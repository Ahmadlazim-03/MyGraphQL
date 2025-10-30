import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Paper, TextInput, PasswordInput, Button, Title, Text, Container, Group } from '@mantine/core';

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

  const G = Group as any;

  return (
    <Container size={420} my={80}>
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} style={{ marginBottom: 8 }}>Sign in</Title>
        <Text color="dimmed" size="sm" mb={18}>Masuk menggunakan akun admin untuk mengakses dashboard monitoring.</Text>

        <form onSubmit={submit}>
          <TextInput label="Email" placeholder="you@example.com" required value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.currentTarget.value)} />
          <PasswordInput label="Password" placeholder="Your password" required mt="md" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.currentTarget.value)} />

          <G position="apart" mt="lg">
            <Button variant="outline" onClick={() => { setEmail('ahmadlazim422@gmail.com'); setPassword('pembelajaranjarakjauh123'); }}>Fill demo</Button>
            <Button type="submit" loading={loading}>Sign in</Button>
          </G>

          {error && <Text color="red" size="sm" mt="sm">{error}</Text>}
        </form>

        <Text color="dimmed" size="xs" mt="md">Username: ahmadlazim422@gmail.com · Password: pembelajaranjarakjauh123</Text>
      </Paper>
    </Container>
  );
}
