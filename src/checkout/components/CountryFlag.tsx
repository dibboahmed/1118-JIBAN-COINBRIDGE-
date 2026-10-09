import { useState } from 'react';

export function GlobalUsdOfficialLogo({
  size = 24,
  className = 'w-6 h-6',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-full shrink-0 select-none shadow-2xs ${className}`}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="globalUsdGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#globalUsdGradient)" />
      <circle cx="16" cy="16" r="12" stroke="#E0F2FE" strokeWidth="1.2" strokeOpacity="0.45" />
      <ellipse cx="16" cy="16" rx="6.5" ry="12" stroke="#E0F2FE" strokeWidth="1.2" strokeOpacity="0.45" />
      <line x1="4" y1="16" x2="28" y2="16" stroke="#E0F2FE" strokeWidth="1.2" strokeOpacity="0.45" />
      <line x1="6.5" y1="10" x2="25.5" y2="10" stroke="#E0F2FE" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="6.5" y1="22" x2="25.5" y2="22" stroke="#E0F2FE" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="16" cy="16" r="8" fill="#0F172A" fillOpacity="0.25" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="16"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        $
      </text>
    </svg>
  );
}

export function CountryFlag({
  countryCode,
  countryName = '',
  fallbackEmoji = '🌐',
  className = 'w-6 h-6',
  size = 24,
}: {
  countryCode: string;
  countryName?: string;
  fallbackEmoji?: string;
  className?: string;
  size?: number;
}) {
  const code = (countryCode || '').toLowerCase().trim();
  const [loadFailed, setLoadFailed] = useState(false);

  // STRICTLY: For Global USD / US, do NOT show the American flag. Show the official Global USD Logo!
  if (code === 'global' || code === 'usd') {
    return <GlobalUsdOfficialLogo size={size} className={className} />;
  }

  const flagCode = code === 'uk' ? 'gb' : code;
  const cdnFlagUrl = `https://hatscripts.github.io/circle-flags/flags/${flagCode}.svg`;

  if (!loadFailed && flagCode && flagCode.length <= 3) {
    return (
      <img
        src={cdnFlagUrl}
        alt={countryName || flagCode}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 select-none shadow-2xs ${className}`}
        style={{ width: size, height: size }}
        onError={() => setLoadFailed(true)}
        loading="lazy"
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center leading-none text-base select-none shrink-0 ${className}`}
      role="img"
      aria-label={countryName || code}
    >
      {fallbackEmoji}
    </span>
  );
}
