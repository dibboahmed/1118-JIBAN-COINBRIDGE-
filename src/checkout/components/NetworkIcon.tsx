import { OfficialUsdtLogo } from './OfficialTokenLogos';

export interface UsdtNetworkItem {
  id: 'polygon' | 'bep20' | 'solana';
  name: string;
  fullName: string;
  tag: string;
  chain: string;
  description: string;
  speed: string;
  badge: string;
  brandColor: string;
}

export const USDT_SUPPORTED_NETWORKS: UsdtNetworkItem[] = [
  {
    id: 'polygon',
    name: 'Polygon',
    fullName: 'Polygon',
    tag: 'POLYGON',
    chain: 'Polygon POS',
    description: 'Polygon Ecosystem Network',
    speed: 'Fast • ~30 sec',
    badge: 'Recommended',
    brandColor: '#8247E5',
  },
  {
    id: 'bep20',
    name: 'BEP20',
    fullName: 'BNB Chain (BEP-20)',
    tag: 'BEP-20',
    chain: 'BNB Smart Chain',
    description: 'BNB Smart Chain (BSC)',
    speed: 'Fast • ~15 sec',
    badge: 'Popular',
    brandColor: '#F3BA2F',
  },
  {
    id: 'solana',
    name: 'Solana',
    fullName: 'Solana (SPL)',
    tag: 'SPL',
    chain: 'Solana',
    description: 'Solana High Speed Network',
    speed: 'Instant payout',
    badge: 'Lowest fee',
    brandColor: '#14F195',
  },
];

export function getNetworkShortName(network?: string): string {
  const n = (network || '').toLowerCase().trim();
  if (n.includes('solana') || n.includes('spl') || n === 'sol') return 'Solana';
  if (n.includes('bnb') || n.includes('bep-20') || n.includes('bep20') || n.includes('bsc')) return 'BEP20';
  if (n.includes('polygon') || n.includes('matic') || n.includes('pol')) return 'Polygon';
  return 'Polygon';
}

export function NetworkIcon({ network, size = 32, className = '' }: { network: string; size?: number; className?: string }) {
  const n = (network || '').toLowerCase().trim();

  // 1. Tron (TRC-20)
  if (n.includes('tron') || n.includes('trc-20') || n.includes('trc20') || n === 'trx') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <circle cx="16" cy="16" r="16" fill="#EF0027" />
        <path d="M7 8.5L25 10.5L21.5 24.5L16 26.5L7 8.5Z" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M7 8.5L16 16.5L21.5 24.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M25 10.5L16 16.5L16 26.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }

  // 2. BNB Chain (BEP-20)
  if (n.includes('bnb') || n.includes('bep-20') || n.includes('bep20') || n.includes('bsc')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
        <path
          d="M12.115 13.918L16 10.033l3.885 3.885 2.26-2.26L16 5.513l-6.145 6.145 2.26 2.26zM5.513 16l2.26-2.26 2.26 2.26-2.26 2.26L5.513 16zm15.46 0l2.26-2.26 2.26 2.26-2.26 2.26-2.26-2.26zm-8.858 2.082L16 21.967l3.885-3.885 2.26 2.26L16 26.487l-6.145-6.145 2.26-2.26z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 3. Solana (SPL)
  if (n.includes('solana') || n.includes('spl') || n === 'sol') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <circle cx="16" cy="16" r="16" fill="#000000" />
        <defs>
          <linearGradient id="sol-net-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
        </defs>
        <path
          d="M8.2 21.6c.14-.14.33-.22.53-.22h12.52c.32 0 .6.2.7.5.11.3.02.63-.22.82l-2.45 2c-.14.14-.33.22-.53.22H6.23c-.32 0-.6-.2-.7-.5-.11-.3-.02-.63.22-.82l2.45-2z"
          fill="url(#sol-net-grad)"
        />
        <path
          d="M8.2 9.8c.14-.14.33-.22.53-.22h12.52c.32 0 .6.2.7.5.11.3.02.63-.22.82l-2.45 2c-.14.14-.33.22-.53.22H6.23c-.32 0-.6-.2-.7-.5-.11-.3-.02-.63.22-.82l2.45-2z"
          fill="url(#sol-net-grad)"
        />
        <path
          d="M23.8 15.7c-.14-.14-.33-.22-.53-.22H10.75c-.32 0-.6.2-.7.5-.11.3.02.63.22.82l2.45 2c.14.14.33.22.53.22h12.52c.32 0 .6-.2.7-.5.11-.3.02-.63-.22-.82l-2.45-2z"
          fill="url(#sol-net-grad)"
        />
      </svg>
    );
  }

  // 4. Polygon
  if (n.includes('polygon') || n.includes('matic') || n.includes('pol')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <circle cx="16" cy="16" r="16" fill="#8247E5" />
        <path
          d="M20.8 12.3c-.6-.4-1.4-.4-2 0l-3.3 1.9-2.2 1.3-3.3 1.9c-.6.4-1.4.4-2 0l-2.6-1.5c-.6-.4-1-1-1-1.7s.4-1.4 1-1.7l2.6-1.5c.6-.4 1.4-.4 2 0l2.6 1.5c.6.4 1 1 1 1.7v1.8l2.2-1.3v-1.8c0-1.4-.7-2.7-2-3.4l-2.6-1.5c-1.2-.7-2.7-.7-3.9 0l-2.6 1.5c-1.2.7-2 2-2 3.4s.7 2.7 2 3.4l2.6 1.5c.6.4 1.4.4 2 0l3.3-1.9 2.2-1.3 3.3-1.9c.6-.4 1.4-.4 2 0l2.6 1.5c.6.4 1 1 1 1.7s-.4 1.4-1 1.7l-2.6 1.5c-.6.4-1.4.4-2 0l-2.6-1.5c-.6-.4-1-1-1-1.7v-1.8l-2.2 1.3v1.8c0 1.4.7 2.7 2 3.4l2.6 1.5c1.2.7 2.7.7 3.9 0l2.6-1.5c1.2-.7 2-2 2-3.4s-.7-2.7-2-3.4l-2.6-1.5z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 5. Ethereum default
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <g fill="#FFFFFF">
        <path d="M16.498 4v8.87l7.497 3.35z" fillOpacity="0.6" />
        <path d="M16.498 4L9 16.22l7.498-3.35z" />
        <path d="M16.498 21.968v6.027L24 17.616z" fillOpacity="0.6" />
        <path d="M16.498 27.995v-6.027L9 17.616z" />
        <path d="M16.498 20.573l7.497-4.353-7.497-3.346z" fillOpacity="0.2" />
        <path d="M9 16.22l7.498 4.353v-7.699z" fillOpacity="0.6" />
      </g>
    </svg>
  );
}

export function UsdtWithNetworkBadge({
  network,
  size = 28,
  badgeSize = 13,
  className = '',
}: {
  network?: string;
  size?: number;
  badgeSize?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <OfficialUsdtLogo size={size} className="w-full h-full" />
      {network && (
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full ring-1.5 ring-white bg-white flex items-center justify-center overflow-hidden"
          style={{ width: badgeSize, height: badgeSize }}
          title={network}
        >
          <NetworkIcon network={network} size={badgeSize} />
        </div>
      )}
    </div>
  );
}
