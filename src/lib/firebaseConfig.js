import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABqWw4gAq51icMKxzWPlchEv7_Sq154h0",
  authDomain: "expertizo-68929.firebaseapp.com",
  databaseURL: "https://expertizo-68929-default-rtdb.firebaseio.com",
  projectId: "expertizo-68929",
  storageBucket: "expertizo-68929.firebasestorage.app",
  messagingSenderId: "927989859852",
  appId: "1:927989859852:web:56ff95bb7bcfd3178e5029",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
