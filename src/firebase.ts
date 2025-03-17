import { initializeApp } from "firebase/app";
import { config } from 'dotenv';
import admin from "firebase-admin";
import { cert } from "firebase-admin/app";

config();

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

admin.initializeApp({
  credential: cert({
    projectId: process.env.projectId,
    clientEmail: process.env.client_email,
    privateKey: process.env.private_key
  }),
  databaseURL: "https://hackaton-f06d6-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.firestore();
const auth = admin.auth();

export { firebase, db, auth }