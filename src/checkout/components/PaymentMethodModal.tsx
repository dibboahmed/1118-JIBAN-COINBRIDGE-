import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Search, ShieldCheck, AlertCircle, X, Building2, Check } from 'lucide-react';
import { UniversalPaymentLogo } from './OfficialPaymentLogos';
import { validatePaymentAccount } from '../utils/paymentValidation';
import { savePaymentAccount, getSavedPaymentAccount, getSavedPaymentMeta } from '../services/accountStorage';

export interface PaymentReceiveMethod {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  feeText: string;
  brandColor: string;
  iconType: string;
  placeholder: string;
  numberLabel: string;
}

export const BANGLADESH_BANKS = [
  'Islami Bank Bangladesh PLC',
  'BRAC Bank PLC',
  'The City Bank PLC',
  'Dutch-Bangla Bank PLC (DBBL)',
  'Eastern Bank PLC (EBL)',
  'Sonali Bank PLC',
  'United Commercial Bank PLC (UCB)',
  'Mutual Trust Bank PLC (MTB)',
  'Prime Bank PLC',
  'Pubali Bank PLC',
  'Bank Asia PLC',
  'Dhaka Bank PLC',
  'Standard Chartered Bangladesh',
  'Southeast Bank PLC',
  'Agrani Bank PLC',
  'Janata Bank PLC',
  'Al-Arafah Islami Bank PLC',
  'Other Bank',
];

export const INDIA_BANKS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank (PNB)',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'Yes Bank',
  'IDFC First Bank',
  'Other Bank',
];

export const NIGERIA_BANKS = [
  'Access bank',
  'Bank transfer (Africa)',
  'kuda bank',
  'kuda',
];

export const GLOBAL_BANKS = [
  'JPMorgan Chase Bank',
  'Bank of America',
  'Citibank N.A.',
  'Wells Fargo',
  'Wise (USD Account)',
  'Revolut (USD Account)',
  'Standard Chartered Bank',
  'HSBC Bank',
  'Barclays Bank',
  'Other International Bank',
];

