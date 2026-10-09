import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Search, Check } from 'lucide-react';
import { CryptoToken } from '../types';
import {
  UsdtWithNetworkBadge,
  USDT_SUPPORTED_NETWORKS,
  getNetworkShortName,
  UsdtNetworkItem,
  NetworkIcon,
} from './NetworkIcon';

interface StablecoinSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedToken: CryptoToken;
  onSelectToken: (token: CryptoToken) => void;
  tokens?: CryptoToken[];
}

export function StablecoinSelectModal({
  isOpen,
  onClose,
  selectedToken,
  onSelectToken,
}: StablecoinSelectModalProps) {
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

  const currentNetworkShort = getNetworkShortName(selectedToken.network || 'Polygon');
  const q = search.toLowerCase().trim();
  const filteredNetworks = USDT_SUPPORTED_NETWORKS.filter((net) => {
    if (!q) return true;
    return (
      net.name.toLowerCase().includes(q) ||
      net.fullName.toLowerCase().includes(q) ||
      net.tag.toLowerCase().includes(q) ||
      net.chain.toLowerCase().includes(q) ||
      net.description.toLowerCase().includes(q)
    );
  });

  const handleSelectNetwork = (net: UsdtNetworkItem) => {
    onSelectToken({
      ...selectedToken,
      network: net.fullName,
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
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1 text-[#E07A28] hover:text-[#C76518] hover:bg-orange-50/60 rounded-xl transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-[#E07A28]" strokeWidth={2.5} />
          </button>
          <div className="flex-1 text-center pr-6">
            <h3 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
              Select network
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              USDT (Tether USD) deposit networks
            </span>
          </div>
          <div className="w-6" />
        </div>

        {/* Search */}
        <div className="relative w-full my-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search network (Polygon, BEP20, Solana...)"
            className="w-full pl-3.5 pr-10 py-2.5 sm:py-3 bg-white border border-[#F2C091] rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#E07A28] focus:ring-1 focus:ring-[#E07A28]"
          />
          <Search
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#E07A28]"
            strokeWidth={2.2}
          />
        </div>

        {/* Network Selection List */}
        <div className="space-y-2.5 w-full flex-1 overflow-y-auto pr-0.5">
          {filteredNetworks.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              No network found matching &ldquo;{search}&rdquo;
            </div>
          ) : (
            filteredNetworks.map((net) => {
              const isSelected = getNetworkShortName(net.fullName) === currentNetworkShort;

              return (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => handleSelectNetwork(net)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-[#E07A28] bg-orange-50/50 shadow-xs ring-1 ring-[#E07A28]'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <UsdtWithNetworkBadge network={net.fullName} size={36} badgeSize={16} />
                    <div className="flex flex-col min-w-0 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[16px] text-slate-900 tracking-tight">
                          {net.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10.5px] font-extrabold bg-slate-100 text-slate-700">
                          {net.tag}
                        </span>
                        <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                          {net.badge}
                        </span>
                      </div>
                      <span className="text-[13px] text-slate-500 font-medium truncate mt-0.5">
                        {net.fullName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 shrink-0">
                    <div
                      className="w-8 h-8 rounded-full bg-white border border-slate-200/90 flex items-center justify-center shadow-xs"
                      title={`${net.chain} Official Logo`}
                    >
                      <NetworkIcon network={net.fullName} size={24} />
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#E07A28] text-white flex items-center justify-center shadow-2xs">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                  </div>
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
