/**
 * Firebase Storage Hook
 * Provides utilities for uploading and downloading files from Firebase Storage
 */

import { useState, useCallback } from 'react';
import {
  ref,
  uploadBytes,
  downloadURL,
  deleteObject,
  getBytes,
  listAll,
  StorageReference,
  UploadTask,
} from 'firebase/storage';
import { firebaseStorage } from '../integrations/firebase';

interface StorageOptions {
  onError?: (error: Error) => void;
  onSuccess?: (data?: any) => void;
}

export const useStorageFile = (bucketPath: string, options?: StorageOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload a file
  const uploadFile = useCallback(
    async (file: File, fileName?: string) => {
      setLoading(true);
      setError(null);
      setUploadProgress(0);
      try {
        const fileRef = ref(firebaseStorage, `${bucketPath}/${fileName || file.name}`);
        const uploadTask = uploadBytes(fileRef, file);

        // Handle upload result
        const snapshot = await uploadTask;
        const url = await downloadURL(snapshot.ref);

        setUploadProgress(100);
        options?.onSuccess?.({ url, path: snapshot.ref.fullPath });
        return { url, path: snapshot.ref.fullPath };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to upload file');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [bucketPath, options]
  );

  // Download a file
  const downloadFile = useCallback(
    async (filePath: string) => {
      setLoading(true);
      setError(null);
      try {
        const fileRef = ref(firebaseStorage, filePath);
        const bytes = await getBytes(fileRef);
        options?.onSuccess?.(bytes);
        return bytes;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to download file');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  // Get download URL
  const getFileUrl = useCallback(
    async (filePath: string) => {
      setLoading(true);
      setError(null);
      try {
        const fileRef = ref(firebaseStorage, filePath);
        const url = await downloadURL(fileRef);
        options?.onSuccess?.(url);
        return url;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get file URL');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  // Delete a file
  const deleteFile = useCallback(
    async (filePath: string) => {
      setLoading(true);
      setError(null);
      try {
        const fileRef = ref(firebaseStorage, filePath);
        await deleteObject(fileRef);
        options?.onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete file');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  // List files in a directory
  const listFiles = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        const dirRef = ref(firebaseStorage, bucketPath);
        const result = await listAll(dirRef);
        const files = await Promise.all(
          result.items.map(async (itemRef) => ({
            name: itemRef.name,
            path: itemRef.fullPath,
            url: await downloadURL(itemRef),
          }))
        );
        options?.onSuccess?.(files);
        return files;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to list files');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [bucketPath, options]
  );

  return {
    loading,
    error,
    uploadProgress,
    uploadFile,
    downloadFile,
    getFileUrl,
    deleteFile,
    listFiles,
  };
};
