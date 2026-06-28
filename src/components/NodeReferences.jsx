import React, { useState } from 'react';
import { Link2, Monitor, AppWindow, Workflow, Box, Plus, X, ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';

// A reference links a journey step to a captured screen, an application, a process,
// another element, or any URL.
export const REF_TYPES = {
  screen: { label: 'Screen', icon: Monitor },
  app: { label: 'App', icon: AppWindow },
  process: { label: 'Process', icon: Workflow },
  element: { label: 'Element', icon: Box },
  link: { label: 'Link', icon: Link2 }
};

export default function NodeReferences({ nodeId, references = [], defaultOpen = false }) {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const [open, setOpen] = useState(defaultOpen);
  const [type, setType] = useState('screen');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  const add = () => {
    if (!label.trim()) return;
    const ref = { id: 'ref-' + Date.now(), type, label: label.trim(), url: url.trim() };
    updateNodeData(nodeId, { references: [...references, ref] });
    setLabel('');
    setUrl('');
  };

  const remove = (rid) => updateNodeData(nodeId, { references: references.filter((r) => r.id !== rid) });

  const count = references.length;

  return (
    <div className="nodrag nowheel" style={{ marginTop: '8px' }}>
      <button
        type="button"
        className="node-toggle"
        style={{ color: count ? 'var(--accent-color)' : 'var(--text-secondary)' }}
        onClick={() => setOpen((v) => !v)}
      >
        <Link2 size={11} />
        References{count ? ` (${count})` : ''}
      </button>

      {open && (
        <div style={{ marginTop: '6px' }}>
          {count > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
              {references.map((r) => {
                const Icon = (REF_TYPES[r.type] || REF_TYPES.link).icon;
                const body = (
                  <>
                    <Icon size={10} />
                    <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
                    {r.url && <ExternalLink size={9} />}
                  </>
                );
                return (
                  <span key={r.id} className="node-ref-chip">
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'inherit', textDecoration: 'none' }}>
                        {body}
                      </a>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>{body}</span>
                    )}
                    <button onClick={() => remove(r.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <X size={9} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '10px', borderRadius: '4px', padding: '2px', outline: 'none' }}
            >
              {Object.entries(REF_TYPES).map(([key, v]) => (
                <option key={key} value={key}>{v.label}</option>
              ))}
            </select>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
              placeholder="Reference name"
              style={{ flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
              placeholder="URL (optional)"
              style={{ flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', outline: 'none' }}
            />
            <button
              onClick={add}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              <Plus size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
