# 🔥 Firebase Setup — step by step (simple)

> **Ek line me:** app aapke **laptop** par chalti hai, aur config wahi padhti hai —
> `chat-page/.env` aur `chat-manage-pannel/.env`.
> GitHub par rakhi file se app ko koi farak nahi padta (wo sirf document hai).

---

# ⚡ Sabse chhota rasta (yehi karo — 2 command)

Project folder me terminal kholo (jahan `package.json` hai) aur bas:

```bash
npm run setup        # pehli baar: node_modules install (2-3 min)
npm run env:create   # dono apps ki .env khud ban jayegi ✅
npm run dev          # sab start
```

Bas. `env:create` automatic dono folders me `.env` bana deta hai aapke live project
(`chat-project-ecb1c`) ki values ke saath — koi copy-paste, koi dotfile drama nahi.

Check karna ho ki sab theek hai:

```bash
npm run env
```

Output me `⇒ mode : FIREBASE` aana chahiye. Phir browser me:

- user → <http://localhost:5173>
- admin → <http://localhost:5174> → footer me **`Firebase connected`** (hara cloud icon)

---

# 🧠 Pehle ye samajh lo (2 minute — yahi confusion tha)

Aapne GitHub par `env.example.txt` banayi. Problem do jagah thi:

### Galti 1 — file ka naam galat

| Aapne banaya | Hona chahiye |
| --- | --- |
| `env.example.txt` ❌ | `.env.example` ✅ |
| shuru me **dot nahi** hai | naam **dot se** shuru hota hai |
| end me `.txt` hai | end me `.txt` **nahi** hota |

### Galti 2 — asli kaam hi GitHub par nahi tha

Ye do alag-alag cheezein hain, inhe mix mat karo:

| File | Kahan rehti hai | Andar kya | GitHub par? |
| --- | --- | --- | --- |
| **`.env`** | aapke **laptop** par, har app ke folder me | **asli values** | ❌ **kabhi nahi** (secret/production config) |
| **`.env.example`** | same jagah | sirf khaali naam (`VITE_FIREBASE_API_KEY=`) | ✅ haan (template/documentation) |

App **sirf `.env`** padhti hai. `.env.example` sirf ye batane ke liye hai ki kaunsi 6 keys chahiye.
Isliye GitHub par file add karne se aapka local app Firebase se **nahi judega** — wo file aapke
computer par chahiye.

> Analogy: `.env.example` = form ka khaali photocopy jo daftar me lagti hai.
> `.env` = aapki bhari hui asli form. Kaam asli form se hota hai, khaali copy se nahi.

---

# 1️⃣ Agar zip use kar rahe ho (sabse aasan)

`eden-chat-source.zip` ke andar **dono `.env` files pehle se bhari hui hain**. Unzip karo aur
seedha `npm run setup` → `npm run dev`. **Kuch banane ki zarurat nahi.**

(Windows Explorer me dot wali files dikhne ke liye: View → Hidden items ✅ — warna samajh aayega
ki file hai hi nahi. PowerShell me `dir -Force chat-page` se bhi dikhengi.)

---

# 2️⃣ Agar GitHub se clone kiya hai

```bash
git clone https://github.com/parimatchsupport-46/CHAT-main-project.git
cd CHAT-main-project

npm run setup
npm run env:create     # ← yahi .env bana dega
npm run dev
```

`env:create` na chale (purana version) to manually banao:

```bash
# Mac / Linux / Git Bash
cp chat-page/.env.example chat-page/.env
cp chat-manage-pannel/.env.example chat-manage-pannel/.env
```

Phir dono `.env` files ko Notepad/VS Code me kholo aur ye 6 lines daalo (values same rahengi):

```env
VITE_FIREBASE_API_KEY=AIzaSyB8Ze5lLZ-8STrRI9rXWWGD3d80pW8mpxs
VITE_FIREBASE_AUTH_DOMAIN=chat-project-ecb1c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=chat-project-ecb1c
VITE_FIREBASE_STORAGE_BUCKET=chat-project-ecb1c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=806023624025
VITE_FIREBASE_APP_ID=1:806023624025:web:f64911a1712ddd5ef8c848
```

