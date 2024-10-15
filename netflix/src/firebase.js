import firebase from "./firebase";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeFjE-XHnbFlGo3b_4rYk1t-FkX3fKdXI",
  authDomain: "netflix-c0e9e.firebaseapp.com",
  projectId: "netflix-c0e9e",
  storageBucket: "netflix-c0e9e.appspot.com",
  messagingSenderId: "734643863218",
  appId: "1:734643863218:web:0c6e4aa6f19d35060a93ab",
  measurementId: "G-97R4ED741Y",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { auth };
export default db;
