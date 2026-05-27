# OpenBoard — Product Specification

Authoritative product and roadmap document for OpenBoard.  
Last updated from codebase review: May 2026.

---

## 1. Product overview

### Product promise

OpenBoard helps people publish a **beautiful, mobile-first link page** in minutes — a free, open-source alternative to Linktree that they can self-host, customize deeply, and share without platform lock-in.

### Target users

| Segment | Primary need |
|---------|--------------|
| Creators | Link-in-bio for social profiles (YouTube, Instagram, TikTok) |
| Developers | Portfolio and project showcase pages |
| Small businesses | Product links, contact, and booking CTAs |
| Educators / teams | Curated resource pages (lightweight; not a full wiki) |

### Core workflows

1. **Sign up / sign in** — Google or email/password → session cookie
2. **Create a board** — blank or from a template → land in editor
3. **Edit content** — add/reorder blocks, customize theme, set title/description
4. **Save & publish** — manual save; public URL live at `/u/{username}/{slug}` from creation
5. **Share** — copy link, embed iframe, social share buttons
6. **Measure** — view per-board analytics (views, link clicks, devices)
7. **Protect (optional)** — set private or password privacy in share settings

### Product goals

- **Activation:** New user → published board in under 2 minutes (template path)
- **Shareability:** Public pages load fast, look great on mobile, good social previews
- **Trust:** Open source, self-hostable, no surprise billing
- **Differentiation:** Built-in analytics, rich theming, 12 block types, AI assist — purpose-built for link pages, not general docs

---

## 2. Current application state

### What the app currently does

OpenBoard is a working Next.js + Firebase SaaS-style app (deployed demo at openboard.vercel.app per README). Authenticated users manage boards in a sidebar app; each board is a ordered list of typed blocks with a theme; public visitors view rendered boards with optional password gate and analytics tracking.

### Current feature inventory

| Area | Status | Notes |
|------|--------|-------|
| Auth (Google + email) | ✅ Shipped | Session cookie via `/api/auth/session` |
| Board list | ✅ Shipped | Realtime Firestore, owner only |
| Board editor | ✅ Shipped | DnD, slash palette, undo/redo, manual save |
| 12 block types | ✅ Shipped | All registered in `block-renderer.tsx` |
| Themes | ✅ Shipped | Presets + custom modal |
| Templates | ✅ Partial | 5 static templates; thumbnails may 404 |
| Public pages | ✅ Shipped | RSC fetch + client render |
| Privacy: private | ✅ Shipped | Blocks public view |
| Privacy: password | ✅ Shipped | Server hash + unlock API + access cookie |
| Privacy: unlisted | ✅ Shipped | Direct URL access; `noindex` robots meta |
| Share / embed | ✅ Shipped | QR code placeholder only |
| Analytics (per board) | ✅ Shipped | Modal with views/clicks/devices |
| Dashboard | ✅ Basic | Aggregate counts; no charts |
| AI suggestions | ✅ Optional | Requires `OPENAI_API_KEY` |
| Collaboration | ✅ Shipped | Email invite resolves to UID; shared boards in list |
| Auto-save | ✅ Shipped | 2s debounce via `useAutoSave` in board editor |
| Custom domains | ❌ Not built | Type only |
| QR codes | ❌ Not built | UI placeholder |
| Nested blocks | ❌ Not built | Dead code paths |
| Form server relay | ❌ Not built | Client POST to external URL only |
| i18n | ❌ Not built | English only |
| Automated tests | ❌ None | Lint + tsc + build only |

### Current user flows

```
Landing (/) → Sign up → /boards
/boards → New board OR /templates → pick template → /board/{id}
/board/{id} → edit blocks → Save (Cmd+S) → Share modal → copy /u/{user}/{slug}
Public visitor → /u/{user}/{slug} → [password gate?] → view + track analytics
```

**Editor shortcuts:** Cmd/Ctrl+S save, Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z redo, `/` command palette, Cmd+Enter open palette when block selected.

### Existing integrations

| Integration | Usage |
|-------------|-------|
| Firebase Auth | Sign-in, session tokens |
| Firestore | Users, boards, analytics rollups, click events |
| Firebase Storage | Image uploads (`uploads/{userId}/...`) |
| OpenAI | Streaming suggestions in add-block flow |
| External webhooks | Form block optional `submitUrl` (browser POST) |
| Cal.com / Calendly | Calendar block iframes |
| YouTube / Vimeo | Video embeds |
| Spotify / Twitter / Instagram | Embed block platforms |

### Current architecture summary

