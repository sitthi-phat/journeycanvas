import React from 'react';
import { NodeResizer } from '@xyflow/react';
import { AlertTriangle, Lightbulb, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeComments from './NodeComments';
import NodeHandles from './NodeHandles';
import ExpandButton from './ExpandButton';

const KINDS = {
  pain: { label: 'Pain Point', icon: AlertTriangle, color: '#ef4444' },
  opportunity: { label: 'Opportunity', icon: Lightbulb, color: '#f59e0b' }
};

export default function MarkerNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);

  const kind = KINDS[data.kind] ? data.kind : 'pain';
  const cfg = KINDS[kind];
  const Icon = cfg.icon;

  const toggleKind = () =>
    updateNodeData(id, { kind: kind === 'pain' ? 'opportunity' : 'pain' });

  return (
    <div
      className={`custom-node marker-node ${selected ? 'selected' : ''}`}
      style={{ borderColor: cfg.color, borderLeftWidth: '6px', background: `${cfg.color}0d` }}
    >
      <NodeResizer isVisible={selected} minWidth={150} minHeight={90} />
      <NodeHandles />

      <div className="actor-header" style={{ color: cfg.color }}>
        <Icon size={15} />
        <button
          onClick={toggleKind}
          title="Switch Pain Point / Opportunity"
          style={{ background: 'transparent', border: 'none', color: cfg.color, fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0 }}
        >
          {cfg.label}
        </button>
        <ExpandButton id={id} style={{ marginLeft: 'auto' }} />
        <button
          className="node-delete-btn"
          style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6' }}
          onClick={() => deleteNode(id)}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <textarea
        className="persona-field"
        value={data.text || ''}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        placeholder={kind === 'pain' ? "What's frustrating here?" : 'What could be better here?'}
      />

      <NodeComments nodeId={id} />
    </div>
  );
}
