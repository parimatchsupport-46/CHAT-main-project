#!/usr/bin/env node
/**
 * Firebase config checker — batata hai ki dono apps ki .env theek hai ya nahi.
 * Chalane ke liye:  npm run env
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const APPS = ['chat-page', 'chat-manage-pannel'];
const KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const readEnv = (file) => {
  if (!existsSync(file)) return null;
  const out = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
};

const mask = (v) => (v.length <= 8 ? '*'.repeat(v.length) : `${v.slice(0, 6)}…${v.slice(-4)}`);

let allGood = true;
const seen = [];

for (const app of APPS) {
  const envPath = join(root, app, '.env');
  const exPath = join(root, app, '.env.example');
  const env = readEnv(envPath);

  console.log(`\n── ${app}`);
  console.log(`   .env present      : ${env ? 'yes' : 'NO'}`);
  console.log(`   .env.example      : ${existsSync(exPath) ? 'yes' : 'NO  ← repo me commit karo'}`);

  if (!env) {
    console.log('   ⇒ mode            : LOCAL (dev-server, port 4317)');
    console.log('     fix: cp ' + app + '/.env.example ' + app + '/.env, phir values bharo');
    allGood = false;
    continue;
  }

  let missing = 0;
  for (const k of KEYS) {
    const v = env[k] ?? '';
    const ok = v.length > 0;
    if (!ok) missing += 1;
    console.log(`   ${ok ? '✓' : '✗'} ${k.padEnd(32)} ${ok ? mask(v) : '(khaali)'}`);
  }

  const mode = env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID ? 'FIREBASE' : 'LOCAL';
  console.log(`   ⇒ mode            : ${mode}`);
  if (mode === 'LOCAL') allGood = false;
  if (missing) allGood = false;

  seen.push(env);
}

if (seen.length === 2) {
  const same = APPS.map((a) => readEnv(join(root, a, '.env')))
    .every((e) => e.VITE_FIREBASE_PROJECT_ID === seen[0].VITE_FIREBASE_PROJECT_ID);
  console.log(`\n── dono apps ka project id ${same ? 'same ✓' : 'ALAG ✗ (same hona chahiye)'}`);
  if (!same) allGood = false;
}

console.log(
  allGood
    ? '\n✓ Config theek lag raha hai — `npm run dev` karo, admin footer me "Firebase connected" dikhega.\n'
    : '\n⚠ Setup adhoora hai — upar ke fix karo, phir `npm run dev` (restart zaroori hai).\n',
);
process.exitCode = allGood ? 0 : 1;
