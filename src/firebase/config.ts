import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWNPyqPQ-xs5zGJiVsgPJ1PuaFhsVndvs",
  authDomain: "hgka-academy.firebaseapp.com",
  projectId: "hgka-academy",
  storageBucket: "hgka-academy.firebasestorage.app",
  messagingSenderId: "235787922634",
  appId: "1:235787922634:web:f25684de73aa93c5f1d833"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 