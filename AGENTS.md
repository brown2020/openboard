# AGENTS.md — OpenBoard

Single source of truth for autonomous agents working in this repository.

## Project overview

OpenBoard is a free, open-source Linktree-style product: users create customizable **boards** (shareable link-in-bio pages) with themed layouts and typed **blocks** (links, rich text, media, forms, etc.), then publish them at `/u/{username}/{slug}`.

**Product purpose:** Give creators, developers, and small teams a self-hostable way to build beautiful public link pages with analytics, privacy controls, and optional AI assistance — without platform lock-in.

## Current tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack in dev) |
| UI | React 19, Tailwind CSS 4, Radix UI primitives |
| Language | TypeScript 5 (strict) |
| State | Zustand 5 (`board-store`, `ui-store`, `user-store`; `collab-store` exists but unused) |
| Backend | Firebase Auth, Firestore, Storage |
| Server auth | Firebase Admin SDK + HttpOnly session cookies |
| Rich text | Tiptap 3 |
| Drag & drop | dnd-kit |
| AI | OpenAI API (`gpt-4o-mini`) via `/api/ai/suggest` |
| Validation | Zod 4 |
| Package manager | **npm** (`package-lock.json` — do not switch) |

## Repository structure

```
src/
├── app/
│   ├── (app)/              # Authenticated shell (sidebar layout)
│   │   ├── page.tsx        # Landing (inside auth layout group)
│   │   ├── boards/         # Board list
│   │   ├── board/[id]/     # Board editor (primary workspace)
│   │   ├── dashboard/      # Aggregate stats
│   │   └── templates/      # Template gallery
│   ├── api/
│   │   ├── auth/session/   # Session cookie create/delete
│   │   ├── ai/suggest/     # Streaming AI suggestions
│   │   └── boards/         # privacy, unlock
│   ├── u/[username]/[slug]/ # Public board (RSC + client view)
│   ├── login/, signup/, reset-password/, reset-auth/
│   └── layout.tsx, globals.css
├── components/
│   ├── blocks/             # 12 block type components + editor chrome
│   ├── modals/             # theme, share, analytics
│   ├── public-board/       # password gate, public client
│   ├── auth/               # Google + email auth UI
│   ├── editor/             # command palette (slash menu)
│   └── ui/                 # Radix/shadcn-style primitives
├── hooks/                  # Firebase sync, analytics, AI, storage, etc.
├── stores/                 # Zustand stores
├── lib/                    # Firebase, auth, API helpers, templates, blocks
├── types/index.ts          # All domain types
└── proxy.ts                # Route protection (Next.js 16 proxy — not middleware.ts)

firestore.rules, storage.rules, firebase.json   # Firebase config
env.example                                      # Required env vars
spec.md                                          # Product spec + roadmap
README.md                                        # Public install/marketing docs
```

## Core architecture overview

```
Browser (React client)
  ├── Firebase Auth (Google + email/password)
  ├── Firestore realtime subscription (owner boards)
  ├── Zustand (editor state, undo/redo, UI modals)
  └── fetch → Next.js API routes (session, AI, privacy, unlock)

Next.js server
  ├── src/proxy.ts — JWT cookie check, redirect unauthenticated users
  ├── RSC public board page — Admin SDK fetch, privacy gate, strip passwordHash
  └── API routes — requireAuth(), rate limiting, server-side password hashing

Firebase
  ├── users/{userId}
  ├── boards/{boardId}
  ├── analytics/{boardId_YYYY-MM-DD}
  └── clicks/{autoId}
```

**Server/client boundary:**
- **Client components** (`"use client"`) dominate the editor, dashboard, and auth flows.
- **Server components** handle public board fetch (`u/[username]/[slug]/page.tsx`) and all API routes.
- Do not import client-only modules (`firebase.ts`, Zustand stores, hooks) into server components or API routes.
- Use `firebase-admin.ts` and `api-utils.ts` on the server; use `firebase.ts` on the client.

**Route protection:** There is no `middleware.ts`. Auth is enforced in `src/proxy.ts` using route lists from `src/lib/routes.ts`:
- **Protected:** `/dashboard`, `/boards`, `/board`, `/templates`
- **Auth-only (redirect if logged in):** `/login`, `/signup`, `/reset-password`
- **Public:** `/`, `/u/*`
- **API:** `/api/ai/*` requires auth cookie; other API routes pass through (each route validates as needed)

## Key app features (today)

