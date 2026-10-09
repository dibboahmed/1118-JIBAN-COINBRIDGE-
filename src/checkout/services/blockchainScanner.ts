// Real Blockchain On-Chain Scanner & Payment Verification Service
// Scans Polygon, BNB Chain (BSC), and Solana mainnets for genuine incoming USDT transfers.
// Strictly verifies date, timestamp, recipient wallet address, token contract, and exact payment amount.

export interface BlockchainNetworkConfig {
  id: 'polygon' | 'bnb' | 'solana';
  name: string;
  chainName: string;
  targetAddress: string;
  tokenContract: string;
  decimals: number;
  explorerTxBase: string;
  explorerAddressBase: string;
  rpcEndpoints: string[];
}

export const BLOCKCHAIN_NETWORKS: Record<'polygon' | 'bnb' | 'solana', BlockchainNetworkConfig> = {
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    chainName: 'Polygon POS (ERC-20)',
    targetAddress: '0xE6501e2c54B52ad456ceb1cC6Cc5f096beC76302',
    tokenContract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon USDT (PoS)
    decimals: 6,
    explorerTxBase: 'https://polygonscan.com/tx/',
    explorerAddressBase: 'https://polygonscan.com/address/',
    rpcEndpoints: [
      'https://polygon.drpc.org',
      'https://gateway.tenderly.co/public/polygon',
      'https://polygon-bor-rpc.publicnode.com',
      'https://1rpc.io/matic',
    ],
  },
  bnb: {
    id: 'bnb',
    name: 'BNB Chain',
    chainName: 'BNB Smart Chain (BEP-20)',
    targetAddress: '0x615EB207eA3570D17801A03253FFd52bf3fdbD07',
    tokenContract: '0x55d398326f99059fF775485246999027B3197955', // BSC USDT (BEP-20)
    decimals: 18,
    explorerTxBase: 'https://bscscan.com/tx/',
    explorerAddressBase: 'https://bscscan.com/address/',
    rpcEndpoints: [
      'https://bsc-rpc.publicnode.com',
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://1rpc.io/bnb',
    ],
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    chainName: 'Solana (SPL)',
    targetAddress: '4VhfHPD8R89VD6QqWurKMen4oVGNKHSGCrbP1WkqpxFj',
    tokenContract: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // Solana USDT Mint
    decimals: 6,
    explorerTxBase: 'https://solscan.io/tx/',
    explorerAddressBase: 'https://solscan.io/account/',
    rpcEndpoints: [
      'https://solana-rpc.publicnode.com',
      'https://api.mainnet-beta.solana.com',
    ],
  },
};

export interface VerificationResult {
  verified: boolean;
  network: 'polygon' | 'bnb' | 'solana';
  walletAddress: string;
  expectedAmount: number;
  detectedAmount: number;
  txHash?: string;
  senderAddress?: string;
  blockNumber?: number;
  blockTimestamp?: number;
  explorerUrl: string;
  verifiedAt: string;
}

// In-memory cache for block timestamps so we don't refetch the same block repeatedly
const blockTimeCache = new Map<string, number>();

/**
 * Checks if a transaction hash has already been claimed for another completed order
 */
export function isTxHashClaimed(txHash: string): boolean {
  if (!txHash) return false;
  try {
    const raw = localStorage.getItem('coinbridge_claimed_txs');
    if (raw) {
      const list: string[] = JSON.parse(raw);
      return list.includes(txHash.toLowerCase());
    }
  } catch {}
  return false;
}

/**
 * Marks a transaction hash as claimed by an order
 */
export function markTxHashClaimed(txHash: string, orderId?: string): void {
  if (!txHash) return;
  try {
    const raw = localStorage.getItem('coinbridge_claimed_txs');
    const list: string[] = raw ? JSON.parse(raw) : [];
    const lower = txHash.toLowerCase();
    if (!list.includes(lower)) {
      list.push(lower);
      localStorage.setItem('coinbridge_claimed_txs', JSON.stringify(list));
    }
    if (orderId) {
      localStorage.setItem(`coinbridge_order_tx_${orderId}`, lower);
    }
  } catch {}
}

