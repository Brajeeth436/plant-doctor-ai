/**
 * Firebase Firestore Hook
 * Provides utilities for reading and writing to Firestore
 */

import { useState, useCallback } from 'react';
import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { firebaseDB } from '../integrations/firebase';

interface FirestoreOptions {
  onError?: (error: Error) => void;
  onSuccess?: (data?: any) => void;
}

export const useFirestore = (collectionName: string, options?: FirestoreOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Add a document
  const addDocument = useCallback(
    async (data: DocumentData) => {
      setLoading(true);
      setError(null);
      try {
        const docRef = await addDoc(collection(firebaseDB, collectionName), {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        options?.onSuccess?.(docRef);
        return docRef;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add document');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [collectionName, options]
  );

  // Set a document
  const setDocument = useCallback(
    async (docId: string, data: DocumentData, merge = false) => {
      setLoading(true);
      setError(null);
      try {
        await setDoc(doc(firebaseDB, collectionName, docId), {
          ...data,
          updatedAt: Timestamp.now(),
        }, { merge });
        options?.onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to set document');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [collectionName, options]
  );

  // Update a document
  const updateDocument = useCallback(
    async (docId: string, data: DocumentData) => {
      setLoading(true);
      setError(null);
      try {
        await updateDoc(doc(firebaseDB, collectionName, docId), {
          ...data,
          updatedAt: Timestamp.now(),
        });
        options?.onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update document');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [collectionName, options]
  );

  // Delete a document
  const deleteDocument = useCallback(
    async (docId: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteDoc(doc(firebaseDB, collectionName, docId));
        options?.onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete document');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [collectionName, options]
  );

  // Get a single document
  const getDocument = useCallback(
    async (docId: string) => {
      setLoading(true);
      setError(null);
      try {
        const docSnap = await getDoc(doc(firebaseDB, collectionName, docId));
        if (docSnap.exists()) {
          const data = {
            id: docSnap.id,
            ...docSnap.data(),
          };
          options?.onSuccess?.(data);
          return data;
        }
        return null;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get document');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [collectionName, options]
  );

  // Query documents
  const queryDocuments = useCallback(
    async (constraints: QueryConstraint[]) => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(firebaseDB, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);
        const documents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        options?.onSuccess?.(documents);
        return documents;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to query documents');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [collectionName, options]
  );

  // Get all documents
  const getAllDocuments = useCallback(async () => {
    return queryDocuments([]);
  }, [queryDocuments]);

  return {
    loading,
    error,
    addDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    queryDocuments,
    getAllDocuments,
  };
};

// Export query helper functions
export { where, orderBy, limit, Timestamp };
