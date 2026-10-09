import { useState } from 'react';

const USDT_OFFICIAL_URLS = [
  'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  'https://cryptologos.cc/logos/tether-usdt-logo.png?v=035',
];

const POLYGON_OFFICIAL_URLS = [
  'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
  'https://cryptologos.cc/logos/polygon-matic-logo.png?v=035',
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
];

const USDC_OFFICIAL_URLS = [
  'https://assets.coingecko.com/coins/images/6319/large/usdc.png',
  'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=035',
];

export function OfficialUsdtLogo({
  className = 'w-7 h-7',
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (!failed && index < USDT_OFFICIAL_URLS.length) {
    return (
      <img
        src={USDT_OFFICIAL_URLS[index]}
        alt="Tether USDT Official Logo"
        width={size}
        height={size}
        className={`rounded-full object-contain shrink-0 select-none aspect-square drop-shadow-2xs ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        onError={() => {
          if (index + 1 < USDT_OFFICIAL_URLS.length) {
            setIndex((i) => i + 1);
          } else {
            setFailed(true);
          }
        }}
        loading="eager"
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-[#26A17B] flex items-center justify-center text-white shrink-0 aspect-square overflow-hidden shadow-2xs ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      title="Tether USD (USDT)"
    >
      <svg viewBox="0 0 32 32" className="w-[72%] h-[72%]" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.922 17.383c-.11.008-.227.012-.357.012-1.398 0-2.61-.17-3.522-.464v4.544c.974.316 2.247.502 3.693.502 1.408 0 2.65-.18 3.593-.487v-4.57c-.89.288-2.072.463-3.407.463zm-.186-9.383h-3.329v3.084h-5.407v4.113h5.407v1.89c-4.455.333-7.807 1.706-7.807 3.363 0 1.657 3.352 3.03 7.807 3.363v7.187h3.329v-7.187c4.455-.333 7.807-1.706 7.807-3.363 0-1.657-3.352-3.03-7.807-3.363v-1.89h5.407V11.084h-5.407V8z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}

export function OfficialUsdcLogo({
  className = 'w-7 h-7',
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (!failed && index < USDC_OFFICIAL_URLS.length) {
    return (
      <img
        src={USDC_OFFICIAL_URLS[index]}
        alt="USD Coin USDC Official Logo"
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 select-none drop-shadow-2xs ${className}`}
        style={{ width: size, height: size }}
        onError={() => {
          if (index + 1 < USDC_OFFICIAL_URLS.length) {
            setIndex((i) => i + 1);
          } else {
            setFailed(true);
          }
        }}
        loading="eager"
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-[#2775CA] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-2xs ${className}`}
      style={{ width: size, height: size }}
      title="USD Coin (USDC)"
    >
      <svg viewBox="0 0 32 32" className="w-[72%] h-[72%]" fill="none">
        <circle cx="16" cy="16" r="14" fill="#2775CA" />
        <text x="16" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">
          $
        </text>
      </svg>
    </div>
  );
}

export function OfficialPolygonLogo({
  className = 'w-5 h-5',
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (!failed && index < POLYGON_OFFICIAL_URLS.length) {
    return (
      <img
        src={POLYGON_OFFICIAL_URLS[index]}
        alt="Polygon Official Logo"
        width={size}
        height={size}
        className={`rounded-full object-contain shrink-0 select-none aspect-square ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        onError={() => {
          if (index + 1 < POLYGON_OFFICIAL_URLS.length) {
            setIndex((i) => i + 1);
          } else {
            setFailed(true);
          }
        }}
        loading="eager"
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-[#8247E5] flex items-center justify-center text-white shrink-0 aspect-square shadow-2xs ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      title="Polygon (POS)"
    >
      <svg viewBox="0 0 178 161" className="w-[70%] h-[70%]" fill="none">
        <path
          d="M66.8,54.7l-16.7-9.7L0,74.1v58l50.1,29l50.1-29V41.9L128,25.8l27.8,16.1v32.2L128,90.2l-16.7-9.7v25.8l16.7,9.7l50.1-29V41.9L128,12.9L66.8,54.7z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}

export function OfficialBnbLogo({
  className = 'w-5 h-5',
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const bnbUrl = 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png';

  if (!failed) {
    return (
      <img
        src={bnbUrl}
        alt="BNB Official Logo"
        width={size}
        height={size}
        className={`rounded-full object-contain shrink-0 select-none aspect-square ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        onError={() => setFailed(true)}
        loading="eager"
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-[#F3BA2F] flex items-center justify-center text-white shrink-0 aspect-square shadow-2xs ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      title="BNB Chain"
    >
      <svg viewBox="0 0 24 24" className="w-[65%] h-[65%]" fill="none">
        <path
          d="M9.1 10.4L12 7.5l2.9 2.9 1.7-1.7L12 4.1 7.4 8.7l1.7 1.7zM4.1 12l1.7-1.7 1.7 1.7-1.7 1.7L4.1 12zm5 1.6L12 16.5l2.9-2.9 1.7 1.7L12 20l-4.6-4.6 1.7-1.8zm2.9-2.2l1.2 1.2-1.2 1.2-1.2-1.2 1.2-1.2z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}

export function OfficialSolanaLogo({
  className = 'w-5 h-5',
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const solUrl = 'https://assets.coingecko.com/coins/images/4128/large/solana.png';

  if (!failed) {
    return (
      <img
        src={solUrl}
        alt="Solana Official Logo"
        width={size}
        height={size}
        className={`rounded-full object-contain shrink-0 select-none aspect-square ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        onError={() => setFailed(true)}
        loading="eager"
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-black flex items-center justify-center shrink-0 aspect-square shadow-2xs ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      title="Solana"
    >
      <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="none">
        <defs>
          <linearGradient id="sol-icon-grad-official" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
        </defs>
        <path
          d="M6.2 16.2c.1-.1.2-.2.4-.2h9.4c.2 0 .5.2.5.4 0 .2 0 .5-.2.6l-1.8 1.5c-.1.1-.2.2-.4.2H4.7c-.2 0-.5-.2-.5-.4 0-.2 0-.5.2-.6l1.8-1.5z"
          fill="url(#sol-icon-grad-official)"
        />
        <path
          d="M6.2 7.3c.1-.1.2-.2.4-.2h9.4c.2 0 .5.2.5.4 0 .2 0 .5-.2.6L14.5 9.6c-.1.1-.2.2-.4.2H4.7c-.2 0-.5-.2-.5-.4 0-.2 0-.5.2-.6l1.8-1.5z"
          fill="url(#sol-icon-grad-official)"
        />
        <path
          d="M17.8 11.8c-.1-.1-.2-.2-.4-.2H8c-.2 0-.5.2-.5.4 0 .2 0 .5.2.6l1.8 1.5c.1.1.2.2.4.2h9.4c.2 0 .5-.2.5-.4 0-.2 0-.5-.2-.6l-1.8-1.5z"
          fill="url(#sol-icon-grad-official)"
        />
      </svg>
    </div>
  );
}

export function OfficialTokenLogo({
  symbol,
  className = 'w-7 h-7',
  size = 28,
}: {
  symbol: string;
  className?: string;
  size?: number;
}) {
  const s = symbol.toUpperCase().trim();
  if (s === 'USDT') {
    return <OfficialUsdtLogo className={className} size={size} />;
  }
  return <OfficialUsdcLogo className={className} size={size} />;
}
