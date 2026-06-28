# JourneyCanvas External API — Changelog & Contract

Machine-facing API for other systems to list, export, import, arrange, and delete boards.

- **Base path:** `/api/v1`
- **Auth:** header `X-API-Key: <API_KEY from .env>` on every endpoint.
  - missing/wrong key → `401`
  - `API_KEY` unset on the server → `503` (API disabled)
- **Docs:** Swagger UI at `GET /api/docs` · raw spec at `GET /api/v1/openapi.json`
- **Source:** routes in `server/index.js`, spec in `server/openapi.js`, shared layout engine in `shared/autoArrange.js`.

---

## UI / Functional changes (context for board-building agents)

These are app-side behaviors that affect how boards look/behave (not API contracts). Full spec in `requirement.md`; overview in `README.md`.

- **Board-to-board link element (`board_link`)** — drop it, pick a board in the **same workspace**, it shows that board's name; clicking opens that board (works in Present view). In the API it's a normal node `{ type:"board_link", data:{ boardId, boardName } }`.
- **Auto-arrange ("tidy layout")** — toolbar button + `POST /api/v1/boards/{id}/arrange`. Deterministic re-flow: title → Persona/Actor cast row → numbered **phase bands** → Action/Decision steps left-to-right → markers/callouts in a right side lane → CTA at end. Tuned so the cast row clears band 1, bands grow to fit, and markers never overlap steps. Idempotent.
- **Arrow editing & routing** — arrows have a wide hit area and render **above** phase/stage lanes (lanes are forced behind edges on every load, so this survives save/reload). Drag either **endpoint** to re-route; select + Delete to remove; selected arrows elevate to front.
- **Card readability** — Action cards collapse **Behaviour** to a compact "+ Behaviour" when empty; the **"⚙️ System"** note auto-grows/wraps (full text, static in Present/export). Phase band titles wrap and show fully (muted placeholder when unnamed).
- **Lane/band z-index** is re-applied by node type at render time (stage/phase = behind, module = behind members) — important if you build boards programmatically: you don't need to set `style.zIndex`, the app handles layering.

## Changelog

### 2026-06 — Board-to-board links
1. **NEW `GET /api/v1/workspaces`** — lists each workspace **with its boards**, so cross-board links can be resolved. → `200 [{ id, name, boards:[{id,name,updatedAt}] }]`.
2. **NEW element type `board_link`** — a node that links to another board in the same workspace. `data: { boardId, boardName }` where `boardId` is the target board's id. Included in board exports and accepted by import (it's now a known type; see `GET /api/v1/elements`). Clicking it in the app opens the target board.

### 2026-06 — Deletes + arrange tuning
1. **NEW `DELETE /api/v1/boards/{id}`** — deletes a board and cascades its nodes/edges/comments; notifies open clients (`board-deleted`, workspace board-list refresh). → `200 { "ok": true, "id": "..." }`, or `404` if not found.
2. **NEW `DELETE /api/v1/workspaces/{id}`** — deletes a workspace **and all its boards**. The default workspace `ws-default` is protected → `400`. → `200 { "ok": true, "id": "...", "deletedBoards": <int> }`, or `404`.
3. **CHANGED behavior (same contract) — `POST /api/v1/boards/{id}/arrange`**: the auto-arrange algorithm was tuned (more clearance between the Persona/Actor cast row and the first phase band; larger persona size estimate; markers/CTA kept in a side lane clear of step cards). **Request and response are unchanged** (`200 { "ok": true, "moved": <int> }`); only the resulting node positions differ (tidier, no overlaps). Still deterministic and idempotent.

> No changes to the request/response shapes of list, export, import, or elements.

### Earlier — initial external API
- Added `GET /boards`, `GET /boards/{id}`, `POST /boards/import`, `POST /boards/{id}/arrange`, `GET /elements`, Swagger docs, and `X-API-Key` auth.
- Export inlines local `/uploads/...` images as base64 `data:` URLs (portable exports).
- Import upserts by id; creating a new board auto-remaps node/edge/comment ids; strict layout validation.

---

## Current endpoint reference

