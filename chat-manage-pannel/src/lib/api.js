/**
 * Data layer ka switch:
 *  - Firestore reachable  → firebaseApi (realtime)
 *  - warna                → localApi (dev-server, port 4317)
 *
 * Firebase config ho lekin Firestore database enable na ho, to app crash nahi
 * karti — local mode me chal padti hai aur UI par reason dikhata hai.
 */
import {
  MODE,
  firebaseConfig,
  FIREBASE_ATTACHMENT_LIMIT,
  LOCAL_ATTACHMENT_LIMIT,
} from './config.js';

const friendlyReason = (err) => {
  const msg = String(err?.message || '');
  if (/has not been used|SERVICE_DISABLED|not enabled|disabled/i.test(msg)) {
    return 'Firestore database enable nahi hai';
  }
  if (/permission|insufficient|PERMISSION_DENIED/i.test(msg)) {
    return 'Firestore rules block kar rahe hain';
  }
  if (/timeout/i.test(msg)) return 'Firebase se connect nahi ho paya';
  return 'Firebase available nahi hai';
};

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Firebase connect timeout')), ms);
    }),
  ]);

const FAIL_KEY = 'eden.firebase.check.v1';
const FAIL_TTL = 3 * 60 * 1000; // 3 min tak dobara try nahi karenge (page fast khule)

const readRecentFailure = () => {
  try {
    const raw = localStorage.getItem(FAIL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.at && Date.now() - parsed.at < FAIL_TTL) return parsed;
  } catch {
    /* ignore */
  }
  return null;
};

const rememberFailure = (reason, detail) => {
  try {
    localStorage.setItem(FAIL_KEY, JSON.stringify({ at: Date.now(), reason, detail }));
  } catch {
    /* ignore */
  }
};

const clearFailure = () => {
  try {
    localStorage.removeItem(FAIL_KEY);
  } catch {
    /* ignore */
  }
};

// Turant retry chahiye? URL me ?firebase=retry lagao (cache clear ho jata hai).
try {
  if (new URLSearchParams(window.location.search).get('firebase') === 'retry') {
    clearFailure();
  }
} catch {
  /* ignore */
}

const localModule = await import('./localApi.js');

let api = localModule.api;
let DATA_MODE = 'local';
let MODE_REASON = '';
let MODE_DETAIL = '';

const recentFailure = MODE === 'firebase' ? readRecentFailure() : null;

if (MODE === 'firebase' && recentFailure) {
  // pichhli baar connect fail hua tha — seedha local mode (fast boot)
  MODE_REASON = recentFailure.reason || 'Firebase available nahi hai';
  MODE_DETAIL = recentFailure.detail || '';
} else if (MODE === 'firebase') {
  try {
    const firebaseModule = await import('./firebaseApi.js');
    await withTimeout(firebaseModule.api.health(), 5000);
    api = firebaseModule.api;
    DATA_MODE = 'firebase';
    clearFailure();
  } catch (err) {
    MODE_REASON = friendlyReason(err);
    MODE_DETAIL = String(err?.message || err);
    rememberFailure(MODE_REASON, MODE_DETAIL);
    console.warn(
      `[eden-chat] Firebase project "${firebaseConfig.projectId}" se connect nahi hua → local mode. ${MODE_REASON} · ${MODE_DETAIL}`,
    );
  }
}

export { api, DATA_MODE, MODE_REASON, MODE_DETAIL, firebaseConfig };
export const MAX_BYTES =
  DATA_MODE === 'firebase' ? FIREBASE_ATTACHMENT_LIMIT : LOCAL_ATTACHMENT_LIMIT;
