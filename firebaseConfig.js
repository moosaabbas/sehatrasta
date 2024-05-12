// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUwabJFqFwSlNMMAbPfibEI7AHcK3TNA8",
  authDomain: "sehat-rasta.firebaseapp.com",
  projectId: "sehat-rasta",
  storageBucket: "sehat-rasta.appspot.com",
  messagingSenderId: "841105500053",
  appId: "1:841105500053:web:cfe5996d2b0bfb70b5789c"
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
export { firebase };






/*
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import storage from Firebase

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUwabJFqFwSlNMMAbPfibEI7AHcK3TNA8",
  authDomain: "sehat-rasta.firebaseapp.com",
  projectId: "sehat-rasta",
  storageBucket: "sehat-rasta.appspot.com",
  messagingSenderId: "841105500053",
  appId: "1:841105500053:web:cfe5996d2b0bfb70b5789c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app); // Initialize storage using the app object

export { app, firestore, storage }; // Export the app, firestore, and storage objects
*/
