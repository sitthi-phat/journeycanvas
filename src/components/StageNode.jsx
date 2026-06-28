import React from 'react';
import { NodeResizer } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import ExpandButton from './ExpandButton';

// Phase colors cycled by the swatch button to differentiate journey stages
export const STAGE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function StageNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);

  const color = data.color || STAGE_COLORS[0];

  const cycleColor = () => {
    const i = STAGE_COLORS.indexOf(color);
    updateNodeData(id, { color: STAGE_COLORS[(i + 1) % STAGE_COLORS.length] });
  };

  return (
    <div
      className={`stage-node ${selected ? 'selected' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        background: `${color}14`,
        border: `2px dashed ${color}66`,
        borderRadius: '14px',
        position: 'relative',
        pointerEvents: 'none'
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={240}
        handleStyle={{ pointerEvents: 'all' }}
        lineStyle={{ pointerEvents: 'all' }}
      />

      {/* Header bar — the only pointer-interactive area, so nodes placed inside stay clickable */}
      <div
        className="stage-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: `${color}26`,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          borderBottom: `1px solid ${color}40`,
          pointerEvents: 'auto'
        }}
      >
        <button
          onClick={cycleColor}
          title="Change phase color"
          style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', flexShrink: 0, padding: 0 }}
        />
        <input
          value={data.label || ''}
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
          placeholder="Phase name (e.g. Onboarding)"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: color,
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            outline: 'none'
          }}
        />
        <ExpandButton id={id} />
        <button
          onClick={() => deleteNode(id)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6', display: 'flex' }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
