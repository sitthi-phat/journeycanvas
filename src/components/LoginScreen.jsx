import React, { useState } from 'react';
import { Layers, LogIn } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function LoginScreen({ onLoggedIn }) {
  const login = useStore((s) => s.login);
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
      onLoggedIn();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand"><Layers size={22} /> <span>JourneyCanvas</span></div>
        <h2 className="auth-title">Sign in</h2>
        <p className="auth-sub">Admin sign-in. Participants join via an invite link.</p>

        <label className="auth-label">Username</label>
        <input className="auth-input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />

        <label className="auth-label">Password</label>
        <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />

        {error && <div className="auth-error">{error}</div>}

        <button className="btn auth-btn" type="submit" disabled={busy}>
          <LogIn size={15} /> {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
