import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const ADMIN_EMAIL = 'ahmadlazim422@gmail.com';
const ADMIN_PASSWORD = 'pembelajaranjarakjauh123';
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, message: 'email and password required' });

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, SECRET, { expiresIn: '8h' });
    // set HttpOnly cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${8 * 60 * 60}; SameSite=Lax`);
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, message: 'Invalid credentials' });
}
