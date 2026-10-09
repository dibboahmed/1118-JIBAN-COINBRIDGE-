import { CryptoToken } from '../types';
import { FIAT_CURRENCIES, FiatCurrency } from '../data/currencies';

export interface LiveMarketData {
  priceUsd: number;
  change24h?: number;
  lastUpdated: number;
}

export interface LiveMarketMap {
  [tokenId: string]: LiveMarketData;
}

let cachedMarketData: LiveMarketMap = {
  btc: { priceUsd: 83951.27, change24h: -0.35, lastUpdated: Date.now() },
  eth: { priceUsd: 2689.74, change24h: 0.46, lastUpdated: Date.now() },
  sol: { priceUsd: 124.5, change24h: 3.29, lastUpdated: Date.now() },
  bnb: { priceUsd: 774.99, change24h: 0.41, lastUpdated: Date.now() },
  usdt: { priceUsd: 1.0, change24h: 0.0, lastUpdated: Date.now() },
  usdc: { priceUsd: 1.0, change24h: 0.0, lastUpdated: Date.now() },
};

const initialFiatRatesFromUsd: Record<string, number> = {
  USD: 1.0,
};

for (const c of FIAT_CURRENCIES) {
  if (c.rateToUsd && c.rateToUsd > 0) {
    initialFiatRatesFromUsd[c.code] = c.rateToUsd;
  } else if (c.rateToEur && c.rateToEur > 0) {
    initialFiatRatesFromUsd[c.code] = c.rateToEur * 0.8773;
  }
}

let cachedFiatRatesFromUsd: Record<string, number> = { ...initialFiatRatesFromUsd };
let lastCryptoFetchTime = 0;
let lastFiatFetchTime = 0;
const CACHE_DURATION_MS = 15 * 1000;

function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, {
    cache: 'no-store',
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));
}

function isReasonablePrice(tokenId: string, price: number): boolean {
  if (!Number.isFinite(price) || price <= 0) return false;
  switch (tokenId) {
    case 'btc': return price >= 10000 && price <= 500000;
    case 'eth': return price >= 500 && price <= 50000;
    case 'bnb': return price >= 50 && price <= 10000;
    case 'sol': return price >= 5 && price <= 5000;
    case 'usdt':
    case 'usdc': return price >= 0.95 && price <= 1.05;
    default: return price > 0;
  }
}

