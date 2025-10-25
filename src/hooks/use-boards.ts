"use client";

import { useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useBoardStore } from "@/stores/board-store";
import { Board, BoardTheme } from "@/types";
import { useAuth } from "./use-auth";

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
  const { user } = useAuth();
  const { boards, setBoards, setLoading, setError } = useBoardStore();

  // Subscribe to user's boards
  useEffect(() => {
    if (!user) {
      setBoards([]);
      return;
    }

    setLoading(true);
    const boardsRef = collection(db, "boards");
    const q = query(
      boardsRef,
      where("ownerId", "==", user.id),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const boardsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Board[];
        setBoards(boardsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching boards:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, setBoards, setLoading, setError]);

  // Create a new board
  const createBoard = useCallback(
    async (title: string, slug: string): Promise<Board | null> => {
      if (!user) return null;

      try {
        const boardId = `${user.id}_${slug}`;
        const boardRef = doc(db, "boards", boardId);

        const newBoard: Board = {
          id: boardId,
          slug,
          title,
          description: "",
          ownerId: user.id,
          ownerUsername: user.username,
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
    [user, setError]
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

        const snapshot = await new Promise<{
          docs: Array<{ id: string; data: () => Record<string, unknown> }>;
        }>((resolve, reject) => {
          const unsubscribe = onSnapshot(q, resolve, reject);
          setTimeout(() => {
            unsubscribe();
            reject(new Error("Timeout"));
          }, 5000);
        });

        if (snapshot.docs.length > 0) {
          return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          } as Board;
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