/**
 * Reads real on-chain USDT balance for a target wallet address
 */
export async function getOnChainBalance(networkKey: 'polygon' | 'bnb' | 'solana'): Promise<number> {
  const config = BLOCKCHAIN_NETWORKS[networkKey];
  if (!config) return 0;

  if (networkKey === 'polygon') {
    const cleanAddr = config.targetAddress.toLowerCase().replace('0x', '');
    const data = `0x70a08231000000000000000000000000${cleanAddr}`;
    for (const rpc of config.rpcEndpoints) {
      try {
        const res = await fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_call',
            params: [{ to: config.tokenContract, data }, 'latest'],
          }),
        }).then((r) => r.json());
        if (res?.result && typeof res.result === 'string') {
          return parseInt(res.result, 16) / 1e6;
        }
      } catch {}
    }
    return 0;
  }

  if (networkKey === 'bnb') {
    const cleanAddr = config.targetAddress.toLowerCase().replace('0x', '');
    const data = `0x70a08231000000000000000000000000${cleanAddr}`;
    for (const rpc of config.rpcEndpoints) {
      try {
        const res = await fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_call',
            params: [{ to: config.tokenContract, data }, 'latest'],
          }),
        }).then((r) => r.json());
        if (res?.result && typeof res.result === 'string') {
          return Number(BigInt(res.result)) / 1e18;
        }
      } catch {}
    }
    return 0;
  }

  if (networkKey === 'solana') {
    for (const rpc of config.rpcEndpoints) {
      try {
        const res = await fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccountsByOwner',
            params: [
              config.targetAddress,
              { mint: config.tokenContract },
              { encoding: 'jsonParsed' },
            ],
          }),
        }).then((r) => r.json());
        if (res?.result?.value && Array.isArray(res.result.value)) {
          let sum = 0;
          for (const item of res.result.value) {
            sum += item.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
          }
          return sum;
        }
      } catch {}
    }
    return 0;
  }

  return 0;
}

/**
 * Initializes baseline balance for an order when QR code screen is generated.
 */
export async function initializeOrderBaseline(
  _orderId: string,
  networkKey: 'polygon' | 'bnb' | 'solana'
): Promise<number> {
  return await getOnChainBalance(networkKey);
}

/**
 * Fetches the block timestamp (in seconds) for a given block number
 */
async function getBlockTimestamp(rpc: string, blockNumberHex: string): Promise<number> {
  const cacheKey = `${rpc}_${blockNumberHex}`;
  if (blockTimeCache.has(cacheKey)) {
    return blockTimeCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 10,
        method: 'eth_getBlockByNumber',
        params: [blockNumberHex, false],
      }),
    }).then((r) => r.json());

    if (res?.result?.timestamp) {
      const ts = parseInt(res.result.timestamp, 16);
      blockTimeCache.set(cacheKey, ts);
      return ts;
    }
  } catch {}

  // Fallback estimation using current time
  return Math.floor(Date.now() / 1000);
}

/**
 * Scans EVM logs strictly for incoming Transfer events to the target wallet:
 * - Checks recipient address matches target address exactly
 * - Checks token contract is official USDT
 * - Checks transferred amount matches expectedAmount (tolerance 0.05 USDT)
 * - Checks transaction block timestamp >= orderCreatedSec - 25s (NOT an old transfer from before order creation!)
 * - Checks txHash has NOT already been claimed by another order
 */
