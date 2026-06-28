import React from 'react';
import { NodeResizer } from '@xyflow/react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeComments from './NodeComments';
import NodeHandles from './NodeHandles';
import ExpandButton from './ExpandButton';

export default function ImageNode({ id, data, selected }) {
  const deleteNode = useStore((state) => state.deleteNode);

  return (
    <div
      className={`custom-node image-node-container ${selected ? 'selected' : ''}`}
      style={{ padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      <NodeResizer isVisible={selected} minWidth={160} minHeight={140} />

      {/* Node Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        background: 'var(--surface-2)',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        gap: '8px',
        flexShrink: 0
      }}>
        <ImageIcon size={14} style={{ color: '#c084fc' }} />
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {data.label || 'Sketch / Asset'}
        </span>
        <ExpandButton id={id} />
        <button
          onClick={() => deleteNode(id)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6' }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Main Image content — fills the available space so it scales when resized */}
      <div style={{ padding: '8px', flex: 1, minHeight: 0, display: 'flex' }}>
        <img
          src={data.url}
          alt={data.label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '6px'
          }}
        />
      </div>

      <div style={{ padding: '0 8px 8px', flexShrink: 0 }}>
        <NodeComments nodeId={id} />
      </div>

      <NodeHandles />
    </div>
  );
}
