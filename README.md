# JourneyCanvas — Collaborative User & Application Journey Mapping

A real-time collaborative canvas for Product Owners, BAs, and engineers to map a
**User Journey** side-by-side with its **Application Journey**, then use AI to
generate the system layer, clean up the layout, and export a developer-ready
**System Architecture Matrix**.

Built with React + `@xyflow/react` (React Flow v12) on the front end, an Express +
Socket.io + SQLite back end, and Google Gemini for the AI features (with offline
mock fallbacks so the app is fully usable without an API key).

---

## Feature status

This reflects what the code actually does today, not just intentions.

| Area | Status | Notes |
| --- | --- | --- |
| Basic auth (single Admin) | ✅ | Fixed Admin account from `.env` (`ADMIN_USER`/`ADMIN_PASSWORD`, default `Admin`/`12345`); all APIs + sockets require a valid token |
| Workspaces → Boards | ✅ | Boards are grouped under workspaces; switch/create/delete workspaces (Admin); existing boards migrate into a default "My Workspace" |
| Scoped, expiring invite links | ✅ | Admin shares a manual link to a **specific workspace** (manage its boards) or a **single board** — never "all". Invitee picks a display name; link **activates on first open then expires in 12h** with a live countdown; one link works for many people in that window |
| Roles & permissions | ✅ | Members edit/create within their scope; only the Admin deletes boards/workspaces and creates invite links |
| External API + Swagger | ✅ | Machine API under `/api/v1` (X-API-Key auth) to **list, export, and import (upsert) boards** + an **element catalog** (`/api/v1/elements`); interactive docs at **`/api/docs`**. Import is strictly validated to prevent broken layouts |
| EdTech palette + Persona/Goal card | ✅ | Education actors (Teacher, Student, Parent, School Admin, Academic, Content Author) & learning/teaching actions; a "Persona / Goal" card to anchor discovery |
| Custom actors & actions | ✅ | "Other / Custom" lets users name an actor/action not in the presets; the typed name becomes its stored type/value |
| Decision element (diamond) | ✅ | Flowchart diamond with dots on all sides; connect from any dot then **flag the edge Yes (green) / No (red)** by clicking its pill; flags persist |
| Slim Actor/Action cards | ✅ | Cards show one `Actor/Action: <Type>` title (click it to change type) + Behaviour; name/sentiment/tags/references/comments live in the Expand overlay |
| Actor-on-Action (multiple) | ✅ | An Action shows who performs it — multiple actors via linked Actor nodes (by edge), a dropdown to add existing actors, and/or typed names (removable chips); a red **!** if none set |
| Discovery journey-mapping | ✅ | **Stage/phase** color columns, per-step **sentiment** (😀–😞), and **Pain Point / Opportunity** markers |
| Light "whiteboard" theme | ✅ | FigJam/Miro-style: off-white dot-grid canvas, white element cards, dark connector lines |
| View modes: User Journey / Application Journey / Dual-Layer | ✅ | Defaults to **User Journey**; Dual-Layer shows two separated lane bands (User top, Application bottom); hidden relationships preserved |
| Drag-and-drop nodes + relational edges | ✅ | Connect from **any of 8 anchors** (4 sides + 4 corners); any-to-any (loose mode); anchors persisted; dark edge lines |
| Individual element resize | ✅ | Every element — incl. pasted images & Module containers — resizes via handles when selected; size saved & synced |
| Focused element editor (Expand) | ✅ | Every element has an Expand button opening a modal overlay to edit its attributes; inline editing still works; position unchanged on close |
| Application Journey as a Screen Map | ✅ | Screens (compact at rest; ⚙️/📦/🔔 chips when selected) joined by small **Action pills** (screen → action → screen); a revisit points the action back to the existing screen — no duplicate screens |
| Real-time collaboration (nodes, edges, cursors) | ✅ | Socket.io; cursors/comments track pan & zoom |
| Presenter / Follow-Me mode | ✅ | Followers mirror the presenter's viewport **and any element overlay the presenter opens** (live edits included); each viewer has an independent **Follow/Unfollow** toggle |
| Per-element comment threads | ✅ | Every node has its own bulleted comment thread with a count badge |
| Per-element behaviour + references | ✅ | Each step has a collapsible **Behaviour** field and a **References** editor (link a screen / app / process / element / URL) |
| **@mention notifications** | ✅ | Type `@name` in a comment; mentioned users get an in-app alert |
| **Cross-layer Module containers (real nesting)** | ✅ | Drop a node inside a Module and it becomes a member; moving the Module moves its members. Persisted via `parent_id` |
| Multi-dimensional tagging | ✅ | `#tags` on any node |
| Global visual search (text / tags / comments) | ✅ | Pans & zooms to the match |
| Undo / redo | ✅ | `⌘/Ctrl+Z` and `⌘/Ctrl+Shift+Z` (or `Ctrl+Y`), plus toolbar buttons |
| Save & re-open boards | ✅ | Auto-saves (debounced) on every meaningful change, **including drags** |
| **High-res export** | ✅ | PNG/JPG, **full canvas** or current view; editing chrome hidden in the image |
| Presentation view | ✅ | "Present view" toggle: clean export-ready theme — hides chrome, static-text fields, right-angle connectors, dark decision diamonds with green/red Yes/No |
| Auto-arrange (tidy layout) | ✅ | One-click **Auto-arrange** button re-flows the board into clean phase bands (title → cast row → numbered bands → steps → markers/callouts → CTA) with no overlap, spacing by real card sizes. Also available headless via `POST /api/v1/boards/{id}/arrange` |
| Link to another board | ✅ | "Link to board" element: pick a board in the **same workspace**; click to open it (works in present mode). API: `board_link` node + `GET /api/v1/workspaces` |
| Edit / re-route arrows | ✅ | Click an arrow to select (wide hit area; sits above phase lanes), drag an endpoint to re-route, Delete to remove |
| Title banner + Phase bands | ✅ | Title/subtitle banner and horizontal numbered Phase bands (color-coded) for presentation-style maps |
| Step number + System line on Actions | ✅ | Optional step-number badge and "⚙️ System" response line per action (infographic-style "Teacher:/System:" cards) |
| Notes / Callouts + Call-to-Action nodes | ✅ | Dashed color-coded **Note/Callout** boxes (bullet points) for annotations, and filled **Call-to-Action / end** buttons to close a journey |
| **Image paste & drag-and-drop** | ✅ | Paste a screenshot (`⌘V` / `Ctrl+V`) or drag image files from Finder/Explorer onto the canvas; lands at the cursor |
| Clone / partial copy (preserves linkages) | ✅ | `Ctrl/Cmd+C` / `V` |
| EdTech starter templates | ✅ | One-click prebuilt journeys in the **presentation/banded** style (title + phase bands + numbered steps with system notes + markers/callouts/CTA): **⭐ All Elements Showcase** (uses every element incl. an app-screen lane), Student Onboarding, Teacher Assigns & Grades (decision + redo loop), Live Class (rejoin loop), Arena Engagement |
| Copy / duplicate a board | ✅ | Copy button on each board deep-copies it (nodes, edges, flags, comments, groupings) into a new named board |
| AI: Build App Lane | ✅ | Generates the Application Journey as a connected left-to-right flow; each block shows a friendly "Serves: Actor · Action" caption (also editable for manually-built blocks) |
| AI: Orchestrator → clean layout + Matrix | ✅ | Outputs a markdown architecture matrix |
| AI: image OCR / sketch digitizer | ❌ Disabled | Out of current scope. The server endpoint (`/api/ai/ocr`) still exists but is not wired into the UI |
| Image annotation (labels/threads on images) | ⚠️ Partial | Images can be placed anywhere via paste/drag; text labels & comment threads anchored on an image are not yet implemented |

