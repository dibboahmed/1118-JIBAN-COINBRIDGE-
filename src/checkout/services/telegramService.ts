import { PayoutOrder } from '../types';
import { db, auth } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const DEFAULT_TELEGRAM_BOT_TOKEN = '8902295031:AAGtVjefjgl2pcA0NAn0U-7u1muR6n9dZLg';
export const DEFAULT_TELEGRAM_CHAT_ID = '7680097351';

export function resolveTelegramUserEmail(orderEmail?: string): string {
  if (orderEmail && orderEmail.trim() && orderEmail.toLowerCase() !== 'guest') {
    return orderEmail.trim();
  }
  if (auth.currentUser?.email && auth.currentUser.email.trim()) {
    return auth.currentUser.email.trim();
  }
  try {
    const raw = localStorage.getItem('coinbridge_saved_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email && parsed.email.trim()) {
        return parsed.email.trim();
      }
    }
  } catch {}
  try {
    const direct = localStorage.getItem('coinbridge_active_user_email');
    if (direct && direct.trim()) {
      return direct.trim();
    }
  } catch {}
  return 'Account in checkout';
}

export function formatTelegramMessage(order: PayoutOrder, eventType: 'created' | 'transferred' = 'created'): string {
  const isTransferred = eventType === 'transferred';
  const headerIcon = isTransferred ? '⚡' : '🚀';
  const headerTitle = isTransferred
    ? 'User Payment Confirmed (Waiting Verification)'
    : 'New Payment Request';

  const formattedDate = new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const resolvedEmail = resolveTelegramUserEmail(order.userEmail);
  const resolvedName = (
    order.userName ||
    auth.currentUser?.displayName ||
    auth.currentUser?.providerData?.[0]?.displayName ||
    (() => {
      try {
        const raw = localStorage.getItem('coinbridge_saved_user');
        return raw ? JSON.parse(raw).displayName : '';
      } catch {
        return '';
      }
    })() ||
    (resolvedEmail && !resolvedEmail.includes('Account in checkout') ? resolvedEmail.split('@')[0] : 'Google User')
  );

  const grossCrypto = order.grossCryptoAmount || order.cryptoAmount || 0;
  const platformFee = typeof order.platformFee === 'number' ? order.platformFee : 0.1;
  const netCrypto = order.netCryptoAmount || Math.max(0, grossCrypto - platformFee);

  return [
    `${headerIcon} *${headerTitle}*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order ID:* \`${order.id}\``,
    `👤 *User Name:* *${resolvedName}*`,
    `📧 *Gmail Address:* \`${resolvedEmail}\``,
    `🌐 *Country:* ${order.country || 'Bangladesh'}`,
    ``,
    `💰 *Total USDT Sent:* \`${grossCrypto} ${order.tokenSymbol || 'USDT'}\``,
    `🏷️ *Platform Fee (Deducted):* \`-${platformFee} ${order.tokenSymbol || 'USDT'}\``,
    `💵 *Net USDT for Payout:* \`${netCrypto.toFixed(2)} ${order.tokenSymbol || 'USDT'}\``,
    `⛓️ *Network:* \`${order.tokenNetwork || 'Polygon'}\``,
    `🪙 *Customer Payout Amount:* \`${order.fiatCurrencyCode || 'BDT'} ${order.fiatAmount}\``,
    ``,
    `💳 *Payment Method:* \`${order.paymentMethod}\` ${order.accountType ? `(${order.accountType})` : ''}`,
    `📱 *Receiving Account:* \`${order.accountNumber}\``,
    `⏰ *Time (BD):* ${formattedDate}`,
    `📊 *Status:* \`${isTransferred ? 'USER_TRANSFERRED_WAITING_VERIFICATION' : 'PENDING'}\``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `ℹ️ _Please verify blockchain transaction before sending payout to customer._`,
  ].join('\n');
}

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return (
    (typeof process !== 'undefined' && process.env?.APP_URL) ||
    'https://coin-bridge.vercel.app'
  );
}

