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
  imgPadding?: string;
}

function OfficialLogoImage({
  urls,
  alt,
  size,
  className = 'w-8 h-8',
  fallback,
  bgClass = 'bg-white',
  imgPadding = 'p-0.5',
}: OfficialLogoImgProps) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const dimensionStyle = size
    ? { width: size, height: size, minWidth: size, minHeight: size }
    : undefined;

  if (!failed && index < urls.length) {
    return (
      <div
        className={`rounded-xl ${bgClass} flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 aspect-square ${imgPadding} ${className}`}
        style={dimensionStyle}
      >
        <img
          src={urls[index]}
          alt={alt}
          className="w-full h-full object-contain select-none pointer-events-none"
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

// Official bKash (বিকাশ) Logo
const BKASH_URLS = ['/logos/bkash.png', '/logos/bkash.svg'];

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
      <svg viewBox="68 18 27 24" fill="none" className="w-full h-full p-1" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFFFFF" d="m78.08 29.42-7.62-9.35.03-.07 9.98 1.14z" />
        <path fill="#FFFFFF" d="m78.48 29.49 2.4-8.32 7.29 9.7-.04.07z" />
        <path fill="#FFFFFF" d="m78.5 29.9 9.24 1.4.01.09-7.97 3.81z" />
        <path fill="#FFFFFF" opacity="0.9" d="m75.05 39.96 3-10.08q.08.15.1.23l1.42 6.11q.08.28-.17.46l-4.1 3.18-.2.14q0-.03-.05-.04" />
        <path fill="#FFFFFF" d="M85.69 27c1.6-.29 3.16-.55 4.79-.83l-1.83 4.75z" />
        <path fill="#FFFFFF" opacity="0.95" d="m81.05 35 7.15-3.47.05.04-.27.78a.3.3 0 0 1-.17.13l-6.67 2.56h-.06zm11.69-6.84H90.1l.71-1.85 1.97 1.77z" />
        <path fill="#FFFFFF" opacity="0.85" d="m74.22 25.38-4.06-3.67.03-.07h1.03c.05 0 .11.07.15.11l2.86 3.5.04.1z" />
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
      bgClass="bg-white border border-slate-100"
      imgPadding="p-1"
    />
  );
}

// Official Nagad (নগদ) Logo
const NAGAD_URLS = ['/logos/nagad.png', '/logos/nagad.svg'];

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
      bgClass="bg-white border border-slate-100"
      imgPadding="p-1"
    />
  );
}

// Official DBBL Rocket (রকেট) Logo
const ROCKET_URLS = ['/logos/rocket.png', '/logos/rocket.svg'];

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
      className={`rounded-xl bg-[#8C3494] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Rocket (DBBL)"
    >
      <svg viewBox="0 0 200 126" fill="none" className="w-full h-full p-1" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFFFFF" d="M 148.5 16.3 L 119 45.9 L 121.1 62.5 L 126.5 51.1 L 143.3 72.6 L 166.8 0 L 88.5 32.6 L 109.7 43.8 Z" />
        <path fill="#FFFFFF" d="M 122.9 68.2 C 97.9 68.2 91.9 68.2 91.9 68.2 C 68.2 71.8 65.7 106.3 91.6 110.9 L 122.9 110.9 L 122.9 79.8 C 133.3 80.2 135.5 93.2 127.8 98 C 129.3 99.8 135.5 106.6 135.5 106.6 C 151.9 92.5 142.5 69.3 122.9 68.2 Z" />
        <path fill="#FFFFFF" d="M 187.8 83.7 L 171.5 95.2 L 186 95.2 C 188.9 95 189 99.3 186 99.6 L 160.9 99.6 L 160.9 79.9 L 199.4 79.9 L 199.4 68.2 C 193.7 68.2 192 44.1 155.7 56.6 C 168.6 57.3 182.4 68.2 182.4 68.2 L 149.5 68.2 L 149.5 111 L 186.5 111 C 194.9 110.8 198.8 104.7 199.7 99.3 C 200.2 90.8 195.1 85.1 187.8 83.7 Z" />
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
      bgClass="bg-[#8C3494]"
      imgPadding="p-0.5"
    />
  );
}

// Official Bangladeshi Bank Transfer (Bangladesh Bank BEFTN / NPSB) Logo
const BANGLADESH_BANK_URLS = ['/logos/bank_bd.svg'];

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

  const vectorFallback = (
    <div
      className={`rounded-xl bg-[#006A4E] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Bangladeshi Bank (BEFTN / NPSB)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="44" stroke="#D97706" strokeWidth="2.5" />
        <circle cx="50" cy="46" r="25" fill="#F42A41" />
        <polygon points="50,26 24,38 76,38" fill="#FFFFFF" />
        <rect x="22" y="38" width="56" height="4" rx="1" fill="#FFFFFF" />
        <rect x="28" y="44" width="7" height="20" rx="1.5" fill="#FFFFFF" />
        <rect x="40" y="44" width="7" height="20" rx="1.5" fill="#FFFFFF" />
        <rect x="53" y="44" width="7" height="20" rx="1.5" fill="#FFFFFF" />
        <rect x="65" y="44" width="7" height="20" rx="1.5" fill="#FFFFFF" />
        <rect x="18" y="66" width="64" height="4" rx="1" fill="#FFFFFF" />
        <rect x="14" y="80" width="72" height="12" rx="6" fill="#064E3B" stroke="#F59E0B" strokeWidth="1" />
        <text x="50" y="89" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill="#FBBF24" textAnchor="middle">BEFTN • NPSB</text>
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={BANGLADESH_BANK_URLS}
      alt="Bangladeshi Bank BEFTN NPSB Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#006A4E]"
      imgPadding="p-0.5"
    />
  );
}

