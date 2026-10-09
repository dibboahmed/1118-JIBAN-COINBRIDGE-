import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronDown, Copy, Check, CheckCircle2, ShieldCheck, Sparkles, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { CryptoToken, generateOrderId } from '../types';
import { FiatCurrency } from '../data/currencies';
import { db, auth } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  scanBlockchainForOrder,
  initializeOrderBaseline,
  VerificationResult,
} from '../services/blockchainScanner';
import {
  sendTelegramOnChainPaymentReceivedAlert,
  pollTelegramOrderApproval,
} from '../services/telegramService';
import {
  OfficialPolygonLogo,
  OfficialBnbLogo,
  OfficialSolanaLogo,
  OfficialUsdtLogo,
} from './OfficialTokenLogos';

export interface PaymentNetworkConfig {
  id: 'polygon' | 'bnb' | 'solana';
  name: string;
  chainName: string;
  symbol: string;
  token: string;
  address: string;
  shortAddress: string;
  brandColor: string;
}

export const PAYMENT_NETWORKS: Record<'polygon' | 'bnb' | 'solana', PaymentNetworkConfig> = {
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    chainName: 'Polygon (POS)',
    symbol: 'POL',
    token: 'USDT',
    address: '0xE6501e2c54B52ad456ceb1cC6Cc5f096beC76302',
    shortAddress: '0xE650...76302',
    brandColor: '#8247E5',
  },
  bnb: {
    id: 'bnb',
    name: 'BNB',
    chainName: 'BNB Smart Chain (BEP-20)',
    symbol: 'BNB',
    token: 'USDT',
    address: '0x615EB207eA3570D17801A03253FFd52bf3fdbD07',
    shortAddress: '0x615E...bD07',
    brandColor: '#F3BA2F',
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    chainName: 'Solana (SPL)',
    symbol: 'SOL',
    token: 'USDT',
    address: '4VhfHPD8R89VD6QqWurKMen4oVGNKHSGCrbP1WkqpxFj',
    shortAddress: '4VhfHP...qpxFj',
    brandColor: '#14F195',
  },
};

function PolygonIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <OfficialPolygonLogo size={size} className={`shrink-0 aspect-square ${className}`} />;
}

function BnbIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <OfficialBnbLogo size={size} className={`shrink-0 aspect-square ${className}`} />;
}

function SolanaIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <OfficialSolanaLogo size={size} className={`shrink-0 aspect-square ${className}`} />;
}

function UsdtPillIcon({ size = 20 }: { size?: number }) {
  return <OfficialUsdtLogo size={size} className="shrink-0 aspect-square" />;
}

interface PaymentQrCodePanelProps {
  initialNetwork?: string;
  payAmountCrypto: number;
  selectedToken: CryptoToken;
  selectedFiatCurrency: FiatCurrency;
  receivingAccountNumber?: string;
  selectedPaymentMethod?: string;
  orderId?: string;
  orderCreatedAt?: string;
  userUid?: string;
  userEmail?: string;
  onBack: () => void;
  onRestartOrder?: () => void;
}

