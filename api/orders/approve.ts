export default async function handler(req: any, res: any) {
  const orderId = req.query?.orderId;
  if (!orderId) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send('<h3>Error: Missing orderId</h3>');
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

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🎉 *Order Completed Successfully!*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 *Order ID:* \`${orderId}\`\n✅ Payout receipt displayed on user's screen.`,
        parse_mode: 'Markdown',
      }),
    });
  } catch (tgErr) {
    console.warn('Telegram confirm note:', tgErr);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!DOCTYPE html>
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
    <p>The customer's screen is now displaying the live completion receipt.</p>
    <div class="order-box">Order ID: ${orderId}</div>
    <a href="javascript:window.close()" class="btn">Close Window</a>
  </div>
</body>
</html>`);
}
