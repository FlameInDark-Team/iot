export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      // ignore
    }
  }

  const enteredPassword = body && body.password ? String(body.password).trim() : '';
  const expectedPassword = (process.env.PORTAL_PASSWORD || 'Swarnadeep').trim();

  if (enteredPassword === expectedPassword) {
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token: 'auth_' + Buffer.from(expectedPassword).toString('base64').substring(0, 12)
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid security passcode'
    });
  }
}
