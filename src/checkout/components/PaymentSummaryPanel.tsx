import { useMemo, useState } from 'react';
import { ArrowLeft, ShieldCheck, Clock, Copy, Check } from 'lucide-react';
import { CryptoToken } from '../types';
import { FiatCurrency } from '../data/currencies';
import { UsdtWithNetworkBadge, getNetworkShortName, NetworkIcon } from './NetworkIcon';
import { CountryFlag } from './CountryFlag';
import { MethodIcon } from './PaymentMethodModal';
import { LiveMarketMap, LiveMarketData } from '../utils/cryptoRates';
import { getSavedPaymentMeta } from '../services/accountStorage';

function getCountryCode(code: string): string {
  const c = (code || '').toUpperCase();
  if (c === 'BDT') return 'bd';
  if (c === 'NGN') return 'ng';
  if (c === 'INR') return 'in';
  if (c === 'USD') return 'global';
  return 'bd';
}

function getMethodIconType(methodName: string, countryCode?: string): string {
  const m = (methodName || '').toLowerCase();
  const c = (countryCode || '').toLowerCase();
  if (m.includes('bkash')) return 'bkash';
  if (m.includes('nagad')) return 'nagad';
  if (m.includes('rocket')) return 'rocket';
  if (m.includes('digital rupee') || m.includes('rupee')) return 'digital_rupee';
  if (m.includes('paytm')) return 'paytm';
  if (m.includes('phonepe')) return 'phonepe';
  if (m.includes('airtm') || m.includes('air tm')) return 'airtm';
  if (m.includes('palmpay') || m.includes('palm pay')) return 'palmpay';
  if (m.includes('opay')) return 'opay';
  if (m.includes('kuda')) return 'kuda';
  if (m.includes('access bank') || m.includes('access')) return 'access_bank';
  if (m.includes('union bank') || m.includes('union')) return 'union_bank';
  if (m.includes('upi')) return 'upi';
  if (m.includes('bank') || m.includes('ach') || m.includes('swift')) {
    if (c === 'bd' || c === 'bdt' || c === 'bangladesh') return 'bank_bd';
    if (c === 'ng' || c === 'ngn' || c === 'nigeria') return 'nigerian_bank';
    if (c === 'global' || c === 'us' || c === 'usd') return 'bank_usd';
    if (c === 'in' || c === 'inr' || c === 'india') return 'bank_in';
    return 'bank';
  }
  return 'wallet';
}

interface PaymentSummaryPanelProps {
  selectedToken: CryptoToken;
  payAmountFiat: number;
  selectedFiatCurrency: FiatCurrency;
  selectedPaymentMethod?: string;
  receivingAccountNumber?: string;
  receivingAccountType?: string;
  onChangePaymentMethod?: () => void;
  onBack: () => void;
  onOrderCompleted?: (orderSummary: {
    cryptoAmount: number;
    grossCryptoAmount?: number;
    platformFee?: number;
    netCryptoAmount?: number;
    tokenSymbol: string;
    fiatAmount: number;
    fiatCode: string;
    paymentMethod: string;
    accountNumber: string;
  }) => void;
  onProceedToQrCode?: () => void;
  livePrices?: Record<string, number> | LiveMarketMap;
  liveFiat?: Record<string, number>;
}