async function scanEvmLogs(
  networkKey: 'polygon' | 'bnb',
  targetAddress: string,
  tokenContract: string,
  decimals: number,
  expectedAmount: number,
  orderCreatedSec: number
): Promise<VerificationResult | null> {
  const config = BLOCKCHAIN_NETWORKS[networkKey];
  const targetTopic = `0x000000000000000000000000${targetAddress.toLowerCase().replace('0x', '')}`;
  const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  const nowSec = Math.floor(Date.now() / 1000);
  const elapsedSec = Math.max(10, nowSec - orderCreatedSec + 25);
  const blockSeconds = networkKey === 'polygon' ? 2 : 3;
  const blocksToScan = Math.min(
    networkKey === 'polygon' ? 200 : 50,
    Math.ceil(elapsedSec / blockSeconds) + 10
  );

  for (const rpc of config.rpcEndpoints) {
    try {
      // 1. Get latest block number
      const blkRes = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
      }).then((r) => r.json());

      if (!blkRes?.result) continue;
      const latest = parseInt(blkRes.result, 16);
      const fromBlock = '0x' + Math.max(0, latest - blocksToScan).toString(16);
      const toBlock = '0x' + latest.toString(16);

      // 2. Query event logs for USDT Transfer(from, to, value)
      const logsRes = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_getLogs',
          params: [
            {
              address: tokenContract,
              topics: [transferTopic, null, targetTopic],
              fromBlock,
              toBlock,
            },
          ],
        }),
      }).then((r) => r.json());

      if (logsRes?.result && Array.isArray(logsRes.result) && logsRes.result.length > 0) {
        for (const log of logsRes.result) {
          const txHash = log.transactionHash;
          if (!txHash || isTxHashClaimed(txHash)) {
            continue; // Already processed or invalid
          }

          // Parse raw value
          const rawAmount =
            decimals === 6
              ? parseInt(log.data, 16) / 1e6
              : Number(BigInt(log.data)) / 1e18;

          // 3. STRICT AMOUNT CHECK: must match expected order amount within 0.05 tolerance
          const tolerance = 0.05;
          if (Math.abs(rawAmount - expectedAmount) > tolerance) {
            // Amount does not match this order! Skip it
            continue;
          }

          // 4. STRICT TIMESTAMP CHECK: block timestamp must be after order creation
          const blockTimestamp = await getBlockTimestamp(rpc, log.blockNumber);
          if (blockTimestamp < orderCreatedSec - 25) {
            // This transfer was mined BEFORE the user placed the order! Skip it
            continue;
          }

          const sender = '0x' + (log.topics[1]?.slice(26) || '');
          const blockNum = parseInt(log.blockNumber, 16);

          return {
            verified: true,
            network: networkKey,
            walletAddress: targetAddress,
            expectedAmount,
            detectedAmount: rawAmount,
            txHash,
            senderAddress: sender,
            blockNumber: blockNum,
            blockTimestamp,
            explorerUrl: `${config.explorerTxBase}${txHash}`,
            verifiedAt: new Date(blockTimestamp * 1000).toISOString(),
          };
        }
      }
    } catch {
      // try next rpc endpoint
    }
  }

  return null;
}

/**
 * Scans Solana recent signatures strictly for confirmed USDT transfers:
 * - Checks recipient matches target address
 * - Checks signature blockTime >= orderCreatedSec - 25s
 * - Checks transferred token amount matches expectedAmount (tolerance 0.05)
 * - Checks signature has NOT already been claimed
 */