### Windows par `.env` file banane ka tarika (dot wali file)

1. `chat-page` folder kholo
2. Address bar me `cmd` type karke Enter → terminal khul jayega us folder me
3. Ye chalao: `copy con .env` → phir 6 lines paste karo → `Ctrl+Z` → Enter
   *(ya: Notepad kholo → paste → **File → Save As** → File name: **`.env`** → "Save as type" = **All Files** → Save)*
4. Wahi cheez `chat-manage-pannel` folder me dohrao

### Zaroori rules

- file ka naam exactly **`.env`** (aage `.txt`, `.example` nahi)
- har key **`VITE_`** se shuru — Vite sirf inhi values browser tak bhejta hai
- `=` ke baad space nahi, quotes nahi
- config **root folder me nahi**, har app ke apne folder me
- banane ke baad **restart**: `Ctrl+C` → `npm run dev` (env sirf start par padhta hai)

---

# 3️⃣ GitHub par kya theek karna hai (2 minute)

Aapke repo me abhi galat naam se file hai. Fix:

1. Repo kholo → `chat-page` → `env.example.txt` par click
2. Upar right me ✏️ **pencil (Edit)** dabao
3. File name box me naam badalo: `env.example.txt` → **`.env.example`** ✅
4. **Commit changes**
5. Wahi `chat-manage-pannel` folder me dohrao

Bas. Ab repo me template sahi naam se hoga, aur naya banda `cp .env.example .env` kar payega.

GitHub web UI dot wali file banata hai — file name box me `.env.example` type karna bilkul
valid hai, koi error nahi aayega.

**Delete karne wali cheez:** repo root me `.sudo_as_admin_successful` (0 byte) naam ki file hai —
wo project ki nahi hai, delete kar do.

---

# 4️⃣ Config values kahan se aati hain (console se)

Naya project banana ho ya values khud verify karni ho:

1. <https://console.firebase.google.com> → login
2. Project chuno (`chat-project-ecb1c`) — ya **Add project** se naya
3. ⚙️ **Project settings** → tab **General**
4. Neeche **Your apps** → Web app (`</>`)
   - pehle se nahi hai to **`</>`** dabao → naam do → **Register app**
5. **SDK setup and configuration** → **Config** radio → `firebaseConfig` object se values copy karo

| `.env` key | console me naam |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

### Firestore database bhi chahiye (data yahan save hota hai)

1. Left menu → **Build → Firestore Database** → **Create database**
2. Location: India ke liye **`asia-south1`**
3. **Start in test mode** → **Create**
4. **Rules** tab me paste karo:

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

> Aapke `chat-project-ecb1c` me Firestore **bana hua hai aur chal raha hai** ✅
> Ye steps sirf tab chahiye jab **naya project** banao.

---

# 5️⃣ Verify — kaam hua ya nahi

| Kahan dekho | Local mode (Firebase nahi juda) | ✅ Firebase mode |
| --- | --- | --- |
| Admin footer | `Local mode · <reason>` | **`Firebase connected`** |
| User profile page | neeche chhota local-mode note | note **gayab** |
| Firestore console → Data | khali | `chats` collection me doc |
| Browser Network tab | `/api/...` | `firestore.googleapis.com` |

`npm run env` bhi bata dega: `⇒ mode : FIREBASE`.

Config badalne ke baad cache bypass karna ho:

```
http://localhost:5173/?firebase=retry
http://localhost:5174/?firebase=retry
```

---

# 6️⃣ Vercel deployment — env vars yahan daalni hain ⚠️

**Aapke dono Vercel deployments abhi LOCAL mode me hain** — kyunki `.env` git me nahi jaati,
isliye build ke waqt Vercel ko values mili hi nahi. Iska matlab `/api` calls → 404
("Backend se connect nahi ho paya").

| Deployment | Kaunsi app | Abhi kya dikh raha hai |
| --- | --- | --- |
| `chat-main-project-wtke.vercel.app` | **admin** (`Eden · Chat Manage`) | `Backend se connect nahi ho paya` |
| `chat-main-project-7q2g.vercel.app` | **user** (`Eden · Chat`) | `Local dev mode · Firebase config add karte hi…` |

