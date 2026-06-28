import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import * as sqlite from './db/sqlite.js';
import * as gemini from './services/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the project .env (journey_tool/.env)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import swaggerUi from 'swagger-ui-express';
import { signToken, verifyToken, authMiddleware, requireAdmin, canAccessBoard, canAccessWorkspace, apiKeyAuth } from './auth.js';
import { buildOpenApiSpec } from './openapi.js';
import { ELEMENTS, KNOWN_TYPES, HANDLE_IDS, EMOTIONS, LAYOUT_NOTES } from './elementSpec.js';
import { arrangeBoard, ESTIMATE_SIZE } from '../shared/autoArrange.js';

const ADMIN_USER = process.env.ADMIN_USER || 'Admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12345';
const ADMIN_LABEL = process.env.ADMIN_LABEL || 'Admin';
const ADMIN_SESSION_HOURS = Number(process.env.ADMIN_SESSION_HOURS || 24);
const INVITE_TTL_HOURS = Number(process.env.INVITE_TTL_HOURS || 12);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload folder exists
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer storage config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serialize multi-statement transactions so concurrent board saves never interleave
// on the single SQLite connection (which would break BEGIN/COMMIT). One Node process,
// so an in-memory promise chain is enough for our ~30-concurrent-user scale.
let writeChain = Promise.resolve();
function runExclusive(task) {
  const result = writeChain.then(() => task());
  writeChain = result.then(() => {}, () => {}); // keep the chain alive on errors
  return result;
}

// API ROUTES

// Middleware: load a board by route param and authorize the principal for it.
function boardAccess(paramName = 'id') {
  return async (req, res, next) => {
    try {
      const board = await sqlite.get('SELECT id, workspace_id FROM boards WHERE id = ?', [req.params[paramName]]);
      if (!board) return res.status(404).json({ error: 'Board not found' });
      if (!canAccessBoard(req.principal, board)) return res.status(403).json({ error: 'Forbidden' });
      req.board = board;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

// ---- Auth ----
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    const exp = Date.now() + ADMIN_SESSION_HOURS * 3600 * 1000;
    const token = signToken({ role: 'admin', label: ADMIN_LABEL, exp });
    return res.json({ token, role: 'admin', label: ADMIN_LABEL, exp });
  }
  res.status(401).json({ error: 'Invalid username or password' });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const { role, label, scope, targetId, exp } = req.principal;
  res.json({ role, label, scope: scope || null, targetId: targetId || null, exp: exp || null });
});

