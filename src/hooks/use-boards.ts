"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useBoardStore } from "@/stores/board-store";
import { Board } from "@/types";
import { useAuthContext } from "@/lib/auth-context";
import { useUserStore } from "@/stores/user-store";
import { DEFAULT_THEME } from "@/lib/constants";
import { getValidToken } from "@/lib/auth-utils";
import { mergeBoardLists } from "@/lib/collaborators";
import { useErrorHandler, getFirebaseErrorMessage } from "./use-error-handler";

function mapBoardDocs(
  docs: { id: string; data: () => Record<string, unknown> }[]
): Board[] {
  return docs.map((entry) => ({
    id: entry.id,
    ...entry.data(),
  })) as Board[];
}

export function useBoards() {
  // Get Firebase user directly from auth context
  const { user: firebaseUser, loading: authLoading } = useAuthContext();
  // Get user profile from store
  const { user: userProfile, isHydrated } = useUserStore();

  const { boards, setBoards, setStatus, setError } = useBoardStore();
  const { handleError } = useErrorHandler();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const ownedBoardsRef = useRef<Board[]>([]);
  const sharedBoardsRef = useRef<Board[]>([]);

  const publishMergedBoards = useCallback(() => {
    setBoards(mergeBoardLists(ownedBoardsRef.current, sharedBoardsRef.current));
    setStatus("success");
  }, [setBoards, setStatus]);

  // Single effect with AbortController to prevent race conditions
  useEffect(() => {
    // Create abort controller to handle cleanup and race conditions
    const controller = new AbortController();

    // Clean up any existing subscription first
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Don't do anything if auth is still loading
    if (authLoading) {
      return;
    }

    // Don't subscribe if no Firebase auth
    if (!firebaseUser) {
      setBoards([]);
      setStatus("idle");
      return;
    }

    // Don't subscribe until user profile is hydrated and matches
    if (!isHydrated || !userProfile?.id || userProfile.id !== firebaseUser.uid) {
      return;
    }

    const initSubscription = async () => {
      try {
        // Force refresh the ID token to ensure Firestore has the latest auth state
        await getValidToken(firebaseUser);

        // Check if aborted before proceeding
        if (controller.signal.aborted) return;

        setStatus("loading");

        const boardsRef = collection(db, "boards");
        const ownedQuery = query(
          boardsRef,
          where("ownerId", "==", firebaseUser.uid),
          orderBy("updatedAt", "desc")
        );
        const sharedQuery = query(
          boardsRef,
          where("collaborators", "array-contains", firebaseUser.uid),
          orderBy("updatedAt", "desc")
        );

        // Check again before setting up listeners
        if (controller.signal.aborted) return;

        ownedBoardsRef.current = [];
        sharedBoardsRef.current = [];

        const unsubscribeOwned = onSnapshot(
          ownedQuery,
          (snapshot) => {
            if (controller.signal.aborted) return;
            ownedBoardsRef.current = mapBoardDocs(snapshot.docs);
            publishMergedBoards();
          },
          (error) => {
            if (controller.signal.aborted) return;
            handleError(error, "Failed to load owned boards");
            if (error.message.includes("index")) {
              setError("Database index required. Please check Firebase console.");
            } else {
              setError(getFirebaseErrorMessage(error));
            }
          }
        );

        const unsubscribeShared = onSnapshot(
          sharedQuery,
          (snapshot) => {
            if (controller.signal.aborted) return;
            sharedBoardsRef.current = mapBoardDocs(snapshot.docs);
            publishMergedBoards();
          },
          (error) => {
            if (controller.signal.aborted) return;
            handleError(error, "Failed to load shared boards");
            if (error.message.includes("index")) {
              setError("Database index required. Please check Firebase console.");
            } else {
              setError(getFirebaseErrorMessage(error));
            }
          }
        );

        unsubscribeRef.current = () => {
          unsubscribeOwned();
          unsubscribeShared();
        };
      } catch (error) {
        if (controller.signal.aborted) return;
        handleError(error, "Failed to refresh authentication token");
      }
    };

    initSubscription();

    // Cleanup function
    return () => {
      controller.abort();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [
    firebaseUser,
    authLoading,
    isHydrated,
    userProfile?.id,
    setBoards,
    setStatus,
    setError,
    handleError,
    publishMergedBoards,
  ]);

  // Create a new board
  const createBoard = useCallback(
    async (title: string, slug: string): Promise<Board | null> => {
      if (!userProfile || !firebaseUser) return null;

      try {
        await getValidToken(firebaseUser);

        let candidateSlug = slug;
        let boardId = `${firebaseUser.uid}_${candidateSlug}`;

        for (let attempt = 0; attempt < 5; attempt++) {
          const boardRef = doc(db, "boards", boardId);
          const existingSnap = await getDoc(boardRef);
          if (!existingSnap.exists()) break;

          const suffix = Math.random().toString(36).slice(2, 6);
          candidateSlug = `${slug}-${suffix}`;
          boardId = `${firebaseUser.uid}_${candidateSlug}`;
        }

        const boardRef = doc(db, "boards", boardId);
        const existingSnap = await getDoc(boardRef);
        if (existingSnap.exists()) {
          setError("Could not generate a unique board URL. Please try again.");
          return null;
        }

        const newBoard: Board = {
          id: boardId,
          slug: candidateSlug,
          title,
          description: "",
          ownerId: firebaseUser.uid,
          ownerUsername: userProfile.username,
          collaborators: [],
          blocks: [],
          layout: "single-column",
          theme: DEFAULT_THEME,
          privacy: "public",
          seo: {},
          analytics: {
            enabled: true,
            views: 0,
            uniqueVisitors: 0,
          },
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
        };

        await setDoc(boardRef, newBoard);
        return newBoard;
      } catch (error) {
        handleError(error, "Failed to create board");
        setError(getFirebaseErrorMessage(error));
        return null;
      }
    },
    [userProfile, firebaseUser, setError, handleError]
  );

  // Get a specific board by ID
  const getBoard = useCallback(
    async (boardId: string): Promise<Board | null> => {
      try {
        const boardRef = doc(db, "boards", boardId);
        const boardSnap = await getDoc(boardRef);

        if (boardSnap.exists()) {
          return { id: boardSnap.id, ...boardSnap.data() } as Board;
        }
        return null;
      } catch (error) {
        handleError(error, "Failed to fetch board");
        return null;
      }
    },
    [handleError]
  );

  // Get a board by username and slug
  const getBoardBySlug = useCallback(
    async (username: string, slug: string): Promise<Board | null> => {
      try {
        const boardsRef = collection(db, "boards");
        const q = query(
          boardsRef,
          where("ownerUsername", "==", username),
          where("slug", "==", slug)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() } as Board;
        }
        return null;
      } catch (error) {
        handleError(error, "Failed to fetch board by slug");
        return null;
      }
    },
    [handleError]
  );

  // Update a board
  const updateBoard = useCallback(
    async (boardId: string, updates: Partial<Board>): Promise<boolean> => {
      try {
        const boardRef = doc(db, "boards", boardId);
        await updateDoc(boardRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
        return true;
      } catch (error) {
        handleError(error, "Failed to update board");
        setError(getFirebaseErrorMessage(error));
        return false;
      }
    },
    [setError, handleError]
  );

  // Delete a board
  const deleteBoard = useCallback(
    async (boardId: string): Promise<boolean> => {
      try {
        const boardRef = doc(db, "boards", boardId);
        await deleteDoc(boardRef);
        return true;
      } catch (error) {
        handleError(error, "Failed to delete board");
        setError(getFirebaseErrorMessage(error));
        return false;
      }
    },
    [setError, handleError]
  );

  return {
    boards,
    createBoard,
    getBoard,
    getBoardBySlug,
    updateBoard,
    deleteBoard,
  };
}
