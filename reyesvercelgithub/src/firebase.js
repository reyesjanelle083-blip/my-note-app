import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCE367-gunfDAypn6Zo6QfeEbksPcHR8Hw",
  authDomain: "my-note-app-cd3dc.firebaseapp.com",
  projectId: "my-note-app-cd3dc",
  storageBucket: "my-note-app-cd3dc.firebasestorage.app",
  messagingSenderId: "283178683665",
  appId: "1:283178683665:web:f8b1f9a5577ead1cac10b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// EXPORT this (VERY IMPORTANT)
export { db };