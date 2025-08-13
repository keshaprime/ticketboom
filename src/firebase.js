import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5Hkp3zPQHlux3dsFFue9wwLpT6rCTtEA",
  authDomain: "ticketboom-fad69.firebaseapp.com",
  projectId: "ticketboom-fad69",
  storageBucket: "ticketboom-fad69.appspot.com",
  messagingSenderId: "1044303868321",
  appId: "1:1044303868321:web:ab7a2ac96f62d9125f5be0",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
