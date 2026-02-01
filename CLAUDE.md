# CLAUDE.md - OpenBoard

## Project Overview

OpenBoard is a free, open-source alternative to Linktree for creating customizable shareable link pages. Built with Next.js 16, React 19, TypeScript, and Firebase.

## Tech Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **UI:** React 19, Tailwind CSS 4, Radix UI
- **State:** Zustand 5 with devtools
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Rich Text:** Tiptap 3
- **Drag & Drop:** dnd-kit
- **AI:** OpenAI API
- **Validation:** Zod 4

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
/src
├── /app                    # Next.js App Router
│   ├── /api                # API routes (auth, ai, boards)
│   ├── /(app)              # Authenticated routes (dashboard, board editor)
│   ├── /u/[username]/[slug] # Public board view
│   └── /login, /signup     # Auth pages
├── /components             # React components
│   ├── /ui                 # Radix-based UI primitives
│   ├── /blocks             # Block type components (12 types)
│   └── /modals             # Modal dialogs
├── /stores                 # Zustand stores
│   ├── board-store.ts      # Board & block state, undo/redo
│   ├── ui-store.ts         # UI/modal state, toasts
│   └── user-store.ts       # User profile state
├── /hooks                  # Custom hooks
│   ├── use-auth.ts         # Firebase auth sync
│   ├── use-boards.ts       # Board CRUD + real-time sync
│   └── use-ai.ts           # AI suggestions
├── /lib                    # Utilities
│   ├── firebase.ts         # Client Firebase config
│   ├── firebase-admin.ts   # Server-side Firebase Admin
│   └── api-utils.ts        # Auth helpers, rate limiting
└── /types                  # TypeScript definitions
```

## Key Concepts

### Block Types
12 discriminated union block types: Link, Text, RichText, Image, Video, Embed, Button, SocialLinks, Calendar, Form, Divider, Spacer

### State Management
- `board-store`: Boards, blocks, themes, undo/redo history (50 entries)
- `ui-store`: Modals, toasts, editor mode, sidebar state
- `user-store`: User profile (not persisted to avoid stale auth)

### Auth Flow
1. Firebase Auth (Google provider)
2. `onIdTokenChanged` listener
3. HttpOnly session cookie (7-day expiry)
4. Server verifies via Firebase Admin SDK

### Firestore Collections
- `/users/{userId}` - User profiles
- `/boards/{boardId}` - Board data with blocks[], theme, privacy
- `/analytics/{eventId}` - View/click tracking

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/session` | POST/DELETE | Session cookie management |
| `/api/ai/suggest` | POST | Stream AI suggestions (rate limited) |
| `/api/boards/privacy` | POST | Update board privacy settings |
| `/api/boards/unlock` | POST | Unlock password-protected boards |

## Coding Patterns

### Adding a New Block Type
1. Add type to `BlockType` union in `/types/index.ts`
2. Create block interface extending `BaseBlock`
3. Add to `Block` discriminated union
4. Create component in `/components/blocks/`
5. Add case to `BlockRenderer.tsx`

### Zustand Store Updates
```typescript
// Use convenience hooks
const { currentBoard, updateBlock } = useCurrentBoard();
const { showToast } = useToast();

// Type-safe block updates
updateBlock<LinkBlock>(blockId, { url: 'https://...' });
```

### API Route Pattern
```typescript
import { requireAuth, errorResponse, rateLimit } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  const { userId } = await requireAuth();
  if (rateLimit(userId, 10)) {
    return errorResponse('Rate limit exceeded', 429);
  }
  // ...
}
```

## Important Files

| File | Purpose |
|------|---------|
| `stores/board-store.ts` | Core board/block state management |
| `hooks/use-boards.ts` | Board CRUD with Firestore real-time sync |
| `types/index.ts` | All TypeScript type definitions |
| `lib/api-utils.ts` | Auth verification, rate limiting |
| `firestore.rules` | Firestore security rules |

## Path Alias

`@/*` maps to `./src/*`

## Environment Variables

Required Firebase config vars (check `.env.local`):
- `NEXT_PUBLIC_FIREBASE_*` - Client Firebase config
- `FIREBASE_*` - Server Firebase Admin config
- `OPENAI_API_KEY` - For AI suggestions

## Security Notes

- Passwords hashed server-side only (never exposed to client)
- Rate limiting on sensitive endpoints (5-10 req/min)
- HttpOnly cookies for session (no XSS exposure)
- Firestore rules enforce owner/collaborator access
