import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

/** True when public client config is present (CI may omit secrets on gate steps). */
export function hasFirebaseClientConfig(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

function getFirebaseApp(): FirebaseApp {
  if (!hasFirebaseClientConfig()) {
    throw new Error(
      "Firebase client config is missing. Set NEXT_PUBLIC_FIREBASE_* env vars (or GitHub Actions secrets in CI)."
    );
  }
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

/**
 * Deferred client init so `next build` / CI gate jobs survive empty secrets.
 * Auth stays a Proxy (property access). Firestore/Storage are real instances
 * from getters — modular APIs use instanceof checks that break under Proxy.
 */
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let storageInstance: FirebaseStorage | undefined;
let googleProviderInstance: GoogleAuthProvider | undefined;

function getClientAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getClientDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

export function getClientStorage(): FirebaseStorage {
  if (!storageInstance) storageInstance = getStorage(getFirebaseApp());
  return storageInstance;
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProviderInstance) {
    googleProviderInstance = new GoogleAuthProvider();
  }
  return googleProviderInstance;
}

export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getClientAuth();
    const value = Reflect.get(instance as object, prop, instance);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
});

export const googleProvider: GoogleAuthProvider = new Proxy(
  {} as GoogleAuthProvider,
  {
    get(_target, prop) {
      const instance = getGoogleProvider();
      const value = Reflect.get(instance as object, prop, instance);
      return typeof value === "function"
        ? (value as (...args: unknown[]) => unknown).bind(instance)
        : value;
    },
  }
);
