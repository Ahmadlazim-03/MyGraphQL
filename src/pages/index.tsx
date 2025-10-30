import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json();
      if (j.ok) {
        router.push('/dashboard');
      } else {
        setError(j.message || 'Login failed');
      }
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#e6eef8' }}>
      <div style={{ width: 420, padding: 28, borderRadius: 12, background: 'linear-gradient(180deg,#0b1220, #071026)', boxShadow: '0 8px 30px rgba(2,6,23,0.6)' }}>
        <h1 style={{ margin: 0, marginBottom: 12, fontSize: 20 }}>Sign in</h1>
        <p style={{ marginTop: 0, marginBottom: 18, color: '#9fb0d6' }}>Masuk menggunakan akun admin untuk mengakses dashboard monitoring.</p>

        <form onSubmit={submit}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #233040', background: '#071224', color: '#e6eef8' }} />
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #233040', background: '#071224', color: '#e6eef8' }} />
          </label>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 14px', borderRadius: 8, background: '#0ea5a3', border: 'none', color: '#012', fontWeight: 600 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <button type="button" onClick={() => { setEmail('ahmadlazim422@gmail.com'); setPassword('pembelajaranjarakjauh123'); }} style={{ padding: '10px 12px', borderRadius: 8, background: 'transparent', border: '1px solid #233040', color: '#9fb0d6' }}>Fill demo</button>
          </div>
          {error && <p style={{ color: '#ffb4b4' }}>{error}</p>}
        </form>

        <p style={{ marginTop: 18, color: '#7f98bf', fontSize: 13 }}>Username: ahmadlazim422@gmail.com<br/>Password: pembelajaranjarakjauh123</p>
      </div>
    </div>
  );
}
