"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeCollaboratorEmail } from "@/lib/collaborators";
import type { UserProfile } from "@/types";

export async function resolveUserIdByEmail(
  email: string
): Promise<string | null> {
  const normalized = normalizeCollaboratorEmail(email);
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", normalized), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  const data = userDoc.data() as UserProfile;
  return data.id || userDoc.id;
}

export async function fetchUserProfileById(
  userId: string
): Promise<UserProfile | null> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function fetchCollaboratorProfiles(
  userIds: string[]
): Promise<Map<string, UserProfile>> {
  const uniqueIds = [...new Set(userIds)];
  const profiles = new Map<string, UserProfile>();

  await Promise.all(
    uniqueIds.map(async (userId) => {
      const profile = await fetchUserProfileById(userId);
      if (profile) {
        profiles.set(userId, profile);
      }
    })
  );

  return profiles;
}