### Implemented and usable
- Google + email/password auth with HttpOnly session cookies (7-day)
- Board CRUD with Firestore realtime sync (owner boards only)
- 12 block types with editor UI and public rendering
- Drag-and-drop block reordering (dnd-kit)
- Slash command palette (`/`) for adding blocks
- Theme customization (presets + custom colors/gradients/fonts)
- Auto-save (2s debounce) plus manual save (Cmd/Ctrl+S)
- Undo/redo (50-entry history in `board-store`)
- Public boards at `/u/{username}/{slug}`
- Privacy modes: public, private, password (unlisted stored but not enforced on public page — see spec.md)
- Password unlock via `/api/boards/unlock` + signed access cookie
- Share modal: copy link, social share, embed iframe code
- Per-board analytics modal (views, clicks, devices from Firestore)
- Dashboard with aggregate board/view counts
- 5 static templates (`src/lib/templates.ts`)
- AI content suggestions when `OPENAI_API_KEY` is set
- Image upload to Firebase Storage
- Form blocks with optional external webhook URL (client-side POST)

### Partially implemented (do not assume complete)
- **Collaboration:** UI invites by email; Firestore rules expect UIDs; collaborator boards not listed in `use-boards.ts`; `collab-store` unused
- **Auto-save:** wired in board editor via `use-auto-save.ts` and `lib/board-save.ts`
- **Nested blocks:** types + `nested-block-renderer.tsx` exist; editor uses flat list only
- **QR codes:** "Coming Soon" placeholder in share modal
- **Custom domains:** typed on `UserProfile` but no routing/DNS implementation
- **Board layouts:** `grid`/`masonry` in types; always `single-column` in practice
- **Unlisted privacy:** no distinct public-page behavior (inferred: same as public if URL is known)
- **Form select fields:** typed but no UI
- **Template thumbnails:** paths like `/templates/creator-basic.jpg` — assets may be missing from `public/`

## Important commands

```bash
npm install          # Install dependencies (use npm only)
npm run dev          # Dev server (Turbopack)
npm run build        # Production build (webpack; avoids sandbox-sensitive Turbopack build worker)
npm run start        # Production server
npm run lint         # ESLint (next lint)
npm run typecheck    # TypeScript check (tsc --noEmit)
npm run test         # Vitest unit tests
```

## Canonical validation command

