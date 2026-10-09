import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { FiatCurrency, FIAT_CURRENCIES } from '../data/currencies';
import { CountryFlag } from './CountryFlag';

export interface SupportedCountry {
  id: string;
  name: string;
  displayName: string;
  code: string;
  symbol: string;
  flag: string;
  rateToUsd: number;
  minAmount: number;
}

export const ONLY_SUPPORTED_COUNTRIES: SupportedCountry[] = [
  {
    id: 'bd',
    name: 'Bangladesh',
    displayName: 'Bangladeshi Taka',
    code: 'BDT',
    symbol: 'Tk',
    flag: '🇧🇩',
    rateToUsd: 125.0,
    minAmount: 1,
  },
  {
    id: 'in',
    name: 'India',
    displayName: 'Indian Rupee',
    code: 'INR',
    symbol: '₹',
    flag: '🇮🇳',
    rateToUsd: 90.0,
    minAmount: 2,
  },
  {
    id: 'ng',
    name: 'Nigeria',
    displayName: 'Nigerian Naira',
    code: 'NGN',
    symbol: '₦',
    flag: '🇳🇬',
    rateToUsd: 1515.0,
    minAmount: 4,
  },
  {
    id: 'global',
    name: 'Global USD',
    displayName: 'Global USD',
    code: 'USD',
    symbol: '$',
    flag: '🌐',
    rateToUsd: 0.95,
    minAmount: 10,
  },
];

interface CountrySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: FiatCurrency;
  onSelectCurrency: (fiat: FiatCurrency) => void;
}

export function CountrySelectModal({
  isOpen,
  onClose,
  selectedCurrency,
  onSelectCurrency,
}: CountrySelectModalProps) {
  const [search, setSearch] = useState('');

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
      setSearch('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const q = search.toLowerCase().trim();
  const filteredCountries = ONLY_SUPPORTED_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.displayName.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
  );

  const handleSelect = (item: SupportedCountry) => {
    const found = FIAT_CURRENCIES.find((c) => c.code === item.code) || {
      code: item.code,
      symbol: item.symbol,
      name: item.displayName,
      rateToEur: 1,
      rateToUsd: item.rateToUsd,
      flag: item.flag,
      country: item.name,
    };
    onSelectCurrency({
      ...found,
      country: item.name,
      rateToUsd: item.rateToUsd,
    });
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-3 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-full sm:max-w-[480px] bg-white rounded-2xl sm:rounded-[32px] shadow-2xl border border-slate-100 p-5 sm:p-6 mx-3 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1 text-[#E07A28] hover:text-[#C76518] hover:bg-orange-50/60 rounded-xl transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-[#E07A28]" strokeWidth={2.5} />
          </button>
          <h3 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight text-center flex-1 pr-6">
            Choose currency
          </h3>
          <div className="w-6" />
        </div>

        {/* Search */}
        <div className="relative w-full mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code"
            className="w-full pl-3.5 pr-10 py-3 bg-white border border-[#F2C091] rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#E07A28] focus:ring-1 focus:ring-[#E07A28]"
          />
          <Search
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#E07A28]"
            strokeWidth={2.2}
          />
        </div>

        {/* Currency List */}
        <div className="space-y-2 w-full flex-1 overflow-y-auto max-h-[60vh]">
          {filteredCountries.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">No currency found</div>
          ) : (
            filteredCountries.map((c) => {
              const isSelected = selectedCurrency.code.toUpperCase() === c.code.toUpperCase();
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full py-3.5 px-3.5 sm:px-4 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-2 border-[#E07A28] bg-orange-50/40 shadow-xs'
                      : 'border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-2xs border border-slate-200/90 flex items-center justify-center">
                    <CountryFlag
                      countryCode={c.id}
                      countryName={c.name}
                      fallbackEmoji={c.flag}
                      size={36}
                      className="w-9 h-9"
                    />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700">
                    {c.code}
                  </span>
                  <span className="text-[15px] sm:text-[16px] font-bold text-slate-900 flex-1 truncate text-left">
                    {c.displayName}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
