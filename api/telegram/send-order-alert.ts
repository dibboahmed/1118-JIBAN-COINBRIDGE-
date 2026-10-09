export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
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
    return res.status(200).json({ success: !!tgData.ok, data: tgData });
  } catch (err: any) {
    console.error('Error sending Telegram alert:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to send alert' });
  }
}
