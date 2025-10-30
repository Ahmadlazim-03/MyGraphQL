import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// This endpoint attempts to run a lightweight health/latency check
// against Postgres or MongoDB depending on the request body. It will
// try to require the appropriate driver dynamically and return
// measured timings and a few counts. If the driver is not installed,
// response will advise how to install the dependency.

type Body = {
  provider?: 'postgres' | 'mongodb';
  url?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { provider = 'postgres', url } = req.body as Body;
  const HIST_PATH = path.join(process.cwd(), 'data', 'monitor-results.json');
  const overallStart = Date.now();
  // determine client IP: respect X-Forwarded-For when behind proxy
  const xf = req.headers['x-forwarded-for'];
  const clientIp = typeof xf === 'string' ? xf.split(',')[0].trim() : (req.socket && req.socket.remoteAddress) || null;

  async function appendHistory(entry: any) {
    try {
      const dir = path.dirname(HIST_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let arr: any[] = [];
      if (fs.existsSync(HIST_PATH)) {
        const raw = fs.readFileSync(HIST_PATH, 'utf-8');
        try { arr = JSON.parse(raw) || []; } catch { arr = []; }
      }
      arr.push(entry);
      // keep only last 500 entries
      if (arr.length > 500) arr = arr.slice(arr.length - 500);
      fs.writeFileSync(HIST_PATH, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (e) {
      // ignore file write errors
      console.error('appendHistory error', e);
    }
  }

  try {
    if (provider === 'postgres') {
      let pg: any;
      try {
        // dynamic require so the server doesn't crash if pg isn't installed
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        pg = require('pg');
      } catch (err) {
        return res.status(200).json({ ok: false, message: 'Missing dependency: install pg to test Postgres (npm i pg).' });
      }

      const { Client } = pg;
      const start = Date.now();
      const client = new Client({ connectionString: url });
      await client.connect();
      const connectTime = Date.now() - start;

      const qStart = Date.now();
      // basic lightweight query
      let usersCount: number | null = null;
      try {
        const r = await client.query('SELECT COUNT(*) as c FROM "User"');
        usersCount = r.rows?.[0]?.c ? parseInt(r.rows[0].c, 10) : null;
      } catch (e) {
        // table might have different name or not exist in this DB; ignore
      }
      const queryTime = Date.now() - qStart;

      await client.end();
      const requestDurationMs = Date.now() - overallStart;
      const result = { ok: true, provider: 'postgres', connectTimeMs: connectTime, sampleQueryMs: queryTime, usersCount, timestamp: new Date().toISOString(), clientIp, requestDurationMs };
      appendHistory(result);
      return res.json(result);
    }

    if (provider === 'mongodb') {
      let mongodb: any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        mongodb = require('mongodb');
      } catch (err) {
        return res.status(200).json({ ok: false, message: 'Missing dependency: install mongodb to test MongoDB (npm i mongodb).' });
      }

      const { MongoClient } = mongodb;
      const start = Date.now();
      const client = new MongoClient(url);
      await client.connect();
      const connectTime = Date.now() - start;

      const db = client.db();
      const qStart = Date.now();
      let usersCount: number | null = null;
      try {
        usersCount = await db.collection('users').countDocuments();
      } catch (e) {
        // ignore if collection not present
      }
      const queryTime = Date.now() - qStart;

      await client.close();
  const requestDurationMs = Date.now() - overallStart;
  const result = { ok: true, provider: 'mongodb', connectTimeMs: connectTime, sampleQueryMs: queryTime, usersCount, timestamp: new Date().toISOString(), clientIp, requestDurationMs };
  await appendHistory(result);
  return res.json(result);
    }

    return res.status(400).json({ ok: false, message: 'Unknown provider' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}