export async function fetchLiveCryptoPrices(): Promise<LiveMarketMap> {
  const now = Date.now();
  if (now - lastCryptoFetchTime < CACHE_DURATION_MS && Object.keys(cachedMarketData).length > 0) {
    return { ...cachedMarketData };
  }

  const binanceSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'USDCUSDT'];
  const binanceQuery = encodeURIComponent(JSON.stringify(binanceSymbols));
  const binanceEndpoints = [
    `https://data-api.binance.vision/api/v3/ticker/24hr?symbols=${binanceQuery}`,
    `https://api.binance.com/api/v3/ticker/24hr?symbols=${binanceQuery}`,
  ];

  for (const endpoint of binanceEndpoints) {
    try {
      const res = await fetchWithTimeout(endpoint, 3000);
      if (res.ok) {
        const data: Array<{ symbol: string; lastPrice: string; priceChangePercent: string }> = await res.json();
        const nextData: LiveMarketMap = { ...cachedMarketData };
        let updatedCount = 0;

        data.forEach((item) => {
          const price = parseFloat(item.lastPrice);
          const change = parseFloat(item.priceChangePercent) || 0;
          if (item.symbol === 'BTCUSDT' && isReasonablePrice('btc', price)) {
            nextData.btc = { priceUsd: price, change24h: change, lastUpdated: now };
            updatedCount++;
          } else if (item.symbol === 'ETHUSDT' && isReasonablePrice('eth', price)) {
            nextData.eth = { priceUsd: price, change24h: change, lastUpdated: now };
            updatedCount++;
          } else if (item.symbol === 'SOLUSDT' && isReasonablePrice('sol', price)) {
            nextData.sol = { priceUsd: price, change24h: change, lastUpdated: now };
            updatedCount++;
          } else if (item.symbol === 'BNBUSDT' && isReasonablePrice('bnb', price)) {
            nextData.bnb = { priceUsd: price, change24h: change, lastUpdated: now };
            updatedCount++;
          } else if (item.symbol === 'USDCUSDT') {
            nextData.usdc = { priceUsd: 1.0, change24h: change, lastUpdated: now };
          }
        });

        nextData.usdt = { priceUsd: 1.0, change24h: 0.0, lastUpdated: now };
        nextData.usdc = { priceUsd: 1.0, change24h: nextData.usdc?.change24h ?? 0.0, lastUpdated: now };

        if (updatedCount >= 3) {
          cachedMarketData = nextData;
          lastCryptoFetchTime = now;
          return { ...cachedMarketData };
        }
      }
    } catch {
      // Continue to next endpoint
    }
  }

  // Fallback endpoint
  try {
    const res = await fetchWithTimeout(
      'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,SOL,BNB,USDT,USDC&tsyms=USD',
      3500
    );
    if (res.ok) {
      const data = await res.json();
      if (data.RAW) {
        const raw = data.RAW;
        const nextData: LiveMarketMap = { ...cachedMarketData };
        if (raw.BTC?.USD?.PRICE && isReasonablePrice('btc', Number(raw.BTC.USD.PRICE))) {
          nextData.btc = { priceUsd: Number(raw.BTC.USD.PRICE), change24h: Number(raw.BTC.USD.CHANGEPCT24HOUR || 0), lastUpdated: now };
        }
        if (raw.ETH?.USD?.PRICE && isReasonablePrice('eth', Number(raw.ETH.USD.PRICE))) {
          nextData.eth = { priceUsd: Number(raw.ETH.USD.PRICE), change24h: Number(raw.ETH.USD.CHANGEPCT24HOUR || 0), lastUpdated: now };
        }
        if (raw.SOL?.USD?.PRICE && isReasonablePrice('sol', Number(raw.SOL.USD.PRICE))) {
          nextData.sol = { priceUsd: Number(raw.SOL.USD.PRICE), change24h: Number(raw.SOL.USD.CHANGEPCT24HOUR || 0), lastUpdated: now };
        }
        if (raw.BNB?.USD?.PRICE && isReasonablePrice('bnb', Number(raw.BNB.USD.PRICE))) {
          nextData.bnb = { priceUsd: Number(raw.BNB.USD.PRICE), change24h: Number(raw.BNB.USD.CHANGEPCT24HOUR || 0), lastUpdated: now };
        }
        nextData.usdt = { priceUsd: 1.0, change24h: 0.0, lastUpdated: now };
        nextData.usdc = { priceUsd: 1.0, change24h: 0.0, lastUpdated: now };
        cachedMarketData = nextData;
        lastCryptoFetchTime = now;
        return { ...cachedMarketData };
      }
    }
  } catch {
    // Ignore fallback error
  }

  return { ...cachedMarketData };
}

export async function fetchLiveFiatRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (now - lastFiatFetchTime < 60 * 1000 && lastFiatFetchTime > 0) {
    return { ...cachedFiatRatesFromUsd };
  }

  const fiatEndpoints = [
    'https://open.er-api.com/v6/latest/USD',
    'https://api.exchangerate-api.com/v4/latest/USD',
  ];

  for (const endpoint of fiatEndpoints) {
    try {
      const res = await fetchWithTimeout(endpoint, 3500);
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && typeof data.rates === 'object') {
          const updated: Record<string, number> = { ...cachedFiatRatesFromUsd };
          for (const [code, rate] of Object.entries(data.rates)) {
            const num = Number(rate);
            if (Number.isFinite(num) && num > 0) {
              updated[code.toUpperCase()] = num;
            }
          }
          updated.USD = 1.0;
          updated.BDT = 125.0;
          updated.NGN = 1345.0;
          cachedFiatRatesFromUsd = updated;
          lastFiatFetchTime = now;
          return { ...cachedFiatRatesFromUsd };
        }
      }
    } catch {
      // Continue
    }
  }

  return { ...cachedFiatRatesFromUsd };
}

