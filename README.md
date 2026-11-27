# Eden Chat — 2 alag apps

Project do **independent** apps me bata diya gaya hai. Dono apni files, apne components,
apni CSS aur apna `package.json` khud rakhte hain — kisi ki cheez doosre ke folder me nahi hai.

```
.
├─ chat-page/              ← USER app (profile setup + chat with support)
├─ chat-manage-pannel/     ← ADMIN app (saare users ki list + chat)
├─ dev-server/             ← sirf development ka chhota backend (Firebase na hone par)
├─ package.json            ← root commands (setup / dev / build / lint / reset)
└─ start-all.sh            ← teeno ek saath chalane wali script
```

## 📌 Current status (2026-11-27, updated)

| Cheez | Status |
| --- | --- |
| Dono apps (user + admin) | ✅ Chal rahi hain — features complete |
| Build + lint | ✅ Clean (`npm run build`, `npm run lint` — 0 errors) |
| **Firestore database** | ✅ **LIVE — kaam kar raha hai** (`chat-project-ecb1c`) |
| Abhi data kahan | ☁️ **Cloud mode** — admin footer me "Firebase connected" |
| Local fallback | 🟡 Backup ke liye maujood — Firestore fail ho to app khud shift ho jati hai |
| Vercel deploy | 🟠 Dono apps deploy hain, par **env vars pending** → abhi local mode me. Fix: `FIREBASE-SETUP.md` §6 (env vars + **redeploy**) |

**Aaj cloud mode me pura test hua (asli Firestore par, mock nahi):**

- profile save → chat open ✅
- text + **image** + **PDF** message → Firestore me save ✅ (attachments `dataUrl` ke roop me)
- admin inbox me user dikha (naam, last message, unread badge 3) ✅
- search filter ✅, admin reply user tak pahuncha ✅
- reload par profile form dobara nahi aaya ✅
- console/page errors: **0**

> Note: test ke dauraan jo demo user (Sneha/Karan) bane the, unhe Firestore se **delete** kar diya
> gaya hai — database saaf hai. Jaise hi koi asli user profile save karega, wo admin inbox me aa jayega.

---

## Ek command me sab chalao (recommended)

```bash
npm run setup               # ek hi baar: dono apps ki dependencies install
npm run dev                 # backend (4317) + user (5173) + admin (5174) — sab ek saath
npm run dev -- --force      # purane atke hue process band karke fresh start
```

Script khud **health check** karta hai (teeno ready hone par hi "Sab chal raha hai" likhta hai)
aur `Ctrl + C` par teeno process + ports saaf kar deta hai — koi orphan `vite` peeche nahi bachta.

Baaki helpers: `npm run build`, `npm run lint`, `npm run reset` (sirf local demo data reset).

Screenshots har app ke andar `preview/` folder me hain:
`chat-page/preview/` aur `chat-manage-pannel/preview/`.

Dono apps ek hi data source se baat karte hain:

| Mode | Kab | Data kahan |
| --- | --- | --- |
| **Cloud (abhi active)** | Firestore reachable ho | `chats/{chatId}` + `chats/{chatId}/messages/{id}` |
| **Local fallback** | Firestore fail ho (offline / rules band) | `dev-server/` (port 4317) → `dev-server/.data/db.json` |

---

## Port busy / "already in use" error

App `vite` me `strictPort: true` hai — isliye port busy hone par chupchaap 5176 par shift nahi hoti,
seedha error deti hai. Fix:

```bash
npm run dev -- --force     # 4317 / 5173 / 5174 par jo bhi hai band karke start
```

Ya sirf dekhna ho ki kaun rok raha hai:

```bash
ss -ltnp | grep -E ':4317|:5173|:5174'
```

---

## Manual chalane ka tarika (agar ek-ek karna ho)

3 terminals kholo:

```bash
# 1) local backend
cd dev-server && node server.mjs        # http://localhost:4317

# 2) user app
cd chat-page && npm install && npm run dev        # http://localhost:5173

# 3) admin app
cd chat-manage-pannel && npm install && npm run dev   # http://localhost:5174
```

Test karne ka best tarika: **do browser windows** — ek me `localhost:5173` (user),
doosre me `localhost:5174` (admin). Message bhejo, doosri taraf ~1 sec me dikh jayega.

Demo data: admin inbox me pehle se 2 users (Aarav, Priya) hain. `Reset demo data`
se wapas original ho jata hai.

> Ek hi browser ke do tabs me kholne se localStorage share hota hai — user app ka
> profile whi rahega, isliye user ke liye alag browser/window use karo.

---

## ☁️ Firebase — ab live hai

> **Setup ka sabse chhota rasta:**
> ```bash
> npm run setup && npm run env:create && npm run dev
> ```
> `env:create` dono apps ki `.env` khud bana deta hai. Poori detail:
> **[`FIREBASE-SETUP.md`](./FIREBASE-SETUP.md)** · check: **`npm run env`**

Project `chat-project-ecb1c`, config dono apps ke `.env` me hai, aur Firestore database
**ban chuka hai** — apps seedha cloud par chal rahi hain (admin footer: *Firebase connected*).