export const COUNTRY_RECEIVE_METHODS: Record<string, PaymentReceiveMethod[]> = {
  bd: [
    {
      id: 'bkash',
      name: 'bKash',
      subtitle: 'bKash Personal Account (Personal Only)',
      badge: 'Personal Only',
      feeText: 'Instant payout • 0.1 USDT fee',
      brandColor: '#E2136E',
      iconType: 'bkash',
      placeholder: '017XXXXXXXX or 01XXXXXXXXX',
      numberLabel: 'bKash Personal Mobile Number (11 digits)',
    },
    {
      id: 'nagad',
      name: 'Nagad',
      subtitle: 'Nagad Personal Account',
      badge: 'Personal',
      feeText: 'Instant payout • 0.1 USDT fee',
      brandColor: '#F7941D',
      iconType: 'nagad',
      placeholder: '01XXXXXXXXX',
      numberLabel: 'Nagad Personal Mobile Number (11 digits)',
    },
    {
      id: 'rocket',
      name: 'Rocket',
      subtitle: 'DBBL Rocket Personal Account',
      badge: 'Personal',
      feeText: 'Instant payout • 0.1 USDT fee',
      brandColor: '#8C3494',
      iconType: 'rocket',
      placeholder: '01XXXXXXXXX or 12-digit number',
      numberLabel: 'Rocket Personal Mobile Number',
    },
    {
      id: 'bank_bd',
      name: 'Bank Transfer',
      subtitle: 'BEFTN / NPSB Direct Bank Transfer (All Bangladeshi Banks)',
      badge: 'All Banks',
      feeText: 'Direct bank payout • 0.1 USDT fee',
      brandColor: '#006A4E',
      iconType: 'bank_bd',
      placeholder: 'Bank Account Number',
      numberLabel: 'Bank Account Number',
    },
  ],
  ng: [
    {
      id: 'bank_transfer',
      name: 'Bank transfer',
      subtitle: 'Direct Settlement to African Bank Accounts',
      badge: 'Popular',
      feeText: 'Instant payout • 0.1 USDT fee',
      brandColor: '#008751',
      iconType: 'nigerian_bank',
      placeholder: 'Enter bank account number',
      numberLabel: 'Bank Account Number',
    },
    {
      id: 'palmpay',
      name: 'PalmPay',
      subtitle: 'PalmPay Digital Wallet & Account Transfer',
      badge: 'Instant',
      feeText: 'Instant wallet payout • 0.1 USDT fee',
      brandColor: '#5400FF',
      iconType: 'palmpay',
      placeholder: '080XXXXXXXX (Phone / Account)',
      numberLabel: 'PalmPay Phone Number / Account',
    },
    {
      id: 'opay',
      name: 'OPay',
      subtitle: 'OPay Digital Services Wallet & Bank Account',
      badge: 'Fast',
      feeText: 'Instant wallet transfer • 0.1 USDT fee',
      brandColor: '#00B875',
      iconType: 'opay',
      placeholder: '080XXXXXXXX (Phone / Account)',
      numberLabel: 'OPay Mobile Number / Account',
    },
  ],
  in: [
    {
      id: 'upi',
      name: 'UPI',
      subtitle: 'Instant UPI ID & VPA Transfer (GPay / Any UPI App)',
      badge: 'Instant',
      feeText: 'Instant payout • 0.1 USDT fee',
      brandColor: '#097939',
      iconType: 'upi',
      placeholder: 'mobile@upi or username@okhdfcbank',
      numberLabel: 'UPI ID / VPA',
    },
    {
      id: 'digital_rupee',
      name: 'Digital Rupee',
      subtitle: 'RBI e₹ (Central Bank Digital Currency Wallet)',
      badge: 'RBI e₹',
      feeText: 'Direct CBDC wallet payout • 0.1 USDT fee',
      brandColor: '#990000',
      iconType: 'digital_rupee',
      placeholder: 'e₹ Wallet ID or Registered Mobile',
      numberLabel: 'Digital Rupee Wallet ID / Phone',
    },
    {
      id: 'paytm',
      name: 'Paytm',
      subtitle: 'Paytm Wallet & Payments Bank Account',
      badge: 'Popular',
      feeText: 'Instant payout • 0.1 USDT fee',
      brandColor: '#002E6E',
      iconType: 'paytm',
      placeholder: '98XXXXXXXX (10 digits)',
      numberLabel: 'Paytm Registered Mobile Number',
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      subtitle: 'PhonePe Wallet & UPI Mobile Account',
      badge: 'Fast',
      feeText: 'Instant payout • 0.1 USDT fee',
      brandColor: '#5F259F',
      iconType: 'phonepe',
      placeholder: '98XXXXXXXX or mobile@ybl',
      numberLabel: 'PhonePe Mobile Number / UPI ID',
    },
    {
      id: 'bank_in',
      name: 'Bank Transfer',
      subtitle: 'Direct to any Indian Bank Account (IMPS / NEFT)',
      badge: '24/7',
      feeText: 'Instant settlement • 0.1 USDT fee',
      brandColor: '#1E3A8A',
      iconType: 'bank_in',
      placeholder: 'Account Number & IFSC Code',
      numberLabel: 'Bank Account Number & IFSC',
    },
  ],
  global: [
    {
      id: 'airtm',
      name: 'Airtm',
      subtitle: 'Instant Airtm USD P2P Wallet Transfer',
      badge: 'Min $10',
      feeText: 'Instant transfer • 1 USDT = 0.95 USD',
      brandColor: '#0084FF',
      iconType: 'airtm',
      placeholder: 'user@email.com or @airtm_username',
      numberLabel: 'Airtm Registered Email / Username',
    },
    {
      id: 'bank_usd',
      name: 'Bank Transfer',
      subtitle: 'Direct Wire / SWIFT / ACH to USD Bank Account',
      badge: 'Min $50',
      feeText: 'Direct bank settlement • 1 USDT = 0.83 USD',
      brandColor: '#004B87',
      iconType: 'bank_usd',
      placeholder: 'IBAN / SWIFT BIC / Routing & Account',
      numberLabel: 'USD Bank Account / IBAN',
    },
  ],
  us: [
    {
      id: 'airtm',
      name: 'Airtm',
      subtitle: 'Instant Airtm USD P2P Wallet Transfer',
      badge: 'Min $10',
      feeText: 'Instant transfer • 1 USDT = 0.95 USD',
      brandColor: '#0084FF',
      iconType: 'airtm',
      placeholder: 'user@email.com or @airtm_username',
      numberLabel: 'Airtm Registered Email / Username',
    },
    {
      id: 'bank_usd',
      name: 'Bank Transfer',
      subtitle: 'Direct Wire / SWIFT / ACH to USD Bank Account',
      badge: 'Min $50',
      feeText: 'Direct bank settlement • 1 USDT = 0.83 USD',
      brandColor: '#004B87',
      iconType: 'bank_usd',
      placeholder: 'IBAN / SWIFT BIC / Routing & Account',
      numberLabel: 'USD Bank Account / IBAN',
    },
  ],
};

