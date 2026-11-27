#!/usr/bin/env node
/**
 * Ek command se dono apps ki .env bana deta hai.
 *
 *   npm run env:create            → chat-page/.env + chat-manage-pannel/.env banao
 *   npm run env:create -- --force → purani .env ke upar likh do
 *
 * Note: Firebase ki web config "secret" nahi hoti — ye browser me by design dikhti hai.
 * Security Firestore rules se aati hai. Isliye ye values repo me rakhna theek hai;
 * .env file ko gitignore rakhna bas safai ke liye hai.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const APPS = ['chat-page', 'chat-manage-pannel'];
const FORCE = process.argv.includes('--force') || process.argv.includes('-f');

// Aapka live Firebase project (chat-project-ecb1c)
const DEFAULTS = {
  VITE_FIREBASE_API_KEY: 'AIzaSyB8Ze5lLZ-8STrRI9rXWWGD3d80pW8mpxs',
  VITE_FIREBASE_AUTH_DOMAIN: 'chat-project-ecb1c.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'chat-project-ecb1c',
  VITE_FIREBASE_STORAGE_BUCKET: 'chat-project-ecb1c.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '806023624025',
  VITE_FIREBASE_APP_ID: '1:806023624025:web:f64911a1712ddd5ef8c848',
};

const parse = (file) => {
  const out = {};
  for (const line of readLines(file)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > -1) out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
};

function readLines(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8').split('\n');
}

// Agar .env.example me values bhar di gayi hain to wahi use karo, warna defaults
let values = { ...DEFAULTS };
for (const app of APPS) {
  const ex = parse(join(root, app, '.env.example'));
  const filled = Object.entries(ex).filter(([, v]) => v.length > 0);
  if (filled.length === Object.keys(DEFAULTS).length) {
    values = Object.fromEntries(filled);
    console.log(`→ ${app}/.env.example me values mili — wahi use kar rahe hain`);
    break;
  }
}

const body =
  '# Firebase config — ye file git me nahi jaati (.gitignore me hai).\n' +
  '# Values: Firebase console → Project settings → General → Your apps → Config\n' +
  Object.entries(values)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') +
  '\n';

for (const app of APPS) {
  const target = join(root, app, '.env');
  if (existsSync(target) && !FORCE) {
    console.log(`• ${app}/.env pehle se hai — chhod diya (overwrite: --force)`);
    continue;
  }
  writeFileSync(target, body, 'utf8');
  console.log(`✓ ${app}/.env ban gayi`);
}

console.log('\nAb chalao:  npm run env   (check)  →  npm run dev');
console.log('Admin footer me "Firebase connected" dikhna chahiye.\n');
