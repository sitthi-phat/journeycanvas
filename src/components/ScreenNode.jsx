import React, { useState } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Monitor, Trash2, Plus, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeComments from './NodeComments';
import NodeHandles from './NodeHandles';
import NodeDescription from './NodeDescription';
import NodeReferences from './NodeReferences';
import AttributeChips from './AttributeChips';
import ExpandButton from './ExpandButton';

// The single Application Journey element: a screen the user lands on, carrying the
// system behaviours (logic / stored data / notifications) that happen there as chips.
export default function ScreenNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);
  const addNodeTag = useStore((state) => state.addNodeTag);
  const removeNodeTag = useStore((state) => state.removeNodeTag);

  const [newTag, setNewTag] = useState('');

  const addAttr = (field, v) => updateNodeData(id, { [field]: [...(data[field] || []), v] });
  const removeAttr = (field, i) => updateNodeData(id, { [field]: (data[field] || []).filter((_, idx) => idx !== i) });

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (newTag.trim()) {
        addNodeTag(id, newTag);
        setNewTag('');
      }
    }
  };

  return (
    <div
      className={`custom-node app-node node-ui screen-node ${selected ? 'selected' : ''}`}
      style={{ borderLeftWidth: '6px' }}
    >
      <NodeResizer isVisible={selected} minWidth={200} minHeight={160} />
      <NodeHandles />

      <div className="actor-header" style={{ color: 'var(--color-ui)' }}>
        <Monitor size={16} />
        <span>Screen / App Step</span>
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
        onChange={(e) => updateNodeData(id, { label: e.target.value })}
        placeholder="Screen name (e.g. Login screen)"
      />

      {/* Friendly "who/what this serves" caption — Actor · Action */}
      <div className="app-context-row">
        <span className="app-context-icon">🧑‍🏫</span>
        <input
          className="app-context-input"
          value={data.actorContext || ''}
          onChange={(e) => updateNodeData(id, { actorContext: e.target.value })}
          placeholder="Serves: Actor · Action (e.g. Student · Sign up)"
        />
      </div>

      {/* System behaviours — shown only when filled (read mode) or while editing (selected) */}
      {(selected || (data.logic || []).length > 0) && (
        <AttributeChips
          label="System logic / checks"
          icon="⚙️"
          color="var(--color-logic)"
          items={data.logic || []}
          onAdd={(v) => addAttr('logic', v)}
          onRemove={(i) => removeAttr('logic', i)}
          placeholder="e.g. Verify login"
          readOnly={!selected}
        />
      )}
      {(selected || (data.storage || []).length > 0) && (
        <AttributeChips
          label="Data remembered"
          icon="📦"
          color="var(--color-storage)"
          items={data.storage || []}
          onAdd={(v) => addAttr('storage', v)}
          onRemove={(i) => removeAttr('storage', i)}
          placeholder="e.g. Save session"
          readOnly={!selected}
        />
      )}
      {(selected || (data.notifications || []).length > 0) && (
        <AttributeChips
          label="Notifications sent"
          icon="🔔"
          color="var(--color-notification)"
          items={data.notifications || []}
          onAdd={(v) => addAttr('notifications', v)}
          onRemove={(i) => removeAttr('notifications', i)}
          placeholder="e.g. Welcome email"
          readOnly={!selected}
        />
      )}

      {/* Tags — chips always; editor only when selected */}
      {(selected || (data.tags || []).length > 0) && (
        <div style={{ marginTop: '10px' }}>
          <label style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: selected ? '6px' : 0 }}>
            {(data.tags || []).map((t, idx) => (
              <span key={idx} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1px 4px', fontSize: '9px', display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--text-secondary)' }}>
                {t}
                {selected && (
                  <button onClick={() => removeNodeTag(id, t)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                    <X size={8} />
                  </button>
                )}
              </span>
            ))}
          </div>
          {selected && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="+ tag (e.g. #db)"
                style={{ flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', outline: 'none' }}
              />
              <button onClick={handleAddTag} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 4px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <Plus size={10} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Behaviour / References / Comments — only while editing, to keep the map clean */}
      {selected && (
        <>
          <NodeDescription nodeId={id} value={data.description} />
          <NodeReferences nodeId={id} references={data.references} />
          <NodeComments nodeId={id} />
        </>
      )}
    </div>
  );
}