### `GET /api/v1/workspaces`
List workspaces with their boards (for resolving `board_link` targets). → `[{ id, name, boards:[{ id, name, updatedAt }] }]`

### `GET /api/v1/boards[?workspaceId=]`
List boards. → `[{ id, name, workspaceId, updatedAt }]`

### `GET /api/v1/boards/{id}`
Export the full board bundle. → `{ id, name, workspaceId, nodes[], edges[], comments[] }`
Local `/uploads/...` images are returned inlined as base64 `data:` URLs (external `https://` and existing `data:` urls pass through). `404` if not found.

### `POST /api/v1/boards/import`
Upsert a board. Body:
```jsonc
{
  "id": "board-123",          // optional. existing id → REPLACE contents; omit → CREATE new
  "name": "My board",          // required when creating (no id)
  "workspaceId": "ws-...",     // optional; unknown/blank → defaults to "ws-default"
  "nodes": [ /* Node[] */ ],   // required
  "edges": [ /* Edge[] */ ],   // optional
  "comments": [ /* Comment[] */ ], // optional
  "validateOnly": false         // optional; true = validate only, no write
}
```
- Success → `200 { "ok": true, "id", "name", "workspaceId", "created": boolean }`
- Dry run → `200 { "ok": true, "validateOnly": true }`
- Validation failure → `400 { "ok": false, "errors": [string] }` (nothing written)
- Creating a new board auto-remaps node/edge/comment ids (and internal refs: edge source/target, `parentId`, `linkedUserNodeId`) so re-importing an export never collides with the original.

**Validation rules (reject with 400):** every node needs an `id`, a known `type` (see `/elements`), and a finite `position.{x,y}`; `width/height` if present must be positive; every edge `source`/`target` must reference a node in the payload; `parentId` must reference an included node; node ids must be unique.

### `POST /api/v1/boards/{id}/arrange`
Deterministically tidy the board layout (title → cast row → numbered phase bands → steps → markers/callouts → CTA), no overlaps. Open clients refresh live. → `200 { "ok": true, "moved": <int> }`, `404` if not found.

### `DELETE /api/v1/boards/{id}`  *(new)*
Delete a board (cascades nodes/edges/comments). → `200 { "ok": true, "id" }`, `404` if not found.

### `DELETE /api/v1/workspaces/{id}`  *(new)*
Delete a workspace and all its boards. `ws-default` is protected. → `200 { "ok": true, "id", "deletedBoards": <int> }`, `400` for default, `404` if not found.

### `GET /api/v1/elements`
Element catalog + layout rules. → `{ handles[], emotions[], layout{}, elements[] }`
Each element entry: `{ type, category, label, description, data:[{name,type,description,enum?,optional?}], defaultSize? }`.

---

## Data shapes

**Node**
```jsonc
{
  "id": "n1",
  "type": "action",            // one of the known types (GET /elements)
  "position": { "x": 0, "y": 0 },
  "width": 240,                 // optional
  "height": 210,                // optional
  "parentId": "mod1",          // optional (nest inside a group_module)
  "data": { /* per-type fields, see /elements */ }
}
```

**Edge**
```jsonc
{
  "id": "e1",
  "source": "n1",
  "target": "n2",
  "type": "flag",              // optional; "flag" = decision Yes/No branch
  "sourceHandle": "r",         // optional: one of t,r,b,l,tl,tr,bl,br
  "targetHandle": "l",         // optional
  "data": { "branch": "true" } // for flag edges: "true" (green Yes) | "false" (red No)
}
```

**Comment**
```jsonc
{ "id": "c1", "nodeId": "n1", "author": "Name", "content": "text",
  "position": { "x": 0, "y": 0 }, "createdAt": "ISO" }
```

---

## Notes for integrators
- A valid key has **full read/write/delete** to any board/workspace (machine trust) — keep `API_KEY` secret; rotate via `.env`.
- Deletes are **destructive and cascade**; there is no soft-delete/undo.
- Recommended round-trip: **export → modify → import** (don't hand-build coordinates; export carries the full layout).
- The human app endpoints (`/api/boards`, `/api/workspaces`, `/api/auth/*`) are separate and use the Admin/invite bearer token — **not** part of `/api/v1`.
