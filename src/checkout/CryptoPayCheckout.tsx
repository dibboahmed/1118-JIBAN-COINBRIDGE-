import { useState, useEffect } from 'react';
import { TOKENS } from './data/tokens';
import { FIAT_CURRENCIES, FiatCurrency } from './data/currencies';
import { CryptoToken, PayoutOrder, generateOrderId } from './types';
import { SelectTokenPanel } from './components/SelectTokenPanel';
import { PaymentSummaryPanel } from './components/PaymentSummaryPanel';
import { PaymentQrCodePanel } from './components/PaymentQrCodePanel';
import { fetchLiveCryptoPrices, fetchLiveFiatRates, LiveMarketMap } from './utils/cryptoRates';
import { sendTelegramOrderNotification } from './services/telegramService';
import {
  savePaymentAccount,
  getSavedPaymentAccount,
  saveActiveCheckoutSession,
  getActiveCheckoutSession,
  clearActiveCheckoutSession,
} from './services/accountStorage';
import { db, auth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function getDefaultPaymentMethod(countryCode: string): string {
  const code = (countryCode || '').toUpperCase();
  if (code === 'BDT') return 'bKash';
  if (code === 'NGN') return 'Bank transfer';
  if (code === 'INR') return 'UPI';
  if (code === 'USD') return 'Airtm';
  return 'bKash';
}

interface CryptoPayCheckoutProps {
  userUid?: string;
  userName?: string;
  userEmail?: string;
  onOrderCreated?: (order: PayoutOrder) => void;
}

export function CryptoPayCheckout({ userUid, userName, userEmail, onOrderCreated }: CryptoPayCheckoutProps) {
  // Reliably resolve user's signed-in Gmail from prop, Firebase Auth or localStorage cache
  const effectiveEmail =
    (userEmail && userEmail.trim()) ||
    (auth.currentUser?.email && auth.currentUser.email.trim()) ||
    (auth.currentUser?.providerData?.[0]?.email && auth.currentUser.providerData[0].email.trim()) ||
    ((auth.currentUser as any)?.reloadUserInfo?.email && (auth.currentUser as any).reloadUserInfo.email.trim()) ||
    (() => {
      try {
        const raw = localStorage.getItem('coinbridge_saved_user');
        return raw ? JSON.parse(raw).email : '';
      } catch {
        return '';
      }
    })() ||
    (() => {
      try {
        return localStorage.getItem('coinbridge_active_user_email') || '';
      } catch {
        return '';
      }
    })() ||
    '';

  const effectiveName =
    (userName && userName.trim()) ||
    (auth.currentUser?.displayName && auth.currentUser.displayName.trim()) ||
    (auth.currentUser?.providerData?.[0]?.displayName && auth.currentUser.providerData[0].displayName.trim()) ||
    (() => {
      try {
        const raw = localStorage.getItem('coinbridge_saved_user');
        return raw ? JSON.parse(raw).displayName : '';
      } catch {
        return '';
      }
    })() ||
    (effectiveEmail ? effectiveEmail.split('@')[0] : 'Google User');

  const savedSession = getActiveCheckoutSession(effectiveEmail);

  const effectiveUid =
    (userUid && userUid.trim()) ||
    auth.currentUser?.uid ||
    'guest';

  const [currentPage, setCurrentPage] = useState<'swap' | 'summary' | 'qrcode'>(
    savedSession?.currentPage || 'swap'
  );

  const [currentOrder, setCurrentOrder] = useState<PayoutOrder | null>(() => {
    if (savedSession?.currentOrderId) {
      return {
        id: savedSession.currentOrderId,
        userId: effectiveUid,
        userEmail: effectiveEmail,
        tokenSymbol: savedSession.tokenSymbol || 'USDT',
        tokenNetwork: savedSession.tokenNetwork || 'Polygon',
        cryptoAmount: savedSession.payAmount || 0,
        fiatCurrencyCode: savedSession.fiatCode || 'BDT',
        fiatCurrencySymbol: 'Tk',
        fiatAmount: Math.max(0, (savedSession.payAmount || 0) - 0.1) * 125,
        country: 'Bangladesh',
        paymentMethod: savedSession.paymentMethod || 'bKash',
        accountNumber: savedSession.accountNumber || '',
        accountType: savedSession.accountType || 'Personal',
        status: 'pending',
        createdAt: savedSession.updatedAt || new Date().toISOString(),
      };
    }
    return null;
  });

  // Default selected token: USDT (Polygon), or restored from session
  const defaultToken = TOKENS.find((t) => t.symbol === 'USDT') || TOKENS[0];
  const [selectedToken, setSelectedToken] = useState<CryptoToken>(() => {
    if (savedSession?.tokenSymbol) {
      const match = TOKENS.find(
        (t) =>
          t.symbol.toUpperCase() === savedSession.tokenSymbol.toUpperCase() &&
          (!savedSession.tokenNetwork ||
            (t.network || '').toLowerCase() === (savedSession.tokenNetwork || '').toLowerCase())
      );
      if (match) return match;
    }
    return defaultToken;
  });

  // Default selected country: Bangladesh, or restored from session
  const defaultFiat =
    FIAT_CURRENCIES.find((c) => c.country === 'Bangladesh') ||
    FIAT_CURRENCIES.find((c) => c.code === 'BDT') ||
    FIAT_CURRENCIES[0];

  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState<FiatCurrency>(() => {
    if (savedSession?.fiatCode) {
      const match = FIAT_CURRENCIES.find(
        (c) => c.code.toUpperCase() === savedSession.fiatCode.toUpperCase()
      );
      if (match) return match;
    }
    return defaultFiat;
  });

  // Payment method (auto-restored from session or remembered storage)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    savedSession?.paymentMethod || 'bKash'
  );

  const [receivingAccountNumber, setReceivingAccountNumber] = useState<string>(() => {
    if (savedSession?.accountNumber) return savedSession.accountNumber;
    return getSavedPaymentAccount(savedSession?.paymentMethod || 'bKash', effectiveEmail);
  });

  const [receivingAccountType, setReceivingAccountType] = useState<string>(
    savedSession?.accountType || 'Personal'
  );

  // Amount
  const [payAmount, setPayAmount] = useState<number>(savedSession?.payAmount || 0);

  // Live real-time market rates
  const [livePrices, setLivePrices] = useState<LiveMarketMap>({});
  const [liveFiat, setLiveFiat] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadRates = async () => {
      try {
        const [cPrices, fRates] = await Promise.all([
          fetchLiveCryptoPrices(),
          fetchLiveFiatRates(),
        ]);
        if (cPrices && Object.keys(cPrices).length > 0) setLivePrices(cPrices);
        if (fRates && Object.keys(fRates).length > 0) setLiveFiat(fRates);
      } catch {
        // Fallbacks in place
      }
    };
    loadRates();
    const interval = setInterval(loadRates, 20000);
    return () => clearInterval(interval);
  }, []);

  // Sync active checkout session to sessionStorage scoped strictly to this user email
  useEffect(() => {
    if (currentPage !== 'swap' || payAmount > 0 || currentOrder) {
      saveActiveCheckoutSession(
        {
          currentPage,
          currentOrderId: currentOrder?.id,
          payAmount,
          tokenSymbol: selectedToken.symbol,
          tokenNetwork: selectedToken.network,
          fiatCode: selectedFiatCurrency.code,
          paymentMethod: selectedPaymentMethod,
          accountNumber: receivingAccountNumber,
          accountType: receivingAccountType,
          updatedAt: new Date().toISOString(),
        },
        effectiveEmail
      );
    }
  }, [
    currentPage,
    currentOrder,
    payAmount,
    selectedToken,
    selectedFiatCurrency,
    selectedPaymentMethod,
    receivingAccountNumber,
    receivingAccountType,
    effectiveEmail,
  ]);

  const handleSelectCountry = (fiat: FiatCurrency) => {
    setSelectedFiatCurrency(fiat);
    const defMethod = getDefaultPaymentMethod(fiat.code);
    setSelectedPaymentMethod(defMethod);
    const remembered = getSavedPaymentAccount(defMethod, effectiveEmail);
    setReceivingAccountNumber(remembered || '');
  };

  const handleSelectPaymentMethod = (
    method: string,
    accountNumber?: string,
    accountType?: string
  ) => {
    setSelectedPaymentMethod(method);
    if (accountNumber !== undefined) {
      setReceivingAccountNumber(accountNumber);
      if (accountNumber.trim()) {
        savePaymentAccount(
          method,
          accountNumber,
          { accountType: accountType || 'Personal' },
          effectiveEmail
        );
      }
    } else {
      // Auto-fill remembered account number for this payment method
      const remembered = getSavedPaymentAccount(method, effectiveEmail);
      if (remembered) {
        setReceivingAccountNumber(remembered);
      }
    }
    if (accountType !== undefined) {
      setReceivingAccountType(accountType);
    }
  };

  const handleOrderCompleted = async (summary: {
    cryptoAmount: number;
    grossCryptoAmount?: number;
    platformFee?: number;
    netCryptoAmount?: number;
    tokenSymbol: string;
    fiatAmount: number;
    fiatCode: string;
    paymentMethod: string;
    accountNumber: string;
  }) => {
    // Automatically save payment account number for next orders
    if (summary.accountNumber && summary.accountNumber.trim()) {
      savePaymentAccount(
        summary.paymentMethod,
        summary.accountNumber,
        {
          accountType: receivingAccountType,
        },
        effectiveEmail
      );
    }

    const grossVal = summary.grossCryptoAmount || summary.cryptoAmount;
    const feeVal = typeof summary.platformFee === 'number' ? summary.platformFee : 0.1;
    const netVal = summary.netCryptoAmount || Math.max(0, grossVal - feeVal);

    const orderRecord: PayoutOrder = {
      id: generateOrderId(),
      userId: effectiveUid,
      userName: effectiveName,
      userEmail: effectiveEmail || auth.currentUser?.email || '',
      tokenSymbol: summary.tokenSymbol,
      tokenNetwork: selectedToken.network,
      cryptoAmount: grossVal,
      grossCryptoAmount: grossVal,
      platformFee: feeVal,
      netCryptoAmount: netVal,
      fiatCurrencyCode: summary.fiatCode,
      fiatCurrencySymbol: selectedFiatCurrency.symbol,
      fiatAmount: summary.fiatAmount,
      country: selectedFiatCurrency.country,
      paymentMethod: summary.paymentMethod,
      accountNumber: summary.accountNumber,
      accountType: receivingAccountType,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (onOrderCreated) {
      onOrderCreated(orderRecord);
    }

    setCurrentOrder(orderRecord);

    // Save to Firestore so it shows up in real time for everyone
    try {
      await setDoc(
        doc(db, 'payout_orders', orderRecord.id),
        {
          ...orderRecord,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Could not persist order to Firestore:', err);
    }

    // Instantly notify Telegram Bot with full order details
    sendTelegramOrderNotification(orderRecord, 'created').catch((err) => {
      console.warn('Telegram notification dispatch error:', err);
    });
  };

  return (
    <div id="app-root-layout" className="w-full flex-1 flex flex-col items-center justify-start p-0 text-[#0F172A]">
      <main className="w-full flex-1 flex items-start justify-center p-0 bg-white">
        {currentPage === 'swap' && (
          <SelectTokenPanel
            selectedToken={selectedToken}
            onSelectToken={setSelectedToken}
            payAmountFiat={payAmount}
            onAmountChange={setPayAmount}
            selectedFiatCurrency={selectedFiatCurrency}
            onSelectFiatCurrency={handleSelectCountry}
            selectedPaymentMethod={selectedPaymentMethod}
            receivingAccountNumber={receivingAccountNumber}
            receivingAccountType={receivingAccountType}
            onSelectPaymentMethod={handleSelectPaymentMethod}
            onContinue={() => setCurrentPage('summary')}
            livePrices={livePrices}
            liveFiat={liveFiat}
          />
        )}

        {currentPage === 'summary' && (
          <PaymentSummaryPanel
            selectedToken={selectedToken}
            payAmountFiat={payAmount}
            selectedFiatCurrency={selectedFiatCurrency}
            selectedPaymentMethod={selectedPaymentMethod}
            receivingAccountNumber={receivingAccountNumber}
            receivingAccountType={receivingAccountType}
            onChangePaymentMethod={() => setCurrentPage('swap')}
            onBack={() => setCurrentPage('swap')}
            onOrderCompleted={handleOrderCompleted}
            onProceedToQrCode={() => setCurrentPage('qrcode')}
            livePrices={livePrices}
            liveFiat={liveFiat}
          />
        )}

        {currentPage === 'qrcode' && (
          <PaymentQrCodePanel
            orderId={currentOrder?.id}
            orderCreatedAt={currentOrder?.createdAt}
            userUid={effectiveUid}
            userEmail={effectiveEmail}
            initialNetwork={selectedToken.network || 'Polygon'}
            payAmountCrypto={payAmount}
            selectedToken={selectedToken}
            selectedFiatCurrency={selectedFiatCurrency}
            receivingAccountNumber={receivingAccountNumber}
            selectedPaymentMethod={selectedPaymentMethod}
            onBack={() => setCurrentPage('summary')}
            onRestartOrder={() => {
              clearActiveCheckoutSession();
              setCurrentOrder(null);
              setPayAmount(0);
              setCurrentPage('swap');
            }}
          />
        )}
      </main>
    </div>
  );
}
