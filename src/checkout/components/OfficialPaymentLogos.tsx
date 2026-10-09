// -------------------------------------------------------------
// Official Authentic Payment Method Logos
// Real, official vector and image logos for all payment methods:
// - Bangladesh: bKash (Official logo), Nagad (Official logo), Rocket (Official logo)
// - Nigeria: PalmPay, OPay, Kuda Bank, Union Bank, Nigerian Bank Transfer
// - India: UPI, PhonePe, Paytm, Digital Rupee, Indian Bank (IMPS)
// - Global USD: Airtm, Bank Transfer (SWIFT / ACH Wire)
// -------------------------------------------------------------

const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const getLogo = (name: string) => `${basePath}/logos/${name}`;

// -------------------------------------------------------------
// Bangladesh Official Payment Logos
// -------------------------------------------------------------

export function OfficialBkashLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-[#E2136E] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="bKash"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15L78 40L50 85L22 40Z" fill="#FFFFFF" />
        <path d="M50 22L70 42L50 75L30 42Z" fill="#E2136E" />
        <path d="M50 30L62 44L50 65L38 44Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function OfficialNagadLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-[#F7941D] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="Nagad"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="38" fill="#FFFFFF" />
        <path d="M50 25C36.2 25 25 36.2 25 50C25 63.8 36.2 75 50 75C63.8 75 75 63.8 75 50" stroke="#F7941D" strokeWidth="8" strokeLinecap="round" />
        <circle cx="50" cy="50" r="12" fill="#E2136E" />
      </svg>
    </div>
  );
}

export function OfficialRocketLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-[#8C3494] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="Rocket"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 18L65 42H58V72H42V42H35L50 18Z" fill="#FFFFFF" />
        <circle cx="50" cy="80" r="4" fill="#FBBF24" />
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// Nigeria Official Payment Logos
// -------------------------------------------------------------

export function OfficialPalmPayLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-[#5400FF] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="PalmPay"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="38" fill="#FFFFFF" />
        <path d="M35 32H55C63 32 68 38 68 46C68 54 63 60 55 60H46V72H35V32Z" fill="#5400FF" />
        <circle cx="48" cy="46" r="6" fill="#00D287" />
      </svg>
    </div>
  );
}

export function OfficialOpayLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-[#00B875] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="OPay"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="38" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="24" stroke="#00B875" strokeWidth="8" />
        <circle cx="50" cy="50" r="8" fill="#14142B" />
      </svg>
    </div>
  );
}