export function MethodIcon({
  iconType,
  name,
  className = 'w-8 h-8',
  countryCode,
}: {
  iconType: string;
  name: string;
  className?: string;
  countryCode?: string;
}) {
  return (
    <UniversalPaymentLogo
      name={name}
      iconType={iconType}
      className={className}
      countryCode={countryCode}
    />
  );
}

export function getMethodIconType(methodName: string, countryCode?: string): string {
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

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethod: string;
  accountNumber?: string;
  onSelectMethod: (methodName: string, accountNumber?: string, accountType?: string) => void;
  countryCode?: string;
  countryName?: string;
}

export function PaymentMethodModal({
  isOpen,
  onClose,
  selectedMethod,
  accountNumber = '',
  onSelectMethod,
  countryCode = 'bd',
  countryName = 'Bangladesh',
}: PaymentMethodModalProps) {
  const code = (countryCode || '').toLowerCase().trim();
  const methods = COUNTRY_RECEIVE_METHODS[code] || COUNTRY_RECEIVE_METHODS['bd'];
  const [step, setStep] = useState<'list' | 'enter_number'>('list');
  const [activeMethod, setActiveMethod] = useState<PaymentReceiveMethod>(
    methods.find((m) => m.name.toLowerCase() === selectedMethod.toLowerCase()) || methods[0]
  );
  const [inputNumber, setInputNumber] = useState<string>(accountNumber);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Structured fields for bank transfers
  const [bankName, setBankName] = useState<string>('');
  const [customBankName, setCustomBankName] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [accountType, setAccountType] = useState<string>('Savings');
  const [branchName, setBranchName] = useState<string>('');
  const [routingNumber, setRoutingNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [swiftCode, setSwiftCode] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const matchingNigeriaBank = NIGERIA_BANKS.find(
        (b) => b.toLowerCase() === (selectedMethod || '').toLowerCase()
      );
      const found =
        methods.find((m) => m.name.toLowerCase() === selectedMethod.toLowerCase()) ||
        (matchingNigeriaBank ? methods.find((m) => m.id === 'bank_transfer') : null) ||
        methods[0];
      setActiveMethod(found);
      const savedForFound = getSavedPaymentAccount(matchingNigeriaBank || found.name);
      const savedMeta = getSavedPaymentMeta(matchingNigeriaBank || found.name);
      setInputNumber(accountNumber || savedForFound || '');
      setErrorMessage('');
      setSearch('');
      setStep('list');
      const activeBank = matchingNigeriaBank || '';
      setBankName(activeBank);
      if (activeBank) {
        if (activeBank.toLowerCase().includes('access')) {
          setCustomBankName(savedMeta?.bankName || 'Access Bank');
        } else if (activeBank.toLowerCase() === 'kuda bank') {
          setCustomBankName(savedMeta?.bankName || 'Kuda Bank');
        } else if (activeBank.toLowerCase().includes('africa')) {
          setCustomBankName(savedMeta?.bankName || '');
        } else {
          setCustomBankName(savedMeta?.bankName || '');
        }
      } else {
        setCustomBankName(savedMeta?.bankName || '');
      }
      setAccountHolderName(savedMeta?.accountHolderName || '');
      setBranchName(savedMeta?.branchName || '');
      setAccountType(savedMeta?.accountType || 'Savings');
      setRoutingNumber('');
      setIfscCode('');
      setSwiftCode('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, selectedMethod, accountNumber, methods]);

  const isBankMethod = useMemo(() => {
    const id = (activeMethod?.id || '').toLowerCase();
    const name = (activeMethod?.name || '').toLowerCase();
    return (
      id.includes('bank') ||
      id === 'kuda' ||
      id === 'union_bank' ||
      name.includes('bank')
    );
  }, [activeMethod]);

  const bankOptions = useMemo(() => {
    if (code === 'bd' || activeMethod?.id === 'bank_bd') return BANGLADESH_BANKS;
    if (code === 'in' || activeMethod?.id === 'bank_in') return INDIA_BANKS;
    if (code === 'ng' || activeMethod?.id === 'bank_transfer') return NIGERIA_BANKS;
    return GLOBAL_BANKS;
  }, [code, activeMethod]);

  const liveValidation = useMemo(() => {
    if (!isOpen || !inputNumber.trim() || isBankMethod) return null;
    return validatePaymentAccount(code, activeMethod?.id || activeMethod?.name || '', inputNumber);
  }, [isOpen, code, activeMethod, inputNumber, isBankMethod]);

  if (!isOpen) return null;

  const isBD = code === 'bd';
  const q = search.toLowerCase().trim();
  const filteredMethods = methods.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.subtitle.toLowerCase().includes(q)
  );

  const handleSelectFromList = (method: PaymentReceiveMethod) => {
    setActiveMethod(method);
    setErrorMessage('');
    setStep('enter_number');
    const savedForMethod = getSavedPaymentAccount(method.name);
    const savedMetaForMethod = getSavedPaymentMeta(method.name);
    setInputNumber(
      savedForMethod ||
      (selectedMethod.toLowerCase() === method.name.toLowerCase() ? accountNumber : '')
    );
    if (savedMetaForMethod?.accountType) {
      setAccountType(savedMetaForMethod.accountType);
    } else {
      setAccountType('Savings');
    }
    const matchingNigeriaBank = NIGERIA_BANKS.find(
      (b) => b.toLowerCase() === (selectedMethod || '').toLowerCase()
    );
    if (method.id === 'bank_transfer') {
      const activeBank = matchingNigeriaBank || '';
      setBankName(activeBank);
      if (activeBank.toLowerCase().includes('access')) {
        setCustomBankName('Access Bank');
      } else if (activeBank.toLowerCase() === 'kuda bank') {
        setCustomBankName('Kuda Bank');
      } else {
        setCustomBankName('');
      }
    } else {
      setBankName('');
      setCustomBankName('');
    }
  };

  const handleConfirmNumber = () => {
    // 1. Bank transfer validation and formatting
    if (isBankMethod) {
      if (!bankName) {
        setErrorMessage('Please select a payment method');
        return;
      }

      const isAfricaTransfer = bankName.toLowerCase().includes('africa');
      const isAccessBank = bankName.toLowerCase().includes('access');
      const isKudaBankDropdown = bankName.toLowerCase() === 'kuda bank';
      const isKudaAccountTypeOnly = bankName.toLowerCase() === 'kuda';

      const chosenBank =
        isAfricaTransfer
          ? (customBankName.trim() || 'Bank transfer (Africa)')
          : isAccessBank
          ? (customBankName.trim() || 'Access bank')
          : isKudaBankDropdown
          ? (customBankName.trim() || 'kuda bank')
          : isKudaAccountTypeOnly
          ? 'kuda'
          : bankName === 'Other Bank' || bankName === 'Other International Bank'
          ? customBankName.trim()
          : (customBankName.trim() || bankName.trim());

      if (isAfricaTransfer && !customBankName.trim()) {
        setErrorMessage('Please enter the bank name');
        return;
      }
      if ((bankName === 'Other Bank' || bankName === 'Other International Bank') && !customBankName.trim()) {
        setErrorMessage('Please specify your bank name');
        return;
      }
      if (!accountHolderName.trim()) {
        setErrorMessage('Please enter the customer / account holder full name');
        return;
      }
      const cleanAcc = inputNumber.trim();
      if (!cleanAcc) {
        setErrorMessage('Please enter the bank account number');
        return;
      }

      // Branch name validation for Access bank and kuda bank, and Bangladesh banks
      if ((isAccessBank || isKudaBankDropdown) && !branchName.trim()) {
        setErrorMessage('Please enter the bank branch name');
        return;
      }
      if ((code === 'bd' || activeMethod.id === 'bank_bd') && !branchName.trim()) {
        setErrorMessage('Please enter the branch name (e.g. Motijheel, Dhanmondi)');
        return;
      }
      if ((code === 'in' || activeMethod.id === 'bank_in') && !ifscCode.trim()) {
        setErrorMessage('Please enter the 11-character IFSC code (e.g. HDFC0001234)');
        return;
      }
      if ((code === 'global' || code === 'us' || activeMethod.id === 'bank_usd') && !swiftCode.trim()) {
        setErrorMessage('Please enter the SWIFT / BIC code');
        return;
      }

      // Payment method identifier returned to caller
      const targetMethodName = bankName;

      // Automatically remember bank details
      savePaymentAccount(targetMethodName, cleanAcc, {
        accountType: isKudaAccountTypeOnly ? accountType : 'Bank',
        bankName: chosenBank,
        accountHolderName: accountHolderName.trim(),
        branchName: branchName.trim(),
      });
      savePaymentAccount(activeMethod.name, cleanAcc, {
        accountType: isKudaAccountTypeOnly ? accountType : 'Bank',
        bankName: chosenBank,
        accountHolderName: accountHolderName.trim(),
        branchName: branchName.trim(),
      });

      // Return chosen method name (Access bank, Bank transfer (Africa), kuda bank, or kuda)
      onSelectMethod(targetMethodName, cleanAcc, isKudaAccountTypeOnly ? accountType : 'Bank');
      onClose();
      return;
    }

    // 2. Personal Wallet / Mobile Banking validation (bKash Personal, Nagad, Rocket, UPI, OPay, etc.)
    const clean = inputNumber.trim();
    const isOpay = activeMethod.id === 'opay' || activeMethod.name.toLowerCase().includes('opay');
    if (!clean) {
      setErrorMessage(
        isOpay
          ? 'Please enter your OPay mobile number or account'
          : 'Please enter your personal account number'
      );
      return;
    }
    const valResult = validatePaymentAccount(code, activeMethod.id || activeMethod.name, clean);
    if (!valResult.isValid) {
      setErrorMessage(valResult.errorMessage || 'Invalid account information for this country');
      return;
    }

    const chosenAccountType = isOpay ? (accountType || 'Savings') : 'Personal';

    // Automatically remember account number & metadata
    savePaymentAccount(activeMethod.name, clean, { accountType: chosenAccountType });

    onSelectMethod(activeMethod.name, clean, chosenAccountType);
    onClose();
  };

  const handleQuickPaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const cleanText = text.trim();
          setInputNumber(cleanText);
          if (!isBankMethod) {
            const check = validatePaymentAccount(code, activeMethod.id || activeMethod.name, cleanText);
            if (!check.isValid) {
              setErrorMessage(check.errorMessage || '');
            } else {
              setErrorMessage('');
            }
          }
        }
      }
    } catch {
      // Ignore clipboard error
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-3 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-full sm:max-w-[500px] bg-white rounded-2xl sm:rounded-[32px] shadow-2xl border border-slate-100 p-5 sm:p-6 mx-3 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <button
            type="button"
            onClick={step === 'enter_number' ? () => setStep('list') : onClose}
            className="p-1.5 -ml-1 text-[#E07A28] hover:text-[#C76518] hover:bg-orange-50/60 rounded-xl transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-[#E07A28]" strokeWidth={2.5} />
          </button>
          <h3 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight text-center flex-1 pr-6">
            {step === 'list' ? 'Choose payment method' : 'Account details'}
          </h3>
          <div className="w-6" />
        </div>

        {/* STEP 1: METHOD SELECTION LIST */}
        {step === 'list' && (
          <>
            <div className="relative w-full mb-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payment method"
                className="w-full pl-3.5 pr-10 py-3 bg-white border border-[#F2C091] rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#E07A28] focus:ring-1 focus:ring-[#E07A28]"
              />
              <Search
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#E07A28]"
                strokeWidth={2.2}
              />
            </div>

            <div className="space-y-2 w-full flex-1 overflow-y-auto max-h-[60vh] pr-0.5">
              {filteredMethods.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No payment method found
                </div>
              ) : (
                filteredMethods.map((method) => {
                  const isSelected = selectedMethod.toLowerCase() === method.name.toLowerCase();
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => handleSelectFromList(method)}
                      className={`w-full py-3.5 px-3.5 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-[#E07A28] bg-orange-50/40 shadow-xs'
                          : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-2xs border border-slate-100 flex items-center justify-center">
                        <MethodIcon iconType={method.iconType} name={method.name} className="w-9 h-9" countryCode={code} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 tracking-tight">
                            {method.name}
                          </span>
                          {method.badge && (
                            <span className="px-2 py-0.5 rounded-md text-[10.5px] font-extrabold bg-slate-100 text-slate-700">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-medium block truncate mt-0.5">
                          {method.subtitle || method.name}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* STEP 2: ENTER ACCOUNT DETAILS & CONFIRM */}
        {step === 'enter_number' && (
          <div className="space-y-3.5 overflow-y-auto max-h-[75vh] pr-0.5">
            {/* Method Banner */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-2xs border border-slate-100 flex items-center justify-center">
                  <MethodIcon
                    iconType={bankName ? getMethodIconType(bankName, code) : activeMethod.iconType}
                    name={bankName || activeMethod.name}
                    className="w-9 h-9"
                    countryCode={code}
                  />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm text-[#0F172A]">{bankName || activeMethod.name}</div>
                  <div className="text-xs text-[#64748B]">{activeMethod.feeText}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('list')}
                className="text-xs font-bold text-[#E07A28] hover:text-[#C76518] hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Strict Personal Notice for bKash, Nagad, Rocket (NO AGENT) */}
            {isBD && !isBankMethod && (
              <div className="p-3 rounded-2xl bg-purple-50/90 border border-purple-200/90 text-purple-900 text-xs font-medium">
                <div className="flex items-center gap-1.5 font-bold text-purple-950">
                  <ShieldCheck size={15} className="text-purple-600 shrink-0" />
                  <span>Personal Account Only</span>
                </div>
                <p className="text-[11.5px] text-purple-800 leading-relaxed mt-1">
                  Payouts are sent strictly to personal accounts. Agent or merchant numbers are not supported.
                </p>
              </div>
            )}

            {/* A) BANK TRANSFER MULTI-FIELD SYSTEM */}
            {isBankMethod ? (
              <div className="space-y-3 pt-1 text-left">
                {/* Payment Method Selector */}
                {activeMethod.id !== 'kuda' && activeMethod.id !== 'union_bank' && (
                  <div>
                    <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                      Payment Method <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={bankName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBankName(val);
                          if (val.toLowerCase().includes('access')) {
                            setCustomBankName('Access Bank');
                          } else if (val.toLowerCase() === 'kuda bank') {
                            setCustomBankName('Kuda Bank');
                          } else if (val.toLowerCase().includes('africa')) {
                            setCustomBankName('');
                          } else if (val.toLowerCase() === 'kuda') {
                            setCustomBankName('');
                          } else if (val === 'Other Bank' || val === 'Other International Bank') {
                            setCustomBankName('');
                          } else {
                            setCustomBankName(val);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] focus:ring-1 focus:ring-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                      >
                        <option value="">-- Select Payment Method --</option>
                        {bankOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Bank Name Input for Bank transfer (Africa), Access bank, Kuda bank, Other Bank */}
                {(bankName.toLowerCase().includes('africa') ||
                  bankName.toLowerCase().includes('access') ||
                  bankName.toLowerCase() === 'kuda bank' ||
                  bankName === 'Other Bank' ||
                  bankName === 'Other International Bank') && (
                  <div>
                    <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                      Bank Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customBankName}
                      onChange={(e) => setCustomBankName(e.target.value)}
                      placeholder={
                        bankName.toLowerCase().includes('africa')
                          ? 'Enter bank name (e.g. Zenith Bank, GTBank, UBA)'
                          : bankName.toLowerCase().includes('access')
                          ? 'Access Bank'
                          : bankName.toLowerCase() === 'kuda bank'
                          ? 'Kuda Bank'
                          : 'Enter official bank name'
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                    />
                  </div>
                )}

                {/* Account Holder Name */}
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Customer Name (Account Holder) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Customer / Account holder full name"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                  />
                </div>

                {/* Bank Account Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#0F172A]">
                      Bank Account Number <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleQuickPaste}
                      className="text-[11px] font-semibold text-[#E07A28] hover:text-[#C76518] hover:underline cursor-pointer"
                    >
                      Paste
                    </button>
                  </div>
                  <input
                    type="text"
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value)}
                    placeholder="Enter bank account number"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                  />
                </div>

                {/* Account Type for Kuda (kuda option) */}
                {bankName.toLowerCase() === 'kuda' && (
                  <div>
                    <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                      Account Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                    >
                      <option value="Savings">Savings Account</option>
                      <option value="Current">Current Account</option>
                    </select>
                  </div>
                )}

                {/* Bank Branch for Access bank, kuda bank, and Bangladesh */}
                {(bankName.toLowerCase().includes('access') ||
                  bankName.toLowerCase() === 'kuda bank' ||
                  code === 'bd' ||
                  activeMethod.id === 'bank_bd') && (
                  <div className={`grid grid-cols-1 ${code === 'bd' || activeMethod.id === 'bank_bd' ? 'sm:grid-cols-2' : ''} gap-2.5`}>
                    <div>
                      <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                        Bank Branch <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="Enter bank branch"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                      />
                    </div>
                    {(code === 'bd' || activeMethod.id === 'bank_bd') && (
                      <div>
                        <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                          Routing Number <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={routingNumber}
                          onChange={(e) => setRoutingNumber(e.target.value)}
                          placeholder="9-digit routing"
                          className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* India IFSC Code */}
                {(code === 'in' || activeMethod.id === 'bank_in') && (
                  <div>
                    <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                      IFSC Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234 or SBIN0001234"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                    />
                  </div>
                )}

                {/* Global USD SWIFT & Routing */}
                {(code === 'global' || code === 'us' || activeMethod.id === 'bank_usd') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                        SWIFT / BIC Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={swiftCode}
                        onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                        placeholder="8 or 11 character SWIFT"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                        Routing (ABA) <span className="text-slate-400 font-normal">(US only)</span>
                      </label>
                      <input
                        type="text"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        placeholder="9-digit routing"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* B) MOBILE WALLET (bKash Personal, Nagad, Rocket, UPI, etc.) */
              <div className="text-left">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#0F172A]">
                    {activeMethod.numberLabel}
                  </label>
                  <button
                    type="button"
                    onClick={handleQuickPaste}
                    className="text-[11px] font-semibold text-[#E07A28] hover:text-[#C76518] hover:underline cursor-pointer"
                  >
                    Paste number
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInputNumber(val);
                      if (errorMessage) {
                        const check = validatePaymentAccount(code, activeMethod.id || activeMethod.name, val);
                        if (check.isValid) {
                          setErrorMessage('');
                        }
                      }
                    }}
                    placeholder={activeMethod.placeholder}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-base font-semibold text-[#0F172A] outline-none ${
                      errorMessage
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200'
                        : liveValidation?.isValid
                        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200'
                        : 'border-[#F2C091] focus:border-[#E07A28] focus:ring-1 focus:ring-[#E07A28]'
                    }`}
                  />
                  {inputNumber && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputNumber('');
                        setErrorMessage('');
                      }}
                      className="absolute right-3 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {liveValidation?.isValid && (
                  <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                    <Check size={14} className="shrink-0 text-emerald-600" strokeWidth={3} />
                    <span>
                      Valid {countryName} account detected ({liveValidation.detectedType})
                    </span>
                  </div>
                )}

                {/* Account Type for OPay */}
                {(activeMethod.id === 'opay' || activeMethod.name.toLowerCase().includes('opay')) && (
                  <div className="mt-3">
                    <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                      Account Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                    >
                      <option value="Savings">Savings Account</option>
                      <option value="Current">Current Account</option>
                      <option value="Personal">Personal Account</option>
                      <option value="Merchant">Merchant Account</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/90 text-rose-800 text-xs font-semibold flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <div className="leading-snug">{errorMessage}</div>
              </div>
            )}

            {/* Submit / Confirm Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmNumber}
                className="w-full py-3 rounded-xl bg-[#E07A28] hover:bg-[#C76518] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {isBankMethod ? (
                  <>
                    <Building2 className="w-4.5 h-4.5 text-white/90" />
                    <span>Confirm Bank Transfer Details</span>
                  </>
                ) : (
                  <span>Confirm {activeMethod.name} Personal Account</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
