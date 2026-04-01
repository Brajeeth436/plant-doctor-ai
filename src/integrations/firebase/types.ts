/**
 * Firebase TypeScript Types
 */

import { User, UserCredential, AuthError } from 'firebase/auth';

export interface FirebaseUser extends User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
  isAnonymous: boolean;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

export interface FirestoreDocument {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export interface StorageFile {
  name: string;
  url: string;
  size?: number;
  contentType?: string;
}
