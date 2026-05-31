// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyCvwn56wM4ZqvlTgPLFPiUtGUZCggli60o",
  authDomain: "yourtube-712db.firebaseapp.com",
  projectId: "yourtube-712db",
  storageBucket: "yourtube-712db.firebasestorage.app",
  messagingSenderId: "1094620927908",
  appId: "1:1094620927908:web:4a1a437166b5eabe851331",
  measurementId: "G-GBX70S6XMD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
