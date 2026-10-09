import { useState, type ReactNode } from 'react';

// =============================================================
// Helper: Official Brand Image Loader with Vector Fallback
// =============================================================
interface OfficialLogoImgProps {
  urls: string[];
  alt: string;
  size?: number;
  className?: string;
  fallback: ReactNode;
  bgClass?: string;
}

function OfficialLogoImage({
  urls,
  alt,
  size,
  className = 'w-8 h-8',
  fallback,
  bgClass = 'bg-white',
}: OfficialLogoImgProps) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  if (!failed && index < urls.length) {
    return (
      <div
        className={`rounded-xl ${bgClass} flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 aspect-square p-0.5 ${className}`}
        style={dimensionStyle}
      >
        <img
          src={urls[index]}
          alt={alt}
          className="w-full h-full object-contain select-none"
          onError={() => {
            if (index + 1 < urls.length) {
              setIndex((prev) => prev + 1);
            } else {
              setFailed(true);
            }
          }}
          loading="eager"
        />
      </div>
    );
  }

  return <>{fallback}</>;
}

// =============================================================
// 1. BANGLADESH OFFICIAL PAYMENT LOGOS
// =============================================================

const BKASH_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/BKash_Logo.svg/512px-BKash_Logo.svg.png',
  'https://raw.githubusercontent.com/redx-dev/payment-logos/main/bkash.png',
  'https://assets.stickpng.com/images/627a20c326084992661081da.png',
];

export function OfficialBkashLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-[#E2136E] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="bKash (Official)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1" xmlns="http://www.w3.org/2000/svg">
        <polygon points="56,20 86,28 62,40" fill="#FFFFFF" />
        <circle cx="68" cy="27" r="2" fill="#E2136E" />
        <polygon points="54,32 78,10 84,16 58,40" fill="#FFFFFF" opacity="0.95" />
        <polygon points="54,32 74,12 64,38" fill="#FCE4EC" opacity="0.4" />
        <polygon points="36,42 64,40 50,70 34,54" fill="#FFFFFF" />
        <polygon points="36,42 48,24 60,38" fill="#FFFFFF" opacity="0.9" />
        <polygon points="18,58 38,48 28,80" fill="#FFFFFF" />
        <polygon points="24,54 36,50 30,72" fill="#FCE4EC" opacity="0.3" />
        <polygon points="50,42 60,40 48,62" fill="#C2185B" opacity="0.3" />
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={BKASH_URLS}
      alt="bKash Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#E2136E]"
    />
  );
}

const NAGAD_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Nagad_Logo.svg/512px-Nagad_Logo.svg.png',
  'https://raw.githubusercontent.com/redx-dev/payment-logos/main/nagad.png',
];

export function OfficialNagadLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-white border border-[#FEE2E2] flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Nagad (Official)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nagadFlameVec" x1="15%" y1="90%" x2="85%" y2="10%">
            <stop offset="0%" stopColor="#EA1D24" />
            <stop offset="45%" stopColor="#F37023" />
            <stop offset="100%" stopColor="#FFBA00" />
          </linearGradient>
          <linearGradient id="nagadCoreVec" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFBA00" />
            <stop offset="100%" stopColor="#EA1D24" />
          </linearGradient>
        </defs>
        <path
          d="M50 14C50 14 55 25 50 33C45 41 37 41 33 50C28 60 35 75 48 77C63 79 75 68 75 52C75 36 64 25 50 14Z"
          fill="url(#nagadFlameVec)"
        />
        <path
          d="M51 31C51 31 59 39 58 48C57 56 50 62 42 61C37 60 35 53 38 47C42 41 48 36 51 31Z"
          fill="#FFFFFF"
        />
        <circle cx="49" cy="50" r="7" fill="url(#nagadCoreVec)" />
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={NAGAD_URLS}
      alt="Nagad Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-white"
    />
  );
}

const ROCKET_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Rocket_DBBL_logo.png/512px-Rocket_DBBL_logo.png',
  'https://raw.githubusercontent.com/redx-dev/payment-logos/main/rocket.png',
];

