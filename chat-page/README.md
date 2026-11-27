# chat-page — User App

User side ka pura app. Is folder me **sirf chat-page ki files** hain — admin app ki koi file
is folder me nahi hai.

## Flow

1. App khulte hi **profile details** screen: **Full name, Mobile number, Email id**
   (validation ke saath — 10 digit mobile, valid email).
2. **Continue to chat** → details `localStorage` (`eden.chat.profile.v1`) me save +
   backend par user ki chat ban jati hai (mobile number hi chat id hai).
3. Dobara app kholne par **seedha chat** khulti hai — details **baar baar nahi** puchhi jati.
4. Profile badalna ho to: header avatar / info → **Edit my profile**.
   Local data hatana ho to: **Log out**.

## Features

| Feature | Detail |
| --- | --- |
| Reply | Bubble long-press (mobile) / right-click ya `⋯` (desktop) → Reply |
| Edit | Sirf apni message — orange "Editing message" bar + `Edited` tag |
| Delete | Sirf apni message — iOS confirm alert |
| Copy | Har message par |
| Support ki chat | Sirf Copy + Reply (edit/delete nahi) |
| Images | Multiple photos, auto-compress, full screen viewer + download |
| PDF / files | PDF, DOC, XLS, PPT, TXT, ZIP |
| Ticks | ✓ bheja, ✓✓ admin ne padha |
| Live | Admin ka reply ~1 sec me (local) ya turant (Firebase) |
| Persistence | Profile local, messages backend par |

## Run

```bash
npm install
npm run dev     # http://localhost:5173  (local backend 4317 chalu hona chahiye)
```

Local backend: `cd ../dev-server && node server.mjs`

## Firebase

`.env.example` → `.env` karke apne Firebase project ki values bharo:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Values bharne par app automatic **Firestore realtime** par chali jayegi (dev-server ki
zarurat nahi). Poora step-by-step: root `README.md` me.

> Attachment limit: Firebase mode me **~700 KB per file** (Firestore doc 1 MB limit).
> Production me bade files ke liye Firebase Storage use karo.

## Structure

```
chat-page/
├─ index.html
├─ vite.config.js          # port 5173 + /api proxy → local backend
├─ src/
│  ├─ App.jsx              # profile gate → chat
│  ├─ data/constants.js    # SUPPORT identity, emojis, PROFILE_KEY
│  ├─ hooks/
│  │  ├─ useProfile.js     # save/read/clear localStorage profile
│  │  ├─ useChatSession.js # live messages + send/edit/delete/markRead
│  │  └─ usePresence.js
│  ├─ lib/
│  │  ├─ api.js            # adapter switch (firebase / local)
│  │  ├─ firebaseApi.js    # Firestore implementation
│  │  ├─ localApi.js       # dev-server implementation
│  │  ├─ config.js         # env + attachment limits
│  │  ├─ image.js          # image compress + dataURL helpers
│  │  └─ format.js         # time, bytes, previews
│  ├─ components/          # ProfileSetup, ChatScreen, Composer, bubbles, sheets…
│  └─ styles/global.css    # iOS style light theme
└─ preview/                # screenshots
```
