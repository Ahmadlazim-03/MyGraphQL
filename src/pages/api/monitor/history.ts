import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const HIST_PATH = path.join(process.cwd(), 'data', 'monitor-results.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      if (!fs.existsSync(HIST_PATH)) return res.status(200).json([]);
      const raw = fs.readFileSync(HIST_PATH, 'utf-8');
      const arr = JSON.parse(raw || '[]');
      return res.status(200).json(arr);
    }

    if (req.method === 'DELETE') {
      if (fs.existsSync(HIST_PATH)) fs.unlinkSync(HIST_PATH);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).end();
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
