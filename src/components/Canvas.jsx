import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useReactFlow,
  ViewportPortal,
  ConnectionMode,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useStore } from '../store/useStore';
import ActorNode from './ActorNode';
import ActionNode from './ActionNode';
import AppNode from './AppNode';
import ImageNode from './ImageNode';
import ModuleNode from './ModuleNode';
import PersonaNode from './PersonaNode';
import StageNode from './StageNode';
import MarkerNode from './MarkerNode';
import ScreenNode from './ScreenNode';
import TransitionNode from './TransitionNode';
import DecisionNode from './DecisionNode';
import FlagEdge from './FlagEdge';
import TitleNode from './TitleNode';
import PhaseNode from './PhaseNode';
import CalloutNode from './CalloutNode';
import CtaNode from './CtaNode';
import BoardLinkNode from './BoardLinkNode';

const edgeTypes = { flag: FlagEdge };

const nodeTypes = {
  persona: PersonaNode,
  actor: ActorNode,
  action: ActionNode,
  decision: DecisionNode,
  title: TitleNode,
  phase: PhaseNode,
  callout: CalloutNode,
  cta: CtaNode,
  board_link: BoardLinkNode,
  ui_element: ScreenNode,
  transition: TransitionNode,
  // legacy standalone blocks (older boards) still render via AppNode
  logic: AppNode,
  storage: AppNode,
  notification: AppNode,
  image_node: ImageNode,
  group_module: ModuleNode,
  stage: StageNode,
  marker: MarkerNode
};

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, setViewport, getViewport } = useReactFlow();

  const {
    nodes,
    edges,
    cursors,
    viewMode,
    boardId,
    userName,
    socket,
    isPresenter,
    presenterId,
    isFollowing,
    presentMode,
    setExpandedNodeId,
    onReconnect,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updatePresenterViewport,
    copySelectedElements,
    cutSelectedElements,
    pasteCopiedElements,
    updateNodeGroupMembership,
    addImageAtPosition,
    pushHistory,
    undo,
    redo
  } = useStore();

  // Last known pointer position in flow coordinates — where pasted images land
  const lastPointerRef = useRef({ x: 200, y: 200 });

  const [zoom, setZoom] = useState(1);

  const isEditableTarget = () => {
    const el = document.activeElement;
    return !!(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable));
  };

  // 1. Copy selected nodes with Cmd/Ctrl+C. (Paste is handled by the paste event below
  //    so we never call preventDefault on Cmd/Ctrl+V — doing so suppresses the native
  //    paste event in Safari, which is what breaks clipboard image paste.)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditableTarget()) return;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const isCopy = mod && key === 'c';
      const isCut = mod && key === 'x';
      const isUndo = mod && key === 'z' && !e.shiftKey;
      const isRedo = (mod && key === 'z' && e.shiftKey) || (e.ctrlKey && key === 'y');

      if (isCopy) {
        e.preventDefault();
        copySelectedElements();
      } else if (isCut) {
        e.preventDefault();
        cutSelectedElements();
      } else if (isRedo) {
        e.preventDefault();
        redo();
      } else if (isUndo) {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedElements, cutSelectedElements, undo, redo]);

  // 1b. Single paste handler: an image on the clipboard drops onto the canvas;
  //     otherwise paste previously-copied nodes (unless typing in a field).
  useEffect(() => {
    const handlePaste = (e) => {
      if (!boardId) return;

      const items = e.clipboardData?.items || [];
      let imageFile = null;
      for (const item of items) {
        if (item.type && item.type.startsWith('image/')) {
          imageFile = item.getAsFile();
          break;
        }
      }

      if (imageFile) {
        e.preventDefault();
        addImageAtPosition(imageFile, { ...lastPointerRef.current });
        return;
      }

      // No image — let normal text paste happen inside form fields
      if (isEditableTarget()) return;
      pasteCopiedElements();
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [boardId, addImageAtPosition, pasteCopiedElements]);

  // 2. Filter elements based on active view mode
  const getVisibleElements = useCallback(() => {
    // Stages & modules span both lanes; pain/opportunity markers are discovery insights → user side only
    const isUserNode = (type) => ['persona', 'actor', 'action', 'decision', 'group_module', 'stage', 'phase', 'title', 'marker', 'callout', 'cta', 'board_link'].includes(type);
    const isAppNode = (type) => ['ui_element', 'transition', 'logic', 'storage', 'notification', 'group_module', 'stage', 'phase', 'title', 'callout', 'cta', 'board_link'].includes(type);

    let filteredNodes = nodes;
    if (viewMode === 'user') {
      filteredNodes = nodes.filter(n => isUserNode(n.type) || n.type === 'image_node');
    } else if (viewMode === 'app') {
      filteredNodes = nodes.filter(n => isAppNode(n.type) || n.type === 'image_node');
    }

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    // Render order: Stages/Phases (back-most) → Modules (parents before children) → everything else
    const rank = (t) => ((t === 'stage' || t === 'phase') ? 0 : t === 'group_module' ? 1 : 2);
    const sortedNodes = [...filteredNodes].sort((a, b) => rank(a.type) - rank(b.type));

    return { filteredNodes: sortedNodes, filteredEdges };
  }, [nodes, edges, viewMode]);

  const { filteredNodes, filteredEdges } = getVisibleElements();

  // Lane/band z-index isn't persisted in the DB, so re-apply it by type on every
  // render. This keeps stages/phases BEHIND the edges (so arrows over a lane stay
  // clickable) and modules behind their members — even after a save + reload.
  const Z_BY_TYPE = { stage: -2, phase: -2, group_module: -1 };
  const displayNodes = filteredNodes.map((n) => {
    const z = Z_BY_TYPE[n.type];
    if (z == null) return n;
    return { ...n, zIndex: z, style: { ...(n.style || {}), zIndex: z } };
  });

  // In presentation view, render plain edges as right-angle (smoothstep) connectors
  const displayEdges = presentMode
    ? filteredEdges.map((e) => (e.type ? e : { ...e, type: 'smoothstep' }))
    : filteredEdges;

  // Dual-Layer view: compute two non-overlapping lane bands (User Journey on top,
  // Application Journey below) split at the boundary between the two layers.
  const laneBands = useMemo(() => {
    if (viewMode !== 'dual') return null;
    const userTypes = ['persona', 'actor', 'action'];
    const appTypes = ['ui_element', 'logic', 'storage', 'notification'];
    const h = (n) => n.measured?.height || n.height || (n.type === 'persona' ? 320 : 220);
    const w = (n) => n.measured?.width || n.width || 220;

    const us = nodes.filter((n) => userTypes.includes(n.type));
    const as = nodes.filter((n) => appTypes.includes(n.type));
    if (us.length === 0 && as.length === 0) return null;

    const all = [...us, ...as];
    const PAD = 60;
    const minX = Math.min(...all.map((n) => n.position.x)) - PAD;
    const maxX = Math.max(...all.map((n) => n.position.x + w(n))) + PAD;
    const top = Math.min(...all.map((n) => n.position.y)) - PAD;
    const bottom = Math.max(...all.map((n) => n.position.y + h(n))) + PAD;

    const userBottom = us.length ? Math.max(...us.map((n) => n.position.y + h(n))) : top;
    const appTop = as.length ? Math.min(...as.map((n) => n.position.y)) : bottom;
    let boundary;
    if (us.length && as.length) boundary = (userBottom + appTop) / 2;
    else if (us.length) boundary = bottom;
    else boundary = top;

    return { minX, width: maxX - minX, top, bottom, boundary, hasUser: us.length > 0, hasApp: as.length > 0 };
  }, [viewMode, nodes]);

  // 3. Drop handler (supports normal palette nodes & library templates)
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!boardId) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      // Image files dragged in from Finder / Explorer
      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        Array.from(files).forEach((file, i) => {
          if (file.type.startsWith('image/')) {
            addImageAtPosition(file, { x: position.x + i * 30, y: position.y + i * 30 });
          }
        });
        return;
      }

      const type = event.dataTransfer.getData('application/reactflow');
      const dataStr = event.dataTransfer.getData('application/reactflow-data');
      if (!type) return;

      // Default Node Dropping
      const customData = dataStr ? JSON.parse(dataStr) : {};

      // Size/stacking presets for structural containers
      const presets = {
        group_module: { width: 350, height: 450, style: { zIndex: -1 } },
        stage: { width: 320, height: 760, style: { zIndex: -2 } },
        phase: { width: 1100, height: 240, style: { zIndex: -2 } },
        title: { width: 560, height: 90 },
        callout: { width: 220, height: 120 },
        cta: { width: 210, height: 64 },
        board_link: { width: 230, height: 52 }
      };

      const newNode = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: {
          label: customData.label || `${type} node`,
          linkedUserNodeId: null,
          tags: [],
          ...customData
        },
        ...(presets[type] || {})
      };

      addNode(newNode);
    },
    [addNode, boardId, screenToFlowPosition, addImageAtPosition]
  );

  // 4. Mirror the presenter's viewport — only while actively following
  useEffect(() => {
    if (!socket || isPresenter || !isFollowing) return;

    const handleSync = ({ viewport }) => {
      if (viewport) {
        setViewport({ x: viewport.x, y: viewport.y, zoom: viewport.zoom }, { duration: 100 });
      }
    };

    socket.on('follower-view-sync', handleSync);
    return () => {
      socket.off('follower-view-sync', handleSync);
    };
  }, [socket, isPresenter, isFollowing, setViewport]);

  const onMove = useCallback(() => {
    const viewport = getViewport();
    setZoom(viewport.zoom);
    if (isPresenter) {
      updatePresenterViewport(viewport);
    }
  }, [isPresenter, getViewport, updatePresenterViewport]);

  // Snapshot before a drag so it can be undone as one step
  const onNodeDragStart = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  // Double-click any node to open its focused editor overlay (works in every mode,
  // including Presentation view where the inline Expand button is hidden)
  const onNodeDoubleClick = useCallback((_event, node) => {
    setExpandedNodeId(node.id);
  }, [setExpandedNodeId]);

  // Re-evaluate Module membership when a node is dropped
  const onNodeDragStop = useCallback(
    (_event, node) => {
      if (node?.type !== 'group_module') {
        updateNodeGroupMembership(node.id);
      }
    },
    [updateNodeGroupMembership]
  );

  // 5. Send cursor positions
  const onMouseMove = useCallback((e) => {
    if (!boardId) return;

    const flowPos = screenToFlowPosition({
      x: e.clientX,
      y: e.clientY
    });

    // Remember where the cursor is so clipboard pastes land here
    lastPointerRef.current = flowPos;

    if (socket) {
      socket.emit('cursor-move', {
        boardId,
        x: flowPos.x,
        y: flowPos.y,
        userName
      });
    }
  }, [socket, boardId, userName, screenToFlowPosition]);

  return (
    <div
      className="canvas-wrapper"
      ref={reactFlowWrapper}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseMove={onMouseMove}
    >
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onMove={onMove}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onNodeDoubleClick={onNodeDoubleClick}
        onInit={(inst) => setZoom(inst.getViewport().zoom)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={{ stroke: '#1f2733', strokeWidth: 2 }}
        fitView
        elevateEdgesOnSelect
        edgesReconnectable
        defaultEdgeOptions={{
          style: { stroke: '#1f2733', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#1f2733' },
          interactionWidth: 24,
          reconnectable: true
        }}
      >
        <Background color="#c7ccd6" gap={20} size={1.4} />
        <Controls />

      </ReactFlow>

      {/* Dual-layer lane bands + live collaborator cursors, aligned through pan/zoom */}
      <ViewportPortal>
        {viewMode === 'dual' && laneBands && laneBands.hasUser && (
          <div
            style={{
              position: 'absolute',
              left: laneBands.minX,
              top: laneBands.top,
              width: laneBands.width,
              height: laneBands.boundary - laneBands.top,
              background: 'rgba(99,102,241,0.05)',
              border: '1px dashed rgba(99,102,241,0.30)',
              borderRadius: 16,
              pointerEvents: 'none',
              zIndex: -10
            }}
          >
            <span style={{ position: 'absolute', top: 8, left: 14, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(99,102,241,0.75)' }}>
              User Journey
            </span>
          </div>
        )}
        {viewMode === 'dual' && laneBands && laneBands.hasApp && (
          <div
            style={{
              position: 'absolute',
              left: laneBands.minX,
              top: laneBands.boundary,
              width: laneBands.width,
              height: laneBands.bottom - laneBands.boundary,
              background: 'rgba(16,185,129,0.05)',
              border: '1px dashed rgba(16,185,129,0.30)',
              borderRadius: 16,
              pointerEvents: 'none',
              zIndex: -10
            }}
          >
            <span style={{ position: 'absolute', top: 8, left: 14, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(16,185,129,0.85)' }}>
              Application Journey
            </span>
          </div>
        )}

        {/* Other cursors */}
        {Object.entries(cursors).map(([socketId, cursor]) => {
          if (socketId === socket?.id) return null;
          return (
            <div
              key={socketId}
              className="collaborator-cursor"
              style={{
                left: cursor.x,
                top: cursor.y,
                transform: `scale(${1 / zoom})`,
                transformOrigin: '0 0'
              }}
            >
              <svg className="cursor-pointer-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M4.5,3 L19.5,12 L12.5,13.5 L17,20 L14,21.5 L9.5,15 L4.5,18.5 Z" />
              </svg>
              <div className="cursor-label">{cursor.userName}</div>
            </div>
          );
        })}
      </ViewportPortal>
    </div>
  );
}

export default function Canvas() {
  return <FlowCanvas />;
}