- **Frontend:** Next.js 16 App Router, mostly client components in authenticated areas
- **Auth gate:** `src/proxy.ts` (not `middleware.ts`) + per-route `requireAuth()` on APIs
- **State:** Zustand for editor/UI; Firestore realtime for board list
- **Public render:** Server fetches board via Admin SDK; strips secrets; client handles theme + analytics
- **Security:** HttpOnly auth cookie; server-side password hashing (scrypt); rate limits on sensitive APIs (in-memory)

### Existing technical constraints

- Firestore rules allow **world read** on boards — private/password enforcement is application-layer on the public route only
- Rate limiting is in-process — not shared across serverless instances
- Board list merges owned boards and collaborator shares via dual Firestore subscriptions
- No CI test pipeline; quality gate is lint + TypeScript + build
- npm lockfile — use npm exclusively

### Known limitations

*(Mix of code-verified and inferred)*

1. ~~**Collaboration is non-functional end-to-end**~~ — email invites resolve to UID; shared boards appear in `/boards` (legacy email entries must be re-invited)
2. ~~**Unlisted boards are not hidden** from direct URL access~~ — unlisted boards are intentionally reachable via direct URL; they are excluded from search indexes (`noindex`)
3. **Analytics `uniqueVisitors`** increments on every view — not deduplicated
4. **`analytics.enabled` flag** is never checked before tracking
5. **Referrer analytics** typed but not written
6. **Form webhooks** often fail due to browser CORS posting to arbitrary URLs
7. **Marketing copy** on landing page overstates collaboration, layouts, and custom domains
8. ~~**Manual save required**~~ — auto-save debounces edits; manual Save / ⌘S still available for immediate persist
9. **Template preview images** reference `/templates/*.jpg` not present in `public/`
10. **`passwordHash` may be readable** by authenticated owner via client Firestore path *(inferred)* — public route correctly strips it

---

## 3. Product roadmap

Ordered by product impact and dependency. Each item is sized for one focused commit sequence on `dev`.

---

### Milestone 1 — Wire auto-save in the board editor ✅

**Status:** Complete (May 2026)

**User value:** Editors never lose work; matches expectations from Notion/Google Docs.

**Acceptance criteria:**
- [x] Board changes (blocks, title, description, theme) debounce-save automatically (~2s after last change)
- [x] Cmd/Ctrl+S still triggers immediate save
- [x] Unsaved indicator reflects auto-save state accurately
- [x] `beforeunload` warning only when a save is in flight or failed

**Implementation note:** `useAutoSave` in `board/[id]/page.tsx` debounces saves via `lib/board-save.ts` fingerprinting; coordinates with `ui-store` `setSaving`; toolbar shows pending/saving/error states.

---

### Milestone 2 — Enforce unlisted privacy on public pages ✅

**Status:** Complete (May 2026)

**User value:** Creators can share link-in-bio pages with a direct link without public discovery.

**Acceptance criteria:**
- [x] `privacy: "unlisted"` boards render for direct URL visitors
- [x] Unlisted boards are not listed on any public index (none exists today — documented below)
- [x] Search engines discouraged via `noindex, nofollow` metadata (referrer-gated 404 deferred — breaks share flows)

**Implementation note:** `lib/public-board-access.ts` defines robots policy; `generateMetadata` on `u/[username]/[slug]/page.tsx` sets `noindex` for unlisted boards; shared fetch in `lib/public-board-server.ts`.

**Unlisted behavior:** Accessible at `/u/{username}/{slug}` for anyone with the link. Not indexed by search engines. No public board directory exists in the app.

---

### Milestone 3 — Fix collaborator invites (email → UID) ✅

**Status:** Complete (May 2026)

**User value:** Teams can actually co-edit boards — a marketed feature today.

**Acceptance criteria:**
- [x] Inviting by email resolves to Firebase UID via `users` collection lookup
- [x] `collaborators[]` stores UIDs consistently
- [x] Firestore rules allow collaborator updates (already written for UIDs)
- [x] Invited user sees shared boards in `/boards` list
- [x] Clear error when email is not registered

**Implementation note:** `share-modal.tsx` resolves email via `collaborators-client.ts`; `use-boards.ts` merges owned + `array-contains` shared subscriptions; composite Firestore index added for `collaborators` + `updatedAt`.

**Follow-up:** Legacy collaborator entries stored as raw emails are ignored until re-invited.

---

### Milestone 4 — QR code generation in share modal

**User value:** Creators print/share QR codes for events, business cards, and offline promo — README lists this as wanted.

