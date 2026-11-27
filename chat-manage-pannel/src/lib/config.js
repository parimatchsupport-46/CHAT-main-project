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

/**
 * Attachments
 *  - Firestore doc ki limit 1 MB hoti hai, isliye bada file "chunks" me save hota hai
 *    (chats/{chatId}/messages/{id}/parts/{attId}__0000 …) aur read karte waqt joda jaata hai.
 *  - Isliye ab asli photos/PDFs bhi chalte hain: har attachment ka apna cap.
 */
export const FIREBASE_ATTACHMENT_LIMIT = 6 * 1024 * 1024; // 6 MB per file
export const LOCAL_ATTACHMENT_LIMIT = 6 * 1024 * 1024;
/** Isse chhota attachment seedha message doc me (inline) rehta hai. */
export const INLINE_ATTACHMENT_LIMIT = 600 * 1024;
/** Ek chunk me base64 characters (doc 1 MB se neeche rahe). */
export const CHUNK_CHARS = 300 * 1024;

export const MODE = useFirebase ? 'firebase' : 'local';