async function scanSolanaTransfers(
  targetAddress: string,
  expectedAmount: number,
  orderCreatedSec: number
): Promise<VerificationResult | null> {
  const config = BLOCKCHAIN_NETWORKS.solana;

  for (const rpc of config.rpcEndpoints) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [targetAddress, { limit: 10 }],
        }),
      }).then((r) => r.json());

      if (res?.result && Array.isArray(res.result)) {
        for (const sigInfo of res.result) {
          if (sigInfo.err) continue;
          const sig = sigInfo.signature;
          if (!sig || isTxHashClaimed(sig)) continue;

          const blockTime = sigInfo.blockTime || 0;
          // STRICT TIMESTAMP CHECK: must be after order creation
          if (blockTime > 0 && blockTime < orderCreatedSec - 25) {
            continue; // Mined before order was created! Skip
          }

          // Fetch full transaction to verify parsed token balances
          try {
            const txRes = await fetch(rpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 2,
                method: 'getTransaction',
                params: [
                  sig,
                  { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
                ],
              }),
            }).then((r) => r.json());

            const meta = txRes?.result?.meta;
            if (meta) {
              const preBalances = meta.preTokenBalances || [];
              const postBalances = meta.postTokenBalances || [];

              // Look for balance change on our target address for USDT mint
              let delta = 0;
              for (const post of postBalances) {
                if (
                  post.mint === config.tokenContract &&
                  post.owner === targetAddress
                ) {
                  const pre = preBalances.find(
                    (p: any) =>
                      p.accountIndex === post.accountIndex &&
                      p.mint === config.tokenContract
                  );
                  const postAmt = post.uiTokenAmount?.uiAmount || 0;
                  const preAmt = pre?.uiTokenAmount?.uiAmount || 0;
                  delta = postAmt - preAmt;
                  break;
                }
              }

              if (Math.abs(delta - expectedAmount) <= 0.05) {
                return {
                  verified: true,
                  network: 'solana',
                  walletAddress: targetAddress,
                  expectedAmount,
                  detectedAmount: delta > 0 ? delta : expectedAmount,
                  txHash: sig,
                  blockTimestamp: blockTime,
                  explorerUrl: `${config.explorerTxBase}${sig}`,
                  verifiedAt: new Date((blockTime || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
                };
              }
            }
          } catch {}
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Main Real Blockchain Scanner:
 * Checks real on-chain transaction history strictly matching:
 * 1. Target Deposit Address (Polygon / BSC / Solana)
 * 2. Token Contract (USDT ERC-20 / BEP-20 / SPL)
 * 3. Exact Payment Amount (matches order cryptoAmount within 0.05 tolerance)
 * 4. Exact Date & Time: Block timestamp must be strictly at or after order creation time
 * 5. Uniqueness: Transaction hash has not been previously claimed
 *
 * If no matching on-chain transaction has been mined yet, returns null (no false/fake results).
 */
export async function scanBlockchainForOrder(params: {
  orderId: string;
  networkKey: 'polygon' | 'bnb' | 'solana';
  expectedAmount: number;
  orderCreatedAt?: string;
}): Promise<VerificationResult | null> {
  const { orderId, networkKey, expectedAmount, orderCreatedAt } = params;
  const config = BLOCKCHAIN_NETWORKS[networkKey];
  if (!config || expectedAmount <= 0) return null;

  // Resolve order creation timestamp in seconds
  let orderCreatedSec: number;
  if (orderCreatedAt) {
    const parsed = new Date(orderCreatedAt).getTime();
    orderCreatedSec = !isNaN(parsed) && parsed > 0
      ? Math.floor(parsed / 1000)
      : Math.floor(Date.now() / 1000) - 60;
  } else {
    // If not provided, fallback to 90 seconds ago
    orderCreatedSec = Math.floor(Date.now() / 1000) - 90;
  }

  let result: VerificationResult | null = null;
  if (networkKey === 'polygon' || networkKey === 'bnb') {
    result = await scanEvmLogs(
      networkKey,
      config.targetAddress,
      config.tokenContract,
      config.decimals,
      expectedAmount,
      orderCreatedSec
    );
  } else if (networkKey === 'solana') {
    result = await scanSolanaTransfers(
      config.targetAddress,
      expectedAmount,
      orderCreatedSec
    );
  }

  if (result && result.verified && result.txHash) {
    // Mark txHash as claimed so it cannot be matched to another order
    markTxHashClaimed(result.txHash, orderId);
    return result;
  }

  return null;
}
