import React from 'react';
import { NodeResizer } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import ExpandButton from './ExpandButton';

// A board title banner (big heading + subtitle), like the header of a presentation map.
export default function TitleNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);

  return (
    <div className={`title-node ${selected ? 'selected' : ''}`} style={{ width: '100%', height: '100%' }}>
      <NodeResizer isVisible={selected} minWidth={260} minHeight={64} />
      {selected && (
        <div className="title-toolbar nodrag">
          <ExpandButton id={id} />
          <button className="node-delete-btn" onClick={() => deleteNode(id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6', display: 'flex' }}>
            <Trash2 size={12} />
          </button>
        </div>
      )}
      <input
        className="title-input nodrag"
        value={data.title || ''}
        onChange={(e) => updateNodeData(id, { title: e.target.value })}
        placeholder="Title…"
      />
      <input
        className="title-sub nodrag"
        value={data.subtitle || ''}
        onChange={(e) => updateNodeData(id, { subtitle: e.target.value })}
        placeholder="Subtitle / description…"
      />
    </div>
  );
}