export function OfficialRocketLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-[#7B287D] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Rocket (DBBL)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rocketThrustVec" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF" />
            <stop offset="35%" stopColor="#F58220" />
            <stop offset="100%" stopColor="#ED1C24" />
          </linearGradient>
        </defs>
        <g transform="translate(4, -2)">
          <path
            d="M36 64L24 76C24 76 30 73 34 76C37 79 36 86 36 86C38 82 44 79 46 76C48 73 54 75 54 75L44 64Z"
            fill="url(#rocketThrustVec)"
          />
          <path d="M34 50L22 62L34 62Z" fill="#FFFFFF" opacity="0.9" />
          <path d="M52 42L66 48L54 58Z" fill="#FFFFFF" opacity="0.9" />
          <path
            d="M58 20C58 20 64 26 62 34L44 62L36 56L50 28C54 22 58 20 58 20Z"
            fill="#FFFFFF"
          />
          <circle cx="51" cy="35" r="3.5" fill="#7B287D" />
          <circle cx="52" cy="34" r="1.2" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={ROCKET_URLS}
      alt="DBBL Rocket Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#7B287D]"
    />
  );
}

export function OfficialBangladeshiBankLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  return (
    <div
      className={`rounded-xl bg-[#006A4E] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Bangladeshi Bank (BEFTN / NPSB)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="30" fill="#F42A41" opacity="0.88" />
        <g fill="#FFFFFF">
          <polygon points="50,26 24,38 76,38" />
          <rect x="22" y="38" width="56" height="4" rx="1" />
          <rect x="28" y="44" width="7" height="22" rx="1.5" />
          <rect x="40" y="44" width="7" height="22" rx="1.5" />
          <rect x="53" y="44" width="7" height="22" rx="1.5" />
          <rect x="65" y="44" width="7" height="22" rx="1.5" />
          <rect x="20" y="68" width="60" height="4" rx="1" />
          <rect x="16" y="73" width="68" height="5" rx="1.5" />
        </g>
        <polygon points="50,47 52,53 58,53 53,57 55,63 50,59 45,63 47,57 42,53 48,53" fill="#FBBF24" />
      </svg>
    </div>
  );
}

// =============================================================
// 2. NIGERIA OFFICIAL PAYMENT LOGOS
// =============================================================

const PALMPAY_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/PalmPay_logo.svg/512px-PalmPay_logo.svg.png',
  'https://palmpay.com/static/img/logo.png',
];

export function OfficialPalmPayLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-[#5400FF] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="PalmPay"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="palmVecGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25F49B" />
            <stop offset="100%" stopColor="#00D287" />
          </linearGradient>
        </defs>
        <g transform="translate(16, 20)">
          <path
            d="M10 38C10 50 20 60 34 60C48 60 58 50 58 38C58 26 48 18 34 18C20 18 10 26 10 38Z"
            fill="url(#palmVecGrad)"
          />
          <path
            d="M20 38C20 45 26 51 34 51C42 51 48 45 48 38C48 31 42 27 34 27C26 27 20 31 20 38Z"
            fill="#5400FF"
          />
          <circle cx="34" cy="38" r="7" fill="#FFFFFF" />
          <ellipse cx="22" cy="14" rx="4" ry="7" transform="rotate(-25 22 14)" fill="url(#palmVecGrad)" />
          <ellipse cx="30" cy="9" rx="4" ry="8" transform="rotate(-8 30 9)" fill="url(#palmVecGrad)" />
          <ellipse cx="38" cy="9" rx="4" ry="8" transform="rotate(8 38 9)" fill="url(#palmVecGrad)" />
          <ellipse cx="46" cy="14" rx="4" ry="7" transform="rotate(25 46 14)" fill="url(#palmVecGrad)" />
        </g>
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={PALMPAY_URLS}
      alt="PalmPay Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#5400FF]"
    />
  );
}

const OPAY_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/OPay_logo.svg/512px-OPay_logo.svg.png',
  'https://opayweb.com/static/img/opay-logo.svg',
];

export function OfficialOpayLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-[#00B875] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="OPay"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="32" stroke="#FFFFFF" strokeWidth="11" />
        <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={OPAY_URLS}
      alt="OPay Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#00B875]"
    />
  );
}

const KUDA_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Kuda_Bank_logo.svg/512px-Kuda_Bank_logo.svg.png',
  'https://kuda.com/static/kuda-logo.svg',
];

export function OfficialKudaLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-[#40196D] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Kuda Bank"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <g fill="#FFFFFF">
          <rect x="24" y="24" width="13" height="52" rx="6.5" />
          <path d="M48 48L64 29C66 26.5 70 26 73 28C76 30.5 76 34.5 73 37L56 54L48 48Z" />
          <path d="M44 48L66 71C68.5 73.5 72.5 73.5 75 71C77.5 68.5 77.5 64.5 75 62L54 42L44 48Z" />
          <circle cx="49" cy="50" r="6.5" />
        </g>
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={KUDA_URLS}
      alt="Kuda Bank Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#40196D]"
    />
  );
}

const UNION_BANK_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Union_Bank_of_Nigeria_logo.svg/512px-Union_Bank_of_Nigeria_logo.svg.png',
];

export function OfficialUnionBankLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-[#005CA9] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Union Bank of Nigeria"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <g fill="#FFFFFF" transform="translate(18, 18) scale(0.64)">
          <path
            d="M85 30C80 25 72 20 62 18C58 14 52 10 46 8C44 7 42 8 43 10C45 13 46 17 44 20C40 22 36 26 34 30C30 31 24 34 20 38C17 41 18 44 22 43C26 42 30 40 33 42C31 46 28 52 24 58C20 64 14 70 8 74C6 75 7 78 10 77C16 75 24 68 28 62C30 68 34 78 38 88C39 90 42 90 42 88C41 80 40 70 41 62C45 61 50 62 55 64C58 68 60 76 62 86C63 88 66 88 66 85C65 77 64 68 64 62C72 58 80 50 86 42C90 37 88 32 85 30ZM50 32C46 30 44 26 46 22C49 22 52 24 54 28C53 30 51 31 50 32Z"
          />
          <path d="M72 40L88 28C90 26 92 28 90 30L76 46Z" />
          <path d="M68 46L82 38C84 36 86 38 84 40L72 52Z" />
        </g>
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={UNION_BANK_URLS}
      alt="Union Bank Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#005CA9]"
    />
  );
}

export function OfficialNigerianBankLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  return (
    <div
      className={`rounded-xl bg-[#008751] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Nigerian Bank Transfer (NIP)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,22 22,36 78,36" fill="#FFFFFF" />
        <rect x="20" y="36" width="60" height="4" rx="1" fill="#FFFFFF" />
        <rect x="26" y="42" width="7" height="24" rx="1.5" fill="#FFFFFF" />
        <rect x="39" y="42" width="7" height="24" rx="1.5" fill="#FFFFFF" />
        <rect x="54" y="42" width="7" height="24" rx="1.5" fill="#FFFFFF" />
        <rect x="67" y="42" width="7" height="24" rx="1.5" fill="#FFFFFF" />
        <rect x="18" y="68" width="64" height="4" rx="1" fill="#FFFFFF" />
        <rect x="14" y="73" width="72" height="5" rx="1.5" fill="#FFFFFF" />
        <circle cx="50" cy="54" r="10" fill="#008751" stroke="#FFFFFF" strokeWidth="2" />
        <polygon points="50,47 46,55 50,55 49,61 54,53 50,53" fill="#FBBF24" />
      </svg>
    </div>
  );
}

// =============================================================
// 3. GLOBAL USD OFFICIAL PAYMENT LOGOS
// =============================================================

const AIRTM_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Airtm_logo.svg/512px-Airtm_logo.svg.png',
  'https://assets.airtm.com/brand/airtm-logo.svg',
];

