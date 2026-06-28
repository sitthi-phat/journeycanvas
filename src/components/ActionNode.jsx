import { useState, useRef, useLayoutEffect } from 'react';
import { NodeResizer } from '@xyflow/react';
import { LogIn, BookOpen, PlayCircle, ClipboardCheck, Upload, CheckSquare, ClipboardList, TrendingUp, Share2, MessageCircle, MousePointerClick, User, AlertTriangle, Trash2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeHandles from './NodeHandles';
import NodeDescription from './NodeDescription';
import ExpandButton from './ExpandButton';
import { actorName } from './ActorNode';

// Education-domain learning/teaching actions for the User Journey lane
export const ACTION_TYPES = {
  access: { label: 'Access / Log in', icon: LogIn, color: '#3b82f6' },
  view_content: { label: 'View Lesson / Content', icon: BookOpen, color: '#6366f1' },
  watch_video: { label: 'Watch Video', icon: PlayCircle, color: '#ec4899' },
  take_assessment: { label: 'Take Quiz / Assessment', icon: ClipboardCheck, color: '#f59e0b' },
  submit: { label: 'Submit Assignment', icon: Upload, color: '#14b8a6' },
  grade: { label: 'Grade / Give Feedback', icon: CheckSquare, color: '#10b981' },
  assign: { label: 'Assign / Set Task', icon: ClipboardList, color: '#8b5cf6' },
  track_progress: { label: 'Track Progress', icon: TrendingUp, color: '#0ea5e9' },
  share: { label: 'Share', icon: Share2, color: '#f97316' },
  discuss: { label: 'Discuss / Comment', icon: MessageCircle, color: '#64748b' }
};

export default function ActionNode({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const deleteNode = useStore((state) => state.deleteNode);
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);

  // Who performs this action — supports MULTIPLE actors, from any mix of:
  //   (1) Actor nodes linked by an edge, (2) picked existing actors, (3) typed names.
  // None at all → flag it.
  const [newActorName, setNewActorName] = useState('');

  // Auto-grow the System note so long text wraps and stays fully visible
  const systemRef = useRef(null);
  useLayoutEffect(() => {
    const el = systemRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
  }, [data.systemNote]);
  const actorNodes = nodes.filter((n) => n.type === 'actor');
  const linkedActors = actorNodes.filter((a) =>
    edges.some((e) => (e.source === a.id && e.target === id) || (e.target === a.id && e.source === id))
  );
  const linkedIds = new Set(linkedActors.map((a) => a.id));
  // back-compat: fall back to the old singular fields
  const actorIds = (data.actorIds || (data.actorId ? [data.actorId] : []))
    .filter((aid) => actorNodes.some((a) => a.id === aid) && !linkedIds.has(aid));
  const actorNames = data.actorNames || (data.actorName ? [data.actorName] : []);
  const availableActors = actorNodes.filter((a) => !linkedIds.has(a.id) && !actorIds.includes(a.id));
  const noActor = linkedActors.length === 0 && actorIds.length === 0 && actorNames.length === 0;

  const addActorId = (aid) => { if (aid) updateNodeData(id, { actorIds: [...actorIds, aid] }); };
  const removeActorId = (aid) => updateNodeData(id, { actorIds: actorIds.filter((x) => x !== aid) });
  const addActorName = () => {
    const v = newActorName.trim();
    if (!v) return;
    updateNodeData(id, { actorNames: [...actorNames, v] });
    setNewActorName('');
  };
  const removeActorName = (idx) => updateNodeData(id, { actorNames: actorNames.filter((_, i) => i !== idx) });

  // A custom action stores its typed name directly in `actionType` (same level as the
  // preset values like 'access'); it just isn't one of the known presets.
  const isCustom = data.isCustom === true || (!!data.actionType && !ACTION_TYPES[data.actionType]);
  const actionKey = !isCustom && data.actionType && ACTION_TYPES[data.actionType] ? data.actionType : 'access';
  const config = isCustom
    ? { label: (data.actionType || '').trim() || 'Custom Action', icon: MousePointerClick, color: '#64748b' }
    : (ACTION_TYPES[actionKey] || ACTION_TYPES.access);
  const IconComponent = config.icon;
  const selectValue = isCustom ? 'other' : actionKey;

  const [editingType, setEditingType] = useState(false);
  const displayType = isCustom ? ((data.actionType || '').trim() || 'Custom action') : config.label;

  const handleTypeChange = (e) => {
    const v = e.target.value;
    if (v === 'other') updateNodeData(id, { isCustom: true, actionType: '' });
    else { updateNodeData(id, { isCustom: false, actionType: v }); setEditingType(false); }
  };

  return (
    <div className={`custom-node action-node ${selected ? 'selected' : ''}`} style={{ borderColor: config.color }}>
      <NodeResizer isVisible={selected} minWidth={160} minHeight={90} />
      <NodeHandles />

      <div className="action-header" style={{ color: config.color }}>
        {data.stepNumber ? <span className="step-number" style={{ background: config.color }}>{data.stepNumber}</span> : null}
        <IconComponent size={16} />
        <button
          className="type-title nodrag"
          title="Click to change action type"
          onClick={(e) => { e.stopPropagation(); setEditingType((v) => !v); }}
          style={{ color: config.color }}
        >
          Action: {displayType}
        </button>
        {data.emotion && (
          <span style={{ marginLeft: 'auto', fontSize: '16px', lineHeight: 1 }} title="Sentiment">{data.emotion}</span>
        )}
        <ExpandButton id={id} style={{ marginLeft: data.emotion ? '8px' : 'auto' }} />
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
          <label>Action Type</label>
          <select className="linkage-select" value={selectValue} onChange={handleTypeChange}>
            {Object.entries(ACTION_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
            <option value="other">Other / Custom…</option>
          </select>
          {isCustom && (
            <input
              className="linkage-select"
              value={data.actionType || ''}
              onChange={(e) => updateNodeData(id, { actionType: e.target.value })}
              placeholder="Name this action (e.g. Reset password)"
              style={{ marginTop: '4px' }}
            />
          )}
        </div>
      )}

      {/* Who performs this action — one or more actors */}
      <div className="action-actor-row">
        {linkedActors.map((a) => (
          <span key={a.id} className="action-actor linked"><User size={11} /> {actorName(a)} <span className="action-actor-hint">· linked</span></span>
        ))}
        {actorIds.map((aid) => (
          <span key={aid} className="action-actor">
            <User size={11} /> {actorName(actorNodes.find((a) => a.id === aid))}
            <button className="chip-x" onClick={() => removeActorId(aid)} title="Remove actor"><X size={9} /></button>
          </span>
        ))}
        {actorNames.map((nm, i) => (
          <span key={`n-${i}`} className="action-actor">
            <User size={11} /> {nm}
            <button className="chip-x" onClick={() => removeActorName(i)} title="Remove actor"><X size={9} /></button>
          </span>
        ))}
        {noActor && <span className="action-actor-flag"><AlertTriangle size={12} /> No actor</span>}
      </div>
      <div className="action-actor-add">
        <select
          className="action-actor-select nodrag"
          value=""
          onChange={(e) => { addActorId(e.target.value); e.target.value = ''; }}
        >
          <option value="">+ Add actor…</option>
          {availableActors.map((a) => <option key={a.id} value={a.id}>{actorName(a)}</option>)}
        </select>
        <input
          className="action-actor-input nodrag"
          value={newActorName}
          onChange={(e) => setNewActorName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addActorName(); } }}
          placeholder="+ name an actor"
        />
      </div>

      {/* System response line (what the system does for this step) */}
      <div className="action-system">
        <span className="action-system-label">⚙️ System</span>
        <textarea
          ref={systemRef}
          rows={1}
          className="action-system-input nodrag"
          value={data.systemNote || ''}
          onChange={(e) => updateNodeData(id, { systemNote: e.target.value })}
          placeholder="system response…"
        />
      </div>

      {/* Behaviour collapses when empty; sentiment, tags, references & comments live in the Expand overlay */}
      <NodeDescription nodeId={id} value={data.description} />
    </div>
  );
}
