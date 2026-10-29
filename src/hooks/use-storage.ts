"use client";

import { useState } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  StorageError,
} from "firebase/storage";
import { getClientStorage } from "@/lib/firebase";
import { reportWriteError } from "@/lib/write-error";
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
      const message = "User must be logged in to upload files";
      setError(reportWriteError("Upload failed", message));
      return null;
    }

    // Validate file type
    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/avif",
    ]);
    if (!allowedTypes.has(file.type)) {
      const message = "Only JPEG, PNG, GIF, WebP, or AVIF images are allowed";
      setError(reportWriteError("Upload failed", message));
      return null;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      const message = "File size must be less than 5MB";
      setError(reportWriteError("Upload failed", message));
      return null;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Default path: uploads/{userId}/{timestamp}_{filename}
      const filePath =
        path || `uploads/${user.id}/${Date.now()}_${file.name}`;
      const storageRef = ref(getClientStorage(), filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<string | null>((resolve) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error: StorageError) => {
            setError(reportWriteError("Upload failed", error));
            setUploading(false);
            resolve(null);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setUploading(false);
              resolve(downloadURL);
            } catch (error) {
              setError(reportWriteError("Upload failed", error));
              setUploading(false);
              resolve(null);
            }
          }
        );
      });
    } catch (err) {
      setError(reportWriteError("Upload failed", err));
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

