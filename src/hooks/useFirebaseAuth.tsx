/**
 * Firebase Authentication Hook
 * Manages user authentication state and provides auth methods
 */

import { useEffect, useState, useContext, createContext, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  AuthError,
} from 'firebase/auth';
import { firebaseAuth } from '../integrations/firebase';
import { FirebaseUser, AuthContextType } from '../integrations/firebase/types';

// Create Auth Context
export const FirebaseAuthContext = createContext<AuthContextType | null>(null);

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser: User | null) => {
      if (currentUser) {
        setUser({
          ...currentUser,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          uid: currentUser.uid,
          isAnonymous: currentUser.isAnonymous,
        } as FirebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      return await createUserWithEmailAndPassword(firebaseAuth, email, password);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      return await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const logOut = async () => {
    try {
      setError(null);
      await signOut(firebaseAuth);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    try {
      setError(null);
      if (firebaseAuth.currentUser) {
        await updateProfile(firebaseAuth.currentUser, updates);
        setUser((prev) =>
          prev
            ? {
                ...prev,
                displayName: updates.displayName ?? prev.displayName,
                photoURL: updates.photoURL ?? prev.photoURL,
              }
            : null
        );
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut: logOut,
    resetPassword,
    updateProfile: updateUserProfile,
  };

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
};

// Custom hook to use Firebase Auth
export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};
