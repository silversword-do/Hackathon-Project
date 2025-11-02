// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjpJitXv_C7AMGiFBxnkOwGzCg0aBxsOs",
  authDomain: "osu-pete-s-ride-around.firebaseapp.com",
  projectId: "osu-pete-s-ride-around",
  storageBucket: "osu-pete-s-ride-around.firebasestorage.app",
  messagingSenderId: "853674000667",
  appId: "1:853674000667:web:b6048f6525a28a0d5293be",
  measurementId: "G-SRLYEXF9Q4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