export async function sendTelegramOnChainPaymentReceivedAlert(params: {
  order: PayoutOrder;
  network: string;
  amount: number;
  walletAddress: string;
  txHash?: string;
  explorerUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const { order, network, amount, walletAddress, txHash, explorerUrl } = params;

  const formattedDate = new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const resolvedEmail = resolveTelegramUserEmail(order.userEmail);
  const resolvedName = (
    order.userName ||
    auth.currentUser?.displayName ||
    auth.currentUser?.providerData?.[0]?.displayName ||
    (() => {
      try {
        const raw = localStorage.getItem('coinbridge_saved_user');
        return raw ? JSON.parse(raw).displayName : '';
      } catch {
        return '';
      }
    })() ||
    (resolvedEmail && !resolvedEmail.includes('Account in checkout') ? resolvedEmail.split('@')[0] : 'Google User')
  );

  const grossCrypto = order.grossCryptoAmount || order.cryptoAmount || amount;
  const platformFee = typeof order.platformFee === 'number' ? order.platformFee : 0.1;
  const netCrypto = order.netCryptoAmount || Math.max(0, grossCrypto - platformFee);

  const messageText = [
    `✅ *REAL ON-CHAIN USDT RECEIVED & VERIFIED!*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order ID:* \`${order.id}\``,
    `👤 *User Name:* *${resolvedName}*`,
    `📧 *Gmail Address:* \`${resolvedEmail}\``,
    `💰 *USDT Received On-Chain:* \`${amount.toFixed(2)} USDT\``,
    `🏷️ *Platform Fee (Deducted):* \`-${platformFee} USDT\``,
    `💵 *Net Payout USDT:* \`${netCrypto.toFixed(2)} USDT\``,
    `⛓️ *Network:* \`${network}\``,
    `📥 *Deposited To Wallet:* \`${walletAddress}\``,
    txHash ? `🔗 *Tx Hash:* \`${txHash}\`` : ``,
    `⏰ *Verified At (BD):* ${formattedDate}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⏳ *Customer Screen: PROCESSING PAYOUT (Waiting for you)*`,
    ``,
    `👉 *Please Send Fiat Payout To Customer:*`,
    `💳 *Method:* \`${order.paymentMethod}\` ${order.accountType ? `(${order.accountType})` : ''}`,
    `📱 *Receiving Account:* \`${order.accountNumber}\``,
    `🪙 *Payout Amount:* \`${order.fiatCurrencyCode || 'BDT'} ${order.fiatAmount}\``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `👇 *After sending payout to customer, click below to mark as SUCCESS:*`,
  ]
    .filter(Boolean)
    .join('\n');

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '✅ Mark as Success (Payout Sent)',
          callback_data: `approve_${order.id}`,
        },
      ],
      ...(explorerUrl
        ? [
            [
              {
                text: '🔍 View on Blockchain Explorer',
                url: explorerUrl,
              },
            ],
          ]
        : []),
    ],
  };

  const botToken = DEFAULT_TELEGRAM_BOT_TOKEN;
  const chatId = DEFAULT_TELEGRAM_CHAT_ID;

  // 1. Try sending via local server proxy first
  try {
    const res = await fetch('/api/telegram/send-order-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageText,
        reply_markup: replyMarkup,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
    }
  } catch (err) {
    console.warn('[TelegramService] Proxy failed, falling back to direct:', err);
  }

  // 2. Direct fallback
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
        reply_markup: replyMarkup,
      }),
    });
    const result = await res.json();
    return { success: !!result.ok };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Sends order alert to Telegram Bot and Chat ID
 */
export async function sendTelegramOrderNotification(
  order: PayoutOrder,
  eventType: 'created' | 'transferred' = 'created',
  _customBaseUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const messageText = formatTelegramMessage(order, eventType);

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '✅ Mark as Success (Payout Sent)',
          callback_data: `approve_${order.id}`,
        },
      ],
    ],
  };

  // 1. Try sending via local server proxy first
  try {
    const res = await fetch('/api/telegram/send-order-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order,
        eventType,
        message: messageText,
        reply_markup: replyMarkup,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        console.log('[TelegramService] Alert delivered via backend proxy');
        return { success: true };
      }
    }
  } catch (err) {
    console.warn('[TelegramService] Backend proxy call failed, using direct client dispatch fallback:', err);
  }

  // 2. Direct Telegram Bot API fallback to guarantee delivery
  try {
    const botToken = DEFAULT_TELEGRAM_BOT_TOKEN;
    const chatId = DEFAULT_TELEGRAM_CHAT_ID;
    const telegramEndpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(telegramEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: replyMarkup,
      }),
    });
    const result = await res.json();
    if (result.ok) {
      console.log('[TelegramService] Alert successfully dispatched directly to Telegram Chat:', chatId);
      return { success: true };
    } else {
      console.error('[TelegramService] Telegram API error:', result);
      return { success: false, error: result.description || 'Telegram API returned error' };
    }
  } catch (err: any) {
    console.error('[TelegramService] Failed to dispatch Telegram message:', err);
    return { success: false, error: err?.message || 'Network error sending to Telegram' };
  }
}

let lastProcessedUpdateId = 0;

/**
 * Polls Telegram Bot API for approval callback button presses.
 * When admin clicks '✅ Mark as Success' in Telegram:
 * 1. Shows instant native confirmation in Telegram (no web page opened).
 * 2. Visually updates the Telegram button to '✅ Payout Sent & Completed'.
 * 3. Updates Firestore order status to 'completed'.
 * 4. Calls onApproved() to instantly render the completion screen on the customer website.
 */
