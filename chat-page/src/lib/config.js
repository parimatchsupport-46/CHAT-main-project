/**
 * Firebase config .env file se aata hai (dono apps me same project).
 * Values na hone par — ya Firestore enable na hone par — app LOCAL DEV MODE
 * me chalti hai (dev-server/ folder, port 4317).
 */
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

export const useFirebase = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const API_BASE = env.VITE_API_BASE || '/api';

/** Firestore doc 1 MB limit hoti hai, isliye cloud me chhota cap. */
export const FIREBASE_ATTACHMENT_LIMIT = 700 * 1024;
export const LOCAL_ATTACHMENT_LIMIT = 4 * 1024 * 1024;

export const MODE = useFirebase ? 'firebase' : 'local';
