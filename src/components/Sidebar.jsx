import React, { useEffect, useState, useRef } from 'react';
import { UserSquare, LayoutGrid, Monitor, Plus, Trash2, FolderOpen, Copy, Columns3, AlertTriangle, Lightbulb, Sparkles, MousePointerClick, ArrowRight, GitBranch, Heading, Rows3, StickyNote, Megaphone, Share2, Link2, ChevronDown, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ACTOR_TYPES } from './ActorNode';
import { ACTION_TYPES } from './ActionNode';
import { EDTECH_TEMPLATES } from '../data/edtechTemplates';
import ShareModal from './ShareModal';

// Common actions surfaced as palette tiles; the rest are available via the node's dropdown
const ACTION_TILES = ['access', 'view_content', 'take_assessment', 'submit', 'grade', 'share'];

// A palette section whose header toggles its content (show more / less)
function Section({ title, defaultOpen = false, children, style }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`palette-section ${open ? '' : 'collapsed'}`} style={style}>
      <h3 className="palette-section-head" onClick={() => setOpen((o) => !o)} role="button" aria-expanded={open}>
        <span>{title}</span>
        <ChevronDown size={14} className="palette-chevron" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
      </h3>
      {open && children}
    </div>
  );
}

export default function Sidebar() {
  const {
    boardsList,
    boardId,
    fetchBoardsList,
    loadBoard,
    duplicateBoard,
    addBuiltinTemplate,
    role,
    principal,
    workspaces,
    currentWorkspaceId,
    fetchWorkspaces,
    setCurrentWorkspace,
    createWorkspace,
    deleteWorkspace,
    createBoard,
    deleteBoard
  } = useStore();

  const isAdmin = role === 'admin';
  const isBoardMember = role === 'member' && principal?.scope === 'board';
  const [share, setShare] = useState(null); // { scope, targetId, name }
  const [boardSearch, setBoardSearch] = useState('');
  const [showAllBoards, setShowAllBoards] = useState(() => {
    try { return localStorage.getItem('jc_boards_showall') === '1'; } catch (_) { return false; }
  });
  const BOARD_LIMIT = 6;

  // Persist the "show all boards" preference across reloads
  useEffect(() => {
    try { localStorage.setItem('jc_boards_showall', showAllBoards ? '1' : '0'); } catch (_) {}
  }, [showAllBoards]);

  // Searchable workspace dropdown
  const [wsOpen, setWsOpen] = useState(false);
  const [wsSearch, setWsSearch] = useState('');
  const wsRef = useRef(null);
  useEffect(() => {
    if (!wsOpen) return;
    const onDown = (e) => { if (wsRef.current && !wsRef.current.contains(e.target)) { setWsOpen(false); setWsSearch(''); } };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [wsOpen]);

  useEffect(() => {
    if (isBoardMember) return; // their single board is auto-loaded by the gate
    (async () => {
      await fetchWorkspaces();
      await fetchBoardsList();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragStart = (event, nodeType, customData = {}) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (typeof customData === 'string') {
      event.dataTransfer.setData('application/reactflow-data', customData);
    } else {
      event.dataTransfer.setData('application/reactflow-data', JSON.stringify(customData));
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleCreateBoard = async () => {
    if (!currentWorkspaceId) { alert('Select or create a workspace first.'); return; }
    const name = prompt('Enter new board name:');
    if (!name || !name.trim()) return;
    await createBoard(name.trim());
  };

  const handleDeleteBoard = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this board? All data will be lost.')) return;
    await deleteBoard(id);
  };

  const handleNewWorkspace = async () => {
    const name = prompt('New workspace name:');
    if (!name || !name.trim()) return;
    await createWorkspace(name.trim());
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspaceId) return;
    if (!confirm('Delete this workspace and ALL its boards? This cannot be undone.')) return;
    await deleteWorkspace(currentWorkspaceId);
  };

  const currentWsName = workspaces.find((w) => w.id === currentWorkspaceId)?.name || 'Workspace';

  // Boards list: searchable + show-more/less
  const searchTerm = boardSearch.trim().toLowerCase();
  const filteredBoards = searchTerm
    ? boardsList.filter((b) => b.name.toLowerCase().includes(searchTerm))
    : boardsList;
  const expanded = !!searchTerm || showAllBoards; // searching always shows all matches
  const visibleBoards = expanded ? filteredBoards : filteredBoards.slice(0, BOARD_LIMIT);
  const hiddenCount = filteredBoards.length - visibleBoards.length;

  const handleCopyBoard = (e, board) => {
    e.stopPropagation();
    const name = prompt('Name for the copied board:', `${board.name} (copy)`);
    if (!name || !name.trim()) return;
    duplicateBoard(board.id, name.trim());
  };

  return (
    <aside className="sidebar-palette">
      {share && <ShareModal scope={share.scope} targetId={share.targetId} name={share.name} onClose={() => setShare(null)} />}

      {/* Workspace + board management (hidden for board-only guests) */}
      {!isBoardMember && (
        <Section title="Workspace" defaultOpen>
          <div className="ws-switcher">
            <div className="ws-picker" ref={wsRef}>
              <button
                className="ws-current"
                title={currentWsName}
                onClick={() => setWsOpen((o) => !o)}
                disabled={!isAdmin && workspaces.length <= 1}
              >
                <span className="ws-current-name">{workspaces.length === 0 ? 'No workspace' : currentWsName}</span>
                <ChevronDown size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
              </button>
              {wsOpen && (
                <div className="ws-dropdown">
                  <div className="ws-dd-search">
                    <Search size={12} />
                    <input
                      autoFocus
                      value={wsSearch}
                      onChange={(e) => setWsSearch(e.target.value)}
                      placeholder={`Search ${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'}…`}
                    />
                  </div>
                  <div className="ws-dd-list">
                    {workspaces
                      .filter((w) => w.name.toLowerCase().includes(wsSearch.trim().toLowerCase()))
                      .map((w) => (
                        <button
                          key={w.id}
                          className={`ws-dd-item ${w.id === currentWorkspaceId ? 'active' : ''}`}
                          title={w.name}
                          onClick={() => { setCurrentWorkspace(w.id); setWsOpen(false); setWsSearch(''); }}
                        >
                          {w.name}
                        </button>
                      ))}
                    {workspaces.filter((w) => w.name.toLowerCase().includes(wsSearch.trim().toLowerCase())).length === 0 && (
                      <div className="ws-dd-empty">No workspace matches</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {isAdmin && (
              <>
                <button title="New workspace" onClick={handleNewWorkspace}><Plus size={14} /></button>
                <button title="Share workspace (invite link)" disabled={!currentWorkspaceId}
                  onClick={() => setShare({ scope: 'workspace', targetId: currentWorkspaceId, name: currentWsName })}>
                  <Share2 size={14} />
                </button>
                {currentWorkspaceId && currentWorkspaceId !== 'ws-default' && (
                  <button title="Delete workspace" onClick={handleDeleteWorkspace}><Trash2 size={14} /></button>
                )}
              </>
            )}
          </div>
        </Section>
      )}

      {!isBoardMember && (
        <Section title="Boards" defaultOpen>
          <button className="btn" style={{ width: '100%', marginBottom: '10px' }} onClick={handleCreateBoard}>
            <Plus size={16} /> New Journey Board
          </button>

          {/* Search boards by name */}
          <div className="board-search">
            <Search size={13} />
            <input
              value={boardSearch}
              onChange={(e) => setBoardSearch(e.target.value)}
              placeholder={`Search ${boardsList.length} board${boardsList.length === 1 ? '' : 's'}…`}
            />
            {boardSearch && (
              <button className="board-search-clear" title="Clear" onClick={() => setBoardSearch('')}>×</button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto', marginTop: '8px' }}>
            {visibleBoards.length === 0 && (
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 2px' }}>
                {searchTerm ? `No boards match “${boardSearch.trim()}”.` : 'No boards yet — create one above.'}
              </p>
            )}
            {visibleBoards.map((b) => (
              <div
                key={b.id}
                onClick={() => loadBoard(b.id)}
                title={b.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: b.id === boardId ? 'rgba(92, 98, 236, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  border: b.id === boardId ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <FolderOpen size={14} style={{ color: b.id === boardId ? 'var(--accent-color)' : 'var(--text-secondary)', flexShrink: 0 }} />
                  <span title={b.name} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: b.id === boardId ? '600' : '400' }}>
                    {b.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                  <button
                    onClick={(e) => handleCopyBoard(e, b)}
                    title="Copy this board"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6', display: 'flex' }}
                  >
                    <Copy size={12} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShare({ scope: 'board', targetId: b.id, name: b.name }); }}
                      title="Share this board (invite link)"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6', display: 'flex' }}
                    >
                      <Share2 size={12} />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteBoard(e, b.id)}
                      title="Delete this board"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b92b6', display: 'flex' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Show more / less (hidden while searching) */}
          {!searchTerm && (filteredBoards.length > BOARD_LIMIT) && (
            <button className="board-showmore" onClick={() => setShowAllBoards((v) => !v)}>
              {showAllBoards ? 'Show less' : `Show all ${filteredBoards.length} (${hiddenCount} more)`}
            </button>
          )}
        </Section>
      )}

      {/* Discovery: start with a Persona */}
      <Section title="Start Here · Persona" defaultOpen>
        <div
          className="draggable-item"
          draggable
          onDragStart={(e) => handleDragStart(e, 'persona', { label: '', role: 'teacher' })}
          style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px', borderLeft: '4px solid #7c3aed' }}
        >
          <UserSquare size={16} style={{ color: '#7c3aed' }} />
          <span>Persona / Goal</span>
        </div>
      </Section>

      {/* User Journey: who */}
      <Section title="User Journey · Actors" defaultOpen>
        <div className="palette-grid">
          {Object.entries(ACTOR_TYPES).map(([key, val]) => {
            const Icon = val.icon;
            return (
              <div
                key={key}
                className="draggable-item"
                draggable
                onDragStart={(e) => handleDragStart(e, 'actor', { actorType: key, label: val.label })}
                style={{ borderLeft: `4px solid ${val.color}` }}
              >
                <Icon style={{ color: val.color }} />
                <span style={{ fontSize: '11px' }}>{val.label}</span>
              </div>
            );
          })}
          <div
            className="draggable-item"
            draggable
            onDragStart={(e) => handleDragStart(e, 'actor', { isCustom: true, actorType: '', label: '' })}
            style={{ borderLeft: '4px solid #64748b' }}
          >
            <UserSquare style={{ color: '#64748b' }} />
            <span style={{ fontSize: '11px' }}>Other / Custom</span>
          </div>
        </div>
      </Section>

      {/* User Journey: what they do */}
      <Section title="User Journey · Actions">
        <div className="palette-grid">
          {ACTION_TILES.map((key) => {
            const val = ACTION_TYPES[key];
            const Icon = val.icon;
            return (
              <div
                key={key}
                className="draggable-item"
                draggable
                onDragStart={(e) => handleDragStart(e, 'action', { actionType: key, label: val.label })}
                style={{ borderLeft: `4px solid ${val.color}` }}
              >
                <Icon style={{ color: val.color }} />
                <span style={{ fontSize: '11px' }}>{val.label}</span>
              </div>
            );
          })}
          <div
            className="draggable-item"
            draggable
            onDragStart={(e) => handleDragStart(e, 'action', { isCustom: true, actionType: '', label: '' })}
            style={{ borderLeft: '4px solid #64748b' }}
          >
            <MousePointerClick style={{ color: '#64748b' }} />
            <span style={{ fontSize: '11px' }}>Other / Custom</span>
          </div>
        </div>
        <div
          className="draggable-item"
          draggable
          onDragStart={(e) => handleDragStart(e, 'decision', { label: '' })}
          style={{ borderLeft: '4px solid #7c3aed', flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px', marginTop: '10px' }}
        >
          <GitBranch size={16} style={{ color: '#7c3aed' }} />
          <span>◇ Decision (True / False)</span>
        </div>
      </Section>

      {/* Journey structure: phases & insights */}
      <Section title="Journey Structure">
        <div
          className="draggable-item"
          draggable
          onDragStart={(e) => handleDragStart(e, 'title', { title: '', subtitle: '' })}
          style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px', borderLeft: '4px solid #1f2733', marginBottom: '10px' }}
        >
          <Heading size={16} style={{ color: '#1f2733' }} />
          <span>Title / Banner</span>
        </div>
        <div
          className="draggable-item"
          draggable
          onDragStart={(e) => handleDragStart(e, 'phase', { number: '', label: '', description: '', color: '#10b981' })}
          style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px', borderLeft: '4px solid #10b981', marginBottom: '10px' }}
        >
          <Rows3 size={16} style={{ color: '#10b981' }} />
          <span>Phase band (row)</span>
        </div>
        <div
          className="draggable-item"
          draggable
          onDragStart={(e) => handleDragStart(e, 'stage', { label: '', color: '#6366f1' })}
          style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px', borderLeft: '4px solid #6366f1', marginBottom: '10px' }}
        >
          <Columns3 size={16} style={{ color: '#6366f1' }} />
          <span>Stage (column)</span>
        </div>
        <div className="palette-grid">
          <div
            className="draggable-item"
            draggable
            onDragStart={(e) => handleDragStart(e, 'marker', { kind: 'pain', label: 'Pain Point', text: '' })}
            style={{ borderLeft: '4px solid #ef4444' }}
          >
            <AlertTriangle style={{ color: '#ef4444' }} />
            <span style={{ fontSize: '11px' }}>Pain Point</span>
          </div>
          <div
            className="draggable-item"
            draggable
            onDragStart={(e) => handleDragStart(e, 'marker', { kind: 'opportunity', label: 'Opportunity', text: '' })}
            style={{ borderLeft: '4px solid #f59e0b' }}
          >
            <Lightbulb style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '11px' }}>Opportunity</span>
          </div>
        </div>
      </Section>

      {/* Annotations & end-points for presentation maps */}
      <Section title="Notes & Call-to-Action">
        <div
          className="draggable-item"
          draggable
          onDragStart={(e) => handleDragStart(e, 'callout', { title: '', lines: [], color: '#f59e0b' })}
          style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px', borderLeft: '4px dashed #f59e0b', marginBottom: '10px' }}
        >
          <StickyNote size={16} style={{ color: '#f59e0b' }} />
          <span>Note / Callout</span>
        </div>
        <div
          className="draggable-item"
          draggable
          onDragStart={(e) => handleDragStart(e, 'cta', { label: '', sublabel: '', color: '#ef4444' })}
          style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px', borderLeft: '4px solid #ef4444', marginBottom: '10px' }}
        >
          <Megaphone size={16} style={{ color: '#ef4444' }} />
          <span>Call-to-Action / End</span>
        </div>
        <div
          className="draggable-item"
          draggable
          onDragStart={(e) => handleDragStart(e, 'board_link', { boardId: '', boardName: '' })}
          style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px', borderLeft: '4px solid #0ea5e9' }}
        >
          <Link2 size={16} style={{ color: '#0ea5e9' }} />
          <span>Link to board</span>
        </div>
      </Section>

      {/* Application Journey Palette — one screen-centric element */}
      <Section title="Application Journey">
        <div className="palette-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div
            className="draggable-item"
            draggable
            onDragStart={(e) => handleDragStart(e, 'ui_element', { label: '', logic: [], storage: [], notifications: [] })}
            style={{ borderLeft: '4px solid var(--color-ui)', flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px' }}
          >
            <Monitor size={16} style={{ color: 'var(--color-ui)' }} />
            <span>📺 Screen / App Step</span>
          </div>
          <div
            className="draggable-item"
            draggable
            onDragStart={(e) => handleDragStart(e, 'transition', { label: '' })}
            style={{ borderLeft: '4px solid var(--color-action)', flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px', marginTop: '8px' }}
          >
            <ArrowRight size={16} style={{ color: 'var(--color-action)' }} />
            <span>➡️ Action / Transition</span>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '8px 2px 0', lineHeight: 1.5 }}>
            Connect screens with a small <strong>Action</strong> pill (e.g. "Submit", "Resubmit"). To revisit a
            screen, point the action <strong>back to the existing screen</strong> — don't duplicate it.
          </p>
        </div>
      </Section>

      {/* Boundary boxes */}
      <Section title="Boundary / Containers">
        <div
          className="draggable-item" 
          draggable 
          onDragStart={(e) => handleDragStart(e, 'group_module', { label: 'New Module Container' })}
          style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: '12px', paddingLeft: '12px', borderLeft: '4px dashed #c084fc' }}
        >
          <LayoutGrid size={16} style={{ color: '#c084fc' }} />
          <span>Module Container</span>
        </div>
      </Section>

      {/* Prebuilt EdTech starter journeys */}
      {boardId && (
        <Section title="Starter Templates · EdTech">
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '0 2px 10px', lineHeight: 1.5 }}>
            Most add a ready-made <strong>User Journey</strong> — then click <strong>AI Build App Lane</strong> to generate the screens. The <strong>full demo</strong> also includes a looping app screen map.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {EDTECH_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => addBuiltinTemplate(tpl)}
                title={`Add: ${tpl.description}`}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px', textAlign: 'left',
                  background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px',
                  padding: '8px 10px', cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-color)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                <Sparkles size={14} style={{ color: 'var(--accent-color)', marginTop: '1px', flexShrink: 0 }} />
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{tpl.name}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{tpl.description}</span>
                </span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Images */}
      <Section title="Images" style={{ marginTop: 'auto' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Paste a screenshot (<strong>{navigator.platform.toLowerCase().includes('mac') ? '⌘V' : 'Ctrl+V'}</strong>)
          or drag image files from your file explorer straight onto the canvas.
        </p>
      </Section>
    </aside>
  );
}
