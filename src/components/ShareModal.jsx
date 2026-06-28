import React, { useEffect, useState } from 'react';
import { X, Copy, Check, RefreshCw, Link2 } from 'lucide-react';
import { useStore } from '../store/useStore';

// Admin-only: generate a manual, scoped invite link for a workspace or a board.
export default function ShareModal({ scope, targetId, name, onClose }) {
  const createInvite = useStore((s) => s.createInvite);
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    setError('');
    setCopied(false);
    try {
      const url = await createInvite(scope, targetId);
      setLink(url);
    } catch (err) {
      setError(err.message || 'Could not create link');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { generate(); /* eslint-disable-next-line */ }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  return (
    <div className="nd-backdrop" onClick={onClose}>
      <div className="nd-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="nd-header">
          <h2 className="nd-title"><Link2 size={16} /> Share {scope === 'workspace' ? 'workspace' : 'board'}</h2>
          <button className="nd-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="nd-section">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px' }}>
            Anyone with this link can join <strong>{name}</strong>
            {scope === 'workspace' ? ' and all its boards' : ' (this board only)'}. They'll pick their own display name.
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <input className="auth-input" style={{ margin: 0 }} readOnly value={busy ? 'Generating…' : link} onFocus={(e) => e.target.select()} />
            <button className="btn" onClick={copy} disabled={!link} title="Copy link">
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
            <button className="btn btn-secondary" onClick={generate} disabled={busy} title="Generate a new link">
              <RefreshCw size={15} />
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="invite-note">
            ⏱️ The link <strong>activates when first opened</strong>, then stays valid for <strong>12 hours</strong>.
            One link can be shared with several people during that window.
          </div>
        </div>
      </div>
    </div>
  );
}
