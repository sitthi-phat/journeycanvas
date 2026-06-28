import React from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import ExpandButton from './ExpandButton';

// A small action/transition pill that sits between screens (e.g. "Submit", "Resubmit").
// It names what the user does to move from one screen to the next.
export default function TransitionNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);

  return (
    <div className={`transition-node ${selected ? 'selected' : ''}`}>
      <NodeResizer isVisible={selected} minWidth={120} minHeight={30} />
      <Handle type="source" position={Position.Left} id="l" />
      <Handle type="source" position={Position.Right} id="r" />
      <ArrowRight size={12} style={{ flexShrink: 0 }} />
      <input
        className="transition-input nodrag"
        value={data.label || ''}
        onChange={(e) => updateNodeData(id, { label: e.target.value })}
        placeholder="action"
      />
      {selected && (
        <>
          <ExpandButton id={id} color="var(--color-action)" style={{ flexShrink: 0 }} />
          <button
            onClick={() => deleteNode(id)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6', display: 'flex', flexShrink: 0 }}
          >
            <Trash2 size={11} />
          </button>
        </>
      )}
    </div>
  );
}
