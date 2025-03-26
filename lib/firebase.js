// lib/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, getRedirectResult, signInWithRedirect } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAL97vebVpW0w3o4oR6vTBem217WiljevQ",
    authDomain: "pet-proj-89ecf.firebaseapp.com",
    projectId: "pet-proj-89ecf",
    storageBucket: "pet-proj-89ecf.firebasestorage.app",
    messagingSenderId: "130978530569",
    appId: "1:130978530569:web:5ae6f3487fab34fdfbffd8",
    measurementId: "G-4PGP4R18MS"
};

// 防止重複初始化
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, getRedirectResult, signInWithRedirect };