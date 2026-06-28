import React from 'react';
import { Maximize2 } from 'lucide-react';
import { useStore } from '../store/useStore';

// Small "expand" control placed in a node header — opens the focused editor overlay.
export default function ExpandButton({ id, color, style }) {
  const setExpandedNodeId = useStore((state) => state.setExpandedNodeId);
  return (
    <button
      className="node-expand-btn nodrag"
      title="Expand to edit"
      onClick={(e) => { e.stopPropagation(); setExpandedNodeId(id); }}
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: color || '#8b92b6', display: 'flex', padding: 0, ...style }}
    >
      <Maximize2 size={12} />
    </button>
  );
}
