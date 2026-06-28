import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge, reconnectEdge } from '@xyflow/react';
import { io } from 'socket.io-client';

const BACKEND_URL = window.location.origin;

// Debounced persistence so rapid edits (e.g. dragging a node) collapse into one save
let __saveTimer = null;
const scheduleSave = (get) => {
  if (__saveTimer) clearTimeout(__saveTimer);
  __saveTimer = setTimeout(() => {
    __saveTimer = null;
    get().saveBoard();
  }, 500);
};

// Resolve a node's absolute canvas position, accounting for an optional parent group
const getAbsolutePosition = (node, nodes) => {
  if (!node) return { x: 0, y: 0 };
  if (node.parentId) {
    const parent = nodes.find((n) => n.id === node.parentId);
    if (parent) {
      return { x: parent.position.x + node.position.x, y: parent.position.y + node.position.y };
    }
  }
  return { x: node.position.x, y: node.position.y };
};

// Parse "@username" mentions out of free text
const parseMentions = (text) =>
  (text.match(/@([\w][\w.-]*)/g) || []).map((m) => m.slice(1));


// Undo/redo history
const HISTORY_LIMIT = 50;
let lastHistoryAt = 0;

export const useStore = create((set, get) => ({
  boardId: null,
  boardName: '',
  userName: 'User_' + Math.round(Math.random() * 1000),
  nodes: [],
  edges: [],
  comments: [],
  cursors: {},
  viewMode: 'user', // 'user' | 'app' | 'dual'  (default to the User Journey)
  socket: null,
  isPresenter: false,
  presenterId: null,
  isFollowing: true, // whether this client mirrors the presenter's view
  matrixMarkdown: '',
  boardsList: [],
  isLoading: false,
  notifications: [],
  past: [],
  future: [],
  expandedNodeId: null,
  presentMode: false,

  // Auth + workspace
  authToken: null,
  role: null,          // 'admin' | 'member'
  principal: null,     // { label, role, scope, targetId, exp }
  workspaces: [],
  currentWorkspaceId: null,

  // Copy/Paste state (for cloning selected elements within a board)
  copiedElements: null,

  setUserName: (userName) => set({ userName }),
  setViewMode: (viewMode) => set({ viewMode }),
  setExpandedNodeId: (expandedNodeId) => {
    set({ expandedNodeId });
    // While presenting, mirror the opened/closed overlay to followers
    const { socket, boardId, isPresenter } = get();
    if (isPresenter && socket) socket.emit('presenter-expand', { boardId, nodeId: expandedNodeId });
  },
  setPresentMode: (presentMode) => set({ presentMode }),

  // --- Auth ---------------------------------------------------------------
  // fetch wrapper that injects the bearer token and logs out on 401
  authFetch: async (url, options = {}) => {
    const token = get().authToken;
    const headers = { ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) get().logout();
    return res;
  },

  applySession: (data) => {
    const principal = {
      label: data.label,
      role: data.role,
      scope: data.scope || null,
      targetId: data.targetId || null,
      exp: data.exp || null
    };
    try { localStorage.setItem('jc_auth', JSON.stringify({ token: data.token, ...principal })); } catch (_) {}
    set({ authToken: data.token, role: data.role, principal, userName: data.label });
  },

  login: async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'Login failed');
    }
    get().applySession(await res.json());
  },

  logout: () => {
    const s = get().socket;
    if (s) s.disconnect();
    try { localStorage.removeItem('jc_auth'); } catch (_) {}
    set({
      authToken: null, role: null, principal: null, socket: null,
      boardId: null, boardName: '', nodes: [], edges: [], comments: [],
      workspaces: [], currentWorkspaceId: null, boardsList: []
    });
  },

  // Restore a saved session on boot; verify it server-side
  loadSession: async () => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('jc_auth') || 'null'); } catch (_) {}
    if (!saved?.token) return false;
    set({
      authToken: saved.token,
      role: saved.role,
      principal: { label: saved.label, role: saved.role, scope: saved.scope || null, targetId: saved.targetId || null, exp: saved.exp || null },
      userName: saved.label
    });
    const res = await get().authFetch('/api/auth/me');
    if (!res.ok) { get().logout(); return false; }
    return true;
  },

  // --- Invites ------------------------------------------------------------
  validateInvite: async (token) => {
    const res = await fetch(`/api/invites/${token}`);
    return res.json().catch(() => ({ valid: false, reason: 'notfound' }));
  },

  acceptInvite: async (token, label) => {
    const res = await fetch(`/api/invites/${token}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'Could not join');
    }
    get().applySession(await res.json());
  },

  createInvite: async (scope, targetId) => {
    const res = await get().authFetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope, targetId })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'Could not create invite');
    }
    const data = await res.json();
    return `${window.location.origin}/?invite=${data.token}`;
  },

  // --- Workspaces ---------------------------------------------------------
  fetchWorkspaces: async () => {
    const res = await get().authFetch('/api/workspaces');
    const data = await res.json().catch(() => []);
    const list = Array.isArray(data) ? data : [];
    set({ workspaces: list });
    let cur = get().currentWorkspaceId;
    if (!cur || !list.some((w) => w.id === cur)) {
      cur = list[0]?.id || null;
      set({ currentWorkspaceId: cur });
    }
    if (cur) get().joinWorkspaceRoom(cur);
    return list;
  },

  createWorkspace: async (name) => {
    const id = 'ws-' + Date.now();
    const res = await get().authFetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name })
    });
    if (res.ok) {
      await get().fetchWorkspaces();
      set({ currentWorkspaceId: id });
      await get().fetchBoardsList();
    }
  },

  deleteWorkspace: async (id) => {
    const res = await get().authFetch(`/api/workspaces/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (get().currentWorkspaceId === id) set({ currentWorkspaceId: null });
      await get().fetchWorkspaces();
      await get().fetchBoardsList();
    }
  },

  setCurrentWorkspace: async (id) => {
    set({ currentWorkspaceId: id });
    get().joinWorkspaceRoom(id);
    await get().fetchBoardsList();
  },

  // --- Boards -------------------------------------------------------------
  createBoard: async (name) => {
    const id = 'board-' + Date.now();
    const workspaceId = get().currentWorkspaceId;
    const res = await get().authFetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, workspaceId })
    });
    if (res.ok) {
      await get().fetchBoardsList();
      get().loadBoard(id);
    }
    return res.ok;
  },

  deleteBoard: async (id) => {
    const { socket, boardId, isPresenter } = get();
    if (isPresenter && socket && boardId === id) socket.emit('stop-presentation', { boardId: id });
    const res = await get().authFetch(`/api/boards/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (boardId === id) {
        set({ boardId: null, boardName: '', nodes: [], edges: [], comments: [], cursors: {}, isPresenter: false, presenterId: null, isFollowing: true });
      }
      await get().fetchBoardsList();
    }
    return res.ok;
  },

  // Fetch boards in the current workspace
  fetchBoardsList: async () => {
    try {
      const ws = get().currentWorkspaceId;
      const url = ws ? `/api/boards?workspaceId=${encodeURIComponent(ws)}` : '/api/boards';
      const res = await get().authFetch(url);
      const data = await res.json();
      set({ boardsList: Array.isArray(data) ? data : [] });
    } catch (err) {
      console.error('Error fetching boards:', err);
    }
  },

  // One persistent socket per session — reused for both workspace and board rooms,
  // so board-list updates arrive even before a board is opened.
  ensureSocket: () => {
    let socket = get().socket;
    if (socket) return socket;

    socket = io(BACKEND_URL, { auth: { token: get().authToken } });

    socket.on('join-denied', ({ boardId } = {}) => {
      console.warn('Join denied for board', boardId);
    });

    // A board was created/removed in a workspace → refresh the list if we're in it
    socket.on('workspace-boards-changed', ({ workspaceId }) => {
      if (workspaceId && workspaceId === get().currentWorkspaceId) get().fetchBoardsList();
    });

    // The board currently open was deleted → leave it cleanly (reset presenter state)
    socket.on('board-deleted', ({ boardId }) => {
      if (get().boardId === boardId) {
        set({
          boardId: null, boardName: '', nodes: [], edges: [], comments: [],
          cursors: {}, isPresenter: false, presenterId: null, isFollowing: true
        });
      }
    });

    socket.on('nodes-synced', ({ nodes }) => {
      const currentNodes = get().nodes;
      const editingId = get().expandedNodeId; // node open in this client's overlay
      const mergedNodes = currentNodes.map(cn => {
        const updated = nodes.find(n => n.id === cn.id);
        if (updated) {
          // Don't let a remote sync clobber the node you're actively editing in the overlay —
          // but followers viewing the presenter's shared overlay SHOULD see live edits.
          if (cn.id === editingId && !get().isFollowing) {
            return { ...cn, position: updated.position, width: updated.width, height: updated.height };
          }
          return {
            ...cn,
            position: updated.position,
            data: { ...cn.data, ...updated.data },
            width: updated.width,
            height: updated.height
          };
        }
        return cn;
      });

      nodes.forEach(n => {
        if (!mergedNodes.some(cn => cn.id === n.id)) {
          mergedNodes.push(n);
        }
      });

      const filteredNodes = mergedNodes.filter(cn => nodes.some(n => n.id === cn.id));
      set({ nodes: filteredNodes });
    });

    socket.on('edges-synced', ({ edges }) => {
      set({ edges });
    });

    socket.on('cursor-synced', ({ socketId, userName, x, y }) => {
      set((state) => ({
        cursors: {
          ...state.cursors,
          [socketId]: { userName, x, y }
        }
      }));
    });

    socket.on('user-left', ({ socketId }) => {
      set((state) => {
        const newCursors = { ...state.cursors };
        delete newCursors[socketId];
        return { cursors: newCursors };
      });
    });

    socket.on('comments-refreshed', () => {
      get().fetchComments();
    });

    socket.on('presenter-state', ({ presenterId }) => {
      const amPresenter = presenterId === socket.id;
      // When a presenter starts, viewers follow by default; reset when presentation ends.
      set({ presenterId, isPresenter: amPresenter, isFollowing: !!presenterId && !amPresenter });
    });

    // Follower mirrors the presenter's open/closed element overlay
    socket.on('presenter-expand', ({ nodeId }) => {
      if (get().isFollowing) set({ expandedNodeId: nodeId });
    });

    socket.on('mention-alert', ({ mentions, author, content }) => {
      if (Array.isArray(mentions) && mentions.includes(get().userName)) {
        set((state) => ({
          notifications: [
            { id: 'notif-' + Date.now(), author, content, read: false, at: new Date().toISOString() },
            ...state.notifications
          ]
        }));
      }
    });

    set({ socket });
    return socket;
  },

  // Join a board's realtime room (reuses the persistent socket)
  joinBoardRoom: (boardId) => {
    const socket = get().ensureSocket();
    socket.emit('join-board', { boardId, userName: get().userName });
  },

  // Join a workspace room so board-list changes broadcast here
  joinWorkspaceRoom: (workspaceId) => {
    if (!workspaceId) return;
    const socket = get().ensureSocket();
    socket.emit('join-workspace', { workspaceId });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, presenterId: null, isPresenter: false, cursors: {} });
    }
  },

  // Load board data
  loadBoard: async (boardId) => {
    // If we were presenting another board, stop it before leaving
    const prev = get();
    if (prev.isPresenter && prev.socket && prev.boardId && prev.boardId !== boardId) {
      prev.socket.emit('stop-presentation', { boardId: prev.boardId });
    }
    set({ isLoading: true });
    try {
      const res = await get().authFetch(`/api/boards/${boardId}`);
      const data = await res.json();
      if (res.ok) {
        set({
          boardId: data.id,
          boardName: data.name,
          nodes: data.nodes || [],
          edges: data.edges || [],
          comments: data.comments || [],
          matrixMarkdown: '',
          past: [],
          future: [],
          cursors: {},
          // presenter state is per-board — reset it when entering a board
          isPresenter: false,
          presenterId: null,
          isFollowing: true
        });
        get().joinBoardRoom(boardId);
      }
    } catch (err) {
      console.error('Error loading board:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Save/Sync board layout
  saveBoard: async () => {
    const { boardId, nodes, edges } = get();
    if (!boardId) return;
    try {
      await get().authFetch(`/api/boards/${boardId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      });
    } catch (err) {
      console.error('Error saving board:', err);
    }
  },

  // XYFlow handlers
  onNodesChange: (changes) => {
    // History: snapshot before removals (e.g. Backspace) and before a resize burst
    if (changes.some((c) => c.type === 'remove')) get().pushHistory();
    else if (changes.some((c) => c.type === 'dimensions' && c.resizing)) get().pushHistoryCoalesced();

    set((state) => {
      const updatedNodes = applyNodeChanges(changes, state.nodes);
      if (state.socket) {
        state.socket.emit('nodes-update', { boardId: state.boardId, nodes: updatedNodes });
      }
      return { nodes: updatedNodes };
    });
    // Persist meaningful changes (drag-end, resize, add/remove) — not transient drag frames or pure selection
    const shouldPersist = changes.some(
      (c) =>
        (c.type === 'position' && c.dragging === false) ||
        c.type === 'dimensions' ||
        c.type === 'remove' ||
        c.type === 'add'
    );
    if (shouldPersist) scheduleSave(get);
  },

  onEdgesChange: (changes) => {
    if (changes.some((c) => c.type === 'remove')) get().pushHistory();
    set((state) => {
      const updatedEdges = applyEdgeChanges(changes, state.edges);
      if (state.socket) {
        state.socket.emit('edges-update', { boardId: state.boardId, edges: updatedEdges });
      }
      return { edges: updatedEdges };
    });
    if (changes.some((c) => c.type === 'remove' || c.type === 'add')) scheduleSave(get);
  },

  // Flag a decision-output edge as Yes (true) / No (false) / unset (null)
  setEdgeBranch: (edgeId, branch) => {
    get().pushHistory();
    set((state) => {
      const updatedEdges = state.edges.map((e) =>
        e.id === edgeId ? { ...e, type: 'flag', data: { ...(e.data || {}), branch } } : e
      );
      if (state.socket) {
        state.socket.emit('edges-update', { boardId: state.boardId, edges: updatedEdges });
      }
      return { edges: updatedEdges };
    });
    scheduleSave(get);
  },

  // Drag an arrow's endpoint onto a different node/handle to re-route it
  onReconnect: (oldEdge, newConnection) => {
    get().pushHistory();
    set((state) => {
      const updatedEdges = reconnectEdge(oldEdge, newConnection, state.edges);
      if (state.socket) {
        state.socket.emit('edges-update', { boardId: state.boardId, edges: updatedEdges });
      }
      return { edges: updatedEdges };
    });
    scheduleSave(get);
  },

  onConnect: (connection) => {
    get().pushHistory();
    // Edges drawn OUT of a Decision become flaggable (Yes/No) — start unflagged
    const srcNode = get().nodes.find((n) => n.id === connection.source);
    const edge = srcNode?.type === 'decision'
      ? { ...connection, type: 'flag', data: { branch: null } }
      : { ...connection };
    set((state) => {
      const updatedEdges = addEdge(edge, state.edges);
      if (state.socket) {
        state.socket.emit('edges-update', { boardId: state.boardId, edges: updatedEdges });
      }
      return { edges: updatedEdges };
    });
    scheduleSave(get);
  },

  // ---- Undo / Redo history ----
  // Snapshot current nodes+edges so the next mutation can be reverted.
  pushHistory: () => {
    lastHistoryAt = Date.now();
    set((s) => ({
      past: [...s.past, { nodes: s.nodes, edges: s.edges }].slice(-HISTORY_LIMIT),
      future: []
    }));
  },

  // Like pushHistory but collapses rapid bursts (typing, resizing) into one entry.
  pushHistoryCoalesced: () => {
    const now = Date.now();
    if (now - lastHistoryAt < 700) {
      lastHistoryAt = now;
      return;
    }
    get().pushHistory();
  },

  undo: () => {
    const { past, future, nodes, edges, socket, boardId } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...future].slice(0, HISTORY_LIMIT)
    });
    if (socket) {
      socket.emit('nodes-update', { boardId, nodes: prev.nodes });
      socket.emit('edges-update', { boardId, edges: prev.edges });
    }
    scheduleSave(get);
  },

  redo: () => {
    const { past, future, nodes, edges, socket, boardId } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, { nodes, edges }].slice(-HISTORY_LIMIT),
      future: future.slice(1)
    });
    if (socket) {
      socket.emit('nodes-update', { boardId, nodes: next.nodes });
      socket.emit('edges-update', { boardId, edges: next.edges });
    }
    scheduleSave(get);
  },

  // Add individual Node
  addNode: (node) => {
    get().pushHistory();
    set((state) => {
      const updatedNodes = [...state.nodes, node];
      if (state.socket) {
        state.socket.emit('nodes-update', { boardId: state.boardId, nodes: updatedNodes });
      }
      scheduleSave(get);
      return { nodes: updatedNodes };
    });
  },

  // Update node data
  updateNodeData: (nodeId, dataUpdate) => {
    get().pushHistoryCoalesced();
    set((state) => {
      const updatedNodes = state.nodes.map(n => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, ...dataUpdate } };
        }
        return n;
      });
      if (state.socket) {
        state.socket.emit('nodes-update', { boardId: state.boardId, nodes: updatedNodes });
      }
      scheduleSave(get);
      return { nodes: updatedNodes };
    });
  },

  // Delete node
  deleteNode: (nodeId) => {
    get().pushHistory();
    set((state) => {
      const updatedNodes = state.nodes.filter(n => n.id !== nodeId);
      const updatedEdges = state.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
      if (state.socket) {
        state.socket.emit('nodes-update', { boardId: state.boardId, nodes: updatedNodes });
        state.socket.emit('edges-update', { boardId: state.boardId, edges: updatedEdges });
      }
      scheduleSave(get);
      return { nodes: updatedNodes, edges: updatedEdges };
    });
  },

  // Multi-Dimensional Tagging Actions
  addNodeTag: (nodeId, tag) => {
    if (!tag.trim()) return;
    const formattedTag = tag.trim().startsWith('#') ? tag.trim().toLowerCase() : `#${tag.trim().toLowerCase()}`;
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;
    const currentTags = node.data?.tags || [];
    if (currentTags.includes(formattedTag)) return; // Avoid duplicates

    get().updateNodeData(nodeId, { tags: [...currentTags, formattedTag] });
  },

  removeNodeTag: (nodeId, tag) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;
    const currentTags = node.data?.tags || [];
    get().updateNodeData(nodeId, { tags: currentTags.filter(t => t !== tag) });
  },

  // Cross-layer Module nesting: after a drag, attach/detach a node to a Module container
  // whose bounds contain the node's center. Positions are converted to/from parent-relative
  // so that moving the Module moves all its members together.
  updateNodeGroupMembership: (nodeId) => {
    const { nodes } = get();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.type === 'group_module') return;

    const abs = getAbsolutePosition(node, nodes);
    const w = node.measured?.width || node.width || 190;
    const h = node.measured?.height || node.height || 90;
    const center = { x: abs.x + w / 2, y: abs.y + h / 2 };

    const containing = nodes.find((m) => {
      if (m.type !== 'group_module') return false;
      const mw = m.measured?.width || m.width || 350;
      const mh = m.measured?.height || m.height || 450;
      return (
        center.x >= m.position.x &&
        center.x <= m.position.x + mw &&
        center.y >= m.position.y &&
        center.y <= m.position.y + mh
      );
    });

    const newParentId = containing ? containing.id : undefined;
    if ((node.parentId || undefined) === newParentId) return;

    set((state) => {
      const updatedNodes = state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const absPos = getAbsolutePosition(n, state.nodes);
        const next = { ...n };
        if (containing) {
          next.parentId = containing.id;
          next.position = { x: absPos.x - containing.position.x, y: absPos.y - containing.position.y };
        } else {
          delete next.parentId;
          next.position = absPos;
        }
        return next;
      });
      if (state.socket) {
        state.socket.emit('nodes-update', { boardId: state.boardId, nodes: updatedNodes });
      }
      return { nodes: updatedNodes };
    });
    scheduleSave(get);
  },

  // Copy/Paste Cloning Logic (Preserves linkages)
  copySelectedElements: () => {
    const selectedNodes = get().nodes.filter(n => n.selected);
    const selectedEdges = get().edges.filter(e => e.selected);
    if (selectedNodes.length === 0) return;
    set({ copiedElements: { nodes: selectedNodes, edges: selectedEdges } });
  },

  pasteCopiedElements: () => {
    const { copiedElements, boardId, socket } = get();
    if (!copiedElements || !boardId) return;
    get().pushHistory();

    const idMap = {};
    const timestamp = Date.now();

    // 1. Map new IDs and generate duplicate nodes with coordinate shifts
    const newNodes = copiedElements.nodes.map((node, index) => {
      const newId = `node-clone-${timestamp}-${index}`;
      idMap[node.id] = newId;

      return {
        ...node,
        id: newId,
        selected: false,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50
        },
        data: {
          ...node.data,
          tags: node.data.tags ? [...node.data.tags, '#cloned'] : ['#cloned']
        }
      };
    });

    // 2. Adjust linked user nodes inside duplicates to point to copied counterparts
    const updatedNewNodes = newNodes.map(node => {
      const oldParentId = node.data.linkedUserNodeId;
      const newParentId = oldParentId && idMap[oldParentId] ? idMap[oldParentId] : oldParentId;
      return {
        ...node,
        data: {
          ...node.data,
          linkedUserNodeId: newParentId
        }
      };
    });

    // 3. Duplicate edges and map to new node IDs
    const newEdges = copiedElements.edges.map((edge, index) => {
      const newId = `edge-clone-${timestamp}-${index}`;
      return {
        ...edge,
        id: newId,
        source: idMap[edge.source] || edge.source,
        target: idMap[edge.target] || edge.target
      };
    });

    // 4. Update local state & sync
    set(state => {
      const mergedNodes = [...state.nodes, ...updatedNewNodes];
      const mergedEdges = [...state.edges, ...newEdges];
      if (socket) {
        socket.emit('nodes-update', { boardId, nodes: mergedNodes });
        socket.emit('edges-update', { boardId, edges: mergedEdges });
      }
      return { nodes: mergedNodes, edges: mergedEdges };
    });

    setTimeout(() => get().saveBoard(), 200);
  },

  // Apply a tidied layout (positions + band sizes) as a single undoable step
  applyArrangedNodes: (arranged) => {
    if (!Array.isArray(arranged) || arranged.length === 0) return;
    const byId = Object.fromEntries(arranged.map((n) => [n.id, n]));
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.map((n) => {
        const a = byId[n.id];
        if (!a) return n;
        return {
          ...n,
          position: a.position || n.position,
          ...(a.width != null ? { width: a.width } : {}),
          ...(a.height != null ? { height: a.height } : {})
        };
      })
    }));
    const { socket, boardId } = get();
    if (socket && boardId) socket.emit('nodes-update', { boardId, nodes: get().nodes });
    scheduleSave(get);
  },

  // Duplicate an existing board (deep copy with fresh ids) under a new name
  duplicateBoard: async (sourceId, name) => {
    if (!sourceId || !name) return;
    try {
      const res = await get().authFetch(`/api/boards/${sourceId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        await get().fetchBoardsList();
        get().loadBoard(data.id);
      }
    } catch (err) {
      console.error('Error duplicating board:', err);
    }
  },

  // Add a prebuilt EdTech starter journey, remapping ids so it's independent
  addBuiltinTemplate: (template) => {
    const { boardId, socket, nodes } = get();
    if (!boardId || !template) return;
    get().pushHistory();

    const idMap = {};
    const ts = Date.now();
    // stagger so repeated adds don't land exactly on top of each other
    const offset = { x: 40 + (nodes.length % 6) * 16, y: 40 };

    const newNodes = template.nodes.map((node, i) => {
      const newId = `tpl-${ts}-${i}`;
      idMap[node.id] = newId;
      return {
        ...node,
        id: newId,
        selected: false,
        position: { x: node.position.x + offset.x, y: node.position.y + offset.y },
        data: { ...node.data }
      };
    });

    // Remap intra-template links (parent groups + app→user linkage)
    const remapped = newNodes.map((node) => ({
      ...node,
      ...(node.parentId ? { parentId: idMap[node.parentId] || node.parentId } : {}),
      data: {
        ...node.data,
        ...(node.data.linkedUserNodeId
          ? { linkedUserNodeId: idMap[node.data.linkedUserNodeId] || node.data.linkedUserNodeId }
          : {})
      }
    }));

    const newEdges = (template.edges || []).map((e, i) => ({
      ...e,
      id: `tpledge-${ts}-${i}`,
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target
    }));

    set((state) => {
      const mergedNodes = [...state.nodes, ...remapped];
      const mergedEdges = [...state.edges, ...newEdges];
      if (socket) {
        socket.emit('nodes-update', { boardId, nodes: mergedNodes });
        socket.emit('edges-update', { boardId, edges: mergedEdges });
      }
      return { nodes: mergedNodes, edges: mergedEdges };
    });

    scheduleSave(get);
  },

  // Comments
  fetchComments: async () => {
    const { boardId } = get();
    if (!boardId) return;
    try {
      const res = await get().authFetch(`/api/boards/${boardId}`);
      const data = await res.json();
      set({ comments: data.comments || [] });
    } catch (err) {
      console.error(err);
    }
  },

  addComment: async (nodeId, content, x, y) => {
    const { boardId, userName, socket } = get();
    if (!boardId) return;

    const commentId = 'comment-' + Date.now();
    try {
      const res = await get().authFetch(`/api/boards/${boardId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, nodeId, author: userName, content, x, y })
      });
      if (res.ok) {
        get().fetchComments();
        if (socket) {
          socket.emit('comment-change', { boardId });
          const mentions = parseMentions(content);
          if (mentions.length > 0) {
            socket.emit('mention-alert', { boardId, mentions, author: userName, content });
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  },

  markNotificationsRead: () =>
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),

  clearNotifications: () => set({ notifications: [] }),

  deleteComment: async (commentId) => {
    const { boardId, socket } = get();
    if (!boardId) return;
    try {
      const res = await get().authFetch(`/api/boards/${boardId}/comments/${commentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        get().fetchComments();
        if (socket) {
          socket.emit('comment-change', { boardId });
        }
      }
    } catch (err) {
      console.error(err);
    }
  },

  // Paste/drop an image directly onto the canvas at a given flow position (no forced OCR)
  addImageAtPosition: async (file, position) => {
    const { boardId } = get();
    if (!boardId || !file) return;
    set({ isLoading: true });
    try {
      const formData = new FormData();
      formData.append('image', file, file.name || `pasted-${Date.now()}.png`);

      const uploadRes = await get().authFetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      const imageNode = {
        id: 'node-img-' + Date.now(),
        type: 'image_node',
        position: position || { x: 200, y: 200 },
        width: 280,
        height: 240,
        data: {
          url: uploadData.url,
          label: file.name || 'Pasted image',
          tags: ['#image', '#pasted']
        }
      };
      get().addNode(imageNode);
    } catch (err) {
      console.error('Error adding pasted image:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // AI Auto-layout
  triggerAIAutoLayout: async () => {
    set({ isLoading: true });
    try {
      const { nodes, edges, boardId } = get();

      const userNodes = nodes.filter(n => n.type === 'actor' || n.type === 'action');
      if (userNodes.length === 0) {
        alert('Please create some User Journey (Actor or Action) nodes first!');
        set({ isLoading: false });
        return;
      }
      const userIds = new Set(userNodes.map(n => n.id));
      const userEdges = edges.filter(e => userIds.has(e.source) && userIds.has(e.target));

      const res = await get().authFetch('/api/ai/auto-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNodes, userEdges })
      });
      const data = await res.json();
      
      if (data && Array.isArray(data.nodes)) {
        // The app journey MIRRORS the user journey: one screen per action, connected in the
        // exact same order as the user-journey edges. The AI only names the screens & fills
        // their chips — the app decides the structure, so it can't merge or mis-wire steps.
        const existing = get().nodes;
        const heightOf = (n) => n.measured?.height || n.height || (n.type === 'persona' ? 320 : 240);
        const anchors = existing.filter(n => ['persona', 'actor', 'action', 'stage', 'group_module'].includes(n.type));
        const userContentNodes = existing.filter(n => ['persona', 'actor', 'action'].includes(n.type));
        const originX = anchors.length ? Math.min(...anchors.map(n => n.position.x)) : 80;
        const laneY = (userContentNodes.length ? Math.max(...userContentNodes.map(n => n.position.y + heightOf(n))) : 400) + 160;
        const GAP = 360;

        // one screen per user action (use the AI's screen if it returned one, else synthesize)
        const aiByAction = {};
        data.nodes.filter(s => s.type === 'ui_element' && s.linkedUserNodeId).forEach(s => { aiByAction[s.linkedUserNodeId] = s; });
        const screenIdOf = {};
        const screenData = {};
        userNodes.filter(n => n.type === 'action').forEach(act => {
          const ai = aiByAction[act.id];
          const sid = `screen-${act.id}`;
          screenIdOf[act.id] = sid;
          const actLabel = act.data?.label || 'Step';
          screenData[sid] = {
            label: ai?.label || `${actLabel} screen`,
            actorContext: ai?.actorContext || '',
            logic: Array.isArray(ai?.logic) ? ai.logic : [],
            storage: Array.isArray(ai?.storage) ? ai.storage : [],
            notifications: Array.isArray(ai?.notifications) ? ai.notifications : []
          };
        });

        // order actions by following the user-journey edges (fallback: left-to-right by x)
        const actionList = userNodes.filter(n => n.type === 'action');
        const adj = {};
        const indeg = {};
        actionList.forEach(a => { adj[a.id] = []; indeg[a.id] = 0; });
        userEdges.forEach(e => { if (adj[e.source] && indeg[e.target] != null) { adj[e.source].push(e.target); indeg[e.target]++; } });
        const order = [];
        const seen = new Set();
        const starts = actionList.filter(a => indeg[a.id] === 0).map(a => a.id);
        const queue = starts.length ? [...starts] : actionList.slice().sort((x, y) => x.position.x - y.position.x).map(a => a.id);
        while (queue.length) {
          const id = queue.shift();
          if (seen.has(id)) continue;
          seen.add(id);
          order.push(id);
          (adj[id] || []).forEach(t => { if (!seen.has(t)) queue.push(t); });
        }
        actionList.filter(a => !seen.has(a.id)).sort((x, y) => x.position.x - y.position.x).forEach(a => order.push(a.id));

        // place screens left-to-right in journey order
        const pos = {};
        const orderIndex = {};
        order.forEach((aid, i) => { orderIndex[aid] = i; pos[screenIdOf[aid]] = { x: originX + i * GAP, y: laneY }; });

        // build action pills + edges from the user-journey edges
        const pillNodes = [];
        const newEdges = [];
        userEdges.forEach((e, i) => {
          const sId = screenIdOf[e.source];
          const tId = screenIdOf[e.target];
          if (!sId || !tId) return;
          const sPos = pos[sId];
          const tPos = pos[tId];
          const loop = (orderIndex[e.target] ?? 0) <= (orderIndex[e.source] ?? 0);
          const pillId = `pill-${e.source}-${e.target}-${i}`;
          const px = (sPos.x + tPos.x) / 2 + 20;
          const py = laneY + (loop ? 250 : 80);
          pos[pillId] = { x: px, y: py };
          const tgtAction = actionList.find(a => a.id === e.target);
          pillNodes.push({ id: pillId, label: e.label || tgtAction?.data?.label || 'next' });
          const h = (a, b) => (Math.abs(b.x - a.x) >= Math.abs(b.y - a.y) ? (b.x >= a.x ? ['r', 'l'] : ['l', 'r']) : (b.y >= a.y ? ['b', 't'] : ['t', 'b']));
          const [sh1, th1] = h(sPos, { x: px, y: py });
          const [sh2, th2] = h({ x: px, y: py }, tPos);
          newEdges.push({ id: `e1-${pillId}`, source: sId, target: pillId, sourceHandle: sh1, targetHandle: th1 });
          newEdges.push({ id: `e2-${pillId}`, source: pillId, target: tId, sourceHandle: sh2, targetHandle: th2 });
        });

        // add screen nodes
        Object.entries(screenIdOf).forEach(([actId, sid]) => {
          get().addNode({
            id: sid,
            type: 'ui_element',
            position: pos[sid] || { x: originX, y: laneY },
            data: { ...screenData[sid], linkedUserNodeId: actId, tags: ['#ai_generated'] }
          });
        });
        // add pill nodes
        pillNodes.forEach(p => {
          get().addNode({ id: p.id, type: 'transition', position: pos[p.id], data: { label: p.label, tags: ['#ai_generated'] } });
        });
        // add edges
        newEdges.forEach(ne => { set(state => ({ edges: [...state.edges, ne] })); });

        // grow stage containers to wrap the new app lane
        const appBottom = Math.max(laneY, ...Object.values(pos).map(p => p.y)) + 260;
        set(state => {
          const updated = state.nodes.map(n => {
            if (n.type === 'stage') {
              const needed = appBottom + 60 - n.position.y;
              return needed > (n.height || 0) ? { ...n, height: needed } : n;
            }
            return n;
          });
          if (state.socket) state.socket.emit('nodes-update', { boardId: state.boardId, nodes: updated });
          return { nodes: updated };
        });

        get().saveBoard();
      }
    } catch (err) {
      console.error('Error triggering AI layout:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // AI Summary/Matrix
  triggerAISummarize: async () => {
    set({ isLoading: true });
    try {
      const { nodes, edges } = get();
      const res = await get().authFetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      });
      const data = await res.json();

      if (data) {
        if (Array.isArray(data.cleanedNodes)) {
          set(state => {
            const updatedNodes = state.nodes.map(n => {
              const cleaned = data.cleanedNodes.find(cn => cn.id === n.id);
              if (cleaned) {
                return { ...n, position: { x: cleaned.x, y: cleaned.y } };
              }
              return n;
            });
            if (state.socket) {
              state.socket.emit('nodes-update', { boardId: state.boardId, nodes: updatedNodes });
            }
            return { nodes: updatedNodes };
          });
        }

        set({ matrixMarkdown: data.matrixMarkdown || '' });
        get().saveBoard();
      }
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Presenter controls
  startPresenting: () => {
    const { socket, boardId } = get();
    if (socket && boardId) {
      socket.emit('start-presentation', { boardId });
    }
  },

  stopPresenting: () => {
    const { socket, boardId } = get();
    if (socket && boardId) {
      socket.emit('stop-presentation', { boardId });
    }
  },

  setFollowing: (isFollowing) => set({ isFollowing }),

  updatePresenterViewport: (viewport) => {
    const { socket, boardId, isPresenter } = get();
    if (socket && boardId && isPresenter) {
      socket.emit('presenter-view-change', { boardId, viewport });
    }
  }
}));
