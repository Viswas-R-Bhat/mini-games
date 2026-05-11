// Vercel Serverless Function — Admin Login
// Credentials are read from Vercel Environment Variables:
//   ADMIN_USER  (e.g. "varaince")
//   ADMIN_PASS  (e.g. "ReAIvive14052026")
// Set these in: Vercel Dashboard → Project → Settings → Environment Variables

export default function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers (same-origin is fine, but just in case)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { username, password } = req.body || {};

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  if (!ADMIN_USER || !ADMIN_PASS) {
    console.error('ADMIN_USER or ADMIN_PASS environment variables not set.');
    return res.status(500).json({ success: false, error: 'Server configuration error.' });
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ success: false, error: 'Invalid credentials.' });
  }
}