export function calculateCryptoAmount(
  fiatAmount: number,
  fiatCurrency: FiatCurrency,
  token: CryptoToken,
  livePrices?: Record<string, number> | LiveMarketMap,
  liveFiat?: Record<string, number>
): {
  cryptoAmount: number;
  tokenPriceInFiat: number;
  fiatUnitsPerToken: number;
  oneFiatInCrypto: number;
  priceUsd: number;
  change24h?: number;
} {
  const tokenId = token.id.toLowerCase();
  let tokenPriceUsd = token.priceUsd || 1.0;
  let change24h: number | undefined = undefined;

  if (['usdt', 'usdc', 'dai', 'usds', 'usde', 'pyusd', 'fdusd', 'tusd', 'usdd'].includes(tokenId)) {
    tokenPriceUsd = 1.0;
    if (livePrices && livePrices[tokenId] && typeof livePrices[tokenId] === 'object') {
      change24h = (livePrices[tokenId] as LiveMarketData).change24h ?? 0.0;
    } else {
      change24h = 0.0;
    }
  } else if (livePrices && livePrices[tokenId]) {
    const val = livePrices[tokenId];
    if (typeof val === 'number' && isReasonablePrice(tokenId, val)) {
      tokenPriceUsd = val;
    } else if (typeof val === 'object' && 'priceUsd' in val) {
      const candidate = (val as LiveMarketData).priceUsd;
      if (isReasonablePrice(tokenId, candidate)) {
        tokenPriceUsd = candidate;
      }
      change24h = (val as LiveMarketData).change24h;
    }
  } else if (cachedMarketData[tokenId]) {
    tokenPriceUsd = cachedMarketData[tokenId].priceUsd;
    change24h = cachedMarketData[tokenId].change24h;
  }

  const code = fiatCurrency.code.toUpperCase();
  let fiatUnitsPerUsd = 1.0;

  if (code === 'BDT') {
    fiatUnitsPerUsd = 125.0; // Fixed rate for BDT payout
  } else if (code === 'NGN') {
    fiatUnitsPerUsd = 1345.0; // Fixed rate for NGN payout: 1 USDT = 1345 NGN
  } else if (code === 'USD') {
    fiatUnitsPerUsd = 1.0;
  } else if (liveFiat && liveFiat[code] && Number.isFinite(liveFiat[code]) && liveFiat[code] > 0) {
    fiatUnitsPerUsd = liveFiat[code];
  } else if (cachedFiatRatesFromUsd[code] && cachedFiatRatesFromUsd[code] > 0) {
    fiatUnitsPerUsd = cachedFiatRatesFromUsd[code];
  } else if (fiatCurrency.rateToUsd && fiatCurrency.rateToUsd > 0) {
    fiatUnitsPerUsd = fiatCurrency.rateToUsd;
  }

  const fiatUnitsPerToken = tokenPriceUsd * fiatUnitsPerUsd;
  const oneFiatInCrypto = fiatUnitsPerToken > 0 ? 1 / fiatUnitsPerToken : 0;

  if (!fiatAmount || fiatAmount <= 0) {
    return {
      cryptoAmount: 0,
      tokenPriceInFiat: fiatUnitsPerToken,
      fiatUnitsPerToken,
      oneFiatInCrypto,
      priceUsd: tokenPriceUsd,
      change24h,
    };
  }

  const cryptoAmount = fiatUnitsPerToken > 0 ? fiatAmount / fiatUnitsPerToken : 0;

  return {
    cryptoAmount,
    tokenPriceInFiat: fiatUnitsPerToken,
    fiatUnitsPerToken,
    oneFiatInCrypto,
    priceUsd: tokenPriceUsd,
    change24h,
  };
}
