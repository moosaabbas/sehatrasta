import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUwabJFqFwSlNMMAbPfibEI7AHcK3TNA8",
  authDomain: "sehat-rasta.firebaseapp.com",
  projectId: "sehat-rasta",
  storageBucket: "sehat-rasta.appspot.com",
  messagingSenderId: "841105500053",
  appId: "1:841105500053:web:cfe5996d2b0bfb70b5789c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