### Fix — dono Vercel projects me 6 variables (5 minute)

**Har project ke liye alag-alag karna hai** (dono me same values):

1. <https://vercel.com/dashboard> → apna project kholo
2. **Settings** (top menu) → left me **Environment Variables**
3. **Key** aur **Value** bharo, **Save** dabao — ye 6 baar:

| Key | Value |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `AIzaSyB8Ze5lLZ-8STrRI9rXWWGD3d80pW8mpxs` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `chat-project-ecb1c.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `chat-project-ecb1c` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `chat-project-ecb1c.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `806023624025` |
| `VITE_FIREBASE_APP_ID` | `1:806023624025:web:f64911a1712ddd5ef8c848` |

Environment select karte waqt **Production + Preview + Development** teeno tick kar do
(ya "All Environments").

4. **Sabse zaroori step — REDEPLOY.** Env vars **build ke time** bundle me jaati hain.
   Sirf Save karne se kuch nahi hoga:

   - **Deployments** tab → sabse upar wali deployment → right side **⋯** → **Redeploy**
   - (ya GitHub par koi bhi chhota commit push kar do, naya build khud chalega)

5. Redeploy ke baad hard refresh (`Ctrl+Shift+R`) → admin footer me **`Firebase connected`**,
   user app ke profile page se local-mode note gayab.

### Verify (30 second)

- admin URL kholo → footer me **Firebase connected** (hara cloud icon)
- user URL kholo → profile bharo → "Continue to chat"
- wapas admin URL refresh → aapka naam inbox me, unread badge ke saath ✅

### Yaad rakhne wali baatein

- **Vercel par `dev-server/` kaam nahi karta** — wo sirf local dev ke liye hai. Firebase mode me
  uski zarurat bhi nahi (bundle me `/api` call hi nahi hoti — maine check kiya).
- Env var badla → **hamesha redeploy** karo.
- Agar Root Directory set hai (`chat-page` / `chat-manage-pannel`) to build command default
  `npm run build`, output `dist` — theek hai. Root Directory khali ho to repo root me build hoga
  aur dono apps ka build fail/confuse hoga.
- Custom domain lagana ho to: Settings → Domains → add.

### Netlify / GitHub Actions bhi chahiye to

| Platform | Jagah |
| --- | --- |
| **Netlify** | Site configuration → **Environment variables** → phir **Deploys → Trigger deploy** |
| **GitHub Actions** | Settings → Secrets → workflow me `env:` block |
| **Firebase Hosting** | `.env.production` banao (usko bhi gitignore karo) |

---

# 7️⃣ Aam galtiyan

| Problem | Wajah | Fix |
| --- | --- | --- |
| Footer `Local mode` hi | `.env` nahi mili / naam `VITE_` ke bina / restart nahi kiya | `npm run env` chalao → jo missing ho wo bharo → restart |
| GitHub par file add ki, app nahi juda | `.env` laptop par chahiye, GitHub par nahi | `npm run env:create` |
| **Vercel par `Backend se connect nahi ho paya` / `/api 404`** | Vercel ko env vars nahi mile → local mode | Section 6: env vars daalo → **Redeploy** |
| `403 PERMISSION_DENIED` | Firestore database nahi bana / rules | console → Create database + rules |
| File dikh hi nahi rahi | dot wali file hidden hai | `dir -Force` / View → Hidden items |
| Bada PDF error | Firestore doc limit 1 MB → cap 700 KB | aage Firebase Storage use karo |

---

# 8️⃣ Ye config secret hai ya nahi?

Firebase **web config secret nahi hoti** — `apiKey` browser me by design dikhta hai, security
**Firestore rules** se aati hai. Isliye `.env` gitignore me rakhna safai ke liye hai, "leak" ka
darr nahi. Par han, project badalne par file edit karni padegi.

Asli dhyan: abhi **test rules (`if true`)** hain — jise bhi URL mile wo data padh/likh sakta hai.
Public repo ke saath production se pehle **Firebase Auth + per-user rules** lagana zaroori hai.
