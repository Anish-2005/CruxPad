import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function hasClientConfig() {
  return Boolean(firebaseConfig.apiKey) && Boolean(firebaseConfig.projectId);
}

function getOrInitApp() {
  if (typeof window === "undefined") {
    return null;
  }
  if (!hasClientConfig()) {
    return null;
  }
  if (app) {
    return app;
  }
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth() {
  if (auth) {
    return auth;
  }
  const firebaseApp = getOrInitApp();
  if (!firebaseApp) {
    return null;
  }
  auth = getAuth(firebaseApp);
  return auth;
}

export function getFirebaseDb() {
  if (db) {
    return db;
  }
  const firebaseApp = getOrInitApp();
  if (!firebaseApp) {
    return null;
  }
  db = getFirestore(firebaseApp);
  return db;
}

export function isFirebaseClientConfigured() {
  return hasClientConfig();
}

