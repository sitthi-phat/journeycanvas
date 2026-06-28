import React, { useState } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Presentation, GraduationCap, Users, Building2, BookMarked, PenTool, Cpu, UserSquare, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeHandles from './NodeHandles';
import NodeDescription from './NodeDescription';
import ExpandButton from './ExpandButton';

// Education-domain actors for the User Journey lane
export const ACTOR_TYPES = {
  teacher: { label: 'Teacher', icon: Presentation, color: '#e11d48' },
  student: { label: 'Student', icon: GraduationCap, color: '#3b82f6' },
  parent: { label: 'Parent / Guardian', icon: Users, color: '#10b981' },
  school_admin: { label: 'School Admin', icon: Building2, color: '#f59e0b' },
  academic: { label: 'Academic / Curriculum Lead', icon: BookMarked, color: '#8b5cf6' },
  content_author: { label: 'Content Author', icon: PenTool, color: '#0ea5e9' },
  system: { label: 'External System', icon: Cpu, color: '#64748b' }
};

// Human-readable name for an actor node (used by Action cards to show "who does it")
export const actorName = (node) => {
  const d = node?.data || {};
  const typeLabel = ACTOR_TYPES[d.actorType]?.label || d.actorType || 'Actor';
  if (d.label && d.label.trim() && d.label.trim() !== typeLabel) return d.label.trim();
  return typeLabel;
};

export default function ActorNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);

  // A custom actor stores its typed name directly in `actorType` (same level as the
  // preset values like 'teacher'); it just isn't one of the known presets.
  const isCustom = data.isCustom === true || (!!data.actorType && !ACTOR_TYPES[data.actorType]);
  const actorKey = !isCustom && data.actorType && ACTOR_TYPES[data.actorType] ? data.actorType : 'teacher';
  const config = isCustom
    ? { label: (data.actorType || '').trim() || 'Custom Actor', icon: UserSquare, color: '#64748b' }
    : (ACTOR_TYPES[actorKey] || ACTOR_TYPES.teacher);
  const IconComponent = config.icon;
  const selectValue = isCustom ? 'other' : actorKey;

  const [editingType, setEditingType] = useState(false);
  const displayType = isCustom ? ((data.actorType || '').trim() || 'Custom actor') : config.label;

  const handleTypeChange = (e) => {
    const v = e.target.value;
    if (v === 'other') updateNodeData(id, { isCustom: true, actorType: '' });
    else { updateNodeData(id, { isCustom: false, actorType: v }); setEditingType(false); }
  };

  return (
    <div className={`custom-node actor-node ${selected ? 'selected' : ''}`} style={{ borderColor: config.color }}>
      <NodeResizer isVisible={selected} minWidth={160} minHeight={90} />
      <NodeHandles />

      <div className="actor-header" style={{ color: config.color }}>
        <IconComponent size={16} />
        <button
          className="type-title nodrag"
          title="Click to change persona type"
          onClick={(e) => { e.stopPropagation(); setEditingType((v) => !v); }}
          style={{ color: config.color }}
        >
          Actor: {displayType}
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

      {editingType && (
        <div className="linkage-select-box" style={{ marginTop: '8px' }}>
          <label>Persona Type</label>
          <select className="linkage-select" value={selectValue} onChange={handleTypeChange}>
            {Object.entries(ACTOR_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
            <option value="other">Other / Custom…</option>
          </select>
          {isCustom && (
            <input
              className="linkage-select"
              value={data.actorType || ''}
              onChange={(e) => updateNodeData(id, { actorType: e.target.value })}
              placeholder="Name this actor type (e.g. Teaching Assistant)"
              style={{ marginTop: '4px' }}
            />
          )}
        </div>
      )}

      {/* Behaviour collapses when empty; tags / references / comments live in the Expand overlay */}
      <NodeDescription nodeId={id} value={data.description} />
    </div>
  );
}
