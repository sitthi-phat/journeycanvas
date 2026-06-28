import React from 'react';
import { NodeResizer } from '@xyflow/react';
import { UserSquare, Target, HeartCrack, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeComments from './NodeComments';
import NodeHandles from './NodeHandles';
import ExpandButton from './ExpandButton';
import { ACTOR_TYPES } from './ActorNode';

// A lightweight "who is this for and what do they want" card to anchor a discovery
// session before the journey steps are drawn.
export default function PersonaNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);

  const set = (field) => (e) => updateNodeData(id, { [field]: e.target.value });

  // Role mirrors the Actor "Other / Custom" behaviour: a custom role stores its typed
  // name directly in `role`, at the same level as the presets.
  const isCustomRole = data.isCustomRole === true || (!!data.role && !ACTOR_TYPES[data.role]);
  const roleSelectValue = isCustomRole ? 'other' : (data.role && ACTOR_TYPES[data.role] ? data.role : 'teacher');
  const handleRoleChange = (e) => {
    const v = e.target.value;
    if (v === 'other') updateNodeData(id, { isCustomRole: true, role: '' });
    else updateNodeData(id, { isCustomRole: false, role: v });
  };

  return (
    <div
      className={`custom-node persona-node ${selected ? 'selected' : ''}`}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <NodeResizer isVisible={selected} minWidth={200} minHeight={180} />
      <NodeHandles />

      <div className="actor-header" style={{ color: '#7c3aed' }}>
        <UserSquare size={16} />
        <span>Persona</span>
        <ExpandButton id={id} style={{ marginLeft: 'auto' }} />
        <button
          className="node-delete-btn"
          style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6' }}
          onClick={() => deleteNode(id)}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <input
        className="node-title-input"
        value={data.label || ''}
        onChange={set('label')}
        placeholder="Persona name (e.g. Ms. Lee — Grade 5 Teacher)"
      />

      <div className="linkage-select-box">
        <label>Role</label>
        <select className="linkage-select" value={roleSelectValue} onChange={handleRoleChange}>
          {Object.entries(ACTOR_TYPES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
          <option value="other">Other / Custom…</option>
        </select>
        {isCustomRole && (
          <input
            className="linkage-select"
            value={data.role || ''}
            onChange={(e) => updateNodeData(id, { role: e.target.value })}
            placeholder="Name this role (e.g. Teaching Assistant)"
            style={{ marginTop: '4px' }}
          />
        )}
      </div>

      <div style={{ marginTop: '10px' }}>
        <label style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <Target size={10} /> Goal / Job-to-be-done
        </label>
        <textarea
          className="persona-field"
          value={data.goal || ''}
          onChange={set('goal')}
          placeholder="What is this person trying to achieve?"
        />
      </div>

      <div style={{ marginTop: '8px' }}>
        <label style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <HeartCrack size={10} /> Pain points / Context
        </label>
        <textarea
          className="persona-field"
          value={data.context || ''}
          onChange={set('context')}
          placeholder="What's hard today? What matters to them?"
        />
      </div>

      <NodeComments nodeId={id} />
    </div>
  );
}
