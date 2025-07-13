import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAVObwoBnIAGtXbt8-3td2gwtrK4gKp7_0",
  authDomain: "intuitionconcept.firebaseapp.com",
  projectId: "intuitionconcept",
  storageBucket: "intuitionconcept.appspot.com",
  messagingSenderId: "4657836202",
  appId: "1:4657836202:web:a9b0e27f4a67847033a0d3"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
