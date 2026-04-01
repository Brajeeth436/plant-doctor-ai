/**
 * Firebase Client Initialization
 * Initializes Firebase with Auth, Firestore, Storage, and Realtime Database
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './config';

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDB = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
export const firebaseRealtimeDB = getDatabase(firebaseApp);

// Export individual service initializers for lazy loading if needed
export const initAuth = () => firebaseAuth;
export const initFirestore = () => firebaseDB;
export const initStorage = () => firebaseStorage;
export const initRealtimeDB = () => firebaseRealtimeDB;

export default firebaseApp;
