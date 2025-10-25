# 🎨 OpenBoard

<div align="center">

**The open-source platform to create beautiful, shareable boards for your links, content, and projects.**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4-orange?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Demo](https://openboard.vercel.app) • [GitHub](https://github.com/brown2020/openboard)

</div>

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup-guide)
- [Project Structure](#-project-structure)
- [Block Types](#-block-types)
- [State Management](#-state-management)
- [Authentication](#-authentication-flow)
- [API Routes](#-api-routes)
- [Customization](#-customization)
- [Analytics](#-analytics)
- [AI Features](#-ai-features)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🌟 Features

### Core Features

- ✨ **Beautiful Boards** - Create stunning, customizable boards with flexible layouts
- 🎨 **Theme System** - Pre-built themes and full customization options
- 🔗 **Multiple Block Types** - Links, text, images, videos, buttons, and more
- 📱 **Mobile-First** - Responsive design that looks great on all devices
- 🚀 **Lightning Fast** - Built with Next.js 16 for optimal performance

### Advanced Features

- 🤖 **AI-Powered** - Get intelligent suggestions for content and SEO optimization
- 📊 **Built-in Analytics** - Track views, clicks, and engagement
- 🔒 **Privacy Controls** - Public, unlisted, password-protected, or private boards
- 👥 **Collaboration** - Invite team members to edit boards together
- 🌐 **Custom Domains** - Use your own domain for branded experiences
- 📋 **Embed Support** - Embed boards anywhere with iframe code

### Use Cases

- 🎭 **Creators** - Perfect for Instagram, TikTok, YouTube link-in-bio
- 💻 **Developers** - Portfolio and project showcases
- 🏢 **Teams** - Shared resource boards and documentation
- 📚 **Educators** - Course materials and resource collections
- 🛍️ **Businesses** - Product catalogs and contact pages

---

## 💻 Tech Stack

### Framework & Core

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router & Turbopack
- **Frontend**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)

### UI & Components

- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)

### Backend & Services

- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Storage**: [Firebase Storage](https://firebase.google.com/docs/storage)
- **Admin SDK**: [Firebase Admin](https://firebase.google.com/docs/admin/setup)

### State & Data

- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Cookie Management**: [js-cookie](https://github.com/js-cookie/js-cookie)
- **AI**: [OpenAI](https://openai.com/) with streaming support

### Key Dependencies

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "firebase": "^12.4.0",
    "firebase-admin": "^13.5.0",
    "js-cookie": "3.0.5",
    "lucide-react": "^0.548.0",
    "next": "^16.0.0",
    "openai": "^6.7.0",
    "react": "^19.0.0",
    "zustand": "^5.0.8"
  }
}
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase account (for authentication and database)

### Installation

```bash
# Clone repository
git clone https://github.com/brown2020/openboard.git
cd openboard

# Install dependencies
npm install

# Copy environment file
cp env.example .env.local

# Add your credentials to .env.local
# Then start dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

---

## 📚 Detailed Setup Guide

### Step 1: Clone and Install

```bash
git clone https://github.com/brown2020/openboard.git
cd openboard
npm install
```

### Step 2: Firebase Setup

#### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "openboard")
4. Disable Google Analytics (optional)
5. Create project

#### 2.2 Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable **Email/Password**:
   - Toggle to enable
   - Email link sign-in (optional)
5. Enable **Google**:
   - Toggle to enable
   - Select support email
   - Save

#### 2.3 Enable Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location (choose closest to your users)
5. Click "Enable"

#### 2.4 Enable Firebase Storage

1. Go to "Storage" in Firebase Console
2. Click "Get Started"
3. Start in test mode
4. Select same location as Firestore
5. Done

#### 2.5 Get Firebase Web Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Web icon `</>`
4. Register your app with a nickname
5. Copy the configuration object

#### 2.6 Generate Firebase Admin SDK Credentials

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values for your `.env.local`:
   - `client_email`
   - `private_key`

#### 2.7 Set Security Rules

**Firestore Rules** (Go to Firestore → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Boards collection
    match /boards/{boardId} {
      allow read: if true;
      allow write: if request.auth != null &&
        (resource == null || resource.data.ownerId == request.auth.uid);
    }

    // Analytics collection
    match /analytics/{docId} {
      allow read: if request.auth != null;
      allow write: if true;
    }

    // Clicks collection
    match /clicks/{clickId} {
      allow write: if true;
      allow read: if request.auth != null;
    }
  }
}
```

**Storage Rules** (Go to Storage → Rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /boards/{boardId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 3: Configure Environment Variables

Create `.env.local` in project root:

```env
# Firebase Authentication & Database
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789

# Firebase Admin SDK (for API routes)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"

# Optional: AI Features (OpenAI)
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### Step 4: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Step 5: Test the Application

#### 5.1 Sign Up

1. Click "Get Started Free" or "Sign Up"
2. Create account with email and password
3. Or use "Sign in with Google"
4. Check email for verification (if using email/password)

#### 5.2 Create Your First Board

1. After sign-in, you'll be at `/boards`
2. Click "New Board"
3. Enter board title (e.g., "My Links")
4. Enter URL slug (e.g., "my-links")
5. Click "Create Board"

#### 5.3 Add Content Blocks

1. In board editor, click "Add Block"
2. Add a link with title and URL
3. Click "Add Link"
4. Click "Save" in the toolbar

#### 5.4 Customize Theme

1. Click "Theme" button in toolbar
2. Choose a preset or customize colors
3. See changes in real-time
4. Click "Save"

#### 5.5 View Your Public Board

1. Click "Preview" in editor
2. Opens in new tab
3. Share this URL with others!

---

## 📁 Project Structure

```
openboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/             # App layout pages with sidebar
│   │   │   ├── board/[id]/    # Board editor
│   │   │   ├── boards/        # Board listing
│   │   │   ├── dashboard/     # Analytics dashboard
│   │   │   ├── templates/     # Board templates
│   │   │   └── page.tsx       # Landing page
│   │   ├── api/               # API routes
│   │   │   └── ai/suggest/    # AI suggestions endpoint
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── reset-password/    # Password reset
│   │   ├── u/[username]/[slug]/ # Public board view
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── blocks/           # Block type components
│   │   │   ├── block-renderer.tsx
│   │   │   ├── link-block.tsx
│   │   │   ├── text-block.tsx
│   │   │   ├── image-block.tsx
│   │   │   ├── button-block.tsx
│   │   │   ├── divider-block.tsx
│   │   │   └── spacer-block.tsx
│   │   ├── modals/           # Modal components
│   │   │   ├── theme-modal.tsx
│   │   │   ├── analytics-modal.tsx
│   │   │   └── share-modal.tsx
│   │   ├── ui/               # Shadcn UI components
│   │   ├── app-sidebar.tsx   # Sidebar navigation
│   │   ├── Header.tsx        # Header with auth
│   │   └── search-form.tsx   # Search component
│   ├── hooks/                # Custom React hooks
│   │   ├── use-auth.ts       # Firebase authentication
│   │   ├── use-boards.ts     # Board management
│   │   ├── use-analytics.ts  # Analytics tracking
│   │   └── use-mobile.ts     # Mobile detection
│   ├── lib/                  # Utility functions
│   │   ├── auth-context.tsx  # Firebase auth context
│   │   ├── auth-cookie.ts    # Cookie management
│   │   ├── firebase.ts       # Firebase configuration
│   │   ├── constants.ts      # App constants
│   │   ├── templates.ts      # Board templates
│   │   └── utils.ts          # Helper functions
│   ├── stores/               # Zustand state stores
│   │   ├── user-store.ts     # User state
│   │   ├── board-store.ts    # Board state
│   │   └── ui-store.ts       # UI state (modals, etc)
│   └── types/                # TypeScript types
│       └── index.ts          # All type definitions
├── public/                   # Static assets
│   └── images/              # Logo and images
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── env.example             # Environment template
├── package.json            # Dependencies
├── LICENSE                 # MIT License
└── README.md              # This file
```

---

## 🧱 Block Types

OpenBoard supports the following block types:

| Block Type       | Description                                      | Settings                                   |
| ---------------- | ------------------------------------------------ | ------------------------------------------ |
| **Link**         | Clickable link with title, description, and icon | URL, title, description, icon, thumbnail   |
| **Text**         | Formatted text content                           | Content, alignment, font size              |
| **Image**        | Image with optional caption and link             | URL, alt text, caption, link, aspect ratio |
| **Button**       | Call-to-action button                            | Text, URL, style, size                     |
| **Video**        | Embedded video (YouTube, Vimeo)                  | URL, platform, title                       |
| **Embed**        | Embedded content (Spotify, Twitter, etc.)        | URL, embed code, platform                  |
| **Social Links** | Grid of social media icons                       | Links array, layout                        |
| **Divider**      | Visual separator                                 | Style, width                               |
| **Spacer**       | Vertical spacing                                 | Height                                     |
| **Calendar**     | Booking calendar (Cal.com, Calendly)             | Provider, URL, title                       |
| **Form**         | Custom form                                      | Fields, submit URL                         |

### Adding New Block Types

1. Define the block interface in `src/types/index.ts`
2. Create the component in `src/components/blocks/`
3. Add to `BlockRenderer` in `block-renderer.tsx`
4. Update constants in `src/lib/constants.ts`

---

## 🗃️ State Management

OpenBoard uses Zustand for lightweight, performant state management:

### User Store (`useUserStore`)

- User profile and authentication state
- User settings and preferences

### Board Store (`useBoardStore`)

- Current board being edited
- Block management (add, update, delete, reorder)
- Board operations

### UI Store (`useUIStore`)

- Modal visibility state
- Editor mode toggle
- UI preferences

### Custom Hooks

- **useAuth()** - Firebase authentication and user sync with Firestore
- **useAuthContext()** - Access Firebase auth user state
- **useBoards()** - Board CRUD operations and real-time subscriptions
- **useAnalytics()** - Analytics tracking and data fetching

---

## 🔐 Authentication Flow

OpenBoard uses Firebase Authentication with the following features:

### Supported Methods

- ✉️ **Email/Password** authentication with email verification
- 🔵 **Google Sign-In** with OAuth
- 🔄 **Password Reset** via email link
- 💾 **Remember Me** functionality with persistent sessions

### Session Management

- **Cookie-based sessions** for API route authentication
- **Firebase Admin SDK** for server-side token verification
- **Automatic token refresh** handled by Firebase
- **Secure HTTP-only cookies** in production

### Auth Flow

1. User signs up/signs in via Firebase Auth
2. Auth state synced to React context (`AuthProvider`)
3. User profile created/loaded from Firestore
4. Auth cookie set for API routes
5. Protected routes check authentication status

### Files

- `src/lib/auth-context.tsx` - Auth provider and context
- `src/lib/auth-cookie.ts` - Cookie management utilities
- `src/hooks/use-auth.ts` - Auth hook with Firestore sync
- `src/app/login/page.tsx` - Login page
- `src/app/signup/page.tsx` - Signup page
- `src/app/reset-password/page.tsx` - Password reset

---

## 🌐 API Routes

### POST /api/ai/suggest

AI-powered content suggestions and optimization.

**Authentication**: Required (Firebase token in cookie)

**Request Body**:

```json
{
  "prompt": "Suggest a board description for a portfolio",
  "type": "board-description" | "link-title" | "content-suggestions" | "seo-optimization"
}
```

**Response**: Server-sent events (streaming)

**Types**:

- `board-description` - Generate compelling board descriptions (< 100 chars)
- `link-title` - Create catchy link titles (< 50 chars)
- `content-suggestions` - Suggest 3-5 content block ideas
- `seo-optimization` - Provide SEO-friendly suggestions

---

## 🎨 Customization

### Creating Custom Themes

Themes can be customized in the Theme Modal or programmatically:

```typescript
const customTheme: BoardTheme = {
  name: "My Theme",
  background: {
    type: "gradient",
    value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  primaryColor: "#667eea",
  secondaryColor: "#764ba2",
  textColor: "#ffffff",
  cardBackground: "rgba(255, 255, 255, 0.1)",
  cardBorder: "rgba(255, 255, 255, 0.2)",
  borderRadius: "lg",
  font: {
    heading: "system-ui",
    body: "system-ui",
  },
};
```

### Built-in Theme Presets

- **Modern** - Clean purple gradient
- **Ocean** - Blue gradient
- **Sunset** - Orange/pink gradient
- **Forest** - Green gradient
- **Monochrome** - Black and white
- **Minimal** - Light and clean

---

## 📊 Analytics

OpenBoard tracks the following metrics:

### Board Analytics

- **Views** - Total page views per board
- **Unique Visitors** - Unique visitor count
- **Engagement** - Average time on page
- **Referrers** - Traffic sources
- **Devices** - Mobile, desktop, tablet breakdown

### Block Analytics

- **Click tracking** per block
- **Click-through rate** calculation
- **Top performing blocks** ranking

### Analytics Dashboard

Access via the Analytics modal in the board editor to see:

- Daily view/click trends
- Device breakdown
- Top blocks performance
- Referrer sources

Analytics are stored in Firestore with privacy in mind.

---

## 🤖 AI Features

OpenBoard includes AI-powered features using OpenAI:

### Available Features

- **Board Descriptions** - Generate compelling descriptions
- **Link Titles** - Create catchy link titles
- **Content Suggestions** - Get ideas for new blocks
- **SEO Optimization** - Optimize for search engines

### Setup

To enable AI features, add your OpenAI API key to `.env.local`:

```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### Usage

1. In board editor, look for the sparkle ✨ icon
2. Click to get AI suggestions
3. Review and apply suggestions
4. Edit as needed

### Cost Considerations

- Uses GPT-4o-mini model (cost-effective)
- Streams responses for better UX
- Limited to authenticated users
- Monitor usage in OpenAI dashboard

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Reporting Bugs

1. Check [existing issues](https://github.com/brown2020/openboard/issues)
2. Create new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

### Suggesting Features

1. Check [feature requests](https://github.com/brown2020/openboard/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
2. Create new issue with:
   - Clear description
   - Use cases and benefits
   - Implementation approach
   - Mockups/examples

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Follow code style guidelines
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**

   ```bash
   git commit -m 'feat: add amazing feature'
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe changes and why
   - Reference related issues
   - Add screenshots for UI changes

### Code Style Guidelines

#### TypeScript

- Use TypeScript for all new files
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types from `src/types/index.ts`

```typescript
// Good
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ text, onClick, variant = "primary" }: ButtonProps) {
  // ...
}

// Bad
export function Button(props: any) {
  // ...
}
```

#### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper file naming: `kebab-case.tsx`

#### Styling

- Use Tailwind CSS utility classes
- Keep inline styles minimal
- Use `cn()` utility for conditional classes

```typescript
<div className={cn(
  "rounded-lg p-4",
  isActive && "bg-primary",
  isDisabled && "opacity-50"
)}>
```

### Commit Message Convention

Use clear, descriptive commit messages:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**

```
feat: add drag-and-drop block reordering
fix: resolve analytics tracking issue
docs: update Firebase setup instructions
```

### Priority Areas

We're especially looking for contributions in:

- [ ] Drag-and-drop block reordering
- [ ] Additional block types (polls, countdown, etc.)
- [ ] Advanced analytics charts
- [ ] Mobile app
- [ ] Internationalization (i18n)
- [ ] Performance optimizations
- [ ] Accessibility improvements

---

## 🔧 Troubleshooting

### Firebase Connection Issues

**Error: Firebase config missing**

- Check all Firebase env vars are set
- Verify they're prefixed with `NEXT_PUBLIC_`
- Restart dev server after adding vars

**Error: Permission denied**

- Check Firestore security rules
- Make sure you're signed in
- Verify board ownership

### Authentication Issues

**Error: Auth state not persisting**

- Check cookie settings in `auth-cookie.ts`
- Verify Firebase Auth is enabled
- Clear browser cache/cookies

**Error: Google Sign-In not working**

- Enable Google in Firebase Console
- Add authorized domains in Firebase
- Check redirect URIs

### Build Errors

**TypeScript errors**

```bash
npm run build
```

Fix any type errors shown

**ESLint errors**

```bash
npm run lint
```

Fix linting issues

### Image Loading Issues

**Error: Image hostname not configured**

Add the hostname to `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "your-domain.com",
      pathname: "/**",
    },
  ],
}
```

### Common Issues

1. **Port already in use**: Change port with `PORT=3001 npm run dev`
2. **Module not found**: Delete `node_modules` and run `npm install`
3. **Build fails**: Check Node.js version (need 18.x+)
4. **Firebase errors**: Verify all credentials are correct

---

## 🚢 Deployment

### Deploy to Vercel

The easiest way to deploy OpenBoard:

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add Environment Variables**

   - Copy all vars from `.env.local`
   - Add to Vercel project settings
   - Include Firebase and OpenAI keys

4. **Deploy!**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your live site

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brown2020/openboard)

### Environment Variables in Production

Make sure to add these in Vercel:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
OPENAI_API_KEY=... (optional)
```

### Custom Domain

1. Add domain in Vercel settings
2. Update DNS records as instructed
3. Wait for SSL certificate
4. Update Firebase authorized domains

### Firebase Production Setup

1. **Update Firestore Rules** to production mode
2. **Add authorized domains** in Firebase Console
3. **Enable reCAPTCHA** for auth (optional)
4. **Set up indexes** for better query performance

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What this means:

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ Liability and warranty disclaimer

---

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Next.js](https://nextjs.org/) - The React Framework
- [React](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling Framework
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful UI Components
- [Firebase](https://firebase.google.com/) - Authentication & Backend
- [Zustand](https://zustand-demo.pmnd.rs/) - State Management
- [Lucide](https://lucide.dev/) - Icon Library
- [OpenAI](https://openai.com/) - AI Features
- [Vercel](https://vercel.com/) - Deployment Platform

---

## 📧 Support

Need help?

- 📖 **Documentation**: This README
- 🐛 **Issues**: [GitHub Issues](https://github.com/brown2020/openboard/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/brown2020/openboard/discussions)
- 📧 **Email**: support@openboard.com
- 💬 **Discord**: Coming soon!

---

## 🗺️ Roadmap

Planned features and improvements:

### Short Term

- [x] Firebase Authentication
- [x] Board CRUD operations
- [x] Multiple block types
- [x] Theme customization
- [x] Analytics tracking
- [x] AI suggestions
- [x] Template gallery

### Medium Term

- [ ] Drag-and-drop block reordering
- [ ] Video and embed blocks
- [ ] Calendar integration (Cal.com, Calendly)
- [ ] Form builder block
- [ ] Advanced analytics dashboard
- [ ] Team collaboration
- [ ] Custom domain support

### Long Term

- [ ] Template marketplace
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Zapier integration
- [ ] API for third-party integrations
- [ ] Multi-language support (i18n)
- [ ] Advanced SEO tools
- [ ] A/B testing features

---

## 🎯 Performance

OpenBoard is built for speed:

- ⚡ **Next.js 16** - Latest features and optimizations
- 🔥 **Turbopack** - Blazing fast builds
- 📦 **Code Splitting** - Load only what's needed
- 🖼️ **Image Optimization** - Automatic WebP conversion
- 🎨 **CSS Purging** - Minimal CSS bundle
- 🚀 **Edge Functions** - Fast API responses
- 📱 **Mobile-First** - Optimized for all devices

---

## 🔒 Security

Security best practices implemented:

- ✅ **Firebase Auth** - Industry-standard authentication
- ✅ **Firestore Rules** - Database-level security
- ✅ **Environment Vars** - Secure credential management
- ✅ **HTTPS Only** - Encrypted connections
- ✅ **Input Validation** - Type-safe with TypeScript
- ✅ **XSS Protection** - React's built-in protection
- ✅ **CSRF Protection** - Next.js built-in
- ✅ **Rate Limiting** - API route protection (recommended)

---

<div align="center">

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=brown2020/openboard&type=Date)](https://star-history.com/#brown2020/openboard&Date)

**Built with ❤️ by the OpenBoard community**

[⭐ Star on GitHub](https://github.com/brown2020/openboard) • [🐦 Follow Updates](https://twitter.com/openboard) • [💬 Join Discord](https://discord.gg/openboard)

**Let's make link-in-bio open source! 🚀**

</div>
