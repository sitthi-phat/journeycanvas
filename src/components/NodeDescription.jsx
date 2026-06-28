import React, { useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { useStore } from '../store/useStore';

// Collapsible "what happens here / expected behaviour" field, separate from the
// discussion comment thread.
export default function NodeDescription({ nodeId, value, defaultOpen = false }) {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const has = !!(value && value.trim());
  // Open if explicitly requested (overlay) or there's content; empty cards stay
  // collapsed to a compact affordance so they don't waste vertical space.
  const [open, setOpen] = useState(defaultOpen || has);

  return (
    <div className="nodrag nowheel" style={{ marginTop: '10px' }}>
      <button
        type="button"
        className="node-toggle"
        style={{ color: has ? 'var(--accent-color)' : 'var(--text-secondary)' }}
        onClick={() => setOpen((v) => !v)}
      >
        <NotebookPen size={11} />
        {!has && !open ? '+ Behaviour' : `Behaviour${has ? ' •' : ''}`}
      </button>

      {open && (
        <textarea
          className="persona-field"
          style={{ marginTop: '6px' }}
          value={value || ''}
          onChange={(e) => updateNodeData(nodeId, { description: e.target.value })}
          placeholder="Describe what happens here / the expected behaviour…"
        />
      )}
    </div>
  );
}
