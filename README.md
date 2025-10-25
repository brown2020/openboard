# 🎨 OpenBoard

<div align="center">

**The open-source platform to create beautiful, shareable boards for your links, content, and projects.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0-orange?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Demo](https://openboard.vercel.app) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 🌟 Features

### Core Features

- ✨ **Beautiful Boards** - Create stunning, customizable boards with flexible layouts
- 🎨 **Theme System** - Pre-built themes and full customization options
- 🔗 **Multiple Block Types** - Links, text, images, videos, buttons, and more
- 📱 **Mobile-First** - Responsive design that looks great on all devices
- 🚀 **Lightning Fast** - Built with Next.js 15 for optimal performance

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

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase account
- Clerk account (for authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/openboard.git
cd openboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/boards
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/boards

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Optional: AI Features
OPENAI_API_KEY=sk-...
```

### 4. Set Up Firebase

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Firebase Storage
4. Set up Firestore Security Rules:

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

### 5. Set Up Clerk Authentication

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys to `.env.local`
4. Configure sign-in/sign-up options in Clerk dashboard

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

---

## 📖 Documentation

### Project Structure

```
openboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/             # App layout pages
│   │   ├── api/               # API routes
│   │   ├── board/[id]/        # Board editor
│   │   ├── boards/            # Board listing
│   │   ├── u/[username]/[slug]/ # Public board view
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── blocks/           # Block type components
│   │   ├── modals/           # Modal components
│   │   └── ui/               # Shadcn UI components
│   ├── hooks/                # Custom React hooks
│   │   ├── use-auth.ts       # Authentication hook
│   │   ├── use-boards.ts     # Board management hook
│   │   └── use-analytics.ts  # Analytics hook
│   ├── lib/                  # Utility functions
│   │   ├── firebase.ts       # Firebase configuration
│   │   ├── constants.ts      # App constants
│   │   └── utils.ts          # Helper functions
│   ├── stores/               # Zustand state stores
│   │   ├── user-store.ts     # User state
│   │   ├── board-store.ts    # Board state
│   │   └── ui-store.ts       # UI state
│   └── types/                # TypeScript types
│       └── index.ts          # Type definitions
├── public/                   # Static assets
└── package.json             # Dependencies
```

### Key Technologies

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Storage**: [Firebase Storage](https://firebase.google.com/docs/storage)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) + [OpenAI](https://openai.com/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)

### Block Types

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

### API Routes

- `POST /api/ai/suggest` - AI content suggestions and optimization

### State Management

OpenBoard uses Zustand for lightweight, performant state management:

- **User Store** (`useUserStore`) - User profile and authentication state
- **Board Store** (`useBoardStore`) - Board data and operations
- **UI Store** (`useUIStore`) - UI state (modals, editor mode, etc.)

### Custom Hooks

- **useAuth()** - Authentication and user sync with Clerk + Firebase
- **useBoards()** - Board CRUD operations and real-time subscriptions
- **useAnalytics()** - Analytics tracking and data fetching

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
  textColor: "#ffffff",
  cardBackground: "rgba(255, 255, 255, 0.1)",
  borderRadius: "lg",
  font: {
    heading: "system-ui",
    body: "system-ui",
  },
};
```

### Adding New Block Types

1. Define the block type in `src/types/index.ts`
2. Create the component in `src/components/blocks/`
3. Add to `BlockRenderer` in `src/components/blocks/block-renderer.tsx`
4. Update constants in `src/lib/constants.ts`

---

## 📊 Analytics

OpenBoard tracks the following metrics:

- **Views** - Total page views per board
- **Unique Visitors** - Unique visitor count
- **Clicks** - Clicks per block
- **Referrers** - Traffic sources
- **Devices** - Mobile, desktop, tablet breakdown

Analytics are stored in Firestore and can be viewed in the Analytics Modal.

---

## 🤖 AI Features

OpenBoard includes AI-powered features using OpenAI:

- **Board Descriptions** - Generate compelling descriptions
- **Link Titles** - Create catchy link titles
- **Content Suggestions** - Get ideas for new blocks
- **SEO Optimization** - Optimize for search engines

To enable AI features, add your OpenAI API key to `.env.local`:

```env
OPENAI_API_KEY=sk-...
```

---

## 🚢 Deployment

### Deploy to Vercel

The easiest way to deploy OpenBoard is with [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/openboard)

### Environment Variables

Make sure to add all environment variables from `.env.local` to your Vercel project settings.

### Custom Domain

To use a custom domain:

1. Add your domain in Vercel settings
2. Update DNS records as instructed
3. Optionally enable custom domains per board in board settings

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write TypeScript with proper types
- Use functional components and hooks
- Follow the component structure in existing code
- Add comments for complex logic
- Test your changes thoroughly

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful UI components
- [Clerk](https://clerk.com/) - Authentication made easy
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📧 Support

- **Documentation**: [Coming Soon]
- **Issues**: [GitHub Issues](https://github.com/yourusername/openboard/issues)
- **Community**: [Discord](https://discord.gg/openboard) (Coming Soon)
- **Email**: support@openboard.com

---

## 🗺️ Roadmap

- [ ] Drag-and-drop block reordering
- [ ] More block types (polls, countdowns, etc.)
- [ ] Template marketplace
- [ ] Team collaboration features
- [ ] Advanced analytics (charts, exports)
- [ ] Mobile app
- [ ] Browser extension
- [ ] Zapier integration
- [ ] Custom CSS editor
- [ ] Multi-language support

---

<div align="center">

**Built with ❤️ by the OpenBoard community**

[⭐ Star on GitHub](https://github.com/yourusername/openboard) • [🐦 Follow on Twitter](https://twitter.com/openboard)

</div>
