// Firebase Client SDK - Client-side only
// This file must NOT be imported at the top level of Server Components.
// Use dynamic imports inside event handlers or useEffect.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Guard: only initialize if API key is present (avoids crash during SSR/prerender)
let app: FirebaseApp;
let auth: Auth;

if (typeof window !== "undefined" && firebaseConfig.apiKey) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} else {
  // Stub for SSR - these will never actually be called server-side
  // because all Firebase usage is inside "use client" event handlers
  app = {} as FirebaseApp;
  auth = {} as Auth;
}

export { app, auth };
