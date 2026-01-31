import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/**
 * Firebase Configuration
 * Requires environment variables in production
 */
const isDev = process.env.NODE_ENV === "development";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (isDev ? "demo-api-key" : ""),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (isDev ? "demo.firebaseapp.com" : ""),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (isDev ? "demo-project" : ""),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (isDev ? "demo.appspot.com" : ""),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (isDev ? "123456789" : ""),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (isDev ? "1:123456789:web:abc123" : ""),
};

// Validate required config in production
if (!isDev && (!firebaseConfig.apiKey || !firebaseConfig.projectId)) {
  throw new Error("Missing required Firebase configuration. Please set NEXT_PUBLIC_FIREBASE_* environment variables.");
}

/**
 * Initialize Firebase - reuses existing app if already initialized
 */
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, storage, auth, googleProvider };
