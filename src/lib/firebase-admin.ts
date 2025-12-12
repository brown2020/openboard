import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";

let _app: ReturnType<typeof initializeApp> | null = null;

type ServiceAccountJson = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function tryLoadServiceAccountFromFile(): ServiceAccountJson | null {
  try {
    const candidatePath = path.join(process.cwd(), "service_key.json");
    if (!fs.existsSync(candidatePath)) return null;
    const raw = fs.readFileSync(candidatePath, "utf8");
    return JSON.parse(raw) as ServiceAccountJson;
  } catch {
    return null;
  }
}

function getAdminApp() {
  if (_app) return _app;

  if (getApps().length > 0) {
    _app = getApps()[0]!;
    return _app;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const serviceAccount = !projectId || !clientEmail || !privateKey
    ? tryLoadServiceAccountFromFile()
    : null;

  const resolvedProjectId = projectId ?? serviceAccount?.project_id;
  const resolvedClientEmail = clientEmail ?? serviceAccount?.client_email;
  const resolvedPrivateKey =
    privateKey ?? serviceAccount?.private_key?.replace(/\\n/g, "\n");

  if (!resolvedProjectId || !resolvedClientEmail || !resolvedPrivateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  _app = initializeApp({
    credential: cert({
      projectId: resolvedProjectId,
      clientEmail: resolvedClientEmail,
      privateKey: resolvedPrivateKey,
    }),
  });

  return _app;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export async function verifyFirebaseAuthCookie(cookieValue: string) {
  const adminAuth = getAdminAuth();

  // Prefer session cookie verification (HttpOnly cookie set by our server).
  try {
    return await adminAuth.verifySessionCookie(cookieValue, true);
  } catch {
    // Back-compat: some environments may still be using ID tokens during migration.
    return await adminAuth.verifyIdToken(cookieValue, true);
  }
}


