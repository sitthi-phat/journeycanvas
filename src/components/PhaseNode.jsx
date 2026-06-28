import React, { useLayoutEffect, useRef } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import ExpandButton from './ExpandButton';

export const PHASE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#0ea5e9', '#8b5cf6'];

// A horizontal phase band: numbered badge + title + description on the left, colored
// border wrapping the steps placed inside it. Sits behind content like a lane.
export default function PhaseNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);
  const color = data.color || PHASE_COLORS[0];

  // Auto-grow the title so long phase names wrap and stay fully visible
  const titleRef = useRef(null);
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
  }, [data.label]);
  const cycleColor = () => {
    const i = PHASE_COLORS.indexOf(color);
    updateNodeData(id, { color: PHASE_COLORS[(i + 1) % PHASE_COLORS.length] });
  };

  return (
    <div
      className={`phase-node ${selected ? 'selected' : ''}`}
      style={{ width: '100%', height: '100%', position: 'relative', border: `2px solid ${color}55`, background: `${color}0d`, borderRadius: 16, pointerEvents: 'none' }}
    >
      <NodeResizer isVisible={selected} minWidth={320} minHeight={150} handleStyle={{ pointerEvents: 'all' }} lineStyle={{ pointerEvents: 'all' }} />

      <div className="phase-side" style={{ pointerEvents: 'auto' }}>
        <div className="phase-badge" style={{ background: color }}>
          <input
            className="phase-number nodrag"
            value={data.number || ''}
            onChange={(e) => updateNodeData(id, { number: e.target.value })}
            placeholder="1"
          />
        </div>
        <div className="phase-text">
          <textarea
            ref={titleRef}
            className="phase-title nodrag"
            value={data.label || ''}
            onChange={(e) => updateNodeData(id, { label: e.target.value })}
            placeholder="Phase name"
            rows={1}
            style={{ color }}
          />
          <textarea
            className="phase-desc nodrag"
            value={data.description || ''}
            onChange={(e) => updateNodeData(id, { description: e.target.value })}
            placeholder="What this phase covers…"
          />
          {selected && (
            <div className="phase-tools nodrag">
              <button className="phase-swatch" onClick={cycleColor} title="Change color" style={{ background: color }} />
              <ExpandButton id={id} />
              <button className="node-delete-btn" onClick={() => deleteNode(id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6', display: 'flex' }}>
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
