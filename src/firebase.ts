// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Use your existing mobile config
const firebaseConfig = {
  apiKey: 'AIzaSyAIvdS8nh1ljtNijeObVZkRW2kbI-rhTq4',
  authDomain: 'nyabonaapp.firebaseapp.com',
  projectId: 'nyabonaapp',
  storageBucket: 'nyabonaapp.firebasestorage.app', 
  messagingSenderId: '291572996388',
  appId: '1:291572996388:android:7756e8c5761a594a0ebbb1',
};


firebaseConfig.storageBucket = 'nyabonaapp.firebasestorage.app';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);       
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

