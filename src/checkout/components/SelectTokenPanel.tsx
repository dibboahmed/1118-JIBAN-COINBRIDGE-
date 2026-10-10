import { useState, useMemo } from 'react';
import { ChevronDown, AlertCircle, ArrowDown } from 'lucide-react';
import { CryptoToken } from '../types';
import { TOKENS } from '../data/tokens';
import { FiatCurrency } from '../data/currencies';
import { CountrySelectModal } from './CountrySelectModal';
import { StablecoinSelectModal } from './StablecoinSelectModal';
import { PaymentMethodModal, MethodIcon } from './PaymentMethodModal';
import { UsdtWithNetworkBadge, getNetworkShortName } from './NetworkIcon';
import { CountryFlag } from './CountryFlag';
import { LiveMarketMap, LiveMarketData } from '../utils/cryptoRates';
import { validatePaymentAccount } from '../utils/paymentValidation';

function getCountryCode(code: string): string {
  const c = (code || '').toUpperCase();
  if (c === 'BDT') return 'bd';
  if (c === 'NGN') return 'ng';
  if (c === 'INR') return 'in';
  if (c === 'USD') return 'global';
  return 'bd';
}

export function getCountryMinAmount(code: string, paymentMethod?: string): number {
  const c = (code || '').toUpperCase();
  if (c === 'BDT') return 1; // Bangladesh Min: 1 USDT
  if (c === 'NGN') return 4; // Nigeria Min: 4 USDT
  if (c === 'INR') return 2; // India Min: 2 USDT
  if (c === 'USD') {
    const m = (paymentMethod || '').toLowerCase();
    if (m.includes('bank')) {
      return 50; // Bank Transfer in Global USD: Min $50
    }
    return 10; // Airtm in Global USD: Min $10
  }
  return 1;
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

interface SelectTokenPanelProps {
  selectedToken: CryptoToken;
  onSelectToken: (token: CryptoToken) => void;
  payAmountFiat: number;
  onAmountChange: (amount: number) => void;
  selectedFiatCurrency: FiatCurrency;
  onSelectFiatCurrency: (fiat: FiatCurrency) => void;
  selectedPaymentMethod?: string;
  receivingAccountNumber?: string;
  receivingAccountType?: string;
  onSelectPaymentMethod?: (
    method: string,
    accountNumber?: string,
    accountType?: string
  ) => void;
  onContinue: () => void;
  livePrices?: Record<string, number> | LiveMarketMap;
  liveFiat?: Record<string, number>;
}

export function SelectTokenPanel({
  selectedToken,
  onSelectToken,
  payAmountFiat,
  onAmountChange,
  selectedFiatCurrency,
  onSelectFiatCurrency,
  selectedPaymentMethod = 'bKash',
  receivingAccountNumber = '',
  receivingAccountType = 'Personal',
  onSelectPaymentMethod,
  onContinue,
  livePrices,
  liveFiat,
}: SelectTokenPanelProps) {
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [stablecoinModalOpen, setStablecoinModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [minWarning, setMinWarning] = useState<string>('');

  const [localPaymentMethod, setLocalPaymentMethod] = useState(selectedPaymentMethod);
  const effectivePaymentMethod = selectedPaymentMethod || localPaymentMethod;

  const handleSelectMethod = (method: string, accountNum?: string, accountTyp?: string) => {
    setLocalPaymentMethod(method);
    if (onSelectPaymentMethod) {
      onSelectPaymentMethod(method, accountNum, accountTyp);
    }
  };

  const minAmount = getCountryMinAmount(
    selectedFiatCurrency.code,
    effectivePaymentMethod
  );

  const [rawCryptoInput, setRawCryptoInput] = useState<string>(
    payAmountFiat > 0 ? String(payAmountFiat) : ''
  );

  const numericCryptoAmount = parseFloat(rawCryptoInput) || 0;
  const isBelowMin = numericCryptoAmount > 0 && numericCryptoAmount < minAmount;

  const countryRateToUsd = useMemo(() => {
    if (selectedFiatCurrency.code === 'BDT') {
      return 125.0; // 1 USDT = 125 BDT (Fixed rate)
    }
    if (selectedFiatCurrency.code === 'NGN') {
      return 1345.0; // 1 USDT = 1345 NGN (Fixed rate)
    }
    if (selectedFiatCurrency.code === 'USD') {
      const m = (effectivePaymentMethod || '').toLowerCase();
      if (m.includes('bank')) {
        return 0.83; // Bank Transfer in Global USD: 1 USDT = 0.83 USD
      }
      return 0.95; // Airtm in Global USD: 1 USDT = 0.95 USD
    }
    if (liveFiat && liveFiat[selectedFiatCurrency.code]) {
      return liveFiat[selectedFiatCurrency.code];
    }
    return selectedFiatCurrency.rateToUsd || 1.0;
  }, [selectedFiatCurrency, liveFiat, effectivePaymentMethod]);

  const tokenPriceUsd = useMemo(() => {
    const key = selectedToken.symbol.toLowerCase();
    if (livePrices && livePrices[key] && typeof livePrices[key] === 'object' && 'priceUsd' in livePrices[key]) {
      return (livePrices[key] as LiveMarketData).priceUsd;
    }
    return selectedToken.priceUsd || 1.0;
  }, [selectedToken, livePrices]);

  const oneTokenInCountryCurrency = tokenPriceUsd * countryRateToUsd;
  const totalInCountryCurrency = numericCryptoAmount > 0 ? numericCryptoAmount * oneTokenInCountryCurrency : 0;

  const formattedCountryTotal =
    totalInCountryCurrency <= 0
      ? '—'
      : totalInCountryCurrency >= 1000
      ? totalInCountryCurrency.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : totalInCountryCurrency.toFixed(2);

  const handleCryptoInputChange = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, '');
    setRawCryptoInput(clean);
    setMinWarning('');
    const parsed = parseFloat(clean);
    if (!isNaN(parsed) && parsed >= 0) {
      onAmountChange(parsed);
    } else {
      onAmountChange(0);
    }
  };

  const countryCode = getCountryCode(selectedFiatCurrency.code);
  const isGlobalUSD = selectedFiatCurrency.code === 'USD' || countryCode === 'global';

  const handleContinueClick = () => {
    if (numericCryptoAmount < minAmount) {
      setMinWarning(
        `Minimum amount for ${selectedFiatCurrency.country} is ${minAmount} ${selectedToken.symbol}`
      );
      setTimeout(() => setMinWarning(''), 3500);
      return;
    }
    if (!receivingAccountNumber) {
      setPaymentModalOpen(true);
      return;
    }
    const val = validatePaymentAccount(countryCode, effectivePaymentMethod, receivingAccountNumber);
    if (!val.isValid) {
      setPaymentModalOpen(true);
      return;
    }
    onContinue();
  };

  return (
    <div
      id="buy-crypto-card"
      className="w-full max-w-full sm:max-w-[500px] bg-white rounded-none sm:rounded-b-[32px] sm:rounded-t-none pt-4 sm:pt-5 pb-5 px-3.5 sm:px-6 mx-auto"
    >
      {/* 2. TOP BOX: USDT / USDC */}
      <div className="bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/80 rounded-[22px] p-3.5 sm:p-4.5 transition-colors text-left">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold text-slate-500">You spend</div>
        </div>
        <div className="flex items-center justify-between gap-3 mt-2 min-h-[52px]">
          <input
            id="buy-crypto-spend-input"
            type="text"
            inputMode="decimal"
            value={rawCryptoInput}
            onFocus={() => {
              if (rawCryptoInput === '0') setRawCryptoInput('');
            }}
            onChange={(e) => handleCryptoInputChange(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-[36px] sm:text-[42px] font-bold text-[#0F172A] outline-none tracking-tight"
          />
          <button
            type="button"
            onClick={() => setStablecoinModalOpen(true)}
            className="shrink-0 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full py-2.5 sm:py-3 px-3.5 sm:px-4 shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            title={`USDT on ${getNetworkShortName(selectedToken.network)} network (click to change network)`}
          >
            <UsdtWithNetworkBadge
              network={selectedToken.network || 'Polygon'}
              size={34}
              badgeSize={15}
            />
            <div className="flex flex-col items-start leading-tight text-left">
              <span className="font-bold text-[17px] sm:text-[18px] text-[#0F172A] tracking-tight">
                USDT
              </span>
              <span className="text-[11px] sm:text-[11.5px] font-extrabold text-[#7C3AED] tracking-tight">
                {getNetworkShortName(selectedToken.network)}
              </span>
            </div>
            <ChevronDown size={18} className="text-[#F59E0B]" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Flow Connector Arrow */}
      <div className="flex justify-center -my-2.5 relative z-10 pointer-events-none">
        <div className="h-7 w-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400">
          <ArrowDown className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* 3. LOWER BOX: COUNTRY */}
      <div className="bg-[#FAF8F2] hover:bg-[#F6F3EB] border border-amber-200/60 rounded-[22px] p-3.5 sm:p-4.5 transition-colors text-left">
        <div className="text-[13px] font-semibold text-amber-800/80">You get</div>
        <div className="flex items-center justify-between gap-3 mt-2 min-h-[52px]">
          <div className="text-[34px] sm:text-[40px] font-bold text-[#0F172A] tracking-tight leading-none truncate select-all">
            {numericCryptoAmount <= 0 ? (
              <span className="text-[#0F172A] font-extrabold select-none">—</span>
            ) : (
              <span>{formattedCountryTotal}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCountryModalOpen(true)}
            className="shrink-0 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full py-2.5 sm:py-3 px-4 shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <CountryFlag
              countryCode={countryCode}
              countryName={selectedFiatCurrency.country}
              fallbackEmoji={selectedFiatCurrency.flag}
              size={32}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-bold text-[18px] sm:text-[19px] text-[#0F172A] tracking-tight">
              {selectedFiatCurrency.code}
            </span>
            <ChevronDown size={18} className="text-[#F59E0B]" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 4. NOTIFICATION / STATUS BANNER */}
      <div
        className={`rounded-xl py-3 px-4 mt-3 transition-colors ${
          isBelowMin
            ? 'bg-amber-50 border border-amber-200 text-amber-900'
            : 'bg-[#F4F6F9]'
        }`}
      >
        {numericCryptoAmount <= 0 ? (
          <div className="text-[13px] text-[#7E8B9B] font-normal text-left flex items-center justify-between">
            <span>Enter amount to see available offers</span>
            <span className="text-[11px] font-semibold text-[#7C3AED]">
              Min: {minAmount} {selectedToken.symbol}
            </span>
          </div>
        ) : isBelowMin ? (
          <div className="text-[12px] font-bold flex items-center justify-between text-left">
            <span className="flex items-center space-x-1">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <span>
                Minimum for {selectedFiatCurrency.country} {isGlobalUSD ? `(${effectivePaymentMethod})` : ''} is {minAmount} {selectedToken.symbol}
              </span>
            </span>
            <button
              type="button"
              onClick={() => handleCryptoInputChange(String(minAmount))}
              className="text-[#7C3AED] underline hover:text-[#6D28D9] font-extrabold cursor-pointer ml-2"
            >
              Set {minAmount}
            </button>
          </div>
        ) : (
          <div className="text-[12px] text-[#0F172A] font-semibold flex items-center justify-between text-left">
            <span className="truncate">
              1 {selectedToken.symbol} ≈ {selectedFiatCurrency.symbol} {oneTokenInCountryCurrency.toFixed(2)} {selectedFiatCurrency.code}
            </span>
            <span className="text-[#16A34A] font-bold text-[11px] bg-green-50 px-2 py-0.5 rounded-full border border-green-200 shrink-0">
              Best offer
            </span>
          </div>
        )}
      </div>

      {/* 5. PAYMENT RECEIVE METHOD & COUNTRY SELECTOR */}
      {isGlobalUSD ? (
        <div className="mt-3.5 space-y-2.5 text-left">
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-bold text-[#0F172A]">Select USD Payout Method:</span>
            <button
              type="button"
              onClick={() => setCountryModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              title="Change Country"
            >
              <CountryFlag
                countryCode={countryCode}
                countryName={selectedFiatCurrency.country}
                size={16}
                className="w-4 h-4"
              />
              <span>{selectedFiatCurrency.country}</span>
              <ChevronDown size={13} className="text-[#F59E0B]" strokeWidth={2.5} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                handleSelectMethod('Airtm', effectivePaymentMethod === 'Airtm' ? receivingAccountNumber : '');
                if (!receivingAccountNumber && effectivePaymentMethod !== 'Airtm') {
                  setPaymentModalOpen(true);
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                effectivePaymentMethod.toLowerCase().includes('airtm')
                  ? 'border-[#0084FF] bg-blue-50/70 shadow-xs ring-2 ring-[#0084FF]/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MethodIcon iconType="airtm" name="Airtm" className="w-6 h-6 rounded-lg text-[10px]" />
                  <span className="font-extrabold text-[13px] text-[#0F172A]">Airtm</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  Min $10
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-[12px] font-black text-[#0084FF]">1 USDT = 0.95 USD</div>
                <div className="text-[10px] text-[#64748B] mt-0.5 font-medium">Instant P2P Wallet</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                handleSelectMethod('Bank Transfer', effectivePaymentMethod === 'Bank Transfer' ? receivingAccountNumber : '');
                if (!receivingAccountNumber && effectivePaymentMethod !== 'Bank Transfer') {
                  setPaymentModalOpen(true);
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                effectivePaymentMethod.toLowerCase().includes('bank')
                  ? 'border-[#1E3A8A] bg-indigo-50/70 shadow-xs ring-2 ring-[#1E3A8A]/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MethodIcon iconType="bank" name="Bank Transfer" className="w-6 h-6 rounded-lg text-[10px]" />
                  <span className="font-extrabold text-[13px] text-[#0F172A]">Bank Transfer</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  Min $50
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-[12px] font-black text-[#1E3A8A]">1 USDT = 0.83 USD</div>
                <div className="text-[10px] text-[#64748B] mt-0.5 font-medium">Direct Wire / SWIFT / ACH</div>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPaymentModalOpen(true)}
            className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <span className="text-[11px] font-semibold text-[#64748B] shrink-0">
                {effectivePaymentMethod.toLowerCase().includes('airtm') ? 'Airtm Email/Username:' : 'USD Bank Account / IBAN:'}
              </span>
              <span className="text-xs font-mono text-[#7C3AED] font-bold truncate">
                {receivingAccountNumber || 'Click to enter account details'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#7C3AED] group-hover:underline shrink-0 ml-2">
              {receivingAccountNumber ? 'Change' : 'Enter'}
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-3 w-full text-left">
          <button
            type="button"
            onClick={() => setPaymentModalOpen(true)}
            className="w-full bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-2xl py-3.5 px-3 sm:py-4 sm:px-3.5 shadow-2xs flex items-center justify-between cursor-pointer transition-all"
            title={`Payment Receive Method: ${effectivePaymentMethod}`}
          >
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <MethodIcon
                iconType={getMethodIconType(effectivePaymentMethod, countryCode)}
                name={effectivePaymentMethod}
                countryCode={countryCode}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0"
              />
              <div className="flex flex-col min-w-0 text-left flex-1">
                <span className="text-[10px] text-[#64748B] font-medium leading-tight mb-0.5">
                  Payment Method
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-[#0F172A] truncate">
                  {effectivePaymentMethod}{' '}
                  {receivingAccountType && receivingAccountType !== 'Bank'
                    ? `(${receivingAccountType})`
                    : ''}
                </span>
                {receivingAccountNumber ? (
                  <span className="text-[11px] font-mono text-[#7C3AED] font-semibold truncate">
                    {receivingAccountNumber}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#64748B] font-medium truncate">
                    Enter number
                  </span>
                )}
              </div>
            </div>
            <ChevronDown size={15} className="text-[#F59E0B] shrink-0 ml-1.5" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={() => setCountryModalOpen(true)}
            className="w-full bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-2xl py-3.5 px-3 sm:py-4 sm:px-3.5 shadow-2xs flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <CountryFlag
                countryCode={countryCode}
                countryName={selectedFiatCurrency.country}
                fallbackEmoji={selectedFiatCurrency.flag}
                size={26}
                className="w-6.5 h-6.5 shrink-0"
              />
              <div className="flex flex-col min-w-0 text-left flex-1">
                <span className="text-[10px] text-[#64748B] font-medium leading-tight mb-0.5">
                  Country
                </span>
                <span className="text-xs sm:text-[13px] font-semibold text-[#0F172A] truncate">
                  {selectedFiatCurrency.country}
                </span>
              </div>
            </div>
            <ChevronDown size={15} className="text-[#F59E0B] shrink-0 ml-1.5" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* 6. PLATFORM FEE ROW */}
      <div className="flex items-center justify-between mt-4 px-1 text-left">
        <span className="text-[#7E8B9B] text-sm font-normal">Platform fee:</span>
        <span className="text-[#0F172A] text-sm font-semibold">0.10 USDT</span>
      </div>

      {minWarning && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{minWarning}</span>
        </div>
      )}

      {/* 7. BOTTOM ACTION BUTTON */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handleContinueClick}
          className={`w-full py-4 rounded-[20px] font-bold text-base text-center transition-all cursor-pointer shadow-md ${
            numericCryptoAmount < minAmount
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white active:scale-[0.99]'
          }`}
        >
          Continue
        </button>
      </div>

      {/* Modals */}
      <CountrySelectModal
        isOpen={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        selectedCurrency={selectedFiatCurrency}
        onSelectCurrency={onSelectFiatCurrency}
      />

      <StablecoinSelectModal
        isOpen={stablecoinModalOpen}
        onClose={() => setStablecoinModalOpen(false)}
        selectedToken={selectedToken}
        onSelectToken={onSelectToken}
        tokens={TOKENS}
      />

      <PaymentMethodModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        selectedMethod={effectivePaymentMethod}
        accountNumber={receivingAccountNumber}
        onSelectMethod={handleSelectMethod}
        countryCode={countryCode}
        countryName={selectedFiatCurrency.country}
      />
    </div>
  );
}
