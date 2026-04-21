import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBC-eOL6xCOON8h0NtUUJlOgZiuc0rKN3s",
  authDomain: "fruitdrop-production-4796c.firebaseapp.com",
  projectId: "fruitdrop-production-4796c",
  storageBucket: "fruitdrop-production-4796c.firebasestorage.app",
  messagingSenderId: "935679136712",
  appId: "1:935679136712:web:ab56c1b412edbb58a066fd",
  measurementId: "G-X66YH6DQPC"
};

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
