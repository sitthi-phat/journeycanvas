import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Lightweight, dependency-free auth: signed HMAC tokens (no JWT library).
// A token is  base64url(payloadJSON) + "." + base64url(HMAC_SHA256(payload)).
// Payload: { role:'admin'|'member', label, scope?, targetId?, iat, exp }  (ms epoch)
// ---------------------------------------------------------------------------

function deriveFallbackSecret() {
  // Stable across restarts for a given install; warn so prod sets a real secret.
  console.warn('[auth] AUTH_SECRET not set — using a derived fallback secret. Set AUTH_SECRET in .env for production.');
  return crypto.createHash('sha256').update('journeycanvas::' + (process.env.ADMIN_PASSWORD || 'default')).digest('hex');
}

function secret() {
  return (process.env.AUTH_SECRET && process.env.AUTH_SECRET.trim()) || deriveFallbackSecret();
}

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (str) => Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');

function sign(body) {
  return b64url(crypto.createHmac('sha256', secret()).update(body).digest());
}

export function signToken(payload) {
  const full = { iat: Date.now(), ...payload };
  const body = b64url(JSON.stringify(full));
  return `${body}.${sign(body)}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  // constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try {
    payload = JSON.parse(fromB64url(body));
  } catch {
    return null;
  }
  if (payload.exp && Date.now() > payload.exp) return null;
  return payload;
}

// ---- Express middleware & authorization helpers ---------------------------

function bearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : null;
}

export function authMiddleware(req, res, next) {
  const principal = verifyToken(bearer(req));
  if (!principal) return res.status(401).json({ error: 'Unauthorized' });
  req.principal = principal;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.principal?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// Machine-to-machine auth for the public /api/v1 API via a static X-API-Key header.
export function apiKeyAuth(req, res, next) {
  const configured = (process.env.API_KEY || '').trim();
  if (!configured) return res.status(503).json({ error: 'External API disabled (API_KEY not set)' });
  const provided = (req.headers['x-api-key'] || '').trim();
  const a = Buffer.from(provided);
  const b = Buffer.from(configured);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Invalid or missing X-API-Key' });
  }
  next();
}

// board = { id, workspace_id }
export function canAccessBoard(principal, board) {
  if (!principal || !board) return false;
  if (principal.role === 'admin') return true;
  if (principal.scope === 'workspace') return principal.targetId === board.workspace_id;
  if (principal.scope === 'board') return principal.targetId === board.id;
  return false;
}

export function canAccessWorkspace(principal, workspaceId) {
  if (!principal || !workspaceId) return false;
  if (principal.role === 'admin') return true;
  if (principal.scope === 'workspace') return principal.targetId === workspaceId;
  return false; // board-scoped members don't browse workspaces
}
