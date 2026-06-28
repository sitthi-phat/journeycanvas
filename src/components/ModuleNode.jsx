import React from 'react';
import { NodeResizer } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeComments from './NodeComments';
import ExpandButton from './ExpandButton';

export default function ModuleNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);

  const handleLabelChange = (e) => {
    updateNodeData(id, { label: e.target.value });
  };

  return (
    <div 
      className={`module-container-node ${selected ? 'selected' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        minWidth: '200px',
        minHeight: '200px'
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={200}
        handleStyle={{ pointerEvents: 'all' }}
        lineStyle={{ pointerEvents: 'all' }}
      />

      <div 
        className="module-container-header"
        style={{
          position: 'absolute',
          top: '-28px',
          left: '0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 17, 26, 0.9)',
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid rgba(192, 132, 252, 0.3)',
          pointerEvents: 'auto' // Re-enable pointer events for interactions
        }}
      >
        <input
          value={data.label || ''}
          onChange={handleLabelChange}
          placeholder="e.g. Payment Module"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#c084fc',
            fontSize: '11px',
            fontWeight: 'bold',
            outline: 'none',
            width: '120px'
          }}
        />
        <ExpandButton id={id} />
        <button
          onClick={() => deleteNode(id)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#8b92b6',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>

      <div style={{ position: 'absolute', top: '6px', left: '6px', width: '220px', pointerEvents: 'auto' }}>
        <NodeComments nodeId={id} />
      </div>
    </div>
  );
}
