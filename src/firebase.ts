import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

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

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

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

// Optionally connect to local emulators for development
// Set VITE_USE_FIREBASE_EMULATORS=true in your .env.local to enable
export const usingEmulators = import.meta.env?.VITE_USE_FIREBASE_EMULATORS === 'true';
if (usingEmulators) {
  try {
    // Use 127.0.0.1 for Windows compatibility
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.info('[Firebase] Connected to local emulators (auth:9099, firestore:8080, storage:9199)');
  } catch (e) {
    // Avoid hard-crashing init if emulator not running
    console.warn('[Firebase] Failed to connect emulators. Ensure they are running or unset VITE_USE_FIREBASE_EMULATORS.', e);
  }
}
