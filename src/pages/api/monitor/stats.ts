import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const HIST_PATH = path.join(process.cwd(), 'data', 'monitor-results.json');

function toDateKey(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!fs.existsSync(HIST_PATH)) return res.status(200).json({ daily: [] });
    const raw = fs.readFileSync(HIST_PATH, 'utf-8');
    const arr: any[] = JSON.parse(raw || '[]');

    // aggregate counts per day (last 30 days)
    const now = new Date();
    const days = 30;
    const map: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      map[d.toISOString().slice(0, 10)] = 0;
    }

    for (const e of arr) {
      if (!e || !e.timestamp) continue;
      const key = toDateKey(e.timestamp);
      if (key in map) map[key] = (map[key] || 0) + 1;
    }

    const daily = Object.keys(map).sort().map((k) => ({ date: k, count: map[k] }));

    // also top client IPs
    const ipCounts: Record<string, number> = {};
    for (const e of arr) {
      const ip = e.clientIp || 'unknown';
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    }
    const topIps = Object.entries(ipCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([ip, c]) => ({ ip, count: c }));

    return res.status(200).json({ daily, topIps });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
