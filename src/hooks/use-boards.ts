"use client";

import { useEffect, useCallback, useRef, useState } from "react";
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
import { Board, BoardTheme } from "@/types";
import { useAuthContext } from "@/lib/auth-context";
import { useUserStore } from "@/stores/user-store";

const DEFAULT_THEME: BoardTheme = {
  name: "Default",
  background: {
    type: "color",
    value: "#ffffff",
  },
  primaryColor: "#000000",
  textColor: "#000000",
  cardBackground: "#f5f5f5",
  borderRadius: "md",
  font: {
    heading: "system-ui",
    body: "system-ui",
  },
};

export function useBoards() {
  // Get Firebase user directly from auth context
  const { user: firebaseUser, loading: authLoading } = useAuthContext();
  // Get user profile from store
  const { user: userProfile, isHydrated } = useUserStore();
  
  const { boards, setBoards, setStatus, setError } = useBoardStore();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Ensure auth token is fresh before subscribing
  useEffect(() => {
    const prepareAuth = async () => {
      if (authLoading || !firebaseUser || !isHydrated || !userProfile?.id) {
        setIsReady(false);
        return;
      }

      if (userProfile.id !== firebaseUser.uid) {
        setIsReady(false);
        return;
      }

      try {
        // Force refresh the ID token to ensure Firestore has the latest auth state
        await firebaseUser.getIdToken(true);
        setIsReady(true);
      } catch (error) {
        console.error("Error refreshing token:", error);
        setIsReady(false);
      }
    };

    prepareAuth();
  }, [authLoading, firebaseUser, isHydrated, userProfile?.id]);

  // Subscribe to user's boards - ONLY when fully ready
  useEffect(() => {
    // Clean up any existing subscription
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

    // Don't subscribe until we're fully ready
    if (!isReady) {
      return;
    }

    setStatus("loading");
    
    const boardsRef = collection(db, "boards");
    const q = query(
      boardsRef,
      where("ownerId", "==", firebaseUser.uid),
      orderBy("updatedAt", "desc")
    );

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const boardsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Board[];
        setBoards(boardsData);
        setStatus("success");
      },
      (error) => {
        console.error("Error fetching boards:", error);
        // Check if it's an index error
        if (error.message.includes("index")) {
          setError("Database index required. Please check Firebase console.");
        } else {
          setError(error.message);
        }
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [firebaseUser, authLoading, isReady, setBoards, setStatus, setError]);

  // Create a new board
  const createBoard = useCallback(
    async (title: string, slug: string): Promise<Board | null> => {
      if (!userProfile || !firebaseUser) return null;

      try {
        // Ensure fresh token
        await firebaseUser.getIdToken(true);
        
        const boardId = `${firebaseUser.uid}_${slug}`;
        const boardRef = doc(db, "boards", boardId);

        const newBoard: Board = {
          id: boardId,
          slug,
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
        console.error("Error creating board:", error);
        setError(
          error instanceof Error ? error.message : "Failed to create board"
        );
        return null;
      }
    },
    [userProfile, firebaseUser, setError]
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
        console.error("Error fetching board:", error);
        return null;
      }
    },
    []
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
        console.error("Error fetching board by slug:", error);
        return null;
      }
    },
    []
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
        console.error("Error updating board:", error);
        setError(
          error instanceof Error ? error.message : "Failed to update board"
        );
        return false;
      }
    },
    [setError]
  );

  // Delete a board
  const deleteBoard = useCallback(
    async (boardId: string): Promise<boolean> => {
      try {
        const boardRef = doc(db, "boards", boardId);
        await deleteDoc(boardRef);
        return true;
      } catch (error) {
        console.error("Error deleting board:", error);
        setError(
          error instanceof Error ? error.message : "Failed to delete board"
        );
        return false;
      }
    },
    [setError]
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
