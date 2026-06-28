import React from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import ExpandButton from './ExpandButton';

// Standard flowchart decision: a diamond with connection dots on every side.
// Connect out from ANY dot, then flag that edge Yes/No (green/red) on the line.
export default function DecisionNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);

  return (
    <div className={`decision-node ${selected ? 'selected' : ''}`} style={{ width: '100%', height: '100%', position: 'relative', minWidth: 150, minHeight: 110 }}>
      <NodeResizer isVisible={selected} minWidth={150} minHeight={110} />

      {/* diamond shape */}
      <svg className="decision-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,3 97,50 50,97 3,50" fill="rgba(124,58,237,0.08)" stroke="#7c3aed" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* centered question */}
      <div className="decision-content">
        <input
          className="decision-q nodrag"
          value={data.label || ''}
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
          placeholder="Decision?"
        />
      </div>

      {/* toolbar (expand / delete) shown when selected */}
      {selected && (
        <div className="decision-toolbar nodrag">
          <ExpandButton id={id} color="#7c3aed" />
          <button onClick={() => deleteNode(id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6', display: 'flex' }}>
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* connection dots on all four sides — output (or input) from any of them */}
      <Handle type="source" position={Position.Top} id="t" />
      <Handle type="source" position={Position.Right} id="r" />
      <Handle type="source" position={Position.Bottom} id="b" />
      <Handle type="source" position={Position.Left} id="l" />
    </div>
  );
}