export function PaymentSummaryPanel({
  selectedToken,
  payAmountFiat,
  selectedFiatCurrency,
  selectedPaymentMethod = 'bKash',
  receivingAccountNumber = '',
  receivingAccountType = 'Personal',
  onChangePaymentMethod,
  onBack,
  onOrderCompleted,
  onProceedToQrCode,
  livePrices,
  liveFiat,
}: PaymentSummaryPanelProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const numericCryptoAmount = payAmountFiat || 0;

  const countryRateToUsd = useMemo(() => {
    if (selectedFiatCurrency.code === 'BDT') {
      return 125.0; // 1 USDT = 125 BDT
    }
    if (selectedFiatCurrency.code === 'NGN') {
      return 1345.0; // 1 USDT = 1345 NGN
    }
    if (selectedFiatCurrency.code === 'USD') {
      const m = (selectedPaymentMethod || '').toLowerCase();
      if (m.includes('bank')) {
        return 0.83; // 1 USDT = 0.83 USD
      }
      return 0.95; // 1 USDT = 0.95 USD
    }
    if (liveFiat && liveFiat[selectedFiatCurrency.code]) {
      return liveFiat[selectedFiatCurrency.code];
    }
    return selectedFiatCurrency.rateToUsd || 1.0;
  }, [selectedFiatCurrency, liveFiat, selectedPaymentMethod]);

  const tokenPriceUsd = useMemo(() => {
    const key = selectedToken.symbol.toLowerCase();
    if (livePrices && livePrices[key] && typeof livePrices[key] === 'object' && 'priceUsd' in livePrices[key]) {
      return (livePrices[key] as LiveMarketData).priceUsd;
    }
    return selectedToken.priceUsd || 1.0;
  }, [selectedToken, livePrices]);

  const oneTokenInCountryCurrency = tokenPriceUsd * countryRateToUsd;
  const platformFee = 0.1; // 0.1 USDT platform fee deducted from payout conversion
  const netCryptoAmount = Math.max(0, numericCryptoAmount - platformFee);
  const totalCountryAmount = netCryptoAmount * oneTokenInCountryCurrency;

  const formattedCountryTotal =
    totalCountryAmount >= 1000
      ? totalCountryAmount.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : totalCountryAmount.toFixed(2);

  const countryCode = getCountryCode(selectedFiatCurrency.code);
  const savedMeta = useMemo(() => {
    return getSavedPaymentMeta(selectedPaymentMethod);
  }, [selectedPaymentMethod]);

  const handleCopyAccount = () => {
    if (!receivingAccountNumber) return;
    navigator.clipboard.writeText(receivingAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmOrder = () => {
    if (onOrderCompleted) {
      onOrderCompleted({
        cryptoAmount: numericCryptoAmount,
        grossCryptoAmount: numericCryptoAmount,
        platformFee,
        netCryptoAmount,
        tokenSymbol: selectedToken.symbol,
        fiatAmount: totalCountryAmount,
        fiatCode: selectedFiatCurrency.code,
        paymentMethod: selectedPaymentMethod,
        accountNumber: receivingAccountNumber,
      });
    }
    if (onProceedToQrCode) {
      onProceedToQrCode();
    } else {
      setConfirmed(true);
    }
  };

  return (
    <div
      id="payment-summary-card"
      className="w-full max-w-full sm:max-w-[500px] bg-white rounded-none sm:rounded-b-[32px] sm:rounded-t-none p-3.5 sm:p-5 mx-auto"
    >
      {/* Header: Back Button & Title */}
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
          title="Back to swap"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-[19px] font-bold text-[#0F172A] tracking-tight">
          Payment summary
        </h2>
        <div className="w-9 h-9" />
      </div>

      {/* Main Order Card */}
      <div className="bg-[#F4F6F9] rounded-[22px] p-4.5 sm:p-5 mt-2 space-y-3.5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <UsdtWithNetworkBadge
              network={selectedToken.network || 'Polygon'}
              size={32}
              badgeSize={15}
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-bold text-[#0F172A]">USDT</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-[#7C3AED]">
                  {getNetworkShortName(selectedToken.network)}
                </span>
              </div>
              <span className="text-xs text-[#7E8B9B] block">
                {selectedToken.network || 'Polygon'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white text-[#0F172A] border border-slate-200/80 shadow-2xs">
            <CountryFlag
              countryCode={countryCode}
              countryName={selectedFiatCurrency.country}
              fallbackEmoji={selectedFiatCurrency.flag}
              size={18}
              className="w-4.5 h-4.5"
            />
            <span className="text-xs font-bold">{selectedFiatCurrency.code}</span>
          </div>
        </div>

        {/* Calculated Receive Amount in Country Currency */}
        <div className="pt-2 border-t border-slate-200/70">
          <div className="text-xs font-medium text-[#7E8B9B]">
            You will receive
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-0.5 truncate select-all">
            {selectedFiatCurrency.symbol} {formattedCountryTotal} {selectedFiatCurrency.code}
          </div>
        </div>
      </div>

      {/* Order Breakdown Details */}
      <div className="bg-[#F4F6F9] rounded-[20px] p-4 sm:p-5 mt-3 space-y-3 text-[13px] text-left">
        <div className="flex items-center justify-between text-[#7E8B9B]">
          <span>Exchange rate</span>
          <span className="font-semibold text-[#0F172A]">
            1 {selectedToken.symbol} ≈ {selectedFiatCurrency.symbol} {oneTokenInCountryCurrency.toFixed(2)} {selectedFiatCurrency.code}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#7E8B9B]">
          <span>Selected Country</span>
          <span className="font-semibold text-[#0F172A] flex items-center space-x-1.5">
            <CountryFlag
              countryCode={countryCode}
              countryName={selectedFiatCurrency.country}
              fallbackEmoji={selectedFiatCurrency.flag}
              size={16}
              className="w-4 h-4"
            />
            <span>{selectedFiatCurrency.country}</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-[#7E8B9B]">
          <span>You send</span>
          <span className="font-semibold text-[#0F172A]">
            {numericCryptoAmount} {selectedToken.symbol}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#7E8B9B]">
          <span>Platform fee</span>
          <span className="font-medium text-[#0F172A]">
            {platformFee.toFixed(2)} {selectedToken.symbol}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#7E8B9B]">
          <span>Crypto network</span>
          <span className="font-semibold text-[#0F172A] flex items-center space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-white border border-slate-200/90 flex items-center justify-center p-0.5">
              <NetworkIcon network={selectedToken.network || 'Polygon'} size={15} />
            </div>
            <span>{selectedToken.network || 'Polygon'}</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-[#7E8B9B]">
          <span>Payment receive method</span>
          <span className="font-semibold text-[#0F172A] flex items-center space-x-1.5">
            <MethodIcon
              iconType={getMethodIconType(selectedPaymentMethod, countryCode)}
              name={selectedPaymentMethod}
              countryCode={countryCode}
              className="w-4.5 h-4.5 rounded-md shrink-0 text-[10px]"
            />
            <span>
              {selectedPaymentMethod}{' '}
              {receivingAccountType && receivingAccountType !== 'Bank'
                ? `(${receivingAccountType})`
                : countryCode === 'bd'
                ? `(${receivingAccountType || 'Personal'})`
                : ''}
            </span>
          </span>
        </div>

        {((receivingAccountType && receivingAccountType !== 'Bank') ||
          (savedMeta?.accountType && savedMeta.accountType !== 'Bank')) && (
          <div className="flex items-center justify-between text-[#7E8B9B]">
            <span>Account type</span>
            <span className="font-semibold text-[#0F172A] truncate max-w-[200px]">
              {receivingAccountType && receivingAccountType !== 'Bank'
                ? receivingAccountType
                : savedMeta?.accountType}
            </span>
          </div>
        )}

        {savedMeta?.bankName && savedMeta.bankName.toLowerCase() !== selectedPaymentMethod.toLowerCase() && (
          <div className="flex items-center justify-between text-[#7E8B9B]">
            <span>Bank name</span>
            <span className="font-semibold text-[#0F172A] truncate max-w-[200px]">
              {savedMeta.bankName}
            </span>
          </div>
        )}

        {savedMeta?.accountHolderName && (
          <div className="flex items-center justify-between text-[#7E8B9B]">
            <span>Customer name</span>
            <span className="font-semibold text-[#0F172A] truncate max-w-[200px]">
              {savedMeta.accountHolderName}
            </span>
          </div>
        )}

        {savedMeta?.branchName && (
          <div className="flex items-center justify-between text-[#7E8B9B]">
            <span>Bank branch</span>
            <span className="font-semibold text-[#0F172A] truncate max-w-[200px]">
              {savedMeta.branchName}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[#7E8B9B] pt-2 border-t border-slate-200/60">
          <span>Receiving account number</span>
          {receivingAccountNumber ? (
            <div className="flex items-center space-x-1.5 font-mono font-bold text-[#7C3AED]">
              <span>{receivingAccountNumber}</span>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                title="Copy number"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onChangePaymentMethod}
              className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
            >
              Add number
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[#7E8B9B] pt-2 border-t border-slate-200/70">
          <span className="flex items-center space-x-1.5 text-xs text-[#16A34A] font-semibold">
            <ShieldCheck size={14} />
            <span>Guaranteed rate</span>
          </span>
          <span className="flex items-center space-x-1 text-xs text-[#7E8B9B]">
            <Clock size={12} />
            <span>15 mins</span>
          </span>
        </div>
      </div>

      {/* Confirmation State / Button */}
      {confirmed ? (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center animate-in fade-in">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Check size={20} strokeWidth={3} />
          </div>
          <h4 className="font-bold text-sm">Payout Order Initiated!</h4>
          <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
            Your payout of {selectedFiatCurrency.symbol} {formattedCountryTotal} {selectedFiatCurrency.code} ({numericCryptoAmount} {selectedToken.symbol}) has been recorded.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Create Another Transfer
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <button
            type="button"
            onClick={handleConfirmOrder}
            className="w-full py-4 rounded-[18px] bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-base text-center cursor-pointer shadow-md transition-all active:scale-[0.99]"
          >
            Confirm &amp; Pay {numericCryptoAmount} {selectedToken.symbol}
          </button>
        </div>
      )}
    </div>
  );
}
