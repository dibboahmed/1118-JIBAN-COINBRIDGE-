export interface CryptoIconProps {
  type: string;
  symbol?: string;
  logoUrl?: string;
  className?: string;
  size?: number;
}

export function CryptoIcon({ type, symbol, className = '', size = 24 }: CryptoIconProps) {
  const cleanSymbol = (symbol || type || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] select-none ${className}`}
    >
      <span>{cleanSymbol.slice(0, 3).toUpperCase()}</span>
    </div>
  );
}

export function LetKnowLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="lk-grad-pwa" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C2E8A" />
          <stop offset="1" stopColor="#4A1860" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#lk-grad-pwa)" />
      <path d="M10 9v14h3.5v-10.5h4v-3.5H10z" fill="#FFFFFF" />
      <path d="M18.5 14.5l4-5.5h4l-4.5 6 5 8h-4.2l-3.3-5.5-1 1.2V23h-2.5V14.5h2.5z" fill="#FFFFFF" />
    </svg>
  );
}
