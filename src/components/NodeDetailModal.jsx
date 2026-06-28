import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeComments from './NodeComments';
import NodeReferences from './NodeReferences';
import NodeDescription from './NodeDescription';
import AttributeChips from './AttributeChips';
import EmotionPicker from './EmotionPicker';
import { ACTOR_TYPES } from './ActorNode';
import { ACTION_TYPES } from './ActionNode';
import { STAGE_COLORS } from './StageNode';
import { CALLOUT_COLORS } from './CalloutNode';
import { CTA_COLORS } from './CtaNode';

const TITLES = {
  persona: 'Persona',
  actor: 'Actor',
  action: 'Action',
  ui_element: 'Screen / App Step',
  transition: 'Action / Transition',
  decision: 'Decision',
  marker: 'Insight',
  stage: 'Stage / Phase',
  group_module: 'Module / Container',
  image_node: 'Image',
  callout: 'Note / Callout',
  cta: 'Call-to-Action'
};

function ColorSwatches({ colors, value, fallback, onPick }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {colors.map((c) => (
        <button key={c} onClick={() => onPick(c)} title={c}
          style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: (value || fallback) === c ? '2px solid var(--text-primary)' : '1px solid var(--border-color)', cursor: 'pointer' }} />
      ))}
    </div>
  );
}

function Label({ children }) {
  return <label className="nd-label">{children}</label>;
}

function Section({ children }) {
  return <div className="nd-section">{children}</div>;
}

// type select that also supports an "Other / Custom…" free-typed value (actor & action)
function TypeSelect({ types, valueKey, data, onPatch }) {
  const isCustom = data.isCustom === true || (!!data[valueKey] && !types[data[valueKey]]);
  const selectValue = isCustom ? 'other' : (data[valueKey] && types[data[valueKey]] ? data[valueKey] : Object.keys(types)[0]);
  return (
    <div>
      <select
        className="nd-input"
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === 'other') onPatch({ isCustom: true, [valueKey]: '' });
          else onPatch({ isCustom: false, [valueKey]: v });
        }}
      >
        {Object.entries(types).map(([k, val]) => <option key={k} value={k}>{val.label}</option>)}
        <option value="other">Other / Custom…</option>
      </select>
      {isCustom && (
        <input
          className="nd-input"
          style={{ marginTop: 6 }}
          value={data[valueKey] || ''}
          onChange={(e) => onPatch({ [valueKey]: e.target.value })}
          placeholder="Name this type (e.g. Teaching Assistant)"
        />
      )}
    </div>
  );
}

