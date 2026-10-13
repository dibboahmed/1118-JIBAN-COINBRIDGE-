import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Search, ShieldCheck, AlertCircle, X, Building2, Check, QrCode, Upload, Image as ImageIcon } from 'lucide-react';
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
      subtitle: 'Name, UPI ID & QR Code',
      badge: 'Instant',
      feeText: 'Instant payout • 0.1 USDT fee',
      brandColor: '#097939',
      iconType: 'upi',
      placeholder: 'username@okhdfcbank or mobile@upi',
      numberLabel: 'UPI ID / VPA',
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      subtitle: 'Name, PhonePe Mobile / UPI ID & QR Code',
      badge: 'Popular',
      feeText: 'Instant payout • 0.1 USDT fee',
      brandColor: '#5F259F',
      iconType: 'phonepe',
      placeholder: '98XXXXXXXX or username@ybl',
      numberLabel: 'PhonePe Mobile / UPI ID',
    },
    {
      id: 'digital_rupee',
      name: 'Digital eRupee',
      subtitle: 'Name, Digital eRupee Wallet VPA & QR Code',
      badge: 'RBI e₹',
      feeText: 'Direct CBDC wallet payout • 0.1 USDT fee',
      brandColor: '#990000',
      iconType: 'digital_rupee',
      placeholder: 'Enter Digital eRupee Wallet VPA',
      numberLabel: 'Digital eRupee Wallet VPA',
    },
    {
      id: 'paytm',
      name: 'Paytm',
      subtitle: 'Name, Account Number & QR Code',
      badge: 'Popular',
      feeText: 'Instant payout • 0.1 USDT fee',
      brandColor: '#002E6E',
      iconType: 'paytm',
      placeholder: 'Paytm Account / Registered Mobile',
      numberLabel: 'Paytm Account / Mobile Number',
    },
    {
      id: 'bank_in',
      name: 'Bank Transfer India',
      subtitle: 'Direct IMPS / NEFT Settlement to Indian Bank',
      badge: '24/7',
      feeText: 'Instant settlement • 0.1 USDT fee',
      brandColor: '#1E3A8A',
      iconType: 'bank_in',
      placeholder: 'Account Number',
      numberLabel: 'Bank Account Number',
    },
  ],
  global: [
    {
      id: 'bank_usd',
      name: 'Bank Transfer',
      subtitle: 'Direct Wire / SWIFT / ACH / IBAN to USD Bank Account',
      badge: 'Min $20',
      feeText: 'Direct bank settlement • 1 USDT = 0.95 USD',
      brandColor: '#004B87',
      iconType: 'bank_usd',
      placeholder: 'Enter Bank Account Number',
      numberLabel: 'Bank Account Number',
    },
  ],
  us: [
    {
      id: 'bank_usd',
      name: 'Bank Transfer',
      subtitle: 'Direct Wire / SWIFT / ACH / IBAN to USD Bank Account',
      badge: 'Min $20',
      feeText: 'Direct bank settlement • 1 USDT = 0.95 USD',
      brandColor: '#004B87',
      iconType: 'bank_usd',
      placeholder: 'Enter Bank Account Number',
      numberLabel: 'Bank Account Number',
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

  // Structured fields for bank transfers & wallet accounts
  const [bankName, setBankName] = useState<string>('');
  const [customBankName, setCustomBankName] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [accountType, setAccountType] = useState<string>('Savings');
  const [branchName, setBranchName] = useState<string>('');
  const [routingNumber, setRoutingNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [swiftCode, setSwiftCode] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [ibanNumber, setIbanNumber] = useState<string>('');
  const qrFileInputRef = useRef<HTMLInputElement>(null);

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
      if (code === 'global' || code === 'us' || methods.length <= 1) {
        setStep('enter_number');
      } else {
        setStep('list');
      }
      const activeBank = matchingNigeriaBank || '';
      setBankName(savedMeta?.bankName || activeBank || '');
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
      setQrCodeUrl(savedMeta?.qrCode || '');
      setCardNumber(savedMeta?.cardNumber || '');
      setMobileNumber(savedMeta?.mobileNumber || '');
      setIbanNumber(savedMeta?.ibanNumber || '');
      setRoutingNumber('');
      setIfscCode('');
      setSwiftCode('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, selectedMethod, accountNumber, methods, code]);

  const isBankIn = useMemo(() => {
    return (
      code === 'in' &&
      ((activeMethod?.id || '').toLowerCase() === 'bank_in' ||
        (activeMethod?.name || '').toLowerCase().includes('bank'))
    );
  }, [code, activeMethod]);

  const isBankUsd = useMemo(() => {
    return (
      (code === 'global' || code === 'us') &&
      ((activeMethod?.id || '').toLowerCase() === 'bank_usd' ||
        (activeMethod?.name || '').toLowerCase().includes('bank'))
    );
  }, [code, activeMethod]);

  const isIndiaWallet = useMemo(() => {
    return (
      code === 'in' &&
      !isBankIn &&
      ['upi', 'phonepe', 'digital_rupee', 'paytm'].includes((activeMethod?.id || '').toLowerCase())
    );
  }, [code, isBankIn, activeMethod]);

  const isBankMethod = useMemo(() => {
    const id = (activeMethod?.id || '').toLowerCase();
    const name = (activeMethod?.name || '').toLowerCase();
    return (
      (id.includes('bank') ||
      id === 'kuda' ||
      id === 'union_bank' ||
      name.includes('bank')) &&
      !isBankIn &&
      !isBankUsd
    );
  }, [activeMethod, isBankIn, isBankUsd]);

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

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, etc.) for the QR code');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setQrCodeUrl(reader.result);
        setErrorMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

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
    setAccountHolderName(savedMetaForMethod?.accountHolderName || '');
    setBranchName(savedMetaForMethod?.branchName || '');
    setQrCodeUrl(savedMetaForMethod?.qrCode || '');
    if (savedMetaForMethod?.accountType) {
      setAccountType(savedMetaForMethod.accountType);
    } else {
      setAccountType('Savings');
    }
    const matchingNigeriaBank = NIGERIA_BANKS.find(
      (b) => b.toLowerCase() === (selectedMethod || '').toLowerCase()
    );
    if (method.id === 'bank_transfer' || method.id === 'bank_in') {
      const activeBank = matchingNigeriaBank || (method.id === 'bank_in' ? (savedMetaForMethod?.bankName || '') : '');
      setBankName(activeBank);
      if (activeBank.toLowerCase().includes('access')) {
        setCustomBankName('Access Bank');
      } else if (activeBank.toLowerCase() === 'kuda bank') {
        setCustomBankName('Kuda Bank');
      } else {
        setCustomBankName(savedMetaForMethod?.bankName || '');
      }
    } else {
      setBankName('');
      setCustomBankName('');
    }
  };

  const handleConfirmNumber = () => {
    // 1. Bank Transfer India (Only 4 mandatory fields: Customer Name, Account Number, Branch, and Bank Name at the very last!)
    if (isBankIn) {
      if (!accountHolderName.trim()) {
        setErrorMessage('Please enter Customer / Account Holder Name');
        return;
      }
      const cleanAcc = inputNumber.trim();
      if (!cleanAcc) {
        setErrorMessage('Please enter Bank Account Number');
        return;
      }
      const valResult = validatePaymentAccount('in', 'bank_in', cleanAcc);
      if (!valResult.isValid) {
        setErrorMessage(valResult.errorMessage || 'Invalid Indian bank account number');
        return;
      }
      if (!branchName.trim()) {
        setErrorMessage('Please enter Bank Branch');
        return;
      }
      const chosenBank = bankName === 'Other Bank' ? customBankName.trim() : (customBankName.trim() || bankName.trim());
      if (!chosenBank) {
        setErrorMessage('Please select or enter Bank Name');
        return;
      }

      savePaymentAccount('Bank Transfer India', cleanAcc, {
        accountType: 'Bank',
        bankName: chosenBank,
        accountHolderName: accountHolderName.trim(),
        branchName: branchName.trim(),
      });
      savePaymentAccount(activeMethod.name, cleanAcc, {
        accountType: 'Bank',
        bankName: chosenBank,
        accountHolderName: accountHolderName.trim(),
        branchName: branchName.trim(),
      });

      onSelectMethod('Bank Transfer India', cleanAcc, 'Bank');
      onClose();
      return;
    }

    // 2. India Wallets: UPI, PhonePe, Digital eRupee, Paytm
    if (isIndiaWallet) {
      if (!accountHolderName.trim()) {
        setErrorMessage('Please enter your Name (Account Holder)');
        return;
      }
      const cleanAcc = inputNumber.trim();
      if (!cleanAcc) {
        const fieldName =
          activeMethod.id === 'upi'
            ? 'UPI ID / VPA'
            : activeMethod.id === 'phonepe'
            ? 'PhonePe Mobile / UPI ID'
            : activeMethod.id === 'digital_rupee'
            ? 'Digital eRupee Wallet VPA'
            : 'Paytm Account / Mobile Number';
        setErrorMessage(`Please enter your ${fieldName}`);
        return;
      }
      const valResult = validatePaymentAccount('in', activeMethod.id, cleanAcc);
      if (!valResult.isValid) {
        setErrorMessage(valResult.errorMessage || 'Invalid account details for India');
        return;
      }

      savePaymentAccount(activeMethod.name, cleanAcc, {
        accountType: 'Personal',
        accountHolderName: accountHolderName.trim(),
        qrCode: qrCodeUrl.trim() || undefined,
        upiId: activeMethod.id === 'upi' || activeMethod.id === 'phonepe' ? cleanAcc : undefined,
        walletVpa: activeMethod.id === 'digital_rupee' ? cleanAcc : undefined,
      });

      onSelectMethod(activeMethod.name, cleanAcc, 'Personal');
      onClose();
      return;
    }

    // 2.5. Bank Transfer Global USD validation and saving
    if (isBankUsd) {
      if (!accountHolderName.trim()) {
        setErrorMessage('Please enter the account holder full name');
        return;
      }
      if (!bankName.trim()) {
        setErrorMessage('Please enter your bank name');
        return;
      }
      const cleanAcc = inputNumber.trim();
      if (!cleanAcc) {
        setErrorMessage('Please enter your bank account number');
        return;
      }
      if (!ibanNumber.trim()) {
        setErrorMessage('Please enter your IBAN number');
        return;
      }
      if (ibanNumber.trim().length < 8) {
        setErrorMessage('Please enter a valid IBAN number (minimum 8 characters)');
        return;
      }
      if (!branchName.trim()) {
        setErrorMessage('Please enter the bank branch name');
        return;
      }

      savePaymentAccount(activeMethod.name, cleanAcc, {
        accountType: 'Bank',
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim(),
        branchName: branchName.trim(),
        cardNumber: cardNumber.trim() || undefined,
        mobileNumber: mobileNumber.trim() || undefined,
        ibanNumber: ibanNumber.trim(),
        qrCode: qrCodeUrl.trim() || undefined,
      });

      onSelectMethod(activeMethod.name, cleanAcc, 'Bank');
      onClose();
      return;
    }

    // 3. Bank transfer validation and formatting (Nigeria / Other)
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

    // 4. Personal Wallet / Mobile Banking validation (bKash Personal, Nagad, Rocket, OPay, etc.)
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
            onClick={
              (code === 'global' || code === 'us' || methods.length <= 1)
                ? onClose
                : step === 'enter_number'
                ? () => setStep('list')
                : onClose
            }
            className="p-1.5 -ml-1 text-[#E07A28] hover:text-[#C76518] hover:bg-orange-50/60 rounded-xl transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-[#E07A28]" strokeWidth={2.5} />
          </button>
          <h3 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight text-center flex-1 pr-6">
            {code === 'global' || code === 'us'
              ? 'USD Bank Account Details'
              : step === 'list'
              ? 'Choose payment method'
              : 'Account details'}
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
                    iconType={
                      isBankUsd
                        ? 'bank_usd'
                        : isBankIn
                        ? 'bank_in'
                        : (bankName ? getMethodIconType(bankName, code) : activeMethod.iconType)
                    }
                    name={
                      isBankUsd
                        ? 'Bank Transfer'
                        : isBankIn
                        ? 'Bank Transfer India'
                        : (bankName || activeMethod.name)
                    }
                    className="w-9 h-9"
                    countryCode={code}
                  />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm text-[#0F172A]">
                    {isBankUsd
                      ? 'USD Bank Transfer (Global USD)'
                      : isBankIn
                      ? 'Bank Transfer India'
                      : (bankName || activeMethod.name)}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {isBankUsd
                      ? 'Direct bank settlement • 1 USDT = 0.95 USD (Min $20)'
                      : activeMethod.feeText}
                  </div>
                </div>
              </div>
              {methods.length > 1 && !isBankUsd && (
                <button
                  type="button"
                  onClick={() => setStep('list')}
                  className="text-xs font-bold text-[#E07A28] hover:text-[#C76518] hover:underline cursor-pointer"
                >
                  Change
                </button>
              )}
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

            {/* A) BANK TRANSFER INDIA */}
            {isBankIn ? (
              <div className="space-y-3 pt-1 text-left">
                {/* 1. Customer Name (Account Holder) */}
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

                {/* 2. Bank Account Number */}
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
                    placeholder="Enter 9-18 digit account number"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800 font-mono"
                  />
                </div>

                {/* 3. Bank Branch */}
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Bank Branch <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Enter bank branch name"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                  />
                </div>

                {/* 4. Bank Name (সবার লাস্টে থাকবে - Bank Name at the very last!) */}
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Bank Name <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBankName(val);
                      if (val === 'Other Bank') {
                        setCustomBankName('');
                      } else {
                        setCustomBankName(val);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] focus:ring-1 focus:ring-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                  >
                    <option value="">-- Select Bank Name --</option>
                    {INDIA_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {bankName === 'Other Bank' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customBankName}
                        onChange={(e) => setCustomBankName(e.target.value)}
                        placeholder="Enter official bank name"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : isIndiaWallet ? (
              /* B) INDIA WALLETS: UPI (Name, UPI ID, QR), Digital eRupee (Name, Digital eRupee wallet VPA, QR), Paytm (Name, Account, QR) */
              <div className="space-y-3 pt-1 text-left">
                {/* 1. Customer Name (Account Holder) */}
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Customer Name (Account Holder) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Account holder full name"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                  />
                </div>

                {/* 2. Identifier: UPI ID / Digital eRupee VPA / Paytm Account */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#0F172A]">
                      {activeMethod.id === 'upi'
                        ? 'UPI ID / VPA'
                        : activeMethod.id === 'phonepe'
                        ? 'PhonePe Mobile Number / UPI ID'
                        : activeMethod.id === 'digital_rupee'
                        ? 'Digital eRupee Wallet VPA'
                        : 'Paytm Account / Mobile Number'}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleQuickPaste}
                      className="text-[11px] font-semibold text-[#E07A28] hover:text-[#C76518] hover:underline cursor-pointer"
                    >
                      Paste
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
                          const check = validatePaymentAccount('in', activeMethod.id, val);
                          if (check.isValid) setErrorMessage('');
                        }
                      }}
                      placeholder={activeMethod.placeholder}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-semibold text-slate-800 font-mono"
                    />
                    {inputNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          setInputNumber('');
                          setErrorMessage('');
                        }}
                        className="absolute right-3 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  {liveValidation?.isValid && (
                    <div className="mt-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                      <Check size={13} className="shrink-0 text-emerald-600" strokeWidth={3} />
                      <span>Valid {liveValidation.detectedType}</span>
                    </div>
                  )}
                </div>

                {/* 3. QR Code Upload & Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <QrCode size={14} className="text-[#097939]" />
                      <span>QR Code</span>
                      <span className="text-[11px] text-slate-400 font-normal">(Attach QR image)</span>
                    </label>
                    {qrCodeUrl && (
                      <button
                        type="button"
                        onClick={() => setQrCodeUrl('')}
                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {qrCodeUrl ? (
                    <div className="relative p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center gap-3">
                      <img
                        src={qrCodeUrl}
                        alt="Uploaded QR Code"
                        className="w-14 h-14 object-contain rounded-lg bg-white border border-slate-200"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <Check size={13} className="text-emerald-600" />
                          <span>QR Code Attached</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          QR code is saved and will be used for recipient payout.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => qrFileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-semibold text-[#E07A28] bg-white border border-[#F2C091] rounded-lg hover:bg-orange-50 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => qrFileInputRef.current?.click()}
                      className="p-3 border-2 border-dashed border-slate-300 hover:border-[#E07A28] rounded-xl bg-slate-50 hover:bg-orange-50/30 transition-colors flex items-center justify-center gap-2 cursor-pointer text-slate-600"
                    >
                      <Upload size={16} className="text-[#E07A28]" />
                      <span className="text-xs font-semibold text-slate-700">
                        Click to upload QR code image
                      </span>
                      <span className="text-[10px] text-slate-400">(JPG, PNG)</span>
                    </div>
                  )}
                  <input
                    ref={qrFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleQrFileChange}
                  />
                </div>
              </div>
            ) : isBankUsd ? (
              /* B) GLOBAL USD BANK TRANSFER (Name, Bank Name, Account, IBAN, Branch, Card, Mobile, QR) */
              <div className="space-y-3 pt-1 text-left">
                {/* 1. Account Holder Full Name - REQUIRED */}
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Account Holder Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Enter account holder full name"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                  />
                </div>

                {/* 2. Bank Name (typed by customer, MANDATORY) */}
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Bank Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter official bank name (e.g. JPMorgan Chase, HSBC, Bank of America)"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                  />
                </div>

                {/* 3. Bank Account Number - REQUIRED */}
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
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800 font-mono"
                  />
                </div>

                {/* 4. IBAN Number - REQUIRED FOR INTERNATIONAL */}
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    IBAN (International Bank Account Number) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ibanNumber}
                    onChange={(e) => setIbanNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. GB29NWBK60161331926819 or US12..."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-mono font-medium text-slate-800"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Required for direct international bank transfer settlement
                  </span>
                </div>

                {/* 5. Bank Branch - REQUIRED */}
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Bank Branch <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Enter bank branch name / location"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2C091] focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                  />
                </div>

                {/* 6. Card Number & 7. Mobile Number - OPTIONAL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                      Card Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Optional card number"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#E07A28] rounded-xl text-sm font-mono font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                      Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#E07A28] rounded-xl text-sm font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* 8. QR Code - OPTIONAL */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <QrCode size={14} className="text-[#004B87]" />
                      <span>Bank QR Code</span>
                      <span className="text-[11px] text-slate-400 font-normal">(Optional)</span>
                    </label>
                    {qrCodeUrl && (
                      <button
                        type="button"
                        onClick={() => setQrCodeUrl('')}
                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {qrCodeUrl ? (
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={qrCodeUrl}
                          alt="Bank QR Preview"
                          className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">QR Code Attached</p>
                          <p className="text-[11px] text-emerald-600 font-medium">Ready for payout</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => qrFileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-semibold text-[#004B87] bg-white border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => qrFileInputRef.current?.click()}
                      className="p-3 border-2 border-dashed border-slate-300 hover:border-[#004B87] rounded-xl bg-slate-50 hover:bg-blue-50/30 transition-colors flex items-center justify-center gap-2 cursor-pointer text-slate-600"
                    >
                      <Upload size={16} className="text-[#004B87]" />
                      <span className="text-xs font-semibold text-slate-700">
                        Upload Bank QR Code (Optional)
                      </span>
                      <span className="text-[10px] text-slate-400">(JPG, PNG)</span>
                    </div>
                  )}
                </div>
              </div>
            ) : isBankMethod ? (
              /* C) OTHER BANK TRANSFER (Nigeria / Africa / Global) */
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
                  </div>
                )}
              </div>
            ) : (
              /* D) GENERAL MOBILE WALLET (bKash Personal, Nagad, Rocket, OPay, PalmPay, etc.) */
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
                {isBankIn ? (
                  <>
                    <Building2 className="w-4.5 h-4.5 text-white/90" />
                    <span>Confirm Bank Transfer India</span>
                  </>
                ) : isBankMethod ? (
                  <>
                    <Building2 className="w-4.5 h-4.5 text-white/90" />
                    <span>Confirm Bank Transfer Details</span>
                  </>
                ) : isIndiaWallet ? (
                  <span>Confirm {activeMethod.name} Details</span>
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
