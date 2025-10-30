import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';
import { Container, Grid, Card, Select, Textarea, Button, Title, Text, Table, Group, Badge, ScrollArea } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);
const G = Group as any;
const T = Text as any;

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
    <Container size="xl" py="xl">
  <G position="apart" mb="md">
        <Title order={2}>Monitoring Dashboard</Title>
        <div>
          <a href="/api/auth/logout" style={{ color: '#268bd2', textDecoration: 'none' }}>Logout</a>
        </div>
      </G>

      <Grid>
        <Grid.Col span={3}>
          <Card shadow="sm" p="md">
            <T weight={600} mb="xs">Database configuration</T>
            <Select
              label="Provider"
              data={[{ value: 'postgres', label: 'Postgres' }, { value: 'mongodb', label: 'MongoDB' }]}
              value={config.provider}
              onChange={(v) => setConfig((s) => ({ ...s, provider: (v as any) }))}
              mb="sm"
            />

            <Textarea
              label="Database URL"
              placeholder="e.g. postgres://user:pass@host:5432/db or mongodb+srv://..."
              minRows={3}
              value={config.url}
              onChange={(e) => setConfig((s) => ({ ...s, url: e.currentTarget.value }))}
            />

            <G mt="md">
              <Button onClick={runCheck} loading={loading} color="teal">Run check</Button>
              <Button variant="outline" onClick={saveConfig}>Save</Button>
            </G>

            {message && <T color="red" mt="sm">{message}</T>}
          </Card>
        </Grid.Col>

        <Grid.Col span={9}>
          <Card shadow="sm" p="md">
            <T weight={600} mb="xs">Result</T>
            {result ? (
              <ScrollArea style={{ maxHeight: 160 }}>
                <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 6, overflowX: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
              </ScrollArea>
            ) : (
              <T color="dimmed">No result yet. Click "Run check" to measure connect time and a sample query.</T>
            )}

            <G position="apart" mt="md">
              <T weight={600}>Recent checks</T>
              <G>
                <Button variant="subtle" onClick={fetchHistory}>Refresh</Button>
                <Button variant="subtle" color="red" onClick={clearHistory}>Clear history</Button>
              </G>
            </G>

            <ScrollArea style={{ maxHeight: 240 }} mt="sm">
              {history.length === 0 ? (
                <T color="dimmed">No history yet.</T>
              ) : (
                <Table highlightOnHover>
                  <thead>
                    <tr><th>Time</th><th>Provider</th><th>Connect ms</th><th>Query ms</th><th>Users</th></tr>
                  </thead>
                  <tbody>
                    {history.slice().reverse().slice(0, 12).map((h) => (
                      <tr key={h.timestamp}>
                        <td>{new Date(h.timestamp).toLocaleTimeString()}</td>
                        <td>{h.provider}</td>
                        <td>{h.connectTimeMs}</td>
                        <td>{h.sampleQueryMs}</td>
                        <td>{h.usersCount ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </ScrollArea>

            <Grid mt="md">
              <Grid.Col span={8}>
                <T weight={600} mb="xs">Daily checks (last 30 days)</T>
                <Bar
                  data={{
                    labels: stats.daily.map((d) => d.date),
                    datasets: [{
                      label: 'Checks',
                      data: stats.daily.map((d) => d.count),
                      backgroundColor: 'rgba(16,185,129,0.8)'
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false }, title: { display: false } },
                    scales: { x: { display: false }, y: { beginAtZero: true } }
                  }}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <T weight={600} mb="xs">Top client IPs</T>
                {stats.topIps.length === 0 ? <Text color="dimmed">No data</Text> : (
                  <div>
                    {stats.topIps.map((t) => (<div key={t.ip}><Badge mr="xs">{t.count}</Badge> <Text span>{t.ip}</Text></div>))}
                  </div>
                )}
              </Grid.Col>
            </Grid>

            <T mt="md" weight={600}>Tips</T>
            <ul>
              <li>Install DB drivers on the server if the API reports a missing dependency.</li>
              <li>In production, configure DB credentials via environment variables (do not save to file).</li>
            </ul>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
