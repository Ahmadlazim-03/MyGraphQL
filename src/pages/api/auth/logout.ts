import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Accept both GET and POST so a simple <a> link works (GET) and API calls can POST.
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).end();

  // Clear cookie
  res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);

  if (req.method === 'GET') {
    // Redirect browser to login page after clearing cookie
    res.writeHead(302, { Location: '/' });
    res.end();
    return;
  }

  return res.status(200).json({ ok: true });
}
