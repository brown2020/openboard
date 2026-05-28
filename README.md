# 🎨 OpenBoard

<div align="center">

**The open-source Linktree alternative. Create beautiful, shareable boards for your links, content, and projects.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Live Demo](https://openboard.vercel.app) • [Report Bug](https://github.com/brown2020/openboard/issues) • [Request Feature](https://github.com/brown2020/openboard/issues)

</div>

---

## ✨ What is OpenBoard?

OpenBoard is a **free, open-source alternative to Linktree** that lets you create stunning, customizable link pages. Unlike proprietary solutions, you own your data, can self-host, and customize everything.

**Perfect for:**

- 🎭 **Creators** - Instagram, TikTok, YouTube link-in-bio
- 💻 **Developers** - Portfolio and project showcases
- 🏢 **Businesses** - Product catalogs and contact pages
- 📚 **Educators** - Course materials and resource collections
- 👥 **Teams** - Shared resource boards and documentation

---

## 🖼️ Screenshots

<details>
<summary>Click to view screenshots</summary>

|               Board Editor               |               Public View                |          Theme Customization           |
| :--------------------------------------: | :--------------------------------------: | :------------------------------------: |
| ![Editor](public/screenshots/editor.png) | ![Public](public/screenshots/public.png) | ![Theme](public/screenshots/theme.png) |

</details>

---

## 🚀 Features

### Core Features

- ✨ **Beautiful Boards** - Create stunning, customizable link pages
- 🎨 **Theme System** - Pre-built themes + full color/gradient customization
- 🔗 **12 Block Types** - Links, text, images, videos, buttons, forms, and more
- ✍️ **Rich Text Editor** - Full WYSIWYG editing powered by Tiptap
- 🎯 **Drag & Drop** - Intuitive block reordering with smooth animations
- 📱 **Mobile-First** - Responsive design that looks great everywhere
- ⚡ **Lightning Fast** - Built with Next.js 16 + Turbopack

### Advanced Features

- 🤖 **AI-Powered** - Get intelligent content suggestions via OpenAI
- 📊 **Built-in Analytics** - Track views, clicks, and engagement
- 🔒 **Privacy Controls** - Public, unlisted, password-protected, or private
- 👥 **Collaboration** - Invite team members to edit boards
- 📋 **Embed Support** - Embed boards anywhere with iframe code
- ↩️ **Undo/Redo** - Full history support with keyboard shortcuts

---

## 💻 Tech Stack

| Category          | Technology                                                              | Version |
| ----------------- | ----------------------------------------------------------------------- | ------- |
| **Framework**     | [Next.js](https://nextjs.org/)                                          | 16.x    |
| **UI Library**    | [React](https://react.dev/)                                             | 19.x    |
| **Language**      | [TypeScript](https://www.typescriptlang.org/)                           | 5.x     |
| **Styling**       | [Tailwind CSS](https://tailwindcss.com/)                                | 4.x     |
| **Backend**       | [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)     | 12.x    |
| **State**         | [Zustand](https://zustand-demo.pmnd.rs/)                                | 5.x     |
| **Rich Text**     | [Tiptap](https://tiptap.dev/)                                           | 3.x     |
| **Drag & Drop**   | [dnd-kit](https://dndkit.com/)                                          | 6.x     |
| **AI**            | [OpenAI](https://openai.com/) + [Vercel AI SDK](https://sdk.vercel.ai/) | Latest  |
| **Icons**         | [Lucide React](https://lucide.dev/)                                     | Latest  |
| **Validation**    | [Zod](https://zod.dev/)                                                 | 4.x     |
| **UI Components** | [Radix UI](https://www.radix-ui.com/)                                   | Latest  |

---

## 📦 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm**, **yarn**, or **pnpm**
- **Firebase** account (free tier works)
- **OpenAI API key** (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/brown2020/openboard.git
cd openboard

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

---

## 🔧 Configuration

### Firebase Setup

1. **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/) → Create new project

2. **Enable Services**:

   - **Authentication**: Enable Google and/or Email/Password providers
   - **Firestore Database**: Create in production mode
   - **Storage**: Enable for image uploads

3. **Get Credentials**:

   - Go to Project Settings → Your apps → Add web app
   - Copy the config values to `.env.local`

4. **Security Rules**:
   - Copy `firestore.rules` to Firestore Rules tab
   - Copy `storage.rules` to Storage Rules tab

### Environment Variables

```bash
# .env.local

# Firebase (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123

# Firebase Admin (Required for API routes)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=sk-your_key_here
```

---

## 📁 Project Structure

```
openboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # Authenticated pages (sidebar layout)
│   │   │   ├── board/[id]/     # Board editor
│   │   │   ├── boards/         # Board listing
│   │   │   ├── dashboard/      # Analytics dashboard
│   │   │   └── templates/      # Template gallery
│   │   ├── api/ai/             # AI API routes
│   │   ├── login/              # Authentication pages
│   │   ├── signup/
│   │   └── u/[username]/[slug] # Public board view
│   ├── components/
│   │   ├── auth/               # Auth components (login, signup)
│   │   ├── blocks/             # Block implementations
│   │   ├── modals/             # Theme, Share, Analytics modals
│   │   └── ui/                 # Shadcn/Radix UI primitives
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities, Firebase config
│   ├── stores/                 # Zustand state stores
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
└── ...config files
```

---

## 🧱 Block Types

| Block            | Description      | Features                               |
| ---------------- | ---------------- | -------------------------------------- |
| **Rich Text**    | WYSIWYG editor   | Bold, italic, headings, lists, links   |
| **Simple Text**  | Plain text       | Alignment, font sizes                  |
| **Link**         | Clickable card   | URL, title, description, icon          |
| **Button**       | CTA button       | 4 styles, 3 sizes                      |
| **Image**        | Media display    | Upload or URL, captions, aspect ratios |
| **Video**        | Video embed      | YouTube, Vimeo, custom                 |
| **Embed**        | Content embed    | Spotify, Twitter, Instagram            |
| **Social Links** | Icon grid        | Multiple platforms, layouts            |
| **Calendar**     | Booking widget   | Cal.com, Calendly                      |
| **Form**         | Data collection  | Custom fields, webhook support         |
| **Divider**      | Visual separator | Solid, dashed, dotted styles           |
| **Spacer**       | Vertical space   | 4 height options                       |

---

## ⌨️ Keyboard Shortcuts

| Shortcut               | Action                |
| ---------------------- | --------------------- |
| `Cmd/Ctrl + S`         | Save board            |
| `Cmd/Ctrl + Z`         | Undo                  |
| `Cmd/Ctrl + Shift + Z` | Redo                  |
| `Cmd/Ctrl + B`         | Bold (in rich text)   |
| `Cmd/Ctrl + I`         | Italic (in rich text) |

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import repo on [Vercel](https://vercel.com)
3. Add environment variables in Project Settings
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brown2020/openboard)

### Self-Hosting

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/openboard.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
5. **Push** to branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Development Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Code Style

- Use **TypeScript** for all new code
- Follow existing patterns and conventions
- Use **functional components** with hooks
- Keep components small and focused

### Product roadmap

See **[spec.md](./spec.md)** for the current feature inventory and prioritized roadmap.

---

## 🔧 Troubleshooting

<details>
<summary><strong>Firebase connection errors</strong></summary>

- Verify all `NEXT_PUBLIC_FIREBASE_*` values in `.env.local`
- Check Firebase Console → Authentication is enabled
- Ensure Firestore and Storage rules allow access

</details>

<details>
<summary><strong>Authentication not persisting</strong></summary>

- Check that cookies are enabled in browser
- Verify Firebase Auth domain is correctly set
- Clear browser cookies and try again

</details>

<details>
<summary><strong>Build fails</strong></summary>

- Ensure Node.js >= 18: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

</details>

<details>
<summary><strong>AI features not working</strong></summary>

- Verify `OPENAI_API_KEY` is set in `.env.local`
- Check API key has sufficient credits
- Ensure Firebase Admin credentials are correct (for auth verification)

</details>

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Firebase](https://firebase.google.com/) - Backend services
- [Tiptap](https://tiptap.dev/) - Rich text editor
- [dnd-kit](https://dndkit.com/) - Drag and drop
- [Radix UI](https://radix-ui.com/) - Accessible components
- [Lucide](https://lucide.dev/) - Beautiful icons

---

<div align="center">

**Built with ❤️ by the OpenBoard community**

[⭐ Star us on GitHub](https://github.com/brown2020/openboard) — it helps!

</div>
