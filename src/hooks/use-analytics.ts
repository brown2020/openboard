"use client";

import { useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  increment,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BoardAnalytics, ClickEvent } from "@/types";

export function useAnalytics() {
  // Track a page view
  const trackView = useCallback(async (boardId: string, userAgent?: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const analyticsRef = doc(db, "analytics", `${boardId}_${today}`);

      await setDoc(
        analyticsRef,
        {
          boardId,
          date: today,
          views: increment(1),
          uniqueVisitors: increment(1),
          devices: {
            mobile: userAgent?.includes("Mobile") ? increment(1) : increment(0),
            desktop:
              !userAgent?.includes("Mobile") && !userAgent?.includes("Tablet")
                ? increment(1)
                : increment(0),
            tablet: userAgent?.includes("Tablet") ? increment(1) : increment(0),
          },
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  }, []);

  // Track a click on a block
  const trackClick = useCallback(
    async (
      boardId: string,
      blockId: string,
      referrer?: string,
      userAgent?: string
    ) => {
      try {
        const today = new Date().toISOString().split("T")[0];

        // Update analytics
        const analyticsRef = doc(db, "analytics", `${boardId}_${today}`);
        await setDoc(
          analyticsRef,
          {
            boardId,
            date: today,
            clicks: {
              [blockId]: increment(1),
            },
          },
          { merge: true }
        );

        // Store individual click event
        const clickRef = doc(collection(db, "clicks"));
        const clickEvent: ClickEvent = {
          id: clickRef.id,
          boardId,
          blockId,
          timestamp: serverTimestamp() as Timestamp,
          referrer,
          userAgent,
        };
        await setDoc(clickRef, clickEvent);
      } catch (error) {
        console.error("Error tracking click:", error);
      }
    },
    []
  );

  // Get analytics for a board
  const getAnalytics = useCallback(
    async (boardId: string, days: number = 30): Promise<BoardAnalytics[]> => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const analyticsRef = collection(db, "analytics");
        const q = query(
          analyticsRef,
          where("boardId", "==", boardId),
          where("date", ">=", startDate.toISOString().split("T")[0]),
          where("date", "<=", endDate.toISOString().split("T")[0])
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => doc.data() as BoardAnalytics);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        return [];
      }
    },
    []
  );

  return {
    trackView,
    trackClick,
    getAnalytics,
  };
}