export function pollTelegramOrderApproval(
  orderId: string,
  onApproved: () => void
): () => void {
  let isPolling = true;

  const poll = async () => {
    if (!isPolling) return;
    try {
      const botToken = DEFAULT_TELEGRAM_BOT_TOKEN;
      const offsetParam = lastProcessedUpdateId
        ? `?offset=${lastProcessedUpdateId + 1}&limit=20`
        : '?limit=20';
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates${offsetParam}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok || !Array.isArray(data.result)) return;

      for (const update of data.result) {
        if (update.update_id > lastProcessedUpdateId) {
          lastProcessedUpdateId = update.update_id;
        }

        if (update.callback_query) {
          const query = update.callback_query;
          const callbackData = query.data || '';

          if (callbackData === `approve_${orderId}` || callbackData === `appr_${orderId}`) {
            // 1. Answer Telegram callback immediately - native alert inside Telegram, NO external URL!
            try {
              await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  callback_query_id: query.id,
                  text: '🎉 Payout Marked as Completed! Customer screen updated.',
                  show_alert: false,
                }),
              });
            } catch (e) {
              console.warn('Telegram answerCallbackQuery note:', e);
            }

            // 2. Edit Telegram message reply markup so admin sees it is marked complete
            if (query.message && query.message.chat && query.message.message_id) {
              try {
                await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: query.message.chat.id,
                    message_id: query.message.message_id,
                    reply_markup: {
                      inline_keyboard: [
                        [
                          {
                            text: '✅ Payout Sent & Completed on Website',
                            callback_data: 'done',
                          },
                        ],
                      ],
                    },
                  }),
                });
              } catch (e) {
                console.warn('Telegram editMessageReplyMarkup note:', e);
              }
            }

            // 3. Update Firestore order document to completed
            try {
              await setDoc(
                doc(db, 'payout_orders', orderId),
                {
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            } catch (e) {
              console.warn('Firestore sync note:', e);
            }

            // 4. Trigger UI callback
            onApproved();
            isPolling = false;
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Telegram poll note:', err);
    }
  };

  poll();
  const interval = setInterval(poll, 1500);

  return () => {
    isPolling = false;
    clearInterval(interval);
  };
}

/**
 * Global background poller for any active/pending orders in user portal.
 * Ensures that if admin clicks 'Mark as Success' in Telegram while customer is looking at
 * Payout History, the order is immediately approved, answered in Telegram, and updated in Firestore!
 */
export function pollTelegramGlobalApproval(
  orderIds: string[],
  onApproved: (orderId: string) => void
): () => void {
  let isPolling = true;

  const poll = async () => {
    if (!isPolling || !orderIds.length) return;
    try {
      const botToken = DEFAULT_TELEGRAM_BOT_TOKEN;
      const offsetParam = lastProcessedUpdateId
        ? `?offset=${lastProcessedUpdateId + 1}&limit=20`
        : '?limit=20';
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates${offsetParam}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok || !Array.isArray(data.result)) return;

      for (const update of data.result) {
        if (update.update_id > lastProcessedUpdateId) {
          lastProcessedUpdateId = update.update_id;
        }

        if (update.callback_query) {
          const query = update.callback_query;
          const callbackData = query.data || '';

          for (const orderId of orderIds) {
            if (callbackData === `approve_${orderId}` || callbackData === `appr_${orderId}`) {
              // 1. Answer Telegram callback
              try {
                await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    callback_query_id: query.id,
                    text: '🎉 Payout Marked as Completed! Customer screen updated.',
                    show_alert: false,
                  }),
                });
              } catch (e) {}

              // 2. Edit Telegram message reply markup
              if (query.message && query.message.chat && query.message.message_id) {
                try {
                  await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: query.message.chat.id,
                      message_id: query.message.message_id,
                      reply_markup: {
                        inline_keyboard: [
                          [
                            {
                              text: '✅ Payout Sent & Completed on Website',
                              callback_data: 'done',
                            },
                          ],
                        ],
                      },
                    }),
                  });
                } catch (e) {}
              }

              // 3. Update Firestore order document to completed
              try {
                await setDoc(
                  doc(db, 'payout_orders', orderId),
                  {
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                  },
                  { merge: true }
                );
              } catch (e) {}

              // 4. Trigger UI callback
              onApproved(orderId);
            }
          }
        }
      }
    } catch (err) {}
  };

  poll();
  const interval = setInterval(poll, 1500);

  return () => {
    isPolling = false;
    clearInterval(interval);
  };
}
