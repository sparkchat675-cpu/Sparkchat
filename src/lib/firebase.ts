import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3m3e8AXtVqIoDD-5Ub3bUScerz1lf5XM",
  authDomain: "panel-login-5f9c4.firebaseapp.com",
  projectId: "panel-login-5f9c4",
  storageBucket: "panel-login-5f9c4.firebasestorage.app",
  messagingSenderId: "395865692814",
  appId: "1:395865692814:web:7a7bb8c34cad7eebb5c7df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Google Login Error:", error);
    throw error;
  }
};