**Acceptance criteria:**
- Share modal displays scannable QR for board URL
- Download PNG button
- Works on mobile and desktop

**Implementation intent:** Add lightweight QR library (e.g. `qrcode` or SVG generator); replace "Coming Soon" placeholder in `share-modal.tsx`.

---

### Milestone 5 — Template gallery polish (thumbnails + empty states)

**User value:** Templates drive activation — first board should look professional immediately.

**Acceptance criteria:**
- Each of 5 templates has a preview image in `public/templates/`
- Template cards show thumbnail without broken image
- Creating from template lands in editor with blocks and theme applied (already works)

**Implementation intent:** Add static preview assets or generate placeholder thumbnails; verify `templates/page.tsx` create flow.

---

### Milestone 6 — Form submissions via server relay

**User value:** Contact/signup forms on link pages actually work without CORS failures.

**Acceptance criteria:**
- Form submit POSTs to `/api/forms/submit` (new route)
- Server forwards to board-configured webhook URL
- Rate limited; basic spam protection (honeypot or rate limit per board)
- Success/error feedback on public form block

**Implementation intent:** New API route; optional Firestore log of submissions for board owner; update `form-block.tsx` public submit path.

---

### Milestone 7 — Dashboard analytics upgrade

**User value:** Owners see trends at a glance without opening each board's analytics modal.

**Acceptance criteria:**
- Dashboard shows total views/clicks for last 7 and 30 days (from `analytics` collection)
- Top 5 links by click count across all boards
- Loading and empty states

**Implementation intent:** Query `analytics` docs in dashboard page or new hook; reuse `use-analytics.ts` patterns; simple bar list UI (no chart library required for v1).

---

### Milestone 8 — SEO and social preview controls

**User value:** Shared links look professional on Twitter, iMessage, Slack.

**Acceptance criteria:**
- Board-level SEO fields (`seo.title`, `seo.description`, `seo.image`) editable in share or settings UI
- Public page renders Open Graph and Twitter meta tags
- Sensible defaults from board title/description

**Implementation intent:** Extend board editor/share modal; add `generateMetadata` or `<head>` tags on public board route.

---

### Milestone 9 — Inline editing consistency across blocks

**User value:** Editor feels modern (Notion-like) — less click-to-edit friction.

**Acceptance criteria:**
- Link, text, button blocks support click-to-edit without separate edit mode where feasible
- Pattern documented for new blocks via `use-block-editor.ts`
- No regression to drag-and-drop or slash palette

**Implementation intent:** Extend `use-block-editor` pattern from link/button blocks to text and social-links; incremental per block type.

**Reference:** See `competitor-analysis.md` table stakes (archival UX research).

---

### Milestone 10 — Username subdomain routing (free tier custom URL)

**User value:** `username.openboard.app` style URLs for branding without full custom DNS.

**Acceptance criteria:**
- Document deployment requirement (wildcard subdomain on Vercel)
- `{username}.openboard.app/{slug}` resolves to same board as `/u/{username}/{slug}`
- Fallback: path-based URL always works

**Implementation intent:** Host-based rewrite in `proxy.ts` or Next.js config; map hostname to username lookup.

**Depends on:** SEO milestone for consistent canonical URLs.

---

## Roadmap notes

- Items intentionally **exclude** generic lint/test/refactor work unless they block a milestone above.
- **Real-time collaboration** (live cursors, OT) is out of scope until Milestone 3 ships and product validates demand — `collab-store` should not drive roadmap priority.
- **Custom DNS domains** remain a later phase after subdomain routing proves value.
- **i18n and WCAG audit** are valuable but secondary to core editor and publish flows.

---

## Appendix: Block type reference

| Type | Editor | Public |
|------|--------|--------|
| link | ✅ | ✅ |
| text | ✅ | ✅ |
| richtext | ✅ (Tiptap) | ✅ |
| image | ✅ (upload) | ✅ |
| video | ✅ | ✅ |
| embed | ✅ | ✅ |
| button | ✅ | ✅ |
| social-links | ✅ | ✅ |
| calendar | ✅ | ✅ |
| form | ✅ (partial: no select field) | ✅ (webhook fragile) |
| divider | ✅ | ✅ |
| spacer | ✅ | ✅ |

---

## Appendix: API routes

| Route | Auth | Purpose |
|-------|------|---------|
| `POST/DELETE /api/auth/session` | Token/cookie | Session management |
| `POST /api/ai/suggest` | Required | AI streaming |
| `POST /api/boards/privacy` | Required | Privacy + password hash |
| `POST /api/boards/unlock` | Public | Password verify + access cookie |