| Cheez | Value |
| --- | --- |
| Project | `chat-project-ecb1c` |
| Database | Firestore (default) — live |
| Chats | `chats/{chatId}` (profile, lastMessage, unread, counters) |
| Messages | `chats/{chatId}/messages/{messageId}` |
| Attachments | **6 MB per file** — chhote inline, bade `chunks` docs me (Firestore 1 MB doc limit ke liye) |
| Realtime | Firestore `onSnapshot` — dono taraf ~1 sec me update |

**Verified aaj:** profile save → text/image/PDF message → admin inbox (unread badge) → search →
admin reply → user ko mila → reload par profile form nahi. Errors: 0.

### Config badalna ho to

Dono apps ke `.env` me same values daalo (dono copies alag rakhi gayi hain — "apni cheez apne paas"):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Badalne ke baad dono dev servers restart. Note: `.env` git-ignored hai, `.env.example` repo me hai.

### Agar Firestore phir se fail ho (offline / rules band / quota)

App **crash nahi hoti** — start par 5 sec ka health check chalta hai, fail hone par
automatic **local mode** (dev-server, port 4317) me chalti hai aur UI par reason dikhati hai.
Failure 3 minute tak cache hoti hai taaki boot fast rahe. Turant dobara try karne ke liye:

```
http://localhost:5173/?firebase=retry
http://localhost:5174/?firebase=retry
```

### Aage kya improve kar sakte hain (optional, abhi zaroorat nahi)

1. **Bade files:** abhi 6 MB tak chalte hain (chunks). Isse bada chahiye to
   **Firebase Storage** me upload karke sirf URL message me rakhna better hai (bucket already bana hua hai).
2. **Security:** abhi test rules (`allow read, write: if true`) hain — production se pehle
   **Firebase Auth** + per-user rules lagana zaroori hai.
3. **Admin login:** filhaal admin panel khula hai; Auth lagne par usse bhi protect karna hoga.

**Firestore test rules (sirf development ke liye):**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chats/{chatId} {
      allow read, write: if true;
      match /messages/{messageId} {
        allow read, write: if true;
      }
    }
  }
}
```

⚠️ Ye demo rules hain — production me Auth + per-user rules lagao.

Cloud mode me local demo users (Aarav/Priya) nahi dikhte — inbox sirf asli users dikhata hai.
Database filhaal khaali hai; jaise hi koi user profile save karega, wo inbox me aa jayega.

---

## 📦 Repo size / GitHub push (important)

Is workspace ka **asli code sirf ~1.7 MB** hai. Bhaari cheezein ye hain:

| Cheez | Size | Files | GitHub par jaani chahiye? |
| --- | --- | --- | --- |
| `chat-page/node_modules` | ~225 MB | 11,831 | ❌ kabhi nahi |
| `chat-manage-pannel/node_modules` | ~225 MB | 11,831 | ❌ kabhi nahi |
| `dist/` (build output) | ~1.2 MB | — | ❌ (`npm run build` se banta hai) |
| `preview/*.png` (screenshots) | ~840 KB | 8 | 🟡 optional |
| **Baaki poora source** | **~1.7 MB** | **~100** | ✅ haan |

Agar download/push 450 MB+ ho raha hai to **node_modules zip me aa gaya hai** — wahi time kha raha hai.

### Fast tarika (seconds me push)

1. Workspace se **`eden-chat-source.zip`** download karo — **868 KB, 100 files** (node_modules/dist ke bina).
2. Unzip → `git init` → `git add .` → commit → push.
3. Naye machine par bas: `npm run setup` (node_modules wapas aa jayenge, `package-lock.json` pinned hai).

### Agar galti se node_modules push ho gaya

```bash
git rm -r --cached chat-page/node_modules chat-manage-pannel/node_modules
git rm -r --cached chat-page/dist chat-manage-pannel/dist
git commit -m "chore: drop node_modules/dist from repo"
git push
```

`.gitignore` me `node_modules/`, `dist/`, `.data/`, `*.log` aur dono `.env` already hain.

> `.env` (Firebase config) zip me hai taaki aapka local setup turant chale, lekin `.gitignore`
> use git se bahar rakhta hai — `.env.example` hi repo me jayega.

---

## Kaun kya karta hai

**chat-page (user)**
- Pehla screen: **profile details** — name, mobile, email (validation ke saath)
- Save hone par `localStorage` me — **dobara nahi puchha jayega**
- Chat: reply, apni message edit/delete, copy, image + PDF/file, lightbox, ticks
- Support ke messages par sirf copy/reply
- Info sheet me: Edit my profile, Log out

**chat-manage-pannel (admin)**
- Home: **saare users ki list** — naam, last message, time, unread badge, search
- **Tap → us user ke saath chat** khul jati hai
- Reply, apni message edit/delete, image/PDF bhejna, user ki details copy
- Chat kholte hi unread clear + user ke messages read (✓✓)

---

## Commands

Root me:

```bash
npm run setup       # dono apps ki dependencies
npm run dev         # backend + user app + admin app
npm run dev -- --force   # purane process band karke fresh start
npm run env         # Firebase config check (kaunsi key missing hai)
npm run env:create  # dono apps ki .env khud bana do (values auto)
npm run build       # dono apps ka production build
npm run lint
npm run reset       # sirf local demo data
```

Har app ke andar:

```bash
npm run dev      # dev server
npm run build    # production build (dist/)
npm run preview  # build preview
npm run lint     # oxlint
```
