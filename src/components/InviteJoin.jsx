import React, { useEffect, useState } from 'react';
import { Layers, LogIn, Clock, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';

export function formatRemaining(expiresAt) {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return 'expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

export default function InviteJoin({ token, onJoined, onFallback }) {
  const validateInvite = useStore((s) => s.validateInvite);
  const acceptInvite = useStore((s) => s.acceptInvite);

  const [status, setStatus] = useState('checking'); // checking | valid | invalid
  const [info, setInfo] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await validateInvite(token);
      if (res?.valid) {
        setInfo(res);
        setStatus('valid');
      } else {
        setInfo(res);
        setStatus('invalid');
      }
    })();
  }, [token, validateInvite]);

  // tick the countdown
  useEffect(() => {
    if (status !== 'valid') return;
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const join = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await acceptInvite(token, name.trim());
      onJoined();
    } catch (err) {
      setError(err.message || 'Could not join');
      setBusy(false);
    }
  };

  if (status === 'checking') {
    return <div className="auth-screen"><div className="auth-card">Checking invite…</div></div>;
  }

  if (status === 'invalid') {
    const msg = info?.reason === 'expired' ? 'This invite link has expired.' : 'This invite link is invalid.';
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand"><Layers size={22} /> <span>JourneyCanvas</span></div>
          <div className="auth-error" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <AlertTriangle size={16} /> {msg}
          </div>
          <button className="btn auth-btn" onClick={onFallback}>Go to sign in</button>
        </div>
      </div>
    );
  }

  const expired = info.expiresAt - Date.now() <= 0;
  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={join}>
        <div className="auth-brand"><Layers size={22} /> <span>JourneyCanvas</span></div>
        <h2 className="auth-title">You're invited</h2>
        <p className="auth-sub">
          You've been invited to a <strong>{info.scope === 'workspace' ? 'workspace' : 'board'}</strong>. Enter a display
          name to join{info.scope === 'workspace' ? ' and access its boards' : ''}.
        </p>

        <div className="invite-timer">
          <Clock size={14} /> {expired ? 'Expired' : `Expires in ${formatRemaining(info.expiresAt)}`}
        </div>

        <label className="auth-label">Your display name</label>
        <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Khun Mai" autoFocus />

        {error && <div className="auth-error">{error}</div>}

        <button className="btn auth-btn" type="submit" disabled={busy || expired || !name.trim()}>
          <LogIn size={15} /> {busy ? 'Joining…' : 'Join'}
        </button>
      </form>
    </div>
  );
}
