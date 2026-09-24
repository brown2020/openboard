# OpenBoard

Open-source Linktree-style boards: create themed, shareable link-in-bio pages with typed blocks, publish at `/u/{username}/{slug}`, and track views/clicks. Live demo: [https://openboard-ten.vercel.app](https://openboard-ten.vercel.app).

> Product inventory: [`spec.md`](./spec.md). Agent conventions: [`AGENTS.md`](./AGENTS.md).

## Features

- **Boards** — CRUD with Firestore realtime sync for the owner; auto-save (debounced) and manual save (Cmd/Ctrl+S); undo/redo
- **Block types** — links, text, rich text (TipTap), buttons, images, video, embeds, social links, forms, calendar, spacers, dividers
- **Editor** — drag-and-drop reordering (dnd-kit), slash command palette, theme presets / custom colors and fonts
- **Public pages** — `/u/{username}/{slug}` with privacy modes (public, private, password unlock via signed cookie)
- **Share** — copy link, social share, embed iframe, QR
- **Analytics** — per-board views/clicks modal; dashboard aggregates
- **Templates** — static starter templates gallery
- **Auth** — Firebase Google + email/password; HttpOnly session cookies
- **Optional AI** — content suggestions via `/api/ai/suggest` when `OPENAI_API_KEY` is set
- Image upload to Firebase Storage; form blocks with optional external webhook

Collaboration UI exists but collaborator listing / full multi-user edit is incomplete — see `spec.md`.

## Tech stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16.2.6 (App Router; production build uses `--webpack`) |
| UI | React ^19.2.6, Tailwind CSS 4, Radix primitives, Lucide / react-icons |
| Language | TypeScript ^5.9.3 |
| State | Zustand ^5.0.13 |
| Backend | Firebase ^12.13.0 + Firebase Admin ^13.10.0 |
| Editor | TipTap 3 |
| DnD | `@dnd-kit/*` |
| AI | OpenAI SDK ^6 (`gpt-4o-mini` suggest route) |
| Validation | Zod ^4.4.3 |
| Tests | Vitest ^3.2.4, ESLint 9 |

## Project structure

```
src/
  app/
    (app)/                 # Auth shell: landing, boards, board/[id], dashboard, templates
    u/[username]/[slug]/    # Public board (RSC + client)
    api/auth/session/      # Session cookie
    api/ai/suggest/        # Streaming AI suggestions
    api/boards/            # privacy, unlock
    api/forms/submit/
    login/ signup/ reset-*/
  components/              # blocks, editor, modals, public-board, auth, ui
  stores/                  # board, ui, user
  lib/                     # firebase client/admin, templates, routes, utils
  proxy.ts                 # Session cookie route protection
firestore.rules  storage.rules  firebase.json  env.example
```

## Getting started

### Prerequisites

- Node.js 22+
- npm
- Firebase project (Auth, Firestore, Storage)
- Optional: OpenAI API key for AI suggestions

### Install

```bash
git clone https://github.com/brown2020/openboard.git
cd openboard
cp env.example .env.local
# Replace placeholders — never commit real secrets
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Deploy `firestore.rules`, `storage.rules`, and indexes (`firestore.indexes.json`) to Firebase.

## Environment variables

From `env.example` (no `.env.example` file):

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client Firebase API key | Firebase Console → Project settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain | Same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project id | Same |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | Same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender id | Same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App id | Same |
| `FIREBASE_CLIENT_EMAIL` | Admin service account email | Firebase Console → Service accounts |
| `FIREBASE_PRIVATE_KEY` | Admin private key (PEM) | Same |
| `OPENAI_API_KEY` | Optional AI suggestions | [platform.openai.com](https://platform.openai.com) |
| `OPENBOARD_COOKIE_SECRET` | Signs HttpOnly cookies for password-protected boards (≥32 chars) | Generate a strong random secret |
| `NEXT_PUBLIC_APP_URL` | Optional public app URL | Your deployment URL |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build (Webpack) |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run validate` | lint + typecheck + test + build |

## Testing and CI

- `.github/workflows/ci.yml` on `dev` / `main`: lint → typecheck → test → production build (client env from Actions secrets; tolerates missing secrets via deferred Firebase init).

## Deployment

Vercel or any Node Next.js host. Set env vars in the host dashboard. Do not inline secrets in workflows.

## Contributing

Branch from `dev`. Keep client Firebase / Zustand out of server components and API routes. See [`AGENTS.md`](./AGENTS.md).

## License

MIT — see [LICENSE](LICENSE).
