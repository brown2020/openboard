# 🎨 OpenBoard

<div align="center">

**The open-source platform to create beautiful, shareable boards for your links, content, and projects.**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6.0-orange?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Demo](https://openboard.vercel.app) • [GitHub](https://github.com/brown2020/openboard)

</div>

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started & Installation](#-getting-started--installation)
  - [Firebase Setup](#firebase-setup)
  - [Environment Variables](#environment-variables)
- [Usage Guide](#-usage-guide)
  - [Rich Text Editing](#rich-text-editing)
  - [Block Management](#block-management)
- [Project Structure](#-project-structure)
- [Architecture & Concepts](#-architecture--concepts)
  - [Block Types](#block-types)
  - [State Management](#state-management)
  - [Authentication](#authentication-flow)
  - [AI Features](#ai-features)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Changelog](#-changelog)
- [License](#-license)

---

## 🌟 Features

### Core Features

- ✨ **Beautiful Boards** - Create stunning, customizable boards with flexible layouts
- 🎨 **Theme System** - Pre-built themes and full customization options
- 🔗 **Multiple Block Types** - Links, text, images, videos, buttons, and more
- ✍️ **Rich Text Editor** - World-class WYSIWYG editor powered by Tiptap
- 🎯 **Drag & Drop** - Intuitive block reordering with smooth animations
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

OpenBoard is built with the latest web technologies.

### Core Dependencies (Installed Versions)

| Package | Version | Description |
|---------|---------|-------------|
| **Next.js** | `16.0.3` | React Framework with App Router & Turbopack |
| **React** | `19.2.0` | UI Library |
| **TypeScript** | `5.9.3` | Static Type Checking |
| **Tailwind CSS** | `4.1.17` | Utility-first CSS Framework |
| **Firebase** | `12.6.0` | Authentication, Firestore, Storage |
| **Firebase Admin** | `13.6.0` | Server-side Firebase operations |
| **Zustand** | `5.0.8` | State Management |
| **@tiptap/react** | `3.11.0` | Headless Rich Text Editor |
| **@dnd-kit/core** | `6.3.1` | Drag and Drop Toolkit |
| **OpenAI** | `6.9.1` | AI Features |
| **AI SDK** | `5.0.98` | Vercel AI SDK |
| **Lucide React** | `0.554.0` | Icon Library |

---

## 🚀 Getting Started & Installation

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
```

### Firebase Setup

To make OpenBoard fully functional, you need to configure a Firebase project.

1.  **Create Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Authentication**:
    *   Go to **Build > Authentication**.
    *   Click "Get Started".
    *   Enable **Google** provider (and/or Email/Password).
3.  **Firestore Database**:
    *   Go to **Build > Firestore Database**.
    *   Click "Create Database".
    *   Start in **Production mode**.
    *   Select a location close to your users.
4.  **Storage**:
    *   Go to **Build > Storage**.
    *   Click "Get Started".
    *   Start in **Production mode**.

#### Security Rules

Copy the contents of `firestore.rules` and `storage.rules` from this repository into the **Rules** tab of your Firestore Database and Storage bucket respectively in the Firebase Console.

### Environment Variables

1.  Copy the example file:
    ```bash
    cp env.example .env.local
    ```

2.  **Client-side Config**:
    *   In Firebase Console, go to **Project Settings** (gear icon).
    *   Scroll to **Your apps** -> Click the web icon (`</>`) to register a web app.
    *   Copy the config values (`apiKey`, `authDomain`, `projectId`, etc.) into `.env.local`.

3.  **Server-side Config (for AI features)**:
    *   In Firebase Console, go to **Project Settings > Service accounts**.
    *   Click **Generate new private key**.
    *   Open the downloaded JSON file.
    *   Copy `client_email` to `FIREBASE_CLIENT_EMAIL` in `.env.local`.
    *   Copy `private_key` to `FIREBASE_PRIVATE_KEY` in `.env.local`. (Make sure to keep the newlines or use `\n`).

4.  **OpenAI (Optional)**:
    *   If you want AI features, add your `OPENAI_API_KEY` to `.env.local`.

### Running the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

---

## 📖 Usage Guide

### Creating & Editing Blocks

1.  **Add Block**: Click the **"Add Block"** button at the bottom of the editor.
2.  **Select Type**: Choose from **Rich Text**, **Link**, **Button**, **Image**, **Video**, etc.
3.  **Edit**: Hover over any block to see controls:
    *   **Edit (✏️)**: Modify content inline.
    *   **Visibility (👁️)**: Toggle public visibility.
    *   **Delete (🗑️)**: Remove the block.

### Rich Text Editing

OpenBoard uses **Tiptap** for a powerful writing experience.

*   **Formatting**: Highlight text for the floating menu or use the toolbar for Bold (**B**), Italic (*I*), Underline (<u>U</u>), Strikethrough (~~S~~), and Code (`<>`).
*   **Headings**: Use H1, H2, H3 for structure.
*   **Lists**: Create bullet (•) or numbered (1.) lists.
*   **Links**: Select text and click 🔗 to add URLs.
*   **Keyboard Shortcuts**:
    *   Bold: `Cmd/Ctrl + B`
    *   Italic: `Cmd/Ctrl + I`
    *   Undo/Redo: `Cmd/Ctrl + Z` / `Cmd/Ctrl + Shift + Z`

### Block Management

*   **Reordering**: Hover over a block and drag the **⋮⋮** handle on the left to move it.
*   **Board Info**: Click the board title or description to edit them inline. Changes save automatically.

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
│   │   ├── api/               # API routes (AI, etc.)
│   │   ├── login/             # Auth pages
│   │   ├── u/[username]/      # Public board view
│   ├── components/            # React components
│   │   ├── blocks/           # Block implementations (Text, Image, etc.)
│   │   ├── modals/           # Dialogs (Theme, Share, Analytics)
│   │   ├── ui/               # Shadcn UI primitives
│   ├── hooks/                # Custom hooks (useAuth, useBoards)
│   ├── lib/                  # Utilities & Firebase config
│   ├── stores/               # Zustand state stores
│   └── types/                # TypeScript definitions
├── public/                   # Static assets
└── ...config files
```

---

## 🏗 Architecture & Concepts

### Block Types

OpenBoard supports a modular block system defined in `src/types/index.ts`.

| Block Type | Description | Settings |
|------------|-------------|----------|
| **Rich Text** | WYSIWYG editor | HTML content, alignment |
| **Link** | Clickable card | URL, title, description, icon |
| **Button** | CTA button | Text, URL, style, size |
| **Image** | Media display | URL, alt, caption, aspect ratio |
| **Video** | Embeds | YouTube, Vimeo, Custom |
| **Embed** | Social/Content | Spotify, Twitter, etc. |
| **Form** | Data collection | Fields, submit URL |
| **Calendar** | Booking | Cal.com, Calendly |
| **Socials** | Icon grid | Social profiles |

### State Management

We use **Zustand** for managing global client state:
- `useBoardStore`: Manages the current board, block operations (CRUD), and ordering.
- `useUserStore`: Manages user profile and preferences.
- `useUIStore`: Manages modal visibility and UI states.

### Authentication Flow

- **Firebase Auth**: Handles Google/Email sign-ins.
- **Session**: Uses secure HTTP-only cookies for API route protection.
- **Context**: `AuthContext` provides user state throughout the React tree.

### AI Features

Powered by OpenAI and Vercel AI SDK:
- **Generative Content**: Suggests board descriptions and link titles.
- **Streaming**: Responses stream in real-time for a snappy UX.
- **Endpoints**: `/api/ai/suggest` handles prompt processing.

---

## 🤝 Contributing

We welcome contributions!

1.  Fork the repository.
2.  Create a feature branch: `git checkout -b feature/amazing-feature`
3.  Commit changes: `git commit -m 'feat: add amazing feature'`
4.  Push to branch: `git push origin feature/amazing-feature`
5.  Open a Pull Request.

**Priority Areas:**
- [ ] Image upload from device
- [ ] Advanced analytics charts
- [ ] Internationalization (i18n)
- [ ] Accessibility improvements

---

## 🔧 Troubleshooting

**Firebase Errors?**
- Ensure `.env.local` has correct `NEXT_PUBLIC_FIREBASE_*` keys.
- Check Firestore/Storage rules in Firebase Console.

**Auth Not Persisting?**
- Check `auth-cookie.ts` settings.
- Verify Firebase Auth is enabled in the console.

**Build Fails?**
- Ensure Node.js version is >= 18.
- Run `npm install` to refresh dependencies.

---

## 🚢 Deployment

The easiest way to deploy is via **Vercel**:

1.  Push your code to GitHub.
2.  Import the repo on Vercel.
3.  Add all environment variables from `.env.local` to Vercel Project Settings.
4.  Deploy!

---

## 📜 Changelog

### [Unreleased] - Rich Text Editor & Enhanced Block Editing

#### 🎉 Major Features
- **Rich Text Editor**: Integrated Tiptap for full WYSIWYG editing (Bold, Italic, Headings, Lists, Code, Links).
- **Enhanced Block System**: Unified editing controls (Edit, Visibility, Delete) for all block types.
- **Drag & Drop**: Smooth reordering using `@dnd-kit` with keyboard support.
- **New Block Types**: Added Video, Embed, Calendar, Social Links, and Form blocks.

#### ✨ Enhancements
- **Image Block**: Added aspect ratio selection, captions, and improved loading.
- **UI Polish**: Better hover states, consistent spacing, and dark mode support.
- **AI Integration**: Content suggestions directly in the block editor.

#### 🛠️ Technical
- Updated dependencies to Next.js 16 and React 19.
- Optimized bundle size with dynamic imports.
- Improved type safety across all block components.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ by the OpenBoard community</strong>
</div>