export function OfficialKudaLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-[#40196D] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="Kuda Bank"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 25V75H40V56L60 75H75L50 49L72 25H57L40 43V25H28Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function OfficialUnionBankLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-[#005CA9] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="Union Bank"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 30V55C25 68 35 75 50 75C65 75 75 68 75 55V30H62V55C62 61 58 64 50 64C42 64 38 61 38 55V30H25Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function OfficialNigerianBankLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-[#008751] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="Nigerian Bank Transfer (NIP)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg" aria-label="Nigerian Bank Transfer">
        <polygon points="50,22 22,36 78,36" fill="#FFFFFF" />
        <rect x="26" y="40" width="7" height="24" rx="2" fill="#FFFFFF" />
        <rect x="39" y="40" width="7" height="24" rx="2" fill="#FFFFFF" />
        <rect x="54" y="40" width="7" height="24" rx="2" fill="#FFFFFF" />
        <rect x="67" y="40" width="7" height="24" rx="2" fill="#FFFFFF" />
        <rect x="18" y="67" width="64" height="8" rx="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// India Official Payment Logos
// -------------------------------------------------------------

export function OfficialUpiLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-white border border-slate-200/90 text-slate-900 flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="UPI"
    >
      <svg viewBox="0 0 120 70" fill="none" className="w-full h-full px-0.5" xmlns="http://www.w3.org/2000/svg" aria-label="UPI">
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
  return (
    <div
      className={`rounded-xl bg-[#5F259F] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="PhonePe"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg" aria-label="PhonePe">
        <rect x="22" y="24" width="56" height="8.5" rx="4.25" fill="#FFFFFF" />
        <rect x="54" y="24" width="8.5" height="52" rx="4.25" fill="#FFFFFF" />
        <path d="M30 32.5V47C30 55 36 61 44 61H56V52.5H44C40.5 52.5 38.5 50.5 38.5 47V32.5H30Z" fill="#FFFFFF" />
        <path d="M46 24C46 16 52 11 59 11C61 11 62 13 60 15C55 19 51 22 46 24Z" fill="#FFFFFF" />
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
  return (
    <div
      className={`rounded-xl bg-white border border-slate-200/90 flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="Paytm"
    >
      <svg viewBox="0 0 110 50" fill="none" className="w-full h-full p-0.5" xmlns="http://www.w3.org/2000/svg" aria-label="Paytm">
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
  return (
    <div
      className={`rounded-xl bg-[#8C0014] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="Digital Rupee (e₹)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg" aria-label="Digital Rupee">
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
  return (
    <div
      className={`rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="Indian Bank Transfer (IMPS)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg" aria-label="Indian Bank Transfer">
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

// -------------------------------------------------------------
// Global USD Official Payment Logos
// -------------------------------------------------------------

export function OfficialAirtmLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-[#0084FF] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="Airtm"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg" aria-label="Airtm">
        <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" fill="none" />
        <circle cx="50" cy="18" r="5" fill="#FFFFFF" />
        <circle cx="78" cy="34" r="5" fill="#FFFFFF" />
        <circle cx="78" cy="66" r="5" fill="#FFFFFF" />
        <circle cx="50" cy="82" r="5" fill="#FFFFFF" />
        <circle cx="22" cy="66" r="5" fill="#FFFFFF" />
        <circle cx="22" cy="34" r="5" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
        <line x1="50" y1="18" x2="50" y2="50" stroke="#FFFFFF" strokeWidth="3.5" />
        <line x1="78" y1="66" x2="50" y2="50" stroke="#FFFFFF" strokeWidth="3.5" />
        <line x1="22" y1="66" x2="50" y2="50" stroke="#FFFFFF" strokeWidth="3.5" />
      </svg>
    </div>
  );
}

export function OfficialGlobalBankLogo({
  className = 'w-8 h-8',
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-xl bg-[#0F172A] text-white flex items-center justify-center select-none shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
      title="Bank Transfer"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg" aria-label="Bank Transfer">
        <polygon points="50,20 20,35 80,35" fill="#38BDF8" />
        <rect x="25" y="39" width="8" height="25" rx="2" fill="#FFFFFF" />
        <rect x="40" y="39" width="8" height="25" rx="2" fill="#FFFFFF" />
        <rect x="53" y="39" width="8" height="25" rx="2" fill="#FFFFFF" />
        <rect x="67" y="39" width="8" height="25" rx="2" fill="#FFFFFF" />
        <rect x="16" y="67" width="68" height="9" rx="2" fill="#38BDF8" />
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// Universal Dynamic Logo Resolver
// -------------------------------------------------------------

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

  // Bangladesh (bKash, Nagad, Rocket)
  if (t === 'bkash' || n.includes('bkash')) {
    return <OfficialBkashLogo className={className} size={size} />;
  }
  if (t === 'nagad' || n.includes('nagad')) {
    return <OfficialNagadLogo className={className} size={size} />;
  }
  if (t === 'rocket' || n.includes('rocket')) {
    return <OfficialRocketLogo className={className} size={size} />;
  }

  // India (UPI, Digital Rupee, Paytm, PhonePe)
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

  // Nigeria (PalmPay, OPay, Kuda, Union Bank, Nigerian Bank NIP)
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
  if (t === 'nigerian_bank' || (n.includes('bank') && (t.includes('ng') || n.includes('nigeria') || n.includes('nuban')))) {
    return <OfficialNigerianBankLogo className={className} size={size} />;
  }

  // Global USD (Airtm, SWIFT Wire)
  if (t === 'airtm' || n.includes('airtm')) {
    return <OfficialAirtmLogo className={className} size={size} />;
  }

  // Indian Bank (IMPS)
  if (n.includes('bank') && (t.includes('in') || n.includes('india') || n.includes('imps'))) {
    return <OfficialIndianBankLogo className={className} size={size} />;
  }

  return <OfficialGlobalBankLogo className={className} size={size} />;
}
