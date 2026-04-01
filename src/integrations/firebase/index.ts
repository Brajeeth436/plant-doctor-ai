/**
 * Firebase Integration Index
 * Centralized exports for all Firebase utilities
 */

export { firebaseApp, firebaseAuth, firebaseDB, firebaseStorage, firebaseRealtimeDB } from './client';
export { firebaseConfig } from './config';
export type { FirebaseUser, AuthContextType, FirestoreDocument, StorageFile } from './types';
