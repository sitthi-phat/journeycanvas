import React, { useState } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Monitor, Cpu, Database, Bell, Trash2, AlertTriangle, Plus, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeComments from './NodeComments';
import NodeHandles from './NodeHandles';
import NodeDescription from './NodeDescription';
import NodeReferences from './NodeReferences';

const APP_BLOCKS = {
  ui_element: { label: 'Screen / UI Element', icon: Monitor, cssClass: 'node-ui', color: '#06b6d4' },
  logic: { label: 'System Logic & Validation', icon: Cpu, cssClass: 'node-logic', color: '#a855f7' },
  storage: { label: 'Data Storage / Remember', icon: Database, cssClass: 'node-storage', color: '#f59e0b' },
  notification: { label: 'External Notification', icon: Bell, cssClass: 'node-notification', color: '#10b881' }
};

export default function AppNode({ id, type, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);
  const allNodes = useStore((state) => state.nodes);
  const addNodeTag = useStore((state) => state.addNodeTag);
  const removeNodeTag = useStore((state) => state.removeNodeTag);

  const [newTag, setNewTag] = useState('');

  const userJourneyNodes = allNodes.filter(
    (n) => n.type === 'actor' || n.type === 'action'
  );

  const blockConfig = APP_BLOCKS[type] || APP_BLOCKS.ui_element;
  const IconComponent = blockConfig.icon;

  const handleLabelChange = (e) => {
    updateNodeData(id, { label: e.target.value });
  };

  const handleLinkChange = (e) => {
    updateNodeData(id, { linkedUserNodeId: e.target.value || null });
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (newTag.trim()) {
        addNodeTag(id, newTag);
        setNewTag('');
      }
    }
  };

  const currentParentNode = userJourneyNodes.find(n => n.id === data.linkedUserNodeId);
  const isLinked = !!currentParentNode;

  return (
    <div 
      className={`custom-node app-node ${blockConfig.cssClass} ${selected ? 'selected' : ''}`}
      style={{ borderLeftWidth: '6px' }}
    >
      <NodeResizer isVisible={selected} minWidth={180} minHeight={120} />
      <NodeHandles />

      <div className="actor-header" style={{ color: blockConfig.color }}>
        <IconComponent size={16} />
        <span>{blockConfig.label}</span>
        <button 
          className="node-delete-btn"
          style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6' }}
          onClick={() => deleteNode(id)}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <input
        className="node-title-input"
        value={data.label || ''}
        onChange={handleLabelChange}
        placeholder="Enter system action description..."
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

      {/* Strict Linkage Enforcement */}
      <div className="linkage-select-box" style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', marginBottom: '2px', width: '100%' }}>
          <label style={{ fontSize: '9px', fontWeight: 'bold' }}>Parent User Step</label>
          {!isLinked && (
            <span style={{ 
              color: '#ef4444', 
              fontSize: '8px', 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '2px',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '1px 4px',
              borderRadius: '3px',
              marginLeft: 'auto'
            }}>
              <AlertTriangle size={8} /> Linkage Required!
            </span>
          )}
        </div>
        <select 
          className="linkage-select" 
          value={data.linkedUserNodeId || ''} 
          onChange={handleLinkChange}
          style={{ 
            borderColor: !isLinked ? '#ef4444' : 'var(--border-color)',
            background: !isLinked ? 'rgba(239, 68, 68, 0.06)' : 'var(--input-bg)',
            width: '100%'
          }}
        >
          <option value="">-- Choose User Action/Actor --</option>
          {userJourneyNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.data?.label ? `[${n.type.toUpperCase()}] ${n.data.label}` : `Unnamed ${n.type} Node`}
            </option>
          ))}
        </select>
      </div>

      {isLinked && (
        <div style={{ 
          marginTop: '6px', 
          fontSize: '9px', 
          color: 'var(--text-secondary)',
          background: 'var(--surface-2)',
          padding: '4px',
          borderRadius: '4px',
          borderLeft: '2px solid var(--accent-color)',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          Linked: <strong>{currentParentNode.data?.label || 'Unnamed Step'}</strong>
        </div>
      )}

      {/* Interactive Tags Section */}
      <div style={{ marginTop: '10px' }}>
        <label style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tags</label>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
          {(data.tags || []).map((t, idx) => (
            <span 
              key={idx} 
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '1px 4px',
                fontSize: '9px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                color: 'var(--text-secondary)'
              }}
            >
              {t}
              <button 
                onClick={() => removeNodeTag(id, t)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                <X size={8} />
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <input 
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="+ tag (e.g. #db)"
            style={{
              flex: 1,
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              outline: 'none'
            }}
          />
          <button 
            onClick={handleAddTag}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '2px 4px',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <Plus size={10} />
          </button>
        </div>
      </div>

      <NodeDescription nodeId={id} value={data.description} />
      <NodeReferences nodeId={id} references={data.references} />
      <NodeComments nodeId={id} />
    </div>
  );
}
