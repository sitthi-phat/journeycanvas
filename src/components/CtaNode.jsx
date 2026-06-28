import React from 'react';
import { NodeResizer } from '@xyflow/react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeHandles from './NodeHandles';
import ExpandButton from './ExpandButton';

export const CTA_COLORS = ['#ef4444', '#10b981', '#6366f1', '#f59e0b', '#0ea5e9'];

// A call-to-action / end-node — a filled "button" that closes the journey
// (e.g. "Go to Aksorn Collection").
export default function CtaNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);
  const color = data.color || CTA_COLORS[0];

  const cycleColor = () => {
    const i = CTA_COLORS.indexOf(color);
    updateNodeData(id, { color: CTA_COLORS[(i + 1) % CTA_COLORS.length] });
  };

  return (
    <div
      className={`cta-node ${selected ? 'selected' : ''}`}
      style={{ width: '100%', height: '100%', background: color }}
    >
      <NodeResizer isVisible={selected} minWidth={150} minHeight={56} />
      <NodeHandles />
      {selected && (
        <div className="cta-toolbar nodrag">
          <button className="phase-swatch nodrag" style={{ background: '#ffffff' }} onClick={cycleColor} title="Change color" />
          <ExpandButton id={id} />
          <button className="node-delete-btn" onClick={() => deleteNode(id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex' }}>
            <Trash2 size={12} />
          </button>
        </div>
      )}
      <ArrowRight size={18} color="#fff" style={{ flexShrink: 0 }} />
      <div className="cta-text">
        <input
          className="cta-label nodrag"
          value={data.label || ''}
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
          placeholder="Call to action"
        />
        <input
          className="cta-sub nodrag"
          value={data.sublabel || ''}
          onChange={(e) => updateNodeData(id, { sublabel: e.target.value })}
          placeholder="subtext (optional)"
        />
      </div>
    </div>
  );
}