// =============================================================
// 2. NIGERIA OFFICIAL PAYMENT LOGOS
// =============================================================

// Official PalmPay Logo
const PALMPAY_URLS = ['/logos/palmpay.png', '/logos/palmpay.svg'];

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
      imgPadding="p-1"
    />
  );
}

// Official OPay Logo
const OPAY_URLS = ['/logos/opay.svg'];

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
        <circle cx="50" cy="42" r="26" stroke="#FFFFFF" strokeWidth="8" />
        <circle cx="50" cy="42" r="7" fill="#FFFFFF" />
        <text x="50" y="82" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="18" fill="#FFFFFF" textAnchor="middle">
          OPay
        </text>
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
      imgPadding="p-0.5"
    />
  );
}

// Official Kuda Bank Logo
const KUDA_URLS = ['/logos/kuda.png', '/logos/kuda.svg'];

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
      imgPadding="p-0.5"
    />
  );
}

// Official Union Bank of Nigeria Plc Logo
const UNION_BANK_URLS = ['/logos/unionbank.png', '/logos/unionbank.svg'];

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
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
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
      alt="Union Bank of Nigeria Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#005CA9]"
      imgPadding="p-0.5"
    />
  );
}

// Official Access Bank Logo
const ACCESS_BANK_URLS = ['/logos/access_bank.png', '/logos/access_bank.svg'];