export function PaymentQrCodePanel({
  initialNetwork = 'Polygon',
  payAmountCrypto,
  selectedToken,
  selectedFiatCurrency,
  receivingAccountNumber = '',
  selectedPaymentMethod = 'bKash',
  orderId,
  orderCreatedAt,
  userUid,
  userEmail,
  onBack,
  onRestartOrder,
}: PaymentQrCodePanelProps) {
  // Determine initial network from props (matches Polygon, BNB, Solana)
  const initialNetworkKey = useMemo<'polygon' | 'bnb' | 'solana'>(() => {
    const n = (initialNetwork || '').toLowerCase();
    if (n.includes('bnb') || n.includes('bep') || n.includes('bsc')) return 'bnb';
    if (n.includes('sol') || n.includes('spl')) return 'solana';
    return 'polygon';
  }, [initialNetwork]);

  const [activeNetworkKey, setActiveNetworkKey] = useState<'polygon' | 'bnb' | 'solana'>(initialNetworkKey);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<any>(null);
  const [, setIsScanning] = useState(false);
  const [, setScanCount] = useState(0);
  const [onChainVerified, setOnChainVerified] = useState<VerificationResult | null>(null);

  const currentNetwork = PAYMENT_NETWORKS[activeNetworkKey];

  // Consistent fiat calculation and formatting across all states
  const fiatMultiplier =
    selectedFiatCurrency.code === 'BDT'
      ? 125
      : selectedFiatCurrency.code === 'NGN'
      ? 1345
      : selectedFiatCurrency.rateToUsd || 1;
  const netCryptoAmount = Math.max(0, payAmountCrypto - 0.1);
  const calculatedFiat = netCryptoAmount * fiatMultiplier;
  const fiatAmount = completedOrderData?.fiatAmount || calculatedFiat;
  const formattedFiat = Number(fiatAmount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // 1. Live real-time Firestore sync: updates instantly when admin approves in Telegram!
  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'payout_orders', orderId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'completed' || data.status === 'success') {
            setIsCompleted(true);
            setIsProcessing(false);
            setCompletedOrderData(data);
          } else if (data.status === 'processing' || data.verifiedOnChain) {
            setIsProcessing(true);
            setCompletedOrderData(data);
          }
        }
      },
      (err) => {
        console.warn('Real-time order sync note:', err);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  // 1b. Active Telegram update poller: directly captures admin's inline button press inside Telegram!
  useEffect(() => {
    if (!orderId || isCompleted) return;

    const stopPolling = pollTelegramOrderApproval(orderId, () => {
      setIsCompleted(true);
      setIsProcessing(false);
    });

    return () => {
      stopPolling();
    };
  }, [orderId, isCompleted]);

  // 2. Initialize real blockchain baseline balance for this order & network
  useEffect(() => {
    if (isCompleted || isProcessing) return;
    initializeOrderBaseline(orderId || 'live_order', activeNetworkKey).catch((e) => {
      console.warn('Baseline init note:', e);
    });
  }, [activeNetworkKey, orderId, isCompleted, isProcessing]);

  // 3. Real Blockchain Scanner (Runs every 2 seconds on mainnet)
  useEffect(() => {
    if (isCompleted || isProcessing) return;

    let isMounted = true;
    let isChecking = false;

    const interval = setInterval(async () => {
      if (isCompleted || isProcessing || isChecking) return;
      isChecking = true;
      setIsScanning(true);
      setScanCount((prev) => prev + 1);

      try {
        const effectiveCreatedAt = orderCreatedAt || completedOrderData?.createdAt;
        const result = await scanBlockchainForOrder({
          orderId: orderId || 'live_order',
          networkKey: activeNetworkKey,
          expectedAmount: payAmountCrypto,
          orderCreatedAt: effectiveCreatedAt,
        });

        if (result && result.verified && isMounted) {
          setOnChainVerified(result);
          setIsProcessing(true);

          // Update Firestore status to 'processing' with on-chain verification proof
          if (orderId) {
            try {
              await setDoc(
                doc(db, 'payout_orders', orderId),
                {
                  status: 'processing',
                  verifiedOnChain: true,
                  txHash: result.txHash || '',
                  detectedAmount: result.detectedAmount,
                  onChainVerifiedAt: result.verifiedAt,
                  processingAt: new Date().toISOString(),
                },
                { merge: true }
              );
            } catch (fsErr) {
              console.warn('Firestore update error:', fsErr);
            }
          }

          // Instantly send Genuine On-Chain Verified Alert to Telegram Bot
          const currentFiatVal = completedOrderData?.fiatAmount || payAmountCrypto * fiatMultiplier;
          const resolvedEmail =
            (userEmail && userEmail.trim()) ||
            auth.currentUser?.email ||
            completedOrderData?.userEmail ||
            (() => {
              try {
                const raw = localStorage.getItem('coinbridge_saved_user');
                return raw ? JSON.parse(raw).email : '';
              } catch {
                return '';
              }
            })() ||
            '';

          sendTelegramOnChainPaymentReceivedAlert({
            order: {
              id: orderId || generateOrderId(),
              userId: userUid || auth.currentUser?.uid || completedOrderData?.userId || 'guest',
              userEmail: resolvedEmail,
              cryptoAmount: payAmountCrypto,
              grossCryptoAmount: payAmountCrypto,
              platformFee: 0.1,
              netCryptoAmount: Math.max(0, payAmountCrypto - 0.1),
              tokenSymbol: 'USDT',
              tokenNetwork: currentNetwork.name,
              fiatAmount: currentFiatVal,
              fiatCurrencyCode: selectedFiatCurrency.code,
              fiatCurrencySymbol: selectedFiatCurrency.symbol,
              paymentMethod: selectedPaymentMethod,
              accountNumber: receivingAccountNumber || 'N/A',
              accountType: 'Personal',
              country: selectedFiatCurrency.country || 'Bangladesh',
              status: 'processing',
              createdAt: effectiveCreatedAt || new Date().toISOString(),
            },
            network: currentNetwork.name,
            amount: result.detectedAmount,
            walletAddress: currentNetwork.address,
            txHash: result.txHash,
            explorerUrl: result.explorerUrl,
          }).catch((tgErr) => {
            console.warn('Telegram on-chain alert error:', tgErr);
          });
        }
      } catch (scanErr) {
        console.warn('Blockchain scan tick error:', scanErr);
      } finally {
        if (isMounted) {
          setIsScanning(false);
          isChecking = false;
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [
    isCompleted,
    isProcessing,
    activeNetworkKey,
    payAmountCrypto,
    orderId,
    currentNetwork,
    selectedFiatCurrency,
    selectedPaymentMethod,
    receivingAccountNumber,
    completedOrderData,
    orderCreatedAt,
    userUid,
    userEmail,
    fiatMultiplier,
  ]);

  // Generate crisp QR code on address / network change
  useEffect(() => {
    let isCancelled = false;
    QRCode.toDataURL(currentNetwork.address, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 480,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((dataUrl) => {
        if (!isCancelled) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [currentNetwork.address]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentNetwork.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // 2. LIVE SUCCESS SCREEN: When admin marks as completed in Telegram, website instantly transforms!
  if (isCompleted) {
    return (
      <div
        id="payment-success-live-screen"
        className="w-full min-h-screen bg-[#F4F5F7] text-slate-900 flex flex-col justify-between items-center py-6 px-4 sm:px-6"
      >
        <div className="w-full max-w-[420px] flex items-center justify-between pb-3">
          <div className="w-10 h-10" />
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Payment Complete</h1>
          <div className="w-10 h-10" />
        </div>

        <div className="w-full max-w-[420px] flex-1 flex flex-col items-center justify-center my-auto space-y-5 text-center">
          {/* Animated Success Ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
              <Check size={48} strokeWidth={3} className="text-emerald-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
              <Sparkles size={14} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Payment Successful!
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-[340px] mx-auto leading-relaxed">
              Your payout of {selectedFiatCurrency.symbol} {formattedFiat} {selectedFiatCurrency.code} has been successfully dispatched.
            </p>
          </div>

          {/* Transaction Receipt Card */}
          <div className="w-full bg-white rounded-[26px] p-5 border border-slate-200/90 shadow-sm text-left space-y-3 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Order Status</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center gap-1">
                <Check size={12} strokeWidth={3} />
                <span>COMPLETED</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Verification</span>
              <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Real On-Chain Verified</span>
              </span>
            </div>

            {(onChainVerified?.txHash || completedOrderData?.txHash) && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Tx Hash</span>
                <a
                  href={
                    onChainVerified?.explorerUrl ||
                    (activeNetworkKey === 'bnb'
                      ? `https://bscscan.com/tx/${onChainVerified?.txHash || completedOrderData?.txHash}`
                      : activeNetworkKey === 'solana'
                      ? `https://solscan.io/tx/${onChainVerified?.txHash || completedOrderData?.txHash}`
                      : `https://polygonscan.com/tx/${onChainVerified?.txHash || completedOrderData?.txHash}`)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-[#7C3AED] hover:underline text-xs flex items-center gap-1"
                >
                  <span>
                    {(onChainVerified?.txHash || completedOrderData?.txHash).slice(0, 8)}...
                    {(onChainVerified?.txHash || completedOrderData?.txHash).slice(-6)}
                  </span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600">
              <span>Order ID</span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {orderId || completedOrderData?.id || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Crypto Paid</span>
              <span className="font-bold text-slate-900">
                {payAmountCrypto} USDT ({currentNetwork.name})
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Payout Amount</span>
              <span className="font-extrabold text-emerald-600 text-base">
                {selectedFiatCurrency.symbol} {formattedFiat} {selectedFiatCurrency.code}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
              <span>Payment Method</span>
              <span className="font-bold text-slate-900">{selectedPaymentMethod}</span>
            </div>

            {receivingAccountNumber && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Receiving Account</span>
                <span className="font-mono font-bold text-[#7C3AED] text-sm">
                  {receivingAccountNumber}
                </span>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="w-full pt-2">
            <button
              type="button"
              onClick={onRestartOrder || onBack}
              className="w-full py-4 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
            >
              <RefreshCw size={16} />
              <span>New Transfer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. LIVE PROCESSING SCREEN: Displays once USDT is confirmed on-chain, waiting for admin payout confirmation
  if (isProcessing && !isCompleted) {
    const txHash = onChainVerified?.txHash || completedOrderData?.txHash;
    const explorerUrl =
      onChainVerified?.explorerUrl ||
      (activeNetworkKey === 'bnb'
        ? `https://bscscan.com/tx/${txHash}`
        : activeNetworkKey === 'solana'
        ? `https://solscan.io/tx/${txHash}`
        : `https://polygonscan.com/tx/${txHash}`);

    return (
      <div
        id="payment-processing-live-screen"
        className="w-full min-h-screen bg-[#F4F5F7] text-slate-900 flex flex-col justify-between items-center py-6 px-4 sm:px-6"
      >
        <div className="w-full max-w-[420px] flex items-center justify-between pb-3">
          <div className="w-10 h-10" />
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Processing Payout</h1>
          <div className="w-10 h-10" />
        </div>

        <div className="w-full max-w-[420px] flex-1 flex flex-col items-center justify-center my-auto space-y-5 text-center">
          {/* Animated Processing Indicator */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-[#7C3AED] shadow-sm">
              <Loader2 size={44} className="animate-spin text-[#7C3AED]" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Check size={14} strokeWidth={3} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Deposit Received!
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-[340px] mx-auto leading-relaxed">
              Your payment of {payAmountCrypto} USDT has been verified on the blockchain. Your payout is now being processed.
            </p>
          </div>

          {/* Transaction Receipt Card */}
          <div className="w-full bg-white rounded-[26px] p-5 border border-slate-200/90 shadow-sm text-left space-y-3 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Order Status</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>PROCESSING PAYOUT</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Verification</span>
              <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Real On-Chain Verified</span>
              </span>
            </div>

            {txHash && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Tx Hash</span>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-[#7C3AED] hover:underline text-xs flex items-center gap-1"
                >
                  <span>
                    {txHash.slice(0, 8)}...{txHash.slice(-6)}
                  </span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600">
              <span>Order ID</span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {orderId || completedOrderData?.id || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Crypto Received</span>
              <span className="font-bold text-slate-900">
                {payAmountCrypto} USDT ({currentNetwork.name})
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Payout Amount</span>
              <span className="font-extrabold text-[#7C3AED] text-base">
                {selectedFiatCurrency.symbol} {formattedFiat} {selectedFiatCurrency.code}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
              <span>Payment Method</span>
              <span className="font-bold text-slate-900">{selectedPaymentMethod}</span>
            </div>

            {receivingAccountNumber && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Receiving Account</span>
                <span className="font-mono font-bold text-[#7C3AED] text-sm">
                  {receivingAccountNumber}
                </span>
              </div>
            )}
          </div>

          {/* Live Sync Notice */}
          <div className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 font-medium pt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live sync active • Screen will update automatically once payout is sent</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. MAIN QR CODE DISPLAY SCREEN
  return (
    <div
      id="payment-qr-code-page"
      className="w-full min-h-screen bg-[#F4F5F7] text-slate-900 flex flex-col justify-between items-center py-5 px-4 sm:px-6"
    >
      {/* Top Header Bar */}
      <div className="w-full max-w-[420px] flex items-center justify-between pt-1 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:text-slate-950 hover:bg-slate-200/80 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">QR Code</h1>
        <div className="w-10 h-10" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[420px] flex-1 flex flex-col items-center justify-center space-y-6 sm:space-y-7 my-auto">
        {/* Network & Token Pills Row */}
        <div className="flex items-center justify-center gap-3 w-full relative z-20">
          {/* Network Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNetworkDropdownOpen((prev) => !prev)}
              className="bg-white px-4 py-2 rounded-full border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-slate-50 transition-all flex items-center gap-2 font-bold text-sm text-slate-900 cursor-pointer"
            >
              {activeNetworkKey === 'polygon' && <PolygonIcon size={18} />}
              {activeNetworkKey === 'bnb' && <BnbIcon size={18} />}
              {activeNetworkKey === 'solana' && <SolanaIcon size={18} />}
              <span>{currentNetwork.name}</span>
              <ChevronDown
                size={15}
                className={`text-slate-500 transition-transform ${
                  networkDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Network Dropdown Menu */}
            {networkDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setNetworkDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl z-40 p-1.5 space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Select Network
                  </div>
                  {(['polygon', 'bnb', 'solana'] as const).map((key) => {
                    const item = PAYMENT_NETWORKS[key];
                    const isSelected = activeNetworkKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setActiveNetworkKey(key);
                          setNetworkDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50 text-[#7C3AED] font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {key === 'polygon' && <PolygonIcon size={18} />}
                          {key === 'bnb' && <BnbIcon size={18} />}
                          {key === 'solana' && <SolanaIcon size={18} />}
                          <div>
                            <div>{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{item.chainName}</div>
                          </div>
                        </div>
                        {isSelected && <Check size={16} className="text-[#7C3AED]" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Token Pill (USDT) */}
          <div className="bg-white px-4 py-2 rounded-full border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center gap-2 font-bold text-sm text-slate-900 select-none">
            <UsdtPillIcon size={18} />
            <span>USDT</span>
          </div>
        </div>

        {/* Central QR Code Card */}
        <div className="w-[300px] h-[300px] sm:w-[330px] sm:h-[330px] bg-white rounded-[34px] sm:rounded-[38px] p-6 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.06)] border border-slate-200/80 flex items-center justify-center relative">
          {qrDataUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={qrDataUrl}
                alt={`${currentNetwork.name} USDT QR Code`}
                className="w-full h-full object-contain rounded-2xl select-none"
                draggable={false}
              />
              {/* Central Official Token Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 bg-white rounded-full p-0.5 shadow-md border-2 border-white flex items-center justify-center">
                  <OfficialUsdtLogo size={36} className="w-9 h-9" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 animate-pulse text-sm">
              Generating QR Code...
            </div>
          )}
        </div>

        {/* Instruction Text */}
        <div className="w-full max-w-[340px] text-center space-y-2 -mt-1">
          <p className="text-slate-600 text-sm sm:text-base font-normal tracking-tight">
            Show this QR code to receive payment
          </p>
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs space-y-1.5 text-left">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Amount:</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {payAmountCrypto} USDT
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Receive Amount:</span>
              <span className="font-bold text-emerald-600 font-mono text-sm">
                {selectedFiatCurrency.symbol} {formattedFiat} {selectedFiatCurrency.code}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Wallet Address Pill with Copy button */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="bg-white px-6 py-3 rounded-full border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:bg-slate-50 transition-all flex items-center gap-2.5 font-mono text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer"
            title="Click to copy full address"
          >
            <span>{currentNetwork.shortAddress}</span>
            {copied ? (
              <Check size={16} className="text-emerald-600 stroke-[2.5]" />
            ) : (
              <Copy size={16} className="text-slate-600" />
            )}
          </button>
          {/* Quick feedback toast */}
          {copied && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Address copied to clipboard!
            </span>
          )}

          {/* Live 2-second Blockchain Scanner Radar Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 border border-slate-200/80 text-[11px] font-mono text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Blockchain Scanner Active (every 2s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
