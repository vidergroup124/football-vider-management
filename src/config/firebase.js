import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// TODO: Replace with your actual Firebase config object later
// คุณสามารถนำค่าเหล่านี้มาจาก Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAKVaZ3EnxKi7dJpDPzkVMCjYTna0n0P08",
  authDomain: "football-vider-management.firebaseapp.com",
  projectId: "football-vider-management",
  storageBucket: "football-vider-management.firebasestorage.app",
  messagingSenderId: "590207741462",
  appId: "1:590207741462:web:8ae3206274a905aaac4f37",
  measurementId: "G-VTXHJXFN60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // เผื่อใช้ในอนาคต
