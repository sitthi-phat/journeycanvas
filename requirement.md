---

# Product Requirement Document (PRD) - Ver. 1.3 (Implementation-Aligned)

## Project Name: Collaborative User & Application Journey Tool

## Target Tech Stack (Phase 1): React JS (Frontend), Node.js API (Backend), Local DB (Storage)

> **About this version (1.3):** Ver 1.2 described the intended product. Ver 1.3 keeps
> that vision but annotates every requirement with what is **actually implemented in the
> current codebase**, and records scope decisions made during build. See the legend below.
>
> **Status legend:** ✅ Implemented · 🟡 Partial / differs from original spec · ⏸️ Disabled / out of current scope · ⬜ Not yet built

---

## 1. Product Concept & Vision

A collaborative digital canvas designed to bridge the gap between business requirements and technical design. The tool enables Product Owners (PO), Business Analysts (BA), Users, and Requirement Owners to visually brainstorm, drag-and-drop, and map out a **User Journey** in parallel with an **Application Journey**. It eliminates backend technical complexities for business users, utilizing an AI-powered engine to clean, orchestrate, and compile raw brainstorming elements into a structural, ready-to-develop Final Diagram and Matrix.

The interface uses a **light "whiteboard" visual style** (FigJam/Miro-like) — a soft off-white canvas with a dot grid, white element cards, and dark connector lines.

**Domain & Audience (EdTech):** The tool is used to co-discover new application solutions between two groups — a **Tech team** (PO, BA, UX) and a non-technical **Business team / Users** (Teachers, Academics). The User Journey is the shared, jargon-free starting point: actors are real education roles (Teacher, Student, Parent/Guardian, School Admin, Academic/Curriculum Lead, Content Author) and actions are learning/teaching tasks. The objective is to **clarify the vision of usage first** with users, before the Tech team derives the Application Journey.

---

## 2. Core Constraints & Guiding Principles

* **Strict Linkage** — 🟡 *Expressed as context, not enforced.* Each Application Journey screen carries a human-readable **"Serves: Actor · Action"** caption tying it to the user journey (AI-filled or hand-typed); an optional `linkedUserNodeId` is also kept for traceability. The tool does not hard-block unlinked screens.
* **No Technical Complexity** — ✅ The Application Journey is screen-centric (see §4) with logic/data/notifications shown as plain-language chips; no API/SQL/REST jargon is exposed.
* **Flexible Image Placement** — ✅ Images are free-roaming canvas objects that can be placed anywhere across both layers and individually resized.

---

## 3. Feature Specifications

### 3.0 Accounts, Workspaces & Sharing *(New)*
* **Workspace → Board hierarchy** — ✅ Boards are grouped under **Workspaces**. A workspace switcher in the sidebar scopes the board list; the Admin can create/delete workspaces. Boards created before this feature are migrated into a default **"My Workspace"**.
* **Basic authentication** — ✅ A single fixed **Admin** account read from `.env` (`ADMIN_USER`/`ADMIN_PASSWORD`, defaults `Admin`/`12345`; display label `ADMIN_LABEL`, default `Admin`). All REST APIs and the Socket.io connection require a valid signed token; unauthenticated requests get `401`.
* **Manual, scoped invite links** — ✅ The Admin shares a link to **one specific workspace** (invitee can manage all of its boards) or **one specific board** (that board only) — there is **no "share everything"** option. The invitee is **prompted for their own display name** on first open.
* **Activation & expiry** — ✅ A link is dormant until first opened; on first open it **activates and expires 12 hours later** (`INVITE_TTL_HOURS`). The invitee sees a **live countdown**; the app auto–signs-out at expiry. One link is **multi-use** within the window (each visitor names themselves).
* **Roles** — ✅ **Members** can open/create/edit boards within their scope; **only the Admin** deletes boards/workspaces and generates invite links.