⚠️ items are known gaps, listed in [Roadmap](#roadmap).

---

## Tech stack

- **Frontend:** React 18, `@xyflow/react` v12, Zustand, Vite, lucide-react
- **Backend:** Node.js, Express, Socket.io
- **Storage:** SQLite (file-based, zero-config)
- **AI:** Google Gemini (`@google/generative-ai`) — optional

## Project structure

```
journey_tool/
├── src/                  React client
│   ├── App.jsx           Header, search, export menu, mention bell
│   ├── store/useStore.js Zustand store + Socket.io client + persistence
│   ├── components/       Canvas, Sidebar, node types, MatrixModal
│   └── styles/global.css Design system
├── server/
│   ├── index.js          Express REST API + Socket.io server
│   ├── db/sqlite.js       SQLite connection, schema & migrations
│   └── services/gemini.js Gemini calls + offline mock fallbacks
├── uploads/              Uploaded board images (created on first upload)
├── database.sqlite       SQLite data file (created on first run)
└── vite.config.js        Dev server + /api & /socket.io proxy
```

---

## Getting started

### Prerequisites

- **Node.js 18+** and npm (check with `node -v`)
- A **Google Gemini API key** is optional — the app falls back to mock AI output without one.

### 1. Clone & install dependencies

```bash
git clone https://github.com/sitthi-phat/journeycanvas.git
cd journeycanvas
npm install
```

> The repo ships **without** a database or uploads — both are created automatically on
> first run. Copy `.env.example` to `.env` to configure secrets (see next step).

### 2. Configure the AI key (optional)

The Gemini features work with a key, and **gracefully fall back to mock output
without one** — so this step is optional for local development.

Create a `.env` file in **this `journey_tool/` folder**. See [`.env.example`](.env.example) for all keys:

```env
GEMINI_API_KEY=your_real_key_here

# Basic auth (single Admin account)
ADMIN_USER=Admin
ADMIN_PASSWORD=12345
ADMIN_LABEL=Admin
AUTH_SECRET=change-me-to-a-long-random-string
ADMIN_SESSION_HOURS=24
INVITE_TTL_HOURS=12
```

**Accounts & sharing:** open the app → sign in as **Admin** (`Admin`/`12345` by default).
Boards live under **Workspaces**. To bring others in, click **Share** on a workspace
(they can manage all its boards) or on a single board (that board only). Send them the
link; on first open it asks for their display name and starts a **12-hour** countdown,
after which the link expires. One link can be used by several participants in that window.

If the key is missing or left as a placeholder (`your_gemini_api_key_here`), the
server logs a warning and serves deterministic mock AI responses.

### 3. Run in development

Runs the API/Socket server and the Vite client together:

```bash
npm run dev
```

- Client: http://localhost:5173
- API/Socket server: http://localhost:5001 (the client proxies `/api` and `/socket.io` to it)

### 4. Build & run production

```bash
npm run build
npm start
```

Then open http://localhost:5001 — the Express server serves the built client from `dist/`.

---

## Usage notes

- **Create a board** from the sidebar, then drag elements from the palette onto the canvas.
- **Start with a Persona:** drag the *Persona / Goal* card out and capture who the journey is for
  (e.g. a Grade 5 Teacher), their goal, and their pain points — then add **Actors** (Teacher,
  Student, Parent, School Admin, …) and their **Actions** (access content, take assessment, grade, …).
- **Map the journey as a story:** drop **Stage** columns across the top (Discover → Enroll →
  Daily learning → Assessment → Outcome), set each Action step's **sentiment** (😀–😞), and drop
  **Pain Point / Opportunity** markers where they belong.
- **Build the app side as a screen map:** drop *Screen / App Step* cards (click to expand and fill logic ⚙️ /
  data 📦 / notifications 🔔), and connect them with small *Action* pills (e.g. "Submit", "Resubmit"):
  screen → action → screen. To revisit a screen, point the action **back to the existing screen** (don't duplicate it).
- **Connect elements:** hover an element to reveal connection dots on all sides and corners;
  drag from any dot to any other element's dot.
- **Edit arrows:** click an arrow to select it (it has a wide, easy-to-grab hit area and pops above
  phase bands), then press Backspace/Delete to remove it. To **re-route** an arrow, drag either
  endpoint onto a different element/dot.
- **Link to another board:** drag out a *Link to board* element, pick a board in the same workspace,
  and click the link to open that board (works in Presentation view too).
- **Resize elements:** click an element to select it, then drag the resize handles on its border.
- **Group with Modules:** drag a Module container out, then drop nodes inside it — they
  become members and move/resize with it.
- **Collaborate:** open the same board in another browser/tab; cursors, edits, comments,
  and presenter mode sync live. When someone presents, use the **Follow/Unfollow** toggle to
  detach from or rejoin their view.
- **Kick off fast:** add a prebuilt journey from **Starter Templates · EdTech** in the sidebar, then adapt it.
- **Describe & reference an element:** each step has a *Behaviour* toggle (what happens here) and a
  *References* toggle to link it to a captured screen, app, process, element, or URL.
- **Comment on an element:** each node has a *Comments* toggle that opens a bulleted thread —
  add, read, and delete comments right on that element.
- **Mention teammates:** in any comment, type `@TheirName`. They see a badge on the bell icon.
- **Add images:** paste a screenshot (`⌘V` on macOS, `Ctrl+V` on Windows) anywhere over the
  canvas, or drag image files in from Finder/Explorer. They drop at the cursor and behave like
  any other node (drag, tag, drop into a Module).
- **Export:** use the Export menu for full-canvas or current-view PNG/JPG.
- **AI:** draft the user journey, then *AI Build App Lane*; when done, *AI Orchestrator*
  cleans the layout and produces the architecture matrix.

## External API (for other systems)

A versioned, machine-facing API lets other systems pull and push boards. **Full contract + changelog: [API_CHANGELOG.md](API_CHANGELOG.md).**

- **Auth:** set `API_KEY` in `.env`; send it as the **`X-API-Key`** header. (Leave `API_KEY` blank to disable the API → `503`.)
- **Docs:** open **`http://localhost:5001/api/docs`** for interactive Swagger UI (use **Authorize** to enter the key).
- **Endpoints** (under `/api/v1`):
  - `GET /workspaces` — list workspaces with their boards (resolves cross-board links).
  - `GET /boards` — list boards (optional `?workspaceId=`).
  - `GET /boards/{id}` — export the full board bundle `{ id, name, workspaceId, nodes, edges, comments }`. **Local uploaded images are inlined as base64 `data:` URLs** so the export is self‑contained and portable across servers (external `https://` and existing `data:` urls are left as‑is).
  - `POST /boards/import` — **upsert** a board (same JSON shape). Pass an existing `id` to replace that board's contents; **omit `id` (and include a `name`) to create a new board** — node/edge ids are auto‑remapped so re‑importing an export never collides with the original. `validateOnly: true` does a dry‑run.
  - `POST /boards/{id}/arrange` — **auto-arrange (tidy)** the board layout deterministically (no overlap); open clients refresh live.
  - `DELETE /boards/{id}` — delete a board (cascades nodes/edges/comments).
  - `DELETE /workspaces/{id}` — delete a workspace **and all its boards** (the default workspace is protected).
  - `GET /elements` — the **element catalog**: every element type, its `data` fields, connection handles, and layout rules.
- **Layout safety:** import is validated strictly — unknown node `type`, missing/non-finite `position`, edges pointing at missing nodes, or bad `parentId` are rejected with `400` and a precise `errors[]`, and nothing is written. Because export returns the exact import shape, the safe pattern is **export → modify → import**.

## Roadmap (known gaps)

- Text labels / comment threads anchored directly on images.
- Re-enable the AI OCR / sketch digitizer (currently disabled, out of scope).
- Optionally hard-enforce the "every app block must link to a user step" constraint.

## Known limitations

- Real-time node sync broadcasts the full node set on change — fine for small teams/boards,
  not optimized for very large boards.
- The board save strategy replaces all nodes/edges per save (simple, but not incremental).
