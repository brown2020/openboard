"use client";

import { useState } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  StorageError,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useAuth } from "./use-auth";

interface UseStorageResult {
  uploadFile: (file: File, path?: string) => Promise<string | null>;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useStorage(): UseStorageResult {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    path?: string
  ): Promise<string | null> => {
    if (!user) {
      setError("User must be logged in to upload files");
      return null;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return null;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return null;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Default path: uploads/{userId}/{timestamp}_{filename}
      const filePath =
        path || `uploads/${user.id}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<string | null>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error: StorageError) => {
            console.error("Upload failed:", error);
            setError(error.message);
            setUploading(false);
            resolve(null);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setUploading(false);
              resolve(downloadURL);
            } catch (err) {
              console.error("Error getting download URL:", err);
              setError("Failed to get download URL");
              setUploading(false);
              resolve(null);
            }
          }
        );
      });
    } catch (err) {
      console.error("Error starting upload:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setUploading(false);
      return null;
    }
  };

  return {
    uploadFile,
    uploading,
    progress,
    error,
  };
}

