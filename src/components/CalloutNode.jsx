import React, { useState } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Info, X, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeHandles from './NodeHandles';
import ExpandButton from './ExpandButton';

export const CALLOUT_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#6366f1', '#0ea5e9'];

// A note / callout box (dashed colored border + title + bullet points) for annotations
// like "Validation rules" or "Handoff only".
export default function CalloutNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);
  const color = data.color || CALLOUT_COLORS[0];
  const lines = data.lines || [];
  const [newLine, setNewLine] = useState('');

  const cycleColor = () => {
    const i = CALLOUT_COLORS.indexOf(color);
    updateNodeData(id, { color: CALLOUT_COLORS[(i + 1) % CALLOUT_COLORS.length] });
  };
  const addLine = () => {
    const v = newLine.trim();
    if (!v) return;
    updateNodeData(id, { lines: [...lines, v] });
    setNewLine('');
  };
  const setLine = (idx, val) => updateNodeData(id, { lines: lines.map((l, i) => (i === idx ? val : l)) });
  const removeLine = (idx) => updateNodeData(id, { lines: lines.filter((_, i) => i !== idx) });

  return (
    <div
      className={`callout-node ${selected ? 'selected' : ''}`}
      style={{ width: '100%', height: '100%', border: `2px dashed ${color}`, background: `${color}12`, borderRadius: 12 }}
    >
      <NodeResizer isVisible={selected} minWidth={180} minHeight={84} />
      <NodeHandles />
      <div className="callout-header" style={{ color }}>
        <Info size={14} />
        <input
          className="callout-title nodrag"
          value={data.title || ''}
          onChange={(e) => updateNodeData(id, { title: e.target.value })}
          placeholder="Note title"
        />
        <button className="phase-swatch nodrag" style={{ background: color }} onClick={cycleColor} title="Change color" />
        <ExpandButton id={id} />
        <button className="node-delete-btn" onClick={() => deleteNode(id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6', display: 'flex' }}>
          <Trash2 size={12} />
        </button>
      </div>
      <ul className="callout-list">
        {lines.map((line, idx) => (
          <li key={idx} className="callout-li">
            <input className="callout-line nodrag" value={line} onChange={(e) => setLine(idx, e.target.value)} />
            <button className="callout-x nodrag" onClick={() => removeLine(idx)}><X size={9} /></button>
          </li>
        ))}
        <li className="callout-li">
          <input
            className="callout-line callout-add nodrag"
            value={newLine}
            onChange={(e) => setNewLine(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLine(); } }}
            onBlur={addLine}
            placeholder="+ add a point"
          />
        </li>
      </ul>
    </div>
  );
}
