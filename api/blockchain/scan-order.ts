export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { network } = req.body || {};
    const targetAddress =
      network === 'bnb'
        ? '0x615EB207eA3570D17801A03253FFd52bf3fdbD07'
        : network === 'solana'
        ? '4VhfHPD8R89VD6QqWurKMen4oVGNKHSGCrbP1WkqpxFj'
        : '0xE6501e2c54B52ad456ceb1cC6Cc5f096beC76302';

    return res.status(200).json({ success: true, targetAddress });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}
