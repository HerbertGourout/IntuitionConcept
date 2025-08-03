import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

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
