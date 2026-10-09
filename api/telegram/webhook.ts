export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    const body = req.body || {};
    if (body.callback_query) {
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

        // 2. Edit Telegram message button
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

        // 3. Update Firestore document
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

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Vercel Webhook error:', err);
    return res.status(200).json({ ok: true });
  }
}
