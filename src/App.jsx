import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import MatrixModal from './components/MatrixModal';
import NodeDetailModal from './components/NodeDetailModal';
import { toPng, toJpeg } from 'html-to-image';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { arrangeBoard } from '../shared/autoArrange';

import {
  Sparkles,
  MonitorPlay,
  MonitorStop,
  Download,
  Layers,
  User,
  FileSpreadsheet,
  Search,
  Tag,
  MessageSquare,
  FileText,
  Monitor,
  Cpu,
  Database,
  Bell,
  ChevronDown,
  Eye,
  EyeOff,
  Undo2,
  Redo2,
  Presentation,
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  const {
    boardId,
    boardName,
    userName,
    viewMode,
    presenterId,
    isPresenter,
    isFollowing,
    isLoading,
    matrixMarkdown,
    nodes,
    edges,
    applyArrangedNodes,
    comments,
    notifications,
    past,
    future,
    undo,
    redo,
    setViewMode,
    presentMode,
    setPresentMode,
    startPresenting,
    stopPresenting,
    setFollowing,
    triggerAIAutoLayout,
    triggerAISummarize,
    markNotificationsRead,
    clearNotifications,
    principal,
    role,
    logout
  } = useStore();

  const { setCenter, getNodes } = useReactFlow();

  // Tidy the board layout using the real measured card sizes (no overlap)
  const handleAutoArrange = () => {
    const measuredById = {};
    getNodes().forEach((n) => {
      const m = n.measured || {};
      if (m.width && m.height) measuredById[n.id] = { width: m.width, height: m.height };
    });
    const measure = (node) => measuredById[node.id] || null;
    const { nodes: arranged } = arrangeBoard({ nodes, edges, measure });
    applyArrangedNodes(arranged);
  };
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const searchContainerRef = useRef(null);
  const exportMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const viewMenuRef = useRef(null);
  const aiMenuRef = useRef(null);

  const VIEW_LABELS = { dual: 'Dual-Layer', user: 'User Journey', app: 'Application Journey' };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Auto-open matrix modal when synthesized
  useEffect(() => {
    if (matrixMarkdown) {
      setIsMatrixOpen(true);
    }
  }, [matrixMarkdown]);

  // Presentation view applies a clean, export-ready theme via a body class
  useEffect(() => {
    document.body.classList.toggle('present-mode', presentMode);
    return () => document.body.classList.remove('present-mode');
  }, [presentMode]);

  // Live countdown for invited (member) sessions; auto sign-out at expiry
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (role !== 'member' || !principal?.exp) return;
    const t = setInterval(() => {
      if (Date.now() >= principal.exp) {
        clearInterval(t);
        logout();
      } else {
        forceTick((n) => n + 1);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [role, principal, logout]);

  const remainingLabel = () => {
    const ms = (principal?.exp || 0) - Date.now();
    if (ms <= 0) return 'expired';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
  };

  // Click outside search listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target)) {
        setShowViewMenu(false);
      }
      if (aiMenuRef.current && !aiMenuRef.current.contains(e.target)) {
        setShowAiMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Run visual search query
  useEffect(() => {
    if (!searchQuery.trim() || !boardId) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results = [];

    // 1. Search Nodes
    nodes.forEach(node => {
      const label = (node.data?.label || '').toLowerCase();
      const tags = (node.data?.tags || []).map(t => t.toLowerCase());
      
      // Match label or tags
      const isLabelMatch = label.includes(query);
      const isTagMatch = tags.some(t => t.includes(query));

      if (isLabelMatch || isTagMatch) {
        results.push({
          type: 'node',
          nodeType: node.type,
          id: node.id,
          label: node.data?.label || `Unnamed ${node.type}`,
          sublabel: isTagMatch ? `Tag match: ${node.data.tags.join(', ')}` : `${node.type.toUpperCase()} block`,
          x: node.position.x,
          y: node.position.y
        });
      }
    });

    // 2. Search Comments
    comments.forEach(c => {
      const content = c.content.toLowerCase();
      if (content.includes(query)) {
        results.push({
          type: 'comment',
          id: c.id,
          label: c.content,
          sublabel: `Posted by: ${c.author}`,
          x: c.position?.x || 0,
          y: c.position?.y || 0,
          nodeId: c.nodeId
        });
      }
    });

    setSearchResults(results);
    setShowSearchDropdown(true);
  }, [searchQuery, nodes, comments, boardId]);

  // Pan and zoom camera to selected matching element
  const handleSearchResultClick = (res) => {
    let targetX = res.x;
    let targetY = res.y;

    // If it's a comment pinned to a node, locate the node's position
    if (res.type === 'comment' && res.nodeId) {
      const parentNode = nodes.find(n => n.id === res.nodeId);
      if (parentNode) {
        targetX = parentNode.position.x;
        targetY = parentNode.position.y;
      }
    }

    setCenter(targetX + 90, targetY + 45, { zoom: 1.4, duration: 800 });
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  const getResultIcon = (res) => {
    if (res.type === 'comment') return <MessageSquare size={12} style={{ color: 'var(--accent-color)' }} />;
    
    switch (res.nodeType) {
      case 'actor': return <User size={12} style={{ color: 'var(--color-actor)' }} />;
      case 'action': return <Search size={12} style={{ color: 'var(--color-action)' }} />;
      case 'ui_element': return <Monitor size={12} style={{ color: 'var(--color-ui)' }} />;
      case 'logic': return <Cpu size={12} style={{ color: 'var(--color-logic)' }} />;
      case 'storage': return <Database size={12} style={{ color: 'var(--color-storage)' }} />;
      case 'notification': return <Bell size={12} style={{ color: 'var(--color-notification)' }} />;
      case 'image_node': return <FileText size={12} style={{ color: '#c084fc' }} />;
      default: return <Tag size={12} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const downloadDataUrl = (dataUrl, ext) => {
    const link = document.createElement('a');
    link.download = `${boardName || 'journey-map'}.${ext}`;
    link.href = dataUrl;
    link.click();
  };

  // scope: 'view' = current viewport only | 'full' = the whole canvas (all nodes)
  // format: 'png' | 'jpeg'
  const handleExport = (scope = 'full', format = 'png') => {
    setShowExportMenu(false);
    const toImage = format === 'jpeg' ? toJpeg : toPng;
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const options = { backgroundColor: '#ffffff', cacheBust: true, quality: 0.95 };

    // Hide editing chrome (handles, resize dots, controls) for a clean exported image
    document.body.classList.add('exporting');
    const done = () => document.body.classList.remove('exporting');

    if (scope === 'view') {
      const element = document.querySelector('.react-flow');
      if (!element) { done(); return; }
      toImage(element, options).then((d) => downloadDataUrl(d, ext)).catch(console.error).finally(done);
      return;
    }

    // Full-canvas export: fit every node into an off-screen render of the viewport pane
    const viewportEl = document.querySelector('.react-flow__viewport');
    if (!viewportEl || nodes.length === 0) { done(); return; }

    const bounds = getNodesBounds(nodes);
    const padding = 0.12;
    const imageWidth = Math.min(4096, Math.max(1024, Math.round(bounds.width * (1 + padding) + 200)));
    const imageHeight = Math.min(4096, Math.max(768, Math.round(bounds.height * (1 + padding) + 200)));
    const t = getViewportForBounds(bounds, imageWidth, imageHeight, 0.3, 2, padding);

    toImage(viewportEl, {
      ...options,
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${t.x}px, ${t.y}px) scale(${t.zoom})`
      }
    })
      .then((d) => downloadDataUrl(d, ext))
      .catch(console.error)
      .finally(done);
  };

  return (
    <div className="app-container">
      {/* Upper Navigation Header */}
      <header className="app-header">
        <div className="brand-section">
          <Layers style={{ color: 'var(--accent-color)' }} />
          <h1 className="brand-logo">JourneyCanvas</h1>
          {boardId && (
            <span title={boardName} style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              background: 'var(--surface-2)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              marginLeft: '8px',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <strong>{boardName}</strong>
            </span>
          )}
        </div>

        {/* Global Visual Search — collapsed to an icon; click to expand */}
        {boardId && (
          <div className="search-container" ref={searchContainerRef} style={{ position: 'relative', flexShrink: 0 }}>
            {searchOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 8px', gap: '6px', width: '230px' }}>
                <Search size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') { setSearchQuery(''); setSearchOpen(false); } }}
                  placeholder="Search text, #tags, comments..."
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '12px', width: '100%', outline: 'none' }}
                />
                <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }} title="Close search" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>
            ) : (
              <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => setSearchOpen(true)} title="Search text, #tags, comments">
                <Search size={14} />
              </button>
            )}

            {/* Dropdown containing filtered search results */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '36px',
                left: 0,
                right: 0,
                background: 'var(--bg-panel-solid)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                maxHeight: '260px',
                overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 999
              }}>
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleSearchResultClick(res)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {getResultIcon(res)}
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {res.label}
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                        {res.sublabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header Actions */}
        <div className="header-actions">
          {/* Account + sign out (always visible) */}
          <div className="account-chip" title={role === 'admin' ? 'Signed in as Admin' : `Invited participant (${principal?.label || userName})`}>
            <span className="account-dot" style={{ background: role === 'admin' ? '#10b981' : '#6366f1' }} />
            <span className="account-name">{principal?.label || userName}</span>
            {role !== 'admin' && <span className="account-role">Guest</span>}
            <button className="account-logout" onClick={logout} title="Sign out">Sign out</button>
          </div>

          {/* View (layer) dropdown */}
          {boardId && (
            <div ref={viewMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setShowViewMenu((v) => !v)}>
                <Layers size={14} /> {VIEW_LABELS[viewMode]} <ChevronDown size={12} />
              </button>
              {showViewMenu && (
                <div className="header-menu">
                  {Object.entries(VIEW_LABELS).map(([k, label]) => (
                    <button
                      key={k}
                      className={`header-menu-item ${viewMode === k ? 'active' : ''}`}
                      onClick={() => { setViewMode(k); setShowViewMenu(false); }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {boardId && (
            <>
              {/* Undo / Redo */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 8px', opacity: past.length ? 1 : 0.4 }}
                  onClick={undo}
                  disabled={!past.length}
                  title="Undo (⌘/Ctrl+Z)"
                >
                  <Undo2 size={14} />
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 8px', opacity: future.length ? 1 : 0.4 }}
                  onClick={redo}
                  disabled={!future.length}
                  title="Redo (⌘/Ctrl+Shift+Z)"
                >
                  <Redo2 size={14} />
                </button>
              </div>

              {/* Presenter Mode Controls (icon-only) */}
              {isPresenter ? (
                <button className="btn btn-secondary" style={{ padding: '6px 10px', borderColor: '#ef4444', color: '#ef4444' }} onClick={stopPresenting} title="Stop presenting">
                  <MonitorStop size={14} />
                </button>
              ) : presenterId ? (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', ...(isFollowing ? { borderColor: 'var(--accent-color)', color: 'var(--accent-color)' } : {}) }}
                  onClick={() => setFollowing(!isFollowing)}
                  title={isFollowing ? 'Following the presenter — click to stop following' : 'Not following — click to follow the presenter again'}
                >
                  {isFollowing ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              ) : (
                <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={startPresenting} title="Present to others (Follow-Me)">
                  <MonitorPlay size={14} />
                </button>
              )}

              {/* Mention Notifications */}
              <div ref={notificationsRef} style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', position: 'relative' }}
                  onClick={() => {
                    setShowNotifications((v) => !v);
                    if (!showNotifications) markNotificationsRead();
                  }}
                  title="Mentions"
                >
                  <Bell size={14} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      background: '#ef4444', color: 'white', fontSize: '9px', fontWeight: 'bold',
                      borderRadius: '10px', minWidth: '16px', height: '16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div style={{
                    position: 'absolute', top: '40px', right: 0, width: '280px',
                    background: 'var(--bg-panel-solid)', border: '1px solid var(--border-color)',
                    borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 999,
                    maxHeight: '320px', overflowY: 'auto'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Mentions</span>
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '10px', cursor: 'pointer' }}>
                          Clear
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '16px', fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        No mentions yet. Others can tag you with <strong>@{userName}</strong> in a comment.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-color)' }}>{n.author}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{n.content}</div>
                          <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{new Date(n.at).toLocaleTimeString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Auto-arrange: tidy the layout (no overlap) — icon only */}
              <button
                className="btn btn-secondary"
                style={{ padding: '6px 10px' }}
                onClick={handleAutoArrange}
                title="Auto-arrange — tidy the layout into clean phase bands (no overlap)"
              >
                <LayoutDashboard size={14} />
              </button>

              {/* Presentation view toggle (clean, export-ready theme) — icon only */}
              <button
                className="btn btn-secondary"
                style={{ padding: '6px 10px', ...(presentMode ? { borderColor: 'var(--accent-color)', color: 'var(--accent-color)' } : {}) }}
                onClick={() => setPresentMode(!presentMode)}
                title={presentMode ? 'Presentation view is ON — click for editing view' : 'Presentation view — clean theme for review & export'}
              >
                <Presentation size={14} />
              </button>

              {/* High-Res Image Export — icon only */}
              <div ref={exportMenuRef} style={{ position: 'relative' }}>
                <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => setShowExportMenu((v) => !v)} title="Export image (PNG / JPG)">
                  <Download size={14} /> <ChevronDown size={12} />
                </button>
                {showExportMenu && (
                  <div style={{
                    position: 'absolute', top: '40px', right: 0, width: '220px',
                    background: 'var(--bg-panel-solid)', border: '1px solid var(--border-color)',
                    borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 999, padding: '4px'
                  }}>
                    {[
                      { label: 'Full canvas — PNG', scope: 'full', format: 'png' },
                      { label: 'Full canvas — JPG', scope: 'full', format: 'jpeg' },
                      { label: 'Current view — PNG', scope: 'view', format: 'png' },
                      { label: 'Current view — JPG', scope: 'view', format: 'jpeg' }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleExport(opt.scope, opt.format)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', background: 'transparent',
                          border: 'none', color: 'var(--text-primary)', fontSize: '12px', padding: '8px 10px',
                          borderRadius: '6px', cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* AI dropdown */}
              <div ref={aiMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  className="btn"
                  style={{ padding: '6px 14px', gap: '6px', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                  onClick={() => setShowAiMenu((v) => !v)}
                  disabled={isLoading}
                >
                  <Sparkles size={14} /> {isLoading ? 'Working…' : 'AI'} <ChevronDown size={12} />
                </button>
                {showAiMenu && (
                  <div className="header-menu" style={{ width: '220px', right: 0, left: 'auto' }}>
                    <button
                      className="header-menu-item"
                      onClick={() => { setShowAiMenu(false); triggerAIAutoLayout(); }}
                      disabled={isLoading}
                    >
                      <span style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>✨ Build App Lane</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Generate the application journey from the user journey</span>
                      </span>
                    </button>
                    <button
                      className="header-menu-item"
                      onClick={() => { setShowAiMenu(false); triggerAISummarize(); }}
                      disabled={isLoading}
                    >
                      <span style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>✨ AI Orchestrator</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Clean up the layout & build the architecture matrix</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {matrixMarkdown && (
                <button 
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', color: '#10b881', borderColor: 'rgba(16, 184, 129, 0.4)' }}
                  onClick={() => setIsMatrixOpen(true)}
                >
                  <FileSpreadsheet size={14} /> Matrix
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Invited-session expiry banner */}
      {role === 'member' && principal?.exp && (
        <div className="expiry-banner">
          ⏱️ Your invite access expires in <strong>{remainingLabel()}</strong>. Save your work — you'll be signed out automatically.
        </div>
      )}

      {/* Main Split workspace */}
      <main className="main-workspace">
        <Sidebar />
        
        {boardId ? (
          <Canvas />
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: 'var(--text-secondary)'
          }}>
            <Layers size={48} style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ color: 'var(--text-primary)' }}>Welcome to JourneyCanvas</h2>
            <p style={{ fontSize: '14px' }}>Please select an existing board or create a new board in the sidebar to begin.</p>
          </div>
        )}
      </main>

      {/* Synthesis Matrix Modal output */}
      <MatrixModal isOpen={isMatrixOpen} onClose={() => setIsMatrixOpen(false)} />

      {/* Focused element editor overlay */}
      <NodeDetailModal />
    </div>
  );
}
