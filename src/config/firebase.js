import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFPQ28b8-OjdDUDqd7xuRpamp6RJAr59U",
  authDomain: "kanban-admin.firebaseapp.com",
  projectId: "kanban-admin",
  storageBucket: "kanban-admin.firebasestorage.app",
  messagingSenderId: "329359268294",
  appId: "1:329359268294:web:e113da786cf7209758bac7",
  measurementId: "G-BXBVHGEGDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
