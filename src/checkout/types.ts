export interface CryptoToken {
  id: string;
  symbol: string;
  name: string;
  network: string;
  networks: string[];
  iconBg: string;
  iconColor: string;
  svgIcon: string;
  logoUrl?: string;
  rateToEur: number;
  priceUsd: number; // Real-time market price of 1 token in USD
}

export interface PaymentDetails {
  beneficiary: string;
  amountFiat: number;
  fiatCurrency: string;
  selectedToken: CryptoToken;
  cryptoAmount: number;
  networkFee: string;
  exchangeRateText: string;
  walletAddress: string;
  countdownSeconds: number;
}

export interface PayoutOrder {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  tokenSymbol?: string;
  tokenNetwork?: string;
  cryptoAmount?: number;
  grossCryptoAmount?: number;
  platformFee?: number;
  netCryptoAmount?: number;
  fiatCurrencyCode?: string;
  fiatCurrencySymbol?: string;
  fiatAmount?: number;
  country?: string;
  paymentMethod?: string;
  accountNumber?: string;
  accountType?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | string;
  createdAt?: string;
  verifiedOnChain?: boolean;
  txHash?: string;
}

/**
 * Generates clean, unique, professional Order ID in format:
 * CB-YYYYMMDD-XXXXXX (e.g. CB-20261008-A7K9P2)
 * CB = Coin Bridge
 * YYYYMMDD = Order date
 * XXXXXX = Random unique uppercase code
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 6; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CB-${dateStr}-${randomCode}`;
}
