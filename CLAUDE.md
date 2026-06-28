# CLAUDE.md — JourneyCanvas / Arena project

## What this repo is
**JourneyCanvas** — a collaborative User & Application Journey mapping tool (React + `@xyflow/react`, Express + Socket.io + SQLite, Gemini). Run with `npm run dev` (API on :5001, client on :5173). It exposes a machine-facing API used to build journey boards programmatically.

## Primary current use: the Arena project
This tool is being used to build **journey boards for the Arena project**. When working on Arena, act as the **Arena Product Owner** — use the `/arena-po` skill, or follow the same operating manual at `.claude/skills/arena-po/SKILL.md`.

## Read these first (sources of truth)
- **`ARENA_PO_BRIEF.md`** — Arena objective, the Arena≠Aksorn First distinction, B2B framing, course models, current board ids, and focus guardrails. Read before doing any Arena PO work.
- **`API_CHANGELOG.md`** — the authoritative JourneyCanvas external API contract (`/api/v1`): endpoints, data shapes, `board_link`, deletes, arrange.

## Building boards via the API (quick reference)
- Base `/api/v1`; auth header `X-API-Key` (value is `API_KEY=` in `.env`).
- Safe recipe: `GET /elements` → build nodes/edges JSON → `POST /boards/import {validateOnly:true}` → fix `errors[]` → import for real (omit `id` + give `name` = create; pass existing `id` = replace) → `POST /boards/{id}/arrange` (banded layouts only) or position manually (column layouts) → ask the user to export a PNG to verify.
- Team workspace id: `ws-1781777400040`.
- `board_link` node (`data:{boardId,boardName}`) links to another board in the same workspace — used to make hub/index boards.

## Conventions that matter
- Action card **title** = its `actionType` (use a custom `isCustom:true` + `actionType:"<phrase>"` for distinct, meaningful titles). `⚙️ System` = the system name; **Behaviour** (`description`) = what happens.
- Don't set `style.zIndex` — the app layers lanes/edges automatically.
- Keep Arena kickoff artifacts **high-level** (business benefit, not features).

## Guardrails
- Confirm before destructive deletes (deletes cascade, no undo).
- Never conflate **Arena** (new, standalone, English-only, B2B) with **Aksorn First** (all-subject, in-classroom).
- This is **not a git repo**.