### 3.0b External API & Swagger *(New)*
* **Machine API (`/api/v1`)** — ✅ Lets other systems integrate. Authenticated by a static **`X-API-Key`** header (`API_KEY` in `.env`; blank disables it → `503`). Endpoints: `GET /boards` (list), `GET /boards/{id}` (export full bundle), `POST /boards/import` (**upsert** by id — replace if exists, else create; `validateOnly` for dry-run), `POST /boards/{id}/arrange` (auto-arrange), `DELETE /boards/{id}` (delete board, cascades), `DELETE /workspaces/{id}` (delete workspace + all its boards; default workspace protected), `GET /elements` (element catalog + layout rules).
* **Link to another board** — ✅ *(New)* A **Link to board** element: drop it, pick any board in the **same workspace**, and it shows that board's name. Clicking the link **opens that board** (works in Presentation view too). Exposed in the API as a `board_link` node (`data.boardId` / `boardName`); `GET /api/v1/workspaces` lists workspaces with their boards so links can be resolved externally.
* **Arrow editing & routing** — ✅ *(New)* Arrows (edges) have a **wide, easy-to-grab hit area** and render **above phase/stage lanes** — lane z-index is re-applied on every load so arrows crossing a lane stay selectable even after save/reload. Drag either **endpoint** to **re-route** an arrow to a different element/connection dot; select + Backspace/Delete to remove; a selected arrow elevates to the front.
* **Card readability** — ✅ Action cards collapse the **Behaviour** field to a compact "+ Behaviour" when empty (less wasted height), and the **"⚙️ System"** note auto-grows/wraps to show long text in full (static in Present/export). Phase band titles wrap and show fully with a muted placeholder when unnamed.
* **Auto-arrange (tidy layout)** — ✅ *(New)* A one-click **Auto-arrange** toolbar button deterministically re-flows the presentation layer into clean phase bands (title → Persona/Actor cast row → numbered bands → Action/Decision steps left-to-right → markers/callouts in a side lane → CTA at the end), spacing everything by its **real measured size** so cards never overlap and bands grow to fit. Also exposed headless at `POST /api/v1/boards/{id}/arrange` (size estimates). Geometry is rule-based (not AI) for reliable, repeatable results; runnable repeatedly (idempotent).
* **Swagger UI** — ✅ Interactive docs at **`/api/docs`** describing every endpoint, the element types/`data` fields, connection handles, and layout conventions, with an **Authorize** button for the API key.
* **Round-trip & layout safety** — ✅ Export returns the exact shape import accepts (recommended flow: *export → modify → import*). Import is **strictly validated before any write** (known node `type`, finite `position`, edges referencing existing nodes, valid `parentId`, unique ids); failures return `400` + `errors[]` and write nothing — preventing broken/overlapping layouts. Imports also live-update connected clients and workspace board lists.

### 3.1 Canvas & Workspace

* **Flexible Layout Modes (View Switching)** — ✅ Three header toggles, **defaulting to User Journey**:
  1. **User Journey:** shows only user personas/actions (plus images). *(default)*
  2. **Application Journey:** shows only system blocks (plus images).
  3. **Dual-Layer View:** shows both, split into two clearly separated lane bands — **User Journey (top)** and **Application Journey (bottom)** — divided at the boundary between the layers so content does not overlap. Band labels are anchored to each lane's corner.
  Hidden relationships are preserved in state and reappear when the view is restored.

* **Drag-and-Drop Infrastructure** — ✅ Relational lines link elements. **Connection anchors are available on all four sides and all four corners** of every element (8 points), and connections can be drawn from any anchor to any anchor (loose connection mode). The chosen anchors are persisted across reloads. Connector lines render in **dark/near-black**. Cross-view relationships are retained even when a lane is hidden.

* **Element Resizing** — ✅ *(New in 1.3)* Every element — actor, action, the four app blocks, images, and module containers — can be **individually resized**. Resize handles appear when an element is selected; sizes are saved and synced to collaborators.

* **Focused Element Editor (Expand)** — ✅ *(New in 1.3)* Every element has an **Expand** control in its header — or **double-click the element** — to open a centered **modal overlay** to review and edit its attributes with full focus (double-click also works in Presentation view, where the Expand button is hidden). Inline editing on the node still works; expanding is optional. Closing the overlay leaves the element's **position on the board unchanged**, with updated content.

* **Anywhere Image Upload & Placement** — 🟡
  * ✅ Users can **paste a screenshot** (`⌘V` / `Ctrl+V`) or **drag image files from Finder/Explorer** directly onto the canvas; images land at the cursor and are free-roaming and resizable.
  * ⬜ Text labels / comment threads anchored *directly on* an image are not yet implemented (images do have a per-element comment thread like any other node — see §3.4).

* **Real-time Collaboration:**
  * ✅ Multiplayer workspace (nodes, edges, comments, and live cursors sync via Socket.io).
  * **Follow Me (Presenter Mode)** — ✅ A presenter broadcasts their pan/zoom; viewers mirror it. *(New in 1.3)* Each viewer has an independent **Follow / Unfollow toggle** to detach from and re-attach to the presenter's view. Starting a presentation is only offered when no one else is presenting. *(Phase C)* Followers also mirror **any element overlay the presenter opens or closes**, including the presenter's live edits inside it, so the room stays focused on the same element.
  * **Comment & @Mention Pipeline** — ✅ (delivered as **per-element comment threads**, see §3.4) Typing `@name` in a comment notifies that user via an in-app bell with an unread badge.

