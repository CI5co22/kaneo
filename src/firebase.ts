import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAAJC7oXCB5EhrE7E_96yWhV5kdlRdCDDg",
  authDomain: "kaneo-ec618.firebaseapp.com",
  projectId: "kaneo-ec618",
  storageBucket: "kaneo-ec618.firebasestorage.app",
  messagingSenderId: "654407742724",
  appId: "1:654407742724:web:7bfbc565362b3717ab0c51",
  measurementId: "G-FLPT3X39NR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
