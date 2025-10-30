import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';

type Config = { provider: 'postgres' | 'mongodb'; url: string };

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';
  const match = cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('token='));
  const token = match ? match.split('=')[1] : null;
  if (!token) {
    return { redirect: { destination: '/', permanent: false } };
  }
  try {
    jwt.verify(token, SECRET);
    return { props: {} };
  } catch (e) {
    return { redirect: { destination: '/', permanent: false } };
  }
};

export default function Dashboard() {
  const [config, setConfig] = useState<Config>({ provider: 'postgres', url: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<{ daily: Array<{date:string,count:number}>, topIps: Array<{ip:string,count:number}> }>({ daily: [], topIps: [] });

  useEffect(() => {
    fetch('/api/monitor/get-config').then(async (r) => {
      const j = await r.json();
      setConfig({ provider: j.provider || 'postgres', url: j.url || '' });
    });
    fetchHistory();
    fetchStats();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch('/api/monitor/history');
      const j = await res.json();
      setHistory(Array.isArray(j) ? j : []);
    } catch (e) {
      // ignore
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/monitor/stats');
      const j = await res.json();
      setStats(j);
    } catch (e) {}
  }

  async function runCheck() {
    setLoading(true);
    setResult(null);
    setMessage(null);
    try {
      const res = await fetch('/api/monitor/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const j = await res.json();
      setResult(j);
    } catch (err: any) {
      setMessage(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    setMessage(null);
    try {
      const res = await fetch('/api/monitor/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const j = await res.json();
      if (j.ok) setMessage('Config saved');
      else setMessage('Failed to save: ' + (j.message || j.error));
    } catch (err: any) {
      setMessage(String(err));
    }
  }

  async function clearHistory() {
    if (!confirm('Clear monitoring history?')) return;
    try {
      const res = await fetch('/api/monitor/history', { method: 'DELETE' });
      const j = await res.json();
      if (j.ok) setHistory([]);
    } catch (e) {}
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, Roboto, sans-serif', padding: 28, background: '#0b1220', minHeight: '100vh', color: '#e6eef8' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ margin: 0 }}>Monitoring Dashboard</h1>
        <div>
          <a href="/api/auth/logout" style={{ color: '#9fb0d6', textDecoration: 'none', marginRight: 12 }}>Logout</a>
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
        <aside style={{ background: '#071026', padding: 18, borderRadius: 12 }}>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Database configuration</h2>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Provider:
            <select
              value={config.provider}
              onChange={(e) => setConfig((s) => ({ ...s, provider: e.target.value as any }))}
              style={{ marginLeft: 8, marginTop: 6 }}
            >
              <option value="postgres">Postgres</option>
              <option value="mongodb">MongoDB</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            Database URL:
            <input
              value={config.url}
              onChange={(e) => setConfig((s) => ({ ...s, url: e.target.value }))}
              placeholder="e.g. postgres://user:pass@host:5432/db or mongodb+srv://..."
              style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 8, background: '#071224', border: '1px solid #183049', color: '#e6eef8' }}
            />
          </label>

          <div style={{ marginTop: 12 }}>
            <button onClick={runCheck} disabled={loading} style={{ marginRight: 8, padding: '8px 12px', borderRadius: 8, background: '#0ea5a3', border: 'none', color: '#012' }}>
              {loading ? 'Checking...' : 'Run check'}
            </button>
            <button onClick={saveConfig} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid #183049', color: '#9fb0d6' }}>Save</button>
          </div>
          {message && <p style={{ marginTop: 10, color: '#ffb4b4' }}>{message}</p>}
        </aside>

        <section style={{ background: '#071026', padding: 18, borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Result</h2>
          {result ? (
            <pre style={{ background: '#011012', color: '#aef0d6', padding: 12, borderRadius: 8, overflowX: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
          ) : (
            <p style={{ color: '#9fb0d6' }}>No result yet. Click "Run check" to measure connect time and a sample query.</p>
          )}

          <div style={{ marginTop: 18 }}>
            <h3 style={{ marginBottom: 8 }}>Recent checks</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={fetchHistory} style={{ padding: '6px 10px', borderRadius: 6 }}>Refresh</button>
              <button onClick={clearHistory} style={{ padding: '6px 10px', borderRadius: 6 }}>Clear history</button>
            </div>
            <div style={{ marginTop: 12 }}>
              {history.length === 0 ? (
                <p style={{ color: '#9fb0d6' }}>No history yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cfeee0' }}>
                  <thead style={{ textAlign: 'left', color: '#9fb0d6' }}>
                    <tr><th>Time</th><th>Provider</th><th>Connect ms</th><th>Query ms</th><th>Users</th></tr>
                  </thead>
                  <tbody>
                    {history.slice().reverse().slice(0, 12).map((h) => (
                      <tr key={h.timestamp} style={{ borderTop: '1px solid #0b2430' }}>
                        <td style={{ padding: '6px 8px' }}>{new Date(h.timestamp).toLocaleTimeString()}</td>
                        <td style={{ padding: '6px 8px' }}>{h.provider}</td>
                        <td style={{ padding: '6px 8px' }}>{h.connectTimeMs}</td>
                        <td style={{ padding: '6px 8px' }}>{h.sampleQueryMs}</td>
                        <td style={{ padding: '6px 8px' }}>{h.usersCount ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ marginTop: 18 }}>
              <h4 style={{ marginBottom: 8 }}>Daily checks (last 30 days)</h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
                {stats.daily.map((d) => {
                  const max = Math.max(1, ...stats.daily.map((x) => x.count));
                  const h = Math.round((d.count / max) * 56);
                  return (
                    <div key={d.date} title={`${d.date}: ${d.count}`} style={{ width: 10, height: h, background: '#0ea5a3', borderRadius: 3 }} />
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginBottom: 6 }}>Top client IPs</h4>
              {stats.topIps.length === 0 ? <p style={{ color: '#9fb0d6' }}>No data</p> : (
                <ul style={{ color: '#cfeee0' }}>
                  {stats.topIps.map((t) => (<li key={t.ip}>{t.ip} — {t.count}</li>))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h3 style={{ marginBottom: 6 }}>Tips</h3>
            <ul style={{ marginTop: 0, color: '#9fb0d6' }}>
              <li>Install DB drivers on the server if the API reports a missing dependency.</li>
              <li>In production, configure DB credentials via environment variables (do not save to file).</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