// ---- Workspaces ----
app.get('/api/workspaces', authMiddleware, async (req, res) => {
  const p = req.principal;
  try {
    let rows;
    if (p.role === 'admin') rows = await sqlite.query('SELECT * FROM workspaces ORDER BY created_at ASC');
    else if (p.scope === 'workspace') rows = await sqlite.query('SELECT * FROM workspaces WHERE id = ?', [p.targetId]);
    else rows = [];
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workspaces', authMiddleware, requireAdmin, async (req, res) => {
  const { id, name } = req.body || {};
  if (!id || !name) return res.status(400).json({ error: 'Missing id or name' });
  try {
    await runExclusive(() => sqlite.run('INSERT INTO workspaces (id, name, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', [id, name]));
    res.json({ id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/workspaces/:id', authMiddleware, requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === 'ws-default') return res.status(400).json({ error: 'Cannot delete the default workspace' });
  try {
    await runExclusive(async () => {
      const boards = await sqlite.query('SELECT id FROM boards WHERE workspace_id = ?', [id]);
      for (const b of boards) await sqlite.run('DELETE FROM boards WHERE id = ?', [b.id]);
      await sqlite.run('DELETE FROM workspaces WHERE id = ?', [id]);
    });
    io.to(`ws:${id}`).emit('workspace-boards-changed', { workspaceId: id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- Invites (admin creates; validate/accept are public for the invitee) ----
app.post('/api/invites', authMiddleware, requireAdmin, async (req, res) => {
  const { scope, targetId } = req.body || {};
  if (!['workspace', 'board'].includes(scope) || !targetId) {
    return res.status(400).json({ error: 'scope must be workspace|board with a targetId' });
  }
  try {
    if (scope === 'workspace') {
      const ws = await sqlite.get('SELECT id FROM workspaces WHERE id = ?', [targetId]);
      if (!ws) return res.status(404).json({ error: 'Workspace not found' });
    } else {
      const b = await sqlite.get('SELECT id FROM boards WHERE id = ?', [targetId]);
      if (!b) return res.status(404).json({ error: 'Board not found' });
    }
    const token = 'inv-' + crypto.randomBytes(18).toString('hex');
    await runExclusive(() => sqlite.run('INSERT INTO invites (token, scope, target_id) VALUES (?, ?, ?)', [token, scope, targetId]));
    res.json({ token, scope, targetId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate + activate on first open (starts the 12h countdown)
app.get('/api/invites/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const inv = await sqlite.get('SELECT * FROM invites WHERE token = ?', [token]);
    if (!inv) return res.json({ valid: false, reason: 'notfound' });
    let expiresAtIso = inv.expires_at;
    if (!inv.activated_at) {
      const now = Date.now();
      const exp = now + INVITE_TTL_HOURS * 3600 * 1000;
      expiresAtIso = new Date(exp).toISOString();
      await runExclusive(() => sqlite.run(
        'UPDATE invites SET activated_at = ?, expires_at = ? WHERE token = ?',
        [new Date(now).toISOString(), expiresAtIso, token]
      ));
    }
    const expMs = new Date(expiresAtIso).getTime();
    if (Date.now() > expMs) return res.json({ valid: false, reason: 'expired' });
    res.json({ valid: true, scope: inv.scope, targetId: inv.target_id, expiresAt: expMs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept → issue a scoped, expiring member token
app.post('/api/invites/:token/accept', async (req, res) => {
  const { token } = req.params;
  const { label } = req.body || {};
  if (!label || !label.trim()) return res.status(400).json({ error: 'Missing display name' });
  try {
    const inv = await sqlite.get('SELECT * FROM invites WHERE token = ?', [token]);
    if (!inv || !inv.expires_at) return res.status(404).json({ error: 'Invalid invite' });
    const expMs = new Date(inv.expires_at).getTime();
    if (Date.now() > expMs) return res.status(410).json({ error: 'Invite expired' });
    const memberToken = signToken({ role: 'member', label: label.trim(), scope: inv.scope, targetId: inv.target_id, exp: expMs });
    res.json({ token: memberToken, role: 'member', label: label.trim(), scope: inv.scope, targetId: inv.target_id, exp: expMs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Get boards (scoped to the principal; admin can filter by ?workspaceId=)
app.get('/api/boards', authMiddleware, async (req, res) => {
  const p = req.principal;
  const { workspaceId } = req.query;
  try {
    let rows;
    if (p.role === 'admin') {
      rows = workspaceId
        ? await sqlite.query('SELECT * FROM boards WHERE workspace_id = ? ORDER BY updated_at DESC', [workspaceId])
        : await sqlite.query('SELECT * FROM boards ORDER BY updated_at DESC');
    } else if (p.scope === 'workspace') {
      rows = await sqlite.query('SELECT * FROM boards WHERE workspace_id = ? ORDER BY updated_at DESC', [p.targetId]);
    } else {
      rows = await sqlite.query('SELECT * FROM boards WHERE id = ?', [p.targetId]);
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Create a new board (within a workspace the principal can access)
app.post('/api/boards', authMiddleware, async (req, res) => {
  const { id, name, workspaceId } = req.body;
  if (!id || !name || !workspaceId) {
    return res.status(400).json({ error: 'Missing id, name or workspaceId' });
  }
  if (!canAccessWorkspace(req.principal, workspaceId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    await runExclusive(() => sqlite.run(
      'INSERT INTO boards (id, name, workspace_id, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [id, name, workspaceId]
    ));
    io.to(`ws:${workspaceId}`).emit('workspace-boards-changed', { workspaceId });
    res.json({ id, name, workspaceId, message: 'Board created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get single board details (nodes, edges, comments)
app.get('/api/boards/:id', authMiddleware, boardAccess(), async (req, res) => {
  const { id } = req.params;
  try {
    const board = await sqlite.get('SELECT * FROM boards WHERE id = ?', [id]);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const dbNodes = await sqlite.query('SELECT * FROM nodes WHERE board_id = ?', [id]);
    const dbEdges = await sqlite.query('SELECT * FROM edges WHERE board_id = ?', [id]);
    const dbComments = await sqlite.query('SELECT * FROM comments WHERE board_id = ?', [id]);

    // Format nodes and edges for XYFlow
    const nodes = dbNodes.map(node => ({
      id: node.id,
      type: node.type,
      position: { x: node.position_x, y: node.position_y },
      width: node.width,
      height: node.height,
      ...(node.parent_id ? { parentId: node.parent_id } : {}),
      data: JSON.parse(node.data)
    }));

    const edges = dbEdges.map(edge => {
      const parsed = edge.data ? JSON.parse(edge.data) : {};
      const { _sourceHandle, _targetHandle, ...rest } = parsed;
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        ...(_sourceHandle ? { sourceHandle: _sourceHandle } : {}),
        ...(_targetHandle ? { targetHandle: _targetHandle } : {}),
        data: rest
      };
    });

    const comments = dbComments.map(comment => ({
      id: comment.id,
      nodeId: comment.node_id,
      author: comment.author,
      content: comment.content,
      position: { x: comment.position_x, y: comment.position_y },
      createdAt: comment.created_at
    }));

    res.json({ ...board, nodes, edges, comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Bulk sync/save a board (nodes and edges)
app.post('/api/boards/:id/sync', authMiddleware, boardAccess(), async (req, res) => {
  const { id } = req.params;
  const { nodes, edges } = req.body;

  try {
    await runExclusive(async () => {
      // Check if board exists
      const board = await sqlite.get('SELECT * FROM boards WHERE id = ?', [id]);
      if (!board) {
        const err = new Error('Board not found');
        err.status = 404;
        throw err;
      }

      await sqlite.run('BEGIN TRANSACTION');
      try {
        // Remove existing nodes & edges for the board
        await sqlite.run('DELETE FROM nodes WHERE board_id = ?', [id]);
        await sqlite.run('DELETE FROM edges WHERE board_id = ?', [id]);

        // Insert updated nodes
        if (nodes && Array.isArray(nodes)) {
          for (const node of nodes) {
            await sqlite.run(
              `INSERT INTO nodes (id, board_id, type, position_x, position_y, width, height, parent_id, data)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                node.id,
                id,
                node.type || 'default',
                node.position?.x ?? 0,
                node.position?.y ?? 0,
                node.width || null,
                node.height || null,
                node.parentId || null,
                JSON.stringify(node.data || {})
              ]
            );
          }
        }

        // Insert updated edges
        if (edges && Array.isArray(edges)) {
          for (const edge of edges) {
            const edgeData = {
              ...(edge.data || {}),
              _sourceHandle: edge.sourceHandle ?? null,
              _targetHandle: edge.targetHandle ?? null
            };
            await sqlite.run(
              `INSERT INTO edges (id, board_id, source, target, type, data)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                edge.id,
                id,
                edge.source,
                edge.target,
                edge.type || 'default',
                JSON.stringify(edgeData)
              ]
            );
          }
        }

        await sqlite.run('UPDATE boards SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        await sqlite.run('COMMIT');
      } catch (txErr) {
        try { await sqlite.run('ROLLBACK'); } catch (_) { /* nothing to roll back */ }
        throw txErr;
      }
    });

    res.json({ success: true, message: 'Sync complete' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// 4b. Duplicate a board (deep copy with fresh ids) into a new named board
app.post('/api/boards/:id/duplicate', authMiddleware, boardAccess(), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const workspaceId = req.board.workspace_id;
  if (!name) return res.status(400).json({ error: 'Missing name' });

  try {
    const created = await runExclusive(async () => {
      const board = await sqlite.get('SELECT * FROM boards WHERE id = ?', [id]);
      if (!board) {
        const err = new Error('Board not found');
        err.status = 404;
        throw err;
      }

      const nodes = await sqlite.query('SELECT * FROM nodes WHERE board_id = ?', [id]);
      const edges = await sqlite.query('SELECT * FROM edges WHERE board_id = ?', [id]);
      const comments = await sqlite.query('SELECT * FROM comments WHERE board_id = ?', [id]);

      const newBoardId = 'board-' + Date.now();
      const nodeIdMap = {};
      nodes.forEach((n, i) => { nodeIdMap[n.id] = `${newBoardId}-n${i}`; });

      await sqlite.run('BEGIN TRANSACTION');
      try {
        await sqlite.run('INSERT INTO boards (id, name, workspace_id, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [newBoardId, name, workspaceId]);

        for (const n of nodes) {
          // remap intra-board references inside data (linkedUserNodeId)
          let dataStr = n.data;
          try {
            const parsed = JSON.parse(n.data || '{}');
            if (parsed.linkedUserNodeId && nodeIdMap[parsed.linkedUserNodeId]) {
              parsed.linkedUserNodeId = nodeIdMap[parsed.linkedUserNodeId];
            }
            dataStr = JSON.stringify(parsed);
          } catch (_) { /* keep original */ }
          const parent = n.parent_id && nodeIdMap[n.parent_id] ? nodeIdMap[n.parent_id] : (n.parent_id || null);
          await sqlite.run(
            `INSERT INTO nodes (id, board_id, type, position_x, position_y, width, height, parent_id, data)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nodeIdMap[n.id], newBoardId, n.type, n.position_x, n.position_y, n.width, n.height, parent, dataStr]
          );
        }

        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          await sqlite.run(
            `INSERT INTO edges (id, board_id, source, target, type, data) VALUES (?, ?, ?, ?, ?, ?)`,
            [`${newBoardId}-e${i}`, newBoardId, nodeIdMap[e.source] || e.source, nodeIdMap[e.target] || e.target, e.type, e.data]
          );
        }

        for (let i = 0; i < comments.length; i++) {
          const c = comments[i];
          const nodeRef = c.node_id && nodeIdMap[c.node_id] ? nodeIdMap[c.node_id] : (c.node_id || null);
          await sqlite.run(
            `INSERT INTO comments (id, board_id, node_id, author, content, position_x, position_y, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [`${newBoardId}-c${i}`, newBoardId, nodeRef, c.author, c.content, c.position_x, c.position_y]
          );
        }

        await sqlite.run('COMMIT');
      } catch (txErr) {
        try { await sqlite.run('ROLLBACK'); } catch (_) { /* nothing to roll back */ }
        throw txErr;
      }

      return { id: newBoardId, name };
    });

    io.to(`ws:${workspaceId}`).emit('workspace-boards-changed', { workspaceId });
    res.json(created);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// 5. Delete a board (admin only)
app.delete('/api/boards/:id', authMiddleware, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const board = await sqlite.get('SELECT workspace_id FROM boards WHERE id = ?', [id]);
    await runExclusive(() => sqlite.run('DELETE FROM boards WHERE id = ?', [id]));
    // Tear down any presentation on the deleted board, and notify anyone still in it
    if (presenterRooms.has(id)) presenterRooms.delete(id);
    io.to(id).emit('presenter-state', { presenterId: null });
    io.to(id).emit('board-deleted', { boardId: id });
    if (board?.workspace_id) io.to(`ws:${board.workspace_id}`).emit('workspace-boards-changed', { workspaceId: board.workspace_id });
    res.json({ success: true, message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Comments CRUD
app.post('/api/boards/:id/comments', authMiddleware, boardAccess(), async (req, res) => {
  const { id } = req.params;
  const { commentId, nodeId, author, content, x, y } = req.body;

  try {
    await runExclusive(() => sqlite.run(
      `INSERT INTO comments (id, board_id, node_id, author, content, position_x, position_y, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [commentId, id, nodeId || null, author, content, x ?? null, y ?? null]
    ));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/boards/:boardId/comments/:commentId', authMiddleware, boardAccess('boardId'), async (req, res) => {
  const { commentId } = req.params;
  try {
    await runExclusive(() => sqlite.run('DELETE FROM comments WHERE id = ?', [commentId]));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Image Upload Route
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// AI endpoints

// AI OCR Digitizer
app.post('/api/ai/ocr', authMiddleware, async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64 data' });
  }
  try {
    const result = await gemini.digitizeCanvasImage(imageBase64);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Auto-layout mapping
app.post('/api/ai/auto-layout', authMiddleware, async (req, res) => {
  const { userNodes, userEdges } = req.body;
  if (!userNodes || !Array.isArray(userNodes)) {
    return res.status(400).json({ error: 'Missing userNodes array' });
  }
  try {
    const result = await gemini.autoGenerateAppJourney(userNodes, Array.isArray(userEdges) ? userEdges : []);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI cleanup and matrix summary
app.post('/api/ai/summarize', authMiddleware, async (req, res) => {
  const { nodes, edges } = req.body;
  try {
    const result = await gemini.restructureAndSummarize(nodes, edges);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================================================
// PUBLIC MACHINE API (/api/v1) — X-API-Key auth, documented at /api/docs
// ===========================================================================

// Interactive Swagger docs (the page itself is public; calls need the key)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(buildOpenApiSpec()));
app.get('/api/v1/openapi.json', (req, res) => res.json(buildOpenApiSpec()));

// Element catalog + layout rules (so connectors know each element + how to arrange them)
app.get('/api/v1/elements', apiKeyAuth, (req, res) => {
  res.json({ handles: HANDLE_IDS, emotions: EMOTIONS, layout: LAYOUT_NOTES, elements: ELEMENTS });
});

// For portable exports: turn local /uploads/<file> image urls into base64 data URLs
const IMAGE_MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.bmp': 'image/bmp' };
function embedLocalImages(nodes) {
  return nodes.map((n) => {
    if (n.type !== 'image_node') return n;
    const url = n.data?.url;
    if (typeof url !== 'string' || !url.startsWith('/uploads/')) return n; // external/data urls untouched
    try {
      const file = path.join(uploadDir, path.basename(url)); // basename guards path traversal
      if (!fs.existsSync(file)) return n;
      const mime = IMAGE_MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
      const b64 = fs.readFileSync(file).toString('base64');
      return { ...n, data: { ...n.data, url: `data:${mime};base64,${b64}` } };
    } catch (_) {
      return n; // on any read error, leave the original url
    }
  });
}

// Map DB rows → the client/export board shape (mirrors GET /api/boards/:id)
function mapBoardBundle(board, dbNodes, dbEdges, dbComments) {
  const nodes = dbNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: n.position_x, y: n.position_y },
    width: n.width,
    height: n.height,
    ...(n.parent_id ? { parentId: n.parent_id } : {}),
    data: JSON.parse(n.data)
  }));
  const edges = dbEdges.map((e) => {
    const parsed = e.data ? JSON.parse(e.data) : {};
    const { _sourceHandle, _targetHandle, ...rest } = parsed;
    return {
      id: e.id, source: e.source, target: e.target, type: e.type,
      ...(_sourceHandle ? { sourceHandle: _sourceHandle } : {}),
      ...(_targetHandle ? { targetHandle: _targetHandle } : {}),
      data: rest
    };
  });
  const comments = dbComments.map((c) => ({
    id: c.id, nodeId: c.node_id, author: c.author, content: c.content,
    position: { x: c.position_x, y: c.position_y }, createdAt: c.created_at
  }));
  return { id: board.id, name: board.name, workspaceId: board.workspace_id, nodes, edges, comments };
}

// Strict validation so a broken layout can never be stored
function validateBoardPayload({ nodes, edges }) {
  const errors = [];
  if (!Array.isArray(nodes)) { errors.push('"nodes" must be an array'); return errors; }
  if (edges != null && !Array.isArray(edges)) errors.push('"edges" must be an array');
  const ids = new Set();
  nodes.forEach((n, i) => {
    if (!n || typeof n.id !== 'string') { errors.push(`node[${i}] is missing a string "id"`); return; }
    if (ids.has(n.id)) errors.push(`duplicate node id "${n.id}"`);
    ids.add(n.id);
    if (!KNOWN_TYPES.includes(n.type)) errors.push(`node "${n.id}" has unknown type "${n.type}"`);
    const p = n.position;
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) errors.push(`node "${n.id}" has invalid position (need finite x,y)`);
    if (n.width != null && !(Number.isFinite(n.width) && n.width > 0)) errors.push(`node "${n.id}" has invalid width`);
    if (n.height != null && !(Number.isFinite(n.height) && n.height > 0)) errors.push(`node "${n.id}" has invalid height`);
  });
  nodes.forEach((n) => {
    if (n && n.parentId && !ids.has(n.parentId)) errors.push(`node "${n.id}" parentId "${n.parentId}" is not in the payload`);
  });
  (Array.isArray(edges) ? edges : []).forEach((e, i) => {
    if (!e || typeof e.id !== 'string') { errors.push(`edge[${i}] is missing a string "id"`); return; }
    if (!ids.has(e.source)) errors.push(`edge "${e.id}" source "${e.source}" is not a node in the payload`);
    if (!ids.has(e.target)) errors.push(`edge "${e.id}" target "${e.target}" is not a node in the payload`);
  });
  return errors;
}

// List workspaces (with their boards, so cross-board links can be resolved)
app.get('/api/v1/workspaces', apiKeyAuth, async (req, res) => {
  try {
    const workspaces = await sqlite.query('SELECT id, name, created_at FROM workspaces ORDER BY created_at ASC');
    const boards = await sqlite.query('SELECT id, name, workspace_id, updated_at FROM boards ORDER BY updated_at DESC');
    res.json(workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      boards: boards.filter((b) => b.workspace_id === w.id).map((b) => ({ id: b.id, name: b.name, updatedAt: b.updated_at }))
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List boards
app.get('/api/v1/boards', apiKeyAuth, async (req, res) => {
  const { workspaceId } = req.query;
  try {
    const rows = workspaceId
      ? await sqlite.query('SELECT id, name, workspace_id, updated_at FROM boards WHERE workspace_id = ? ORDER BY updated_at DESC', [workspaceId])
      : await sqlite.query('SELECT id, name, workspace_id, updated_at FROM boards ORDER BY updated_at DESC');
    res.json(rows.map((r) => ({ id: r.id, name: r.name, workspaceId: r.workspace_id, updatedAt: r.updated_at })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export a board (full bundle)
app.get('/api/v1/boards/:id', apiKeyAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const board = await sqlite.get('SELECT * FROM boards WHERE id = ?', [id]);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const [dbNodes, dbEdges, dbComments] = await Promise.all([
      sqlite.query('SELECT * FROM nodes WHERE board_id = ?', [id]),
      sqlite.query('SELECT * FROM edges WHERE board_id = ?', [id]),
      sqlite.query('SELECT * FROM comments WHERE board_id = ?', [id])
    ]);
    const bundle = mapBoardBundle(board, dbNodes, dbEdges, dbComments);
    bundle.nodes = embedLocalImages(bundle.nodes); // self-contained export (images inlined)
    res.json(bundle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import (upsert) a board
app.post('/api/v1/boards/import', apiKeyAuth, async (req, res) => {
  const { id, name, workspaceId, nodes = [], edges = [], comments = [], validateOnly } = req.body || {};
  const errors = validateBoardPayload({ nodes, edges });
  if (!id && !name) errors.unshift('"name" is required when creating a new board (no id given)');
  if (errors.length) return res.status(400).json({ ok: false, errors });
  if (validateOnly) return res.json({ ok: true, validateOnly: true });

  try {
    const result = await runExclusive(async () => {
      let wsId = workspaceId;
      if (wsId) {
        const ws = await sqlite.get('SELECT id FROM workspaces WHERE id = ?', [wsId]);
        if (!ws) wsId = null;
      }
      if (!wsId) wsId = 'ws-default';

      const boardId = id || ('board-' + Date.now());
      const existing = await sqlite.get('SELECT id FROM boards WHERE id = ?', [boardId]);

      await sqlite.run('BEGIN TRANSACTION');
      try {
        if (existing) {
          await sqlite.run('UPDATE boards SET name = COALESCE(?, name), workspace_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name || null, wsId, boardId]);
          await sqlite.run('DELETE FROM nodes WHERE board_id = ?', [boardId]);
          await sqlite.run('DELETE FROM edges WHERE board_id = ?', [boardId]);
          await sqlite.run('DELETE FROM comments WHERE board_id = ?', [boardId]);
        } else {
          await sqlite.run('INSERT INTO boards (id, name, workspace_id, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [boardId, name || 'Imported board', wsId]);
        }

        // node/edge/comment ids are GLOBAL primary keys. When creating a NEW board
        // we remap them to fresh ids (and rewrite internal references) so importing
        // an export while the original still exists can't collide.
        const creating = !existing;
        const idMap = {};
        if (creating) nodes.forEach((n, i) => { idMap[n.id] = `${boardId}-n${i}`; });
        const mapNodeId = (nid) => (creating ? (idMap[nid] || nid) : nid);

        for (const node of nodes) {
          let data = node.data || {};
          if (creating && data.linkedUserNodeId && idMap[data.linkedUserNodeId]) {
            data = { ...data, linkedUserNodeId: idMap[data.linkedUserNodeId] };
          }
          await sqlite.run(
            `INSERT INTO nodes (id, board_id, type, position_x, position_y, width, height, parent_id, data)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [mapNodeId(node.id), boardId, node.type, node.position.x, node.position.y, node.width || null, node.height || null, node.parentId ? mapNodeId(node.parentId) : null, JSON.stringify(data)]
          );
        }
        for (let i = 0; i < edges.length; i++) {
          const edge = edges[i];
          const edgeData = { ...(edge.data || {}), _sourceHandle: edge.sourceHandle ?? null, _targetHandle: edge.targetHandle ?? null };
          await sqlite.run(
            `INSERT INTO edges (id, board_id, source, target, type, data) VALUES (?, ?, ?, ?, ?, ?)`,
            [creating ? `${boardId}-e${i}` : edge.id, boardId, mapNodeId(edge.source), mapNodeId(edge.target), edge.type || 'default', JSON.stringify(edgeData)]
          );
        }
        for (let i = 0; i < comments.length; i++) {
          const c = comments[i];
          await sqlite.run(
            `INSERT INTO comments (id, board_id, node_id, author, content, position_x, position_y, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [creating ? `${boardId}-c${i}` : (c.id || `${boardId}-c${i}`), boardId, c.nodeId ? mapNodeId(c.nodeId) : null, c.author || 'import', c.content || '', c.position?.x ?? null, c.position?.y ?? null]
          );
        }
        await sqlite.run('COMMIT');
      } catch (txErr) {
        try { await sqlite.run('ROLLBACK'); } catch (_) { /* nothing to roll back */ }
        throw txErr;
      }
      return { id: boardId, name: name || (existing ? undefined : 'Imported board'), workspaceId: wsId, created: !existing };
    });

    // Live-update any connected clients + workspace board lists
    io.to(result.id).emit('nodes-synced', { nodes });
    io.to(result.id).emit('edges-synced', { edges });
    io.to(result.id).emit('comments-refreshed');
    io.to(`ws:${result.workspaceId}`).emit('workspace-boards-changed', { workspaceId: result.workspaceId });

    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-arrange (tidy) a board's layout — deterministic, uses size estimates
app.post('/api/v1/boards/:id/arrange', apiKeyAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const board = await sqlite.get('SELECT id FROM boards WHERE id = ?', [id]);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const dbNodes = await sqlite.query('SELECT * FROM nodes WHERE board_id = ?', [id]);
    const dbEdges = await sqlite.query('SELECT * FROM edges WHERE board_id = ?', [id]);
    const nodes = dbNodes.map((n) => ({
      id: n.id, type: n.type, position: { x: n.position_x, y: n.position_y },
      width: n.width, height: n.height, ...(n.parent_id ? { parentId: n.parent_id } : {}), data: JSON.parse(n.data)
    }));
    const edges = dbEdges.map((e) => ({ id: e.id, source: e.source, target: e.target }));

    const { nodes: arranged } = arrangeBoard({ nodes, edges }); // server uses built-in ESTIMATE_SIZE

    let moved = 0;
    await runExclusive(async () => {
      await sqlite.run('BEGIN TRANSACTION');
      try {
        for (const n of arranged) {
          await sqlite.run(
            'UPDATE nodes SET position_x = ?, position_y = ?, width = ?, height = ? WHERE id = ? AND board_id = ?',
            [n.position.x, n.position.y, n.width ?? null, n.height ?? null, n.id, id]
          );
          moved++;
        }
        await sqlite.run('UPDATE boards SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        await sqlite.run('COMMIT');
      } catch (txErr) {
        try { await sqlite.run('ROLLBACK'); } catch (_) { /* nothing to roll back */ }
        throw txErr;
      }
    });

    io.to(id).emit('nodes-synced', { nodes: arranged }); // live-refresh open clients
    res.json({ ok: true, moved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a board (cascades nodes/edges/comments; tears down any presentation)
app.delete('/api/v1/boards/:id', apiKeyAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const board = await sqlite.get('SELECT workspace_id FROM boards WHERE id = ?', [id]);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    await runExclusive(() => sqlite.run('DELETE FROM boards WHERE id = ?', [id]));
    if (presenterRooms.has(id)) presenterRooms.delete(id);
    io.to(id).emit('presenter-state', { presenterId: null });
    io.to(id).emit('board-deleted', { boardId: id });
    if (board.workspace_id) io.to(`ws:${board.workspace_id}`).emit('workspace-boards-changed', { workspaceId: board.workspace_id });
    res.json({ ok: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a workspace and ALL its boards (the default workspace is protected)
app.delete('/api/v1/workspaces/:id', apiKeyAuth, async (req, res) => {
  const { id } = req.params;
  if (id === 'ws-default') return res.status(400).json({ error: 'Cannot delete the default workspace' });
  try {
    const ws = await sqlite.get('SELECT id FROM workspaces WHERE id = ?', [id]);
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });
    const boards = await sqlite.query('SELECT id FROM boards WHERE workspace_id = ?', [id]);
    await runExclusive(async () => {
      for (const b of boards) await sqlite.run('DELETE FROM boards WHERE id = ?', [b.id]);
      await sqlite.run('DELETE FROM workspaces WHERE id = ?', [id]);
    });
    boards.forEach((b) => {
      if (presenterRooms.has(b.id)) presenterRooms.delete(b.id);
      io.to(b.id).emit('board-deleted', { boardId: b.id });
    });
    io.to(`ws:${id}`).emit('workspace-boards-changed', { workspaceId: id });
    res.json({ ok: true, id, deletedBoards: boards.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io Real-time Collaboration logic
const presenterRooms = new Map(); // boardId -> socketId of presenter

// Authenticate every socket connection from the handshake token
io.use((socket, next) => {
  const principal = verifyToken(socket.handshake?.auth?.token);
  if (!principal) return next(new Error('Unauthorized'));
  socket.principal = principal;
  next();
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a workspace room so this client receives its board-list changes
  socket.on('join-workspace', ({ workspaceId }) => {
    if (!workspaceId || !canAccessWorkspace(socket.principal, workspaceId)) return;
    if (socket.workspaceRoom && socket.workspaceRoom !== `ws:${workspaceId}`) {
      socket.leave(socket.workspaceRoom);
    }
    socket.workspaceRoom = `ws:${workspaceId}`;
    socket.join(socket.workspaceRoom);
  });

  // Join a board room (only if the principal is authorized for that board)
  socket.on('join-board', async ({ boardId, userName }) => {
    try {
      const board = await sqlite.get('SELECT id, workspace_id FROM boards WHERE id = ?', [boardId]);
      if (!board || !canAccessBoard(socket.principal, board)) {
        socket.emit('join-denied', { boardId });
        return;
      }
    } catch (e) {
      socket.emit('join-denied', { boardId });
      return;
    }
    // Leave a previously-joined board room (persistent socket switches boards).
    // If we were its presenter, clear that and tell the old room.
    if (socket.boardId && socket.boardId !== boardId) {
      if (presenterRooms.get(socket.boardId) === socket.id) {
        presenterRooms.delete(socket.boardId);
        socket.to(socket.boardId).emit('presenter-state', { presenterId: null });
      }
      socket.leave(socket.boardId);
    }
    socket.join(boardId);
    socket.boardId = boardId;
    socket.userName = userName;
    console.log(`${userName} (${socket.id}) joined board: ${boardId}`);
    
    // Notify room
    socket.to(boardId).emit('user-joined', { socketId: socket.id, userName });
    
    // Send current presenter details
    if (presenterRooms.has(boardId)) {
      socket.emit('presenter-state', { presenterId: presenterRooms.get(boardId) });
    }
  });

  // Sync node changes in real-time
  socket.on('nodes-update', ({ boardId, nodes }) => {
    socket.to(boardId).emit('nodes-synced', { nodes });
  });

  // Sync edge changes in real-time
  socket.on('edges-update', ({ boardId, edges }) => {
    socket.to(boardId).emit('edges-synced', { edges });
  });

  // Cursor movements
  socket.on('cursor-move', ({ boardId, x, y, userName }) => {
    socket.to(boardId).emit('cursor-synced', {
      socketId: socket.id,
      userName,
      x,
      y
    });
  });

  // Comments addition/deletion
  socket.on('comment-change', ({ boardId }) => {
    socket.to(boardId).emit('comments-refreshed');
  });

  // @mention notifications — relay to everyone else in the board room
  socket.on('mention-alert', ({ boardId, mentions, author, content }) => {
    socket.to(boardId).emit('mention-alert', { mentions, author, content });
  });

  // Presenter logic
  socket.on('start-presentation', ({ boardId }) => {
    presenterRooms.set(boardId, socket.id);
    io.to(boardId).emit('presenter-state', { presenterId: socket.id });
    console.log(`Presentation started on board ${boardId} by ${socket.id}`);
  });

  socket.on('stop-presentation', ({ boardId }) => {
    if (presenterRooms.get(boardId) === socket.id) {
      presenterRooms.delete(boardId);
      io.to(boardId).emit('presenter-state', { presenterId: null });
      console.log(`Presentation stopped on board ${boardId}`);
    }
  });

  socket.on('presenter-view-change', ({ boardId, viewport }) => {
    if (presenterRooms.get(boardId) === socket.id) {
      socket.to(boardId).emit('follower-view-sync', { viewport });
    }
  });

  // Presenter opened/closed an element overlay → mirror to followers
  socket.on('presenter-expand', ({ boardId, nodeId }) => {
    if (presenterRooms.get(boardId) === socket.id) {
      socket.to(boardId).emit('presenter-expand', { nodeId });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (socket.boardId) {
      socket.to(socket.boardId).emit('user-left', { socketId: socket.id, userName: socket.userName });
      
      // If presenter disconnected, clean up
      if (presenterRooms.get(socket.boardId) === socket.id) {
        presenterRooms.delete(socket.boardId);
        socket.to(socket.boardId).emit('presenter-state', { presenterId: null });
      }
    }
  });
});

// Serve static frontend in production if built
const distDir = path.resolve(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distDir, 'index.html'));
  });
}

// Safety nets: log unexpected errors instead of letting the process hard-crash,
// so one bad request/socket doesn't take the board down for everyone.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