export function OfficialAirtmLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-gradient-to-br from-[#00A3FF] to-[#0066F6] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Airtm"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <polygon points="50,22 76,36 76,64 50,78 24,64 24,36" strokeOpacity="0.8" />
          <line x1="50" y1="22" x2="50" y2="50" />
          <line x1="76" y1="36" x2="50" y2="50" />
          <line x1="76" y1="64" x2="50" y2="50" />
          <line x1="50" y1="78" x2="50" y2="50" />
          <line x1="24" y1="64" x2="50" y2="50" />
          <line x1="24" y1="36" x2="50" y2="50" />
        </g>
        <circle cx="50" cy="22" r="5" fill="#FFFFFF" />
        <circle cx="76" cy="36" r="5" fill="#FFFFFF" />
        <circle cx="76" cy="64" r="5" fill="#FFFFFF" />
        <circle cx="50" cy="78" r="5" fill="#FFFFFF" />
        <circle cx="24" cy="64" r="5" fill="#FFFFFF" />
        <circle cx="24" cy="36" r="5" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="7" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="3.5" fill="#0066F6" />
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={AIRTM_URLS}
      alt="Airtm Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#0066F6]"
    />
  );
}

export function OfficialGlobalBankLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  return (
    <div
      className={`rounded-xl bg-[#004B87] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Bank Transfer (SWIFT / ACH Wire)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="32" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.5" />
        <ellipse cx="50" cy="50" rx="16" ry="32" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="18" y1="50" x2="82" y2="50" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.5" />
        <g fill="#FFFFFF">
          <polygon points="50,22 24,35 76,35" fill="#38BDF8" />
          <rect x="22" y="35" width="56" height="3" rx="1" />
          <rect x="28" y="40" width="6" height="24" rx="1" />
          <rect x="40" y="40" width="6" height="24" rx="1" />
          <rect x="54" y="40" width="6" height="24" rx="1" />
          <rect x="66" y="40" width="6" height="24" rx="1" />
          <rect x="20" y="66" width="60" height="3" rx="1" fill="#38BDF8" />
          <rect x="16" y="70" width="68" height="4" rx="1" />
        </g>
        <circle cx="50" cy="52" r="8" fill="#FBBF24" />
        <text x="50" y="56" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="system-ui, sans-serif">$</text>
      </svg>
    </div>
  );
}

// =============================================================
// 4. INDIA OFFICIAL PAYMENT LOGOS
// =============================================================

const UPI_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/512px-UPI-Logo-vector.svg.png',
];

export function OfficialUpiLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-white border border-slate-200/90 text-slate-900 flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="UPI (Official)"
    >
      <svg viewBox="0 0 120 70" fill="none" className="w-full h-full px-0.5" xmlns="http://www.w3.org/2000/svg">
        <polygon points="20,15 35,35 20,55 8,55 23,35 8,15" fill="#097939" />
        <polygon points="38,15 53,35 38,55 26,55 41,35 26,15" fill="#F47920" />
        <text
          x="55"
          y="46"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="30"
          fontStyle="italic"
          fill="#1B2A4A"
          letterSpacing="-1"
        >
          UPI
        </text>
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={UPI_URLS}
      alt="UPI Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-white border border-slate-200"
    />
  );
}

const PHONEPE_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png',
];

export function OfficialPhonePeLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-[#5F259F] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="PhonePe"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="36" fill="#FFFFFF" />
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fill="#5F259F"
          fontSize="44"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          पे
        </text>
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={PHONEPE_URLS}
      alt="PhonePe Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#5F259F]"
    />
  );
}

const PAYTM_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png',
];

export function OfficialPaytmLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  const vectorFallback = (
    <div
      className={`rounded-xl bg-white border border-slate-200/90 flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Paytm"
    >
      <svg viewBox="0 0 110 50" fill="none" className="w-full h-full p-0.5" xmlns="http://www.w3.org/2000/svg">
        <text x="6" y="35" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="28" fill="#002E6E" letterSpacing="-1.5">
          pay
        </text>
        <text x="60" y="35" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="28" fill="#00BAF2" letterSpacing="-1.5">
          tm
        </text>
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={PAYTM_URLS}
      alt="Paytm Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-white border border-slate-200"
    />
  );
}

export function OfficialDigitalRupeeLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  return (
    <div
      className={`rounded-xl bg-[#8C0014] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Digital Rupee (e₹)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="42" stroke="#FFFFFF" strokeWidth="3.5" strokeDasharray="7 5" opacity="0.75" />
        <text x="18" y="62" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="36" fill="#FBBF24">
          e
        </text>
        <text x="42" y="64" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="44" fill="#FFFFFF">
          ₹
        </text>
      </svg>
    </div>
  );
}

export function OfficialIndianBankLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  return (
    <div
      className={`rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Indian Bank Transfer (IMPS)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,20 20,35 80,35" fill="#FFFFFF" />
        <rect x="25" y="39" width="8" height="25" rx="2" fill="#FFFFFF" />
        <rect x="40" y="39" width="8" height="25" rx="2" fill="#FFFFFF" />
        <rect x="53" y="39" width="8" height="25" rx="2" fill="#FFFFFF" />
        <rect x="67" y="39" width="8" height="25" rx="2" fill="#FFFFFF" />
        <rect x="16" y="67" width="68" height="9" rx="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

// =============================================================
// Universal Dynamic Logo Resolver
// =============================================================

export function UniversalPaymentLogo({
  name,
  iconType,
  className = 'w-8 h-8',
  size,
}: {
  name: string;
  iconType?: string;
  className?: string;
  size?: number;
}) {
  const n = (name || '').toLowerCase().trim();
  const t = (iconType || '').toLowerCase().trim();

  // 1. Bangladesh
  if (t === 'bkash' || n.includes('bkash')) {
    return <OfficialBkashLogo className={className} size={size} />;
  }
  if (t === 'nagad' || n.includes('nagad')) {
    return <OfficialNagadLogo className={className} size={size} />;
  }
  if (t === 'rocket' || n.includes('rocket')) {
    return <OfficialRocketLogo className={className} size={size} />;
  }
  if (
    (n.includes('bank') && (t.includes('bd') || n.includes('bangladesh') || t === 'bank_bd')) ||
    n.includes('beftn') ||
    n.includes('npsb')
  ) {
    return <OfficialBangladeshiBankLogo className={className} size={size} />;
  }

  // 2. Nigeria
  if (t === 'palmpay' || n.includes('palmpay') || n.includes('palm pay')) {
    return <OfficialPalmPayLogo className={className} size={size} />;
  }
  if (t === 'opay' || n.includes('opay')) {
    return <OfficialOpayLogo className={className} size={size} />;
  }
  if (t === 'kuda' || n.includes('kuda')) {
    return <OfficialKudaLogo className={className} size={size} />;
  }
  if (t === 'union_bank' || n.includes('union')) {
    return <OfficialUnionBankLogo className={className} size={size} />;
  }
  if (
    t === 'nigerian_bank' ||
    (n.includes('bank') && (t.includes('ng') || n.includes('nigeria') || n.includes('nip') || n.includes('nuban') || t === 'bank_transfer'))
  ) {
    return <OfficialNigerianBankLogo className={className} size={size} />;
  }

  // 3. Global USD
  if (t === 'airtm' || n.includes('airtm') || n.includes('air tm')) {
    return <OfficialAirtmLogo className={className} size={size} />;
  }
  if (
    (n.includes('bank') && (t.includes('usd') || n.includes('usd') || n.includes('swift') || n.includes('ach') || n.includes('wire') || t === 'bank_usd')) ||
    n.includes('wire') ||
    n.includes('swift') ||
    n.includes('ach')
  ) {
    return <OfficialGlobalBankLogo className={className} size={size} />;
  }

  // 4. India
  if (t === 'upi' || n === 'upi' || n.includes('upi')) {
    return <OfficialUpiLogo className={className} size={size} />;
  }
  if (t === 'digital_rupee' || n.includes('digital rupee') || n.includes('rupee')) {
    return <OfficialDigitalRupeeLogo className={className} size={size} />;
  }
  if (t === 'paytm' || n.includes('paytm')) {
    return <OfficialPaytmLogo className={className} size={size} />;
  }
  if (t === 'phonepe' || n.includes('phonepe')) {
    return <OfficialPhonePeLogo className={className} size={size} />;
  }
  if (n.includes('bank') && (t.includes('in') || n.includes('india') || n.includes('imps') || t === 'bank_in')) {
    return <OfficialIndianBankLogo className={className} size={size} />;
  }

  return <OfficialGlobalBankLogo className={className} size={size} />;
}
