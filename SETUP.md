# OpenBoard Setup Guide

Complete step-by-step guide to get OpenBoard running locally.

## Prerequisites

Make sure you have:

- Node.js 18.x or higher
- npm or yarn
- Git

## Step 1: Clone and Install

```bash
git clone https://github.com/yourusername/openboard.git
cd openboard
npm install
```

## Step 2: Firebase Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "openboard")
4. Disable Google Analytics (optional)
5. Create project

### 2.2 Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add rules later)
4. Select a location
5. Create

### 2.3 Enable Storage

1. Go to "Storage" in Firebase Console
2. Click "Get Started"
3. Start in test mode
4. Done

### 2.4 Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Web icon `</>`
4. Register your app
5. Copy the config values

### 2.5 Set Security Rules

**Firestore Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /boards/{boardId} {
      allow read: if true;
      allow write: if request.auth != null &&
        (resource == null || resource.data.ownerId == request.auth.uid);
    }

    match /analytics/{docId} {
      allow read: if request.auth != null;
      allow write: if true;
    }

    match /clicks/{clickId} {
      allow write: if true;
      allow read: if request.auth != null;
    }
  }
}
```

**Storage Rules:**

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

## Step 3: Clerk Setup

### 3.1 Create Clerk Account

1. Go to [Clerk.com](https://clerk.com)
2. Sign up for free account
3. Create new application

### 3.2 Configure Authentication

1. In Clerk Dashboard, go to "User & Authentication"
2. Enable desired sign-in methods:
   - Email/Password ✓
   - Google (optional)
   - GitHub (optional)
3. Configure email settings
4. Save changes

### 3.3 Get API Keys

1. Go to "API Keys" in Clerk Dashboard
2. Copy "Publishable Key"
3. Copy "Secret Key"

### 3.4 Configure URLs

In Clerk Dashboard, set these URLs:

- Home URL: `http://localhost:3000`
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in: `/boards`
- After sign-up: `/boards`

## Step 4: Environment Variables

Create `.env.local` in project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/boards
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/boards

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# Optional: AI Features
OPENAI_API_KEY=sk-your-openai-key-here
```

## Step 5: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 6: Test the Application

### 6.1 Sign Up

1. Click "Get Started Free"
2. Create account with email
3. Verify email if required

### 6.2 Create Board

1. After sign-in, you'll be at `/boards`
2. Click "New Board"
3. Enter board title and slug
4. Click "Create Board"

### 6.3 Add Blocks

1. In board editor, click "Add Block"
2. Add a link with title and URL
3. Click "Save"

### 6.4 View Public Board

1. Click "Preview" in editor
2. See your live board
3. Test analytics tracking

## Troubleshooting

### Firebase Connection Issues

**Error: Firebase config missing**

- Check all Firebase env vars are set
- Verify they're prefixed with `NEXT_PUBLIC_`
- Restart dev server after adding vars

**Error: Permission denied**

- Check Firestore security rules
- Make sure you're signed in
- Verify board ownership

### Clerk Authentication Issues

**Error: Clerk keys missing**

- Verify both publishable and secret keys are set
- Check they match your Clerk dashboard
- Ensure no extra spaces in keys

**Error: Redirect loop**

- Check Clerk URL configuration
- Verify middleware.ts paths
- Clear browser cache/cookies

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

## Optional: OpenAI Setup

For AI features:

1. Create [OpenAI account](https://platform.openai.com/)
2. Generate API key
3. Add to `.env.local`:

```env
OPENAI_API_KEY=sk-your-key-here
```

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables in Vercel

Add all variables from `.env.local` to Vercel project settings.

### Custom Domain

1. Add domain in Vercel settings
2. Update DNS as instructed
3. Wait for SSL certificate

## Database Indexes (Optional)

For better performance, create these Firestore indexes:

**Boards Collection:**

- Fields: `ownerId` (Ascending), `updatedAt` (Descending)

**Analytics Collection:**

- Fields: `boardId` (Ascending), `date` (Descending)

Go to Firestore Console → Indexes → Composite to create.

## Support

Having issues? Check:

- [GitHub Issues](https://github.com/yourusername/openboard/issues)
- [Documentation](https://github.com/yourusername/openboard)
- Email: support@openboard.com

---

**Next Steps:**

- Customize your theme
- Try different templates
- Share your board!