function TagsField({ tags = [], onAdd, onRemove }) {
  const [val, setVal] = useState('');
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {tags.map((t, i) => (
          <span key={i} className="nd-chip">
            {t}
            <button onClick={() => onRemove(t)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={10} /></button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          className="nd-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && val.trim()) { e.preventDefault(); onAdd(val); setVal(''); } }}
          placeholder="+ tag (e.g. #vip)"
        />
        <button className="nd-btn" onClick={() => { if (val.trim()) { onAdd(val); setVal(''); } }}><Plus size={12} /></button>
      </div>
    </div>
  );
}

export default function NodeDetailModal() {
  const expandedNodeId = useStore((s) => s.expandedNodeId);
  const node = useStore((s) => s.nodes.find((n) => n.id === s.expandedNodeId));
  const setExpandedNodeId = useStore((s) => s.setExpandedNodeId);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const deleteNode = useStore((s) => s.deleteNode);
  const addNodeTag = useStore((s) => s.addNodeTag);
  const removeNodeTag = useStore((s) => s.removeNodeTag);

  if (!expandedNodeId || !node) return null;

  const data = node.data || {};
  const set = (patch) => updateNodeData(node.id, patch);
  const setArr = (field, arr) => updateNodeData(node.id, { [field]: arr });
  const close = () => setExpandedNodeId(null);

  const renderFields = () => {
    switch (node.type) {
      case 'persona':
        return (
          <>
            <Section><Label>Persona name</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Ms. Lee — Grade 5 Teacher" /></Section>
            <Section><Label>Role</Label><TypeSelect types={ACTOR_TYPES} valueKey="role" data={data} onPatch={(p) => set(p.isCustom !== undefined ? { isCustomRole: p.isCustom, ...('role' in p ? { role: p.role } : {}) } : p)} /></Section>
            <Section><Label>🎯 Goal / Job-to-be-done</Label><textarea className="nd-area" value={data.goal || ''} onChange={(e) => set({ goal: e.target.value })} placeholder="What is this person trying to achieve?" /></Section>
            <Section><Label>💔 Pain points / Context</Label><textarea className="nd-area" value={data.context || ''} onChange={(e) => set({ context: e.target.value })} placeholder="What's hard today? What matters to them?" /></Section>
            <Section><NodeComments nodeId={node.id} defaultOpen /></Section>
          </>
        );
      case 'actor':
        return (
          <>
            <Section><Label>Description</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="Enter actor description…" /></Section>
            <Section><Label>Persona type</Label><TypeSelect types={ACTOR_TYPES} valueKey="actorType" data={data} onPatch={set} /></Section>
            <Section><Label>Tags</Label><TagsField tags={data.tags} onAdd={(t) => addNodeTag(node.id, t)} onRemove={(t) => removeNodeTag(node.id, t)} /></Section>
            <Section><NodeDescription nodeId={node.id} value={data.description} defaultOpen /></Section>
            <Section><NodeReferences nodeId={node.id} references={data.references} defaultOpen /></Section>
            <Section><NodeComments nodeId={node.id} defaultOpen /></Section>
          </>
        );
      case 'action':
        return (
          <>
            <Section><Label>Description</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Submit assignment" /></Section>
            <Section><Label>Action type</Label><TypeSelect types={ACTION_TYPES} valueKey="actionType" data={data} onPatch={set} /></Section>
            <Section><Label>Step number</Label><input className="nd-input" value={data.stepNumber || ''} onChange={(e) => set({ stepNumber: e.target.value })} placeholder="e.g. 1" /></Section>
            <Section><Label>⚙️ System response</Label><input className="nd-input" value={data.systemNote || ''} onChange={(e) => set({ systemNote: e.target.value })} placeholder="What the system does at this step" /></Section>
            <Section><Label>Sentiment</Label><EmotionPicker value={data.emotion} onChange={(e) => set({ emotion: e })} /></Section>
            <Section><Label>Tags</Label><TagsField tags={data.tags} onAdd={(t) => addNodeTag(node.id, t)} onRemove={(t) => removeNodeTag(node.id, t)} /></Section>
            <Section><NodeDescription nodeId={node.id} value={data.description} defaultOpen /></Section>
            <Section><NodeReferences nodeId={node.id} references={data.references} defaultOpen /></Section>
            <Section><NodeComments nodeId={node.id} defaultOpen /></Section>
          </>
        );
      case 'ui_element':
        return (
          <>
            <Section><Label>Screen name</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Login screen" /></Section>
            <Section><Label>🧑‍🏫 Serves (Actor · Action)</Label><input className="nd-input" value={data.actorContext || ''} onChange={(e) => set({ actorContext: e.target.value })} placeholder="e.g. Student · Sign up" /></Section>
            <Section><AttributeChips label="System logic / checks" icon="⚙️" color="var(--color-logic)" items={data.logic || []} onAdd={(v) => setArr('logic', [...(data.logic || []), v])} onRemove={(i) => setArr('logic', (data.logic || []).filter((_, idx) => idx !== i))} placeholder="e.g. Verify login" /></Section>
            <Section><AttributeChips label="Data remembered" icon="📦" color="var(--color-storage)" items={data.storage || []} onAdd={(v) => setArr('storage', [...(data.storage || []), v])} onRemove={(i) => setArr('storage', (data.storage || []).filter((_, idx) => idx !== i))} placeholder="e.g. Save session" /></Section>
            <Section><AttributeChips label="Notifications sent" icon="🔔" color="var(--color-notification)" items={data.notifications || []} onAdd={(v) => setArr('notifications', [...(data.notifications || []), v])} onRemove={(i) => setArr('notifications', (data.notifications || []).filter((_, idx) => idx !== i))} placeholder="e.g. Welcome email" /></Section>
            <Section><Label>Tags</Label><TagsField tags={data.tags} onAdd={(t) => addNodeTag(node.id, t)} onRemove={(t) => removeNodeTag(node.id, t)} /></Section>
            <Section><NodeDescription nodeId={node.id} value={data.description} defaultOpen /></Section>
            <Section><NodeReferences nodeId={node.id} references={data.references} defaultOpen /></Section>
            <Section><NodeComments nodeId={node.id} defaultOpen /></Section>
          </>
        );
      case 'transition':
        return <Section><Label>Action label</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Submit, Resubmit" /></Section>;
      case 'decision':
        return (
          <>
            <Section><Label>Decision question</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Meets standard?" /></Section>
            <Section><div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Connect out from <strong>any dot</strong> to the next step, then click the edge's pill to flag it <strong style={{ color: '#10b981' }}>Yes</strong> (green) or <strong style={{ color: '#ef4444' }}>No</strong> (red).</div></Section>
            <Section><NodeComments nodeId={node.id} defaultOpen /></Section>
          </>
        );
      case 'marker':
        return (
          <>
            <Section>
              <Label>Type</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['pain', 'opportunity'].map((k) => (
                  <button key={k} className={`nd-btn ${data.kind === k || (!data.kind && k === 'pain') ? 'active' : ''}`} onClick={() => set({ kind: k })}>
                    {k === 'pain' ? '⚠️ Pain Point' : '💡 Opportunity'}
                  </button>
                ))}
              </div>
            </Section>
            <Section><Label>Note</Label><textarea className="nd-area" value={data.text || ''} onChange={(e) => set({ text: e.target.value })} placeholder="What's the problem or idea?" /></Section>
            <Section><NodeComments nodeId={node.id} defaultOpen /></Section>
          </>
        );
      case 'stage':
        return (
          <>
            <Section><Label>Phase name</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Onboarding" /></Section>
            <Section>
              <Label>Color</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {STAGE_COLORS.map((c) => (
                  <button key={c} onClick={() => set({ color: c })} title={c}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: (data.color || STAGE_COLORS[0]) === c ? '2px solid var(--text-primary)' : '1px solid var(--border-color)', cursor: 'pointer' }} />
                ))}
              </div>
            </Section>
          </>
        );
      case 'group_module':
        return (
          <>
            <Section><Label>Module name</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Payment Module" /></Section>
            <Section><NodeComments nodeId={node.id} defaultOpen /></Section>
          </>
        );
      case 'image_node':
        return (
          <>
            {data.url && <Section><img src={data.url} alt={data.label} style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 8, display: 'block', margin: '0 auto' }} /></Section>}
            <Section><Label>Label</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="Image label" /></Section>
            <Section><NodeComments nodeId={node.id} defaultOpen /></Section>
          </>
        );
      case 'callout':
        return (
          <>
            <Section><Label>Note title</Label><input className="nd-input" value={data.title || ''} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Validation rules" /></Section>
            <Section><Label>Points (one per line)</Label><textarea className="nd-input" rows={5} value={(data.lines || []).join('\n')} onChange={(e) => set({ lines: e.target.value.split('\n').filter((l) => l.trim() !== '') })} placeholder={'First point\nSecond point'} /></Section>
            <Section><Label>Color</Label><ColorSwatches colors={CALLOUT_COLORS} value={data.color} fallback={CALLOUT_COLORS[0]} onPick={(c) => set({ color: c })} /></Section>
          </>
        );
      case 'cta':
        return (
          <>
            <Section><Label>Label</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Go to Aksorn Collection" /></Section>
            <Section><Label>Subtext</Label><input className="nd-input" value={data.sublabel || ''} onChange={(e) => set({ sublabel: e.target.value })} placeholder="optional" /></Section>
            <Section><Label>Color</Label><ColorSwatches colors={CTA_COLORS} value={data.color} fallback={CTA_COLORS[0]} onPick={(c) => set({ color: c })} /></Section>
          </>
        );
      default:
        return <Section><Label>Label</Label><input className="nd-input" value={data.label || ''} onChange={(e) => set({ label: e.target.value })} /></Section>;
    }
  };

  return (
    <div className="nd-backdrop" onClick={close}>
      <div className="nd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nd-header">
          <h2 className="nd-title">{TITLES[node.type] || 'Element'}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="nd-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }} onClick={() => { deleteNode(node.id); close(); }} title="Delete">
              <Trash2 size={14} />
            </button>
            <button className="nd-btn" onClick={close} title="Close"><X size={16} /></button>
          </div>
        </div>
        <div className="nd-body">{renderFields()}</div>
      </div>
    </div>
  );
}
