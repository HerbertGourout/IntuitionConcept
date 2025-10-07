import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, initializeFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAVObwoBnIAGtXbt8-3td2gwtrK4gKp7_0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "intuitionconcept.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "intuitionconcept",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "intuitionconcept.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "4657836202",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:4657836202:web:a9b0e27f4a67847033a0d3"
};

// Éviter la double initialisation lors du HMR (Hot Module Replacement)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with enhanced settings for better connectivity
let db: ReturnType<typeof getFirestore>;
const useEmulators = import.meta.env?.VITE_USE_FIREBASE_EMULATORS === 'true';

if (useEmulators) {
  // Use standard getFirestore for emulators
  db = getFirestore(app);
} else {
  // Use initializeFirestore with fallback settings for production
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Fallback for CORS/WebChannel issues
  });
}

export { db };
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const usingEmulators = useEmulators;

// Configure Auth persistence from env: 'local' | 'session' | 'none'
try {
  const persistenceMode = (import.meta.env?.VITE_AUTH_PERSISTENCE || 'local').toLowerCase();
  if (persistenceMode === 'session') {
    setPersistence(auth, browserSessionPersistence);
  } else if (persistenceMode === 'none') {
    setPersistence(auth, inMemoryPersistence);
  } else {
    // default: local
    setPersistence(auth, browserLocalPersistence);
  }
} catch (e) {
  console.warn('[Firebase] Failed to set auth persistence:', e);
}

// Enable offline persistence for better reliability
if (!useEmulators) {
  try {
    enableIndexedDbPersistence(db);
    console.info('[Firebase] IndexedDB persistence enabled');
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === 'failed-precondition') {
      console.warn('[Firebase] Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (error.code === 'unimplemented') {
      console.warn('[Firebase] The current browser does not support all features required for persistence.');
    } else {
      console.warn('[Firebase] Failed to enable persistence:', err);
    }
  }
}

// Optionally connect to local emulators for development
// Set VITE_USE_FIREBASE_EMULATORS=true in your .env.local to enable
if (useEmulators) {
  try {
    // Use 127.0.0.1 for Windows compatibility
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    console.info('[Firebase] Connected to local emulators (auth:9099, firestore:8080, storage:9199)');
  } catch (e) {
    // Avoid hard-crashing init if emulator not running
    console.warn('[Firebase] Failed to connect emulators. Ensure they are running or unset VITE_USE_FIREBASE_EMULATORS.', e);
  }
}
