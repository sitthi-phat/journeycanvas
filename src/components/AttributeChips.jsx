import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

// A compact labelled list of short text chips, used for a Screen's system logic,
// stored data, and notifications (behaviours that happen at that screen).
export default function AttributeChips({ label, icon, color, items = [], onAdd, onRemove, placeholder, readOnly = false }) {
  const [val, setVal] = useState('');
  const add = () => {
    const v = val.trim();
    if (!v) return;
    onAdd(v);
    setVal('');
  };

  return (
    <div className="nodrag nowheel" style={{ marginTop: '8px' }}>
      <label style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <span>{icon}</span> {label}
      </label>

      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
          {items.map((t, i) => (
            <span key={i} className="attr-chip" style={{ borderColor: `${color}66`, color }}>
              {t}
              {!readOnly && (
                <button onClick={() => onRemove(i)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={9} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {!readOnly && (
      <div style={{ display: 'flex', gap: '4px' }}>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={{ flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', outline: 'none' }}
        />
        <button onClick={add} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <Plus size={10} />
        </button>
      </div>
      )}
    </div>
  );
}