* **File & Board Management:**
  * **Undo / Redo** — ✅ *(New in 1.3)* Multi-step undo/redo of canvas changes (add, delete, move, resize, connect, edit, paste, templates) via `⌘/Ctrl+Z` and `⌘/Ctrl+Shift+Z` (or `Ctrl+Y`), plus toolbar buttons. History resets per board.
  * **Save & Re-open** — ✅ Boards auto-save (debounced) on every meaningful change **including node drags and resizes**, persisted to a local SQLite database. Multiple named boards can be created, reopened, and deleted from the sidebar.
  * **High-Res Export** — ✅ Export the **current view** or the **entire canvas** as **`.png` or `.jpg`** (white background) from the Export menu. Editing chrome (handles, resize dots, controls) is hidden in the exported image.
  * **Presentation View** — ✅ *(New in 1.3, Phase A)* A **Present view** toggle that applies a clean, export-ready theme: hides editing chrome and "+ add" controls, renders fields as static text, draws connectors as **right-angle (smooth-step)** lines, and styles **Decision diamonds dark with white text** + **green "Yes" / red "No"** branch labels. Aimed at review and producing a polished exported diagram.

### 3.2 Template, Clone & Reuse

* **Journey Cloning / Partial Copy** — ✅ Select elements and copy/paste (`⌘/Ctrl+C` then `V`); user→app linkages and edges are remapped and preserved.
* **Starter Templates (EdTech)** — ✅ *(Revised — Phase C)* Prebuilt one-click journeys authored in the **presentation / banded** style (Title banner → cast row of Persona + Actors → horizontal **Phase bands** of **numbered Action steps** each with a *⚙️ System* line → Pain/Opportunity markers, Note callouts, and a **Call-to-Action** end node):
  * **⭐ All Elements Showcase** — exercises *every* element type, including a **Decision** with Yes/No branches + redo loop and an **Application-Journey screen lane** (screens + transition pills inside a Module).
  * **Student Onboarding** — clean linear user journey with a callout and CTA.
  * **Teacher Assigns & Grades** — Decision + Yes/No branches + redo loop + pain marker.
  * **Live Class Session** — rejoin loop for dropped students.
  * **Arena Engagement** — hook → engage → interact → celebrate, with markers + CTA.
  Most templates seed the user side; click **AI Build App Lane** (or build screens manually) to add the Application Journey — except the Showcase, which already includes a sample app lane.
* **Copy Board** — ✅ *(New in 1.3)* Duplicate any board into a new one (prompts for a name). The server deep-copies all nodes, edges (incl. flags), comments, groupings, and links with fresh ids, then opens the copy. (Replaces the earlier browser-only "reusable templates" feature, which was removed.)

### 3.3 Ready-to-use Object Palette

A sidebar of standardized, **education-domain** drag-and-drop components, ordered to guide a discovery session — start with a persona, then map who acts and what they do:

* **Persona / Goal card** — ✅ *(New in 1.3)* A "start here" card capturing the persona name, role, **goal / job-to-be-done**, and **pain points / context**, to anchor the journey before steps are drawn.
* **Actors** — ✅ Education personas: `Teacher`, `Student`, `Parent / Guardian`, `School Admin`, `Academic / Curriculum Lead`, `Content Author`, plus `External System` for integrations. Each actor node's role can also be switched via a dropdown. An **Other / Custom** option lets users name an actor not in the list (e.g. *Teaching Assistant*); the typed name is stored as the actor's type/value, at the same level as the presets.
* **Actions** — ✅ Learning/teaching verbs: `Access / Log in`, `View Lesson / Content`, `Watch Video`, `Take Quiz / Assessment`, `Submit Assignment`, `Grade / Give Feedback`, `Assign / Set Task`, `Track Progress`, `Share`, `Discuss / Comment`, plus **Other / Custom** for naming an action not in the list (the typed name is stored as the action's type/value).
* **Decision** — ✅ *(New in 1.3)* A standard flowchart **diamond** with connection dots on every side. Connect out from **any dot** to the next element, then click the pill on that edge to **flag it Yes (green) / No (red)** — the line turns the matching colour. Flags persist.
* **Slim cards** — ✅ *(New in 1.3)* Actor & Action cards show just the **`Actor/Action: <Type>`** title (no duplicated name/dropdown) plus **Behaviour** (shown by default). **Click the title** to change the type inline (with a textbox when **Other**). Sentiment, name/description, tags, references, and comments live in the **Expand** overlay.
* **Step number & System line** — ✅ *(Phase 2)* Each Action can carry a **step number** badge and a **"⚙️ System"** response line on the card (and in the overlay), matching the "Teacher: … / System: …" style of a presentation flowchart.
* **Actor-on-Action** — ✅ *(New in 1.3)* Each Action shows *who performs it* and supports **multiple actors**, from any mix of: **Actor nodes linked by edges** (shown automatically as "· linked"), **existing actors picked from a dropdown**, and **typed names**. Each added actor is a removable chip; if none is set, a red **!** flags the action. So you can model actors explicitly when you want detail, or just name one (or several) on the action.
* **Modules & Features (Cross-Layer Containers)** — ✅ Boundary boxes denote business domains (e.g. Authentication, Assessment, Enrollment). *(New in 1.3)* Module nesting is **real**: dropping an element inside a module makes it a member, and moving/resizing the module moves its members together; membership persists across reloads.

### 3.4 Taxonomy, Comments & Search

* **Multi-Dimensional Tagging** — ✅ Attach multiple `#tags` to any element.
* **Per-Element Behaviour & Comments** — ✅ *(Changed in 1.3)* Every step element (Actor, Action, App block) has:
  * a collapsible **Behaviour** field describing what happens / the expected behaviour, and
  * a **References** editor to link the step to a **captured screen, application, process, another element, or a URL** (typed chips), and
  * its own **bulleted comment thread** with a count badge for discussion (`@mentions` supported — see §3.1).
  (The per-element thread replaces the earlier free-floating "pin a comment on the canvas" interaction, which was removed.)
* **Global Visual Search & Filter** — ✅ A search bar queries element labels, `#tags`, and comment text; selecting a result pans and zooms the canvas to that element. *(OCR text is no longer indexed — see §3.5.)*

### 3.5 AI Orchestration & Automation

* **AI Build App Lane (Auto-Generate)** — ✅ *(Improved in 1.3)* The Application Journey **mirrors the User Journey 1:1**: the app creates **one screen per user action** and connects them in the **same order as the user-journey edges** (so it can never merge or mis-wire steps), with small **Action pills** between screens (`screen → action → screen`) and **loop-backs only where the user journey itself loops**. The AI is used only to *name* each screen and fill its logic/data/notification chips and **"Serves: Actor · Action"** caption; the app decides the structure & layout deterministically (clean left-to-right lane, loop pills dropped below, containers grown to wrap it).
* **Manual Application Journey** — ✅ Users build the Screen Map by hand too: add a Screen / App Step, fill its chips, and draw arrows between screens. To show a revisit, draw an arrow **back to the existing screen** rather than duplicating it.
* **Smart Image OCR & Digitizer** — ⏸️ **Disabled / out of current scope.** The UI entry point has been removed. The server endpoint (`/api/ai/ocr`) and the Gemini OCR function still exist but are not wired into the app, so re-enabling later is straightforward.
* **AI Orchestrator & Final Summary (Core Feature)** — ✅
  * The AI cleans up the layout (re-positions nodes into tidy User/App lanes).
  * It outputs a structured **System Architecture Matrix Table** grouped by Module/Feature, Actor, User Action, and System Response, rendered in a modal and copyable as Markdown.
* **AI availability** — All AI features call Google Gemini when a `GEMINI_API_KEY` is configured, and **fall back to deterministic mock output** when it is missing, so the app is fully usable offline.

### 3.6 Discovery Journey-Mapping *(New in 1.3)*

Turns the canvas from a flow diagram into a true discovery journey map, capturing the human context that aligns the Tech and Business teams on the vision:

* **Title / Banner** — ✅ *(Phase 2)* A heading + subtitle element for the top of a presentation map.
* **Note / Callout & Call-to-Action** — ✅ *(Phase C)* A dashed, color-coded **Note/Callout** box with bullet points (e.g. *Validation rules*, *Handoff only*) for annotations, and a filled **Call-to-Action / end** button (e.g. *Go to Aksorn Collection*) to close a journey. Both connect to other elements, resize, and render cleanly in Presentation view.
* **Stages / Phases** — ✅ Two band styles: vertical **Stage columns** and horizontal **Phase bands** (numbered badge + title + description on the left, like the infographic). Both have a cyclable color, sit behind the elements, span every view, and are resizable. Their wrappers are click‑through (only the header/resize handles are interactive) so elements and edge labels placed on top stay clickable.
* **Sentiment / Emotional curve** — ✅ Each Action step can carry a sentiment marker (😀 🙂 😐 🙁 😞), shown as a badge on the step, to capture how the user feels at that moment.
* **Pain Point & Opportunity markers** — ✅ Drag-in annotation cards (red **Pain Point** / amber **Opportunity**, toggleable) with free text, used to flag problems and ideas against specific steps. They are **discovery insights shown in the User Journey & Dual views only** (hidden in the Application-Journey view to keep it technical), and carry their own comment thread.

---

## 4. Simplified Application Elements

*(Restructured in 1.3 — screen-centric.)* The Application Journey is a flow of **Screen / App Step** cards (📺). Everything a screen *does* is captured as attributes **inside** that screen rather than as separate nodes, so the diagram reads as a friendly journey instead of a dense grid:

* **Screen / App Step (📺):** A state the user lands on (e.g., *Login screen*). The single Application Journey element.
* On each screen, as editable chips:
  * **System Logic / Checks (⚙️):** rules and validations run there (e.g., *Verify login*).
  * **Data Remembered (📦):** information retained there (e.g., *Save session*).
  * **Notifications Sent (🔔):** outbound messages from there (e.g., *Welcome email*).
* Each screen also shows a friendly **"Serves: Actor · Action"** caption.

The Application Journey reads as a **Screen Map**: screens are connected through small **Action pills** (a `transition` element, e.g. *Submit*, *Resubmit*) that name what moves the user on — `screen → action → screen`. A **revisit points the action back** to the existing screen, so a screen is never duplicated. Screen cards stay **compact at rest** (only filled behaviours show) and expand to full editors when selected.

> Backward compatibility: older boards that used standalone `logic` / `storage` / `notification` blocks still render; new work uses the screen-centric model.

---

## 5. Technical Specifications (Phase 1)

* **Frontend** — ✅ **React 18** with **`@xyflow/react` (React Flow v12)** for node-based rendering, dynamic vector edges, multi-anchor connections, node resizing, and free-form image placement. State via **Zustand**; build/dev via **Vite**; icons via **lucide-react**.
* **Backend API** — ✅ **Node.js + Express** REST endpoints for board/node/edge/comment CRUD and image upload, plus **Socket.io** for real-time sync (nodes, edges, cursors, comments, presenter view, mentions).
* **Storage (Local DB)** — ✅ **SQLite** (file-based, zero-config) with `boards`, `nodes`, `edges`, and `comments` tables. Node `parent_id` (module nesting) and edge connection anchors are persisted.
* **AI** — ✅ Google Gemini via `@google/generative-ai`, optional, with offline mock fallbacks.

---

## 6. Implementation Status Summary

| Requirement | Status |
| --- | --- |
| 3 view modes (Dual / User / App) | ✅ |
| Multi-side + corner connection anchors, dark edges | ✅ |
| Individual element resize (incl. images) | ✅ |
| Real-time collaboration (nodes/edges/cursors/comments) | ✅ |
| Presenter "Follow Me" + per-viewer Unfollow toggle | ✅ |
| Per-element comment threads + @mention notifications | ✅ |
| Image paste & drag-drop from file explorer | ✅ |
| Undo / redo (multi-step, hotkeys + buttons) | ✅ |
| Save & re-open (auto-save incl. drag/resize) | ✅ |
| High-res export — PNG/JPG, full canvas or current view | ✅ |
| Clone / partial copy preserving linkages | ✅ |
| Tagging + global search (labels/tags/comments) | ✅ |
| Cross-layer Module containers with real nesting | ✅ |
| AI auto-generate app layer | ✅ |
| AI Orchestrator → clean layout + Architecture Matrix | ✅ |
| Screen-centric Application Journey (logic/data/notifications as chips) | ✅ |
| Light "whiteboard" theme | ✅ |
| EdTech persona/actor/action palette + Persona-Goal card | ✅ |
| Journey stages/phases (color columns) | ✅ |
| Per-step sentiment / emotional curve | ✅ |
| Pain Point & Opportunity markers | ✅ |
| Per-element Behaviour field + References (screen/app/process/element/link) | ✅ |
| EdTech starter templates (one-click prebuilt journeys) | ✅ |
| Copy / duplicate a board (deep copy, new name) | ✅ |
| Strict linkage (advisory warning, not enforced) | 🟡 |
| Template library (localStorage, not shared/server) | 🟡 |
| On-image text labels / threads | ⬜ |
| AI Image OCR / sketch digitizer | ⏸️ |

## 7. Known Gaps / Roadmap

* Text labels / comment threads anchored directly on images.
* Re-enable the AI OCR / sketch digitizer (currently disabled).
* Optionally hard-enforce the "every app block must link to a user step" constraint.
* Real-time node sync currently broadcasts the full node set per change and saves replace the whole board (simple, not incremental) — fine for small teams, not optimized for very large boards.