Run all of these before considering work done:

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run test          # Vitest unit tests
npm run build         # Production build
npm run validate      # All of the above
```

## Non-interactive testing rules

- Never use watch mode (`--watch`, `-w`).
- Never open a headed browser or require manual login for validation.
- Never prompt for user input in scripts.
- Use CI-safe commands only.
- For auth-dependent behavior, verify via code review and typecheck/build — do not rely on manual Firebase login in agent runs unless env credentials are confirmed present.

## Development conventions

- Path alias: `@/*` → `./src/*`
- Functional React components with hooks; no class components
- Match existing file naming: kebab-case directories, PascalCase components
- Extend existing Zustand stores and hooks rather than introducing parallel state
- Use `useCurrentBoard()`, `useToast()`, `useModal()` convenience hooks from stores
- Block changes follow the pattern in `types/index.ts` → block component → `block-renderer.tsx`
- API routes use `requireAuth()` and `rateLimit()` from `lib/api-utils.ts`
- Sanitize user HTML via `lib/sanitize.ts` where applicable
- Prefer minimal, focused diffs — one product concern per change sequence

## TypeScript and lint expectations

- `strict: true` in `tsconfig.json` — no `any` without justification
- ESLint: `eslint.config.mjs` extends `next/core-web-vitals` and `next/typescript`
- Fix lint and type errors introduced by your changes
- Do not modify generated files (`.next/`, `next-env.d.ts`) unless source requires it

## Server/client boundary guidance

| Context | Use |
|---------|-----|
| API routes, RSC data fetch | `firebase-admin`, `cookies()`, `requireAuth()` |
| Client components, hooks | `firebase.ts` (client SDK), Zustand, hooks |
| Shared constants/types | `types/`, `lib/auth-constants.ts`, `lib/routes.ts` |
| Password hashing | Server only (`lib/password.ts`) — never expose `passwordHash` on public routes (public page already strips it) |

Adding a new protected page: add path prefix to `PROTECTED_ROUTES` in `lib/routes.ts`.

Adding a new API route: decide if `proxy.ts` should gate it; use `requireAuth()` inside the handler for user-scoped operations.

## Route-protection guidance

Session flow:
1. Client Firebase Auth → `onIdTokenChanged` in `auth-context.tsx`
2. POST ID token to `/api/auth/session` → HttpOnly cookie
3. `proxy.ts` checks cookie JWT expiry on navigation
4. API routes verify cookie via Admin SDK

When testing route protection in code review, trace both `proxy.ts` and any handler-level `requireAuth()` checks.

## State-management guidance

- **`board-store`:** boards list, current board, blocks, theme, undo/redo — primary editor state
- **`ui-store`:** modals (`theme`, `share`, `analytics`), toasts, editor selection, saving flag
- **`user-store`:** profile from Firestore — intentionally not persisted
- **`collab-store`:** scaffolding only — do not build on it without fixing collaboration model first

Board persistence goes through `use-boards.ts` (`updateBoard`, `createBoard`, etc.), not direct Firestore calls from components.

## Testing expectations

- Vitest unit tests exist under `src/lib/*.test.ts` for core library helpers.
- No browser/E2E test suite is currently present.
- Validation = `npm run validate` (lint + typecheck + test + build).
- Manual QA is out of scope for autonomous runs unless browser MCP is explicitly requested with credentials

## Files and systems requiring extra caution

| Area | Risk |
|------|------|
| `firestore.rules` | World-readable boards; privacy enforced in app layer only |
| `src/proxy.ts` | Single auth gate — breaking it exposes or blocks routes |
| `lib/password.ts`, `lib/board-access-cookie.ts` | Password and access token security |
| `lib/api-utils.ts` | In-memory rate limiting — not durable across instances |
| `hooks/use-boards.ts` | Core data sync; race conditions guarded with AbortController |
| `stores/board-store.ts` | Undo/redo history — easy to corrupt with bad merges |
| `components/modals/share-modal.tsx` | Privacy + collaborator writes |
| `app/u/[username]/[slug]/page.tsx` | Public surface — must never leak `passwordHash` |

## Git workflow (main + dev)

| Branch | Role |
|--------|------|
| `main` | Stable production — **never push directly from autonomous runs** |
| `dev` | Autonomous working branch — commit and push here |

Rules:
- Do **not** create feature branches unless explicitly instructed
- Do **not** open pull requests unless explicitly instructed
- Do **not** merge to `main` from autonomous runs
- Before starting: `git fetch origin && git checkout dev && git pull origin dev`
- One focused, PR-sized change per task (even when committing directly to `dev`)
- Commit messages: imperative mood, concise (e.g. `feat:`, `fix:`, `docs:`)

## Definition of done

1. Change matches task scope — no drive-by refactors
2. `npm run lint` passes
3. `npx tsc --noEmit` passes
4. `npm run build` passes
5. No secrets committed; env vars documented in `env.example` if added
6. Product behavior documented in `spec.md` if user-facing capabilities changed
7. Committed to `dev` and pushed to `origin/dev` when task requires delivery

## Rules for autonomous Codex runs

1. Read `AGENTS.md` and `spec.md` before making changes
2. Inspect relevant source — do not trust README/marketing copy alone
3. One focused change set per run (PR-sized, ~1 product concern)
4. Prefer completing partial features over new abstractions
5. Do not remove dead code unless the task explicitly includes cleanup
6. Do not add dependencies without clear product need
7. Label inferred conclusions when reporting findings
8. Stop and report if uncommitted changes exist that are not yours — do not overwrite

## Stop conditions

Stop and report (do not proceed) when:
- Uncommitted changes exist from another session and are not clearly safe to preserve
- `dev` has merge conflicts you cannot resolve without guessing intent
- Required env vars for the task are missing and the task requires runtime verification
- The task would require pushing to `main`
- A change would require Firestore rule migrations or destructive data operations without explicit approval
- Build/lint failures pre-exist on `dev` and are unrelated — document them rather than fixing unrelated debt in the same run

## Environment variables

See `env.example`. Required for full functionality:
- `NEXT_PUBLIC_FIREBASE_*` (6 vars)
- `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Optional: `OPENAI_API_KEY`, `OPENBOARD_COOKIE_SECRET`

## Related docs

- **`spec.md`** — Product spec, current state, roadmap (authoritative for product direction)
- **`README.md`** — Installation, Firebase setup, public-facing feature list
- **`competitor-analysis.md`** — Archival UX research (Notion comparison); not product spec