export function OfficialAccessBankLogo({
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
      className={`rounded-xl bg-[#001D4A] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Access Bank Plc"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        {/* Background shield/circle accent */}
        <rect width="100" height="100" rx="20" fill="#001D4A" />
        {/* Access Bank signature chevrons in bright orange & white */}
        <g transform="translate(14, 22) scale(0.72)">
          {/* Left chevron 1 */}
          <path d="M12 50 L40 18 L52 30 L32 50 L52 70 L40 82 Z" fill="#F58220" />
          {/* Middle chevron 2 */}
          <path d="M38 50 L66 18 L78 30 L58 50 L78 70 L66 82 Z" fill="#F7941D" />
          {/* Right chevron 3 */}
          <path d="M64 50 L92 18 L104 30 L84 50 L104 70 L92 82 Z" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={ACCESS_BANK_URLS}
      alt="Access Bank Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#001D4A]"
      imgPadding="p-0.5"
    />
  );
}

// Official Nigerian Bank Transfer (NIBSS NIP) Logo
const NIGERIAN_BANK_URLS = ['/logos/nigerian_bank.png', '/logos/nigerian_bank.svg'];

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

  const vectorFallback = (
    <div
      className={`rounded-xl bg-[#008751] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Nigerian Bank Transfer (NIBSS Instant Payments)"
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

  return (
    <OfficialLogoImage
      urls={NIGERIAN_BANK_URLS}
      alt="Nigerian Bank Transfer (NIBSS NIP) Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-white border border-slate-100"
      imgPadding="p-1"
    />
  );
}

// =============================================================
// 3. GLOBAL USD OFFICIAL PAYMENT LOGOS
// =============================================================

// Official Airtm Logo
const AIRTM_URLS = ['/logos/airtm.svg'];

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
      className={`rounded-xl bg-[#0066F6] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Airtm"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 46 L42 28 L58 28 L72 46 L62 56 L38 56 Z" stroke="#FFFFFF" strokeWidth="3.5" strokeLinejoin="round" fill="#FFFFFF" fillOpacity="0.2" />
        <circle cx="28" cy="46" r="4.5" fill="#FFFFFF" />
        <circle cx="42" cy="28" r="4.5" fill="#FFFFFF" />
        <circle cx="58" cy="28" r="4.5" fill="#FFFFFF" />
        <circle cx="72" cy="46" r="4.5" fill="#FFFFFF" />
        <circle cx="38" cy="56" r="4.5" fill="#FFFFFF" />
        <circle cx="62" cy="56" r="4.5" fill="#FFFFFF" />
        <circle cx="50" cy="44" r="6" fill="#FFFFFF" />
        <text x="50" y="78" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="16" fill="#FFFFFF" textAnchor="middle">
          airtm
        </text>
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
      imgPadding="p-0.5"
    />
  );
}

// Official Global USD Bank Transfer (SWIFT / ACH / Wire) Logo
const GLOBAL_BANK_URLS = ['/logos/bank_usd.svg'];

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

  const vectorFallback = (
    <div
      className={`rounded-xl bg-[#0A1D37] text-white flex items-center justify-center select-none shadow-xs overflow-hidden shrink-0 ${className}`}
      style={dimensionStyle}
      title="Bank Transfer (SWIFT / ACH Wire)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="40" r="22" stroke="#F97316" strokeWidth="2.5" fill="#0F294D" />
        <ellipse cx="50" cy="33" rx="20" ry="6" stroke="#38BDF8" strokeWidth="1" fill="none" />
        <line x1="28" y1="40" x2="72" y2="40" stroke="#F97316" strokeWidth="1.5" />
        <ellipse cx="50" cy="47" rx="20" ry="6" stroke="#38BDF8" strokeWidth="1" fill="none" />
        <ellipse cx="50" cy="40" rx="12" ry="22" stroke="#38BDF8" strokeWidth="1.2" fill="none" />
        <text x="50" y="76" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="13" fill="#FFFFFF" textAnchor="middle" letterSpacing="1.5">
          SWIFT
        </text>
      </svg>
    </div>
  );

  return (
    <OfficialLogoImage
      urls={GLOBAL_BANK_URLS}
      alt="SWIFT Global Wire Bank Transfer Official Logo"
      size={size}
      className={className}
      fallback={vectorFallback}
      bgClass="bg-[#0A1D37]"
      imgPadding="p-0.5"
    />
  );
}

// =============================================================
// 4. INDIA OFFICIAL PAYMENT LOGOS
// =============================================================

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

  return (
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
}

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

  return (
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
}

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

  return (
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
  countryCode,
}: {
  name: string;
  iconType?: string;
  className?: string;
  size?: number;
  countryCode?: string;
}) {
  const n = (name || '').toLowerCase().trim();
  const t = (iconType || '').toLowerCase().trim();
  const c = (countryCode || '').toLowerCase().trim();

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
    t === 'bank_bd' ||
    ((n.includes('bank') || t === 'bank') && (c === 'bd' || c === 'bdt' || c === 'bangladesh' || n.includes('bangladesh'))) ||
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
  if (t === 'access_bank' || t === 'access' || n.includes('access bank') || n.includes('access')) {
    return <OfficialAccessBankLogo className={className} size={size} />;
  }
  if (t === 'union_bank' || n.includes('union')) {
    return <OfficialUnionBankLogo className={className} size={size} />;
  }
  if (
    t === 'nigerian_bank' ||
    t === 'bank_transfer' ||
    ((n.includes('bank') || t === 'bank') && (c === 'ng' || c === 'ngn' || c === 'nigeria' || n.includes('nigeria') || n.includes('nip') || n.includes('nuban')))
  ) {
    return <OfficialNigerianBankLogo className={className} size={size} />;
  }

  // 3. Global USD
  if (t === 'airtm' || n.includes('airtm') || n.includes('air tm')) {
    return <OfficialAirtmLogo className={className} size={size} />;
  }
  if (
    t === 'bank_usd' ||
    ((n.includes('bank') || t === 'bank') && (c === 'global' || c === 'us' || c === 'usd' || n.includes('usd') || n.includes('swift') || n.includes('wire') || n.includes('ach'))) ||
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
  if (t === 'bank_in' || ((n.includes('bank') || t === 'bank') && (c === 'in' || c === 'inr' || c === 'india' || n.includes('india') || n.includes('imps')))) {
    return <OfficialIndianBankLogo className={className} size={size} />;
  }

  // Contextual fallback by country code
  if (c === 'bd' || c === 'bdt') return <OfficialBangladeshiBankLogo className={className} size={size} />;
  if (c === 'ng' || c === 'ngn') return <OfficialNigerianBankLogo className={className} size={size} />;
  if (c === 'in' || c === 'inr') return <OfficialIndianBankLogo className={className} size={size} />;

  return <OfficialGlobalBankLogo className={className} size={size} />;
}
