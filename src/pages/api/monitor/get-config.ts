import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'db-config.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return res.status(200).json({ provider: 'postgres', url: '' });
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const json = JSON.parse(raw);
    return res.status(200).json(json);
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
