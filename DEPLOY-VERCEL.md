# 🚀 Vercel deploy — chat-page + chat-manage-pannel

> **Aapke purane dono URLs ab 404 de rahe hain** (`DEPLOYMENT_NOT_FOUND`) —
> deployment delete ho gaya hai ya project rename hua hai. Neeche se naya banao (5 minute).
> Code bilkul theek hai — maine repo ke file-by-file check kiya, wahi latest code hai.

---

## 1. Do project banao (dono alag)

<https://vercel.com/new> → **Import Git Repository** → `parimatchsupport-46/CHAT-main-project`

### Project A — user app

| Setting | Value |
| --- | --- |
| Project Name | `live-chat` (kuch bhi) |
| **Root Directory** | **`chat-page`** ← ye sabse zaroori hai |
| Framework Preset | Vite (auto detect ho jayega) |
| Build Command | `npm run build` (default) |
| Output Directory | `dist` (default) |

### Project B — admin panel

Wahi repo dobara import karo, bas:

| Setting | Value |
| --- | --- |
| Project Name | `live-chat-admin` |
| **Root Directory** | **`chat-manage-pannel`** |

`chat-page` aur `chat-manage-pannel` ke andar `vercel.json` bhi daal diya hai — Vite framework,
build command aur SPA rewrite khud set ho jate hain.

---

## 2. Environment variables (dono projects me, same values)

Project → **Settings** → **Environment Variables** → 6 keys add karo → Environment: **All**

```
VITE_FIREBASE_API_KEY=AIzaSyB8Ze5lLZ-8STrRI9rXWWGD3d80pW8mpxs
VITE_FIREBASE_AUTH_DOMAIN=chat-project-ecb1c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=chat-project-ecb1c
VITE_FIREBASE_STORAGE_BUCKET=chat-project-ecb1c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=806023624025
VITE_FIREBASE_APP_ID=1:806023624025:web:f64911a1712ddd5ef8c848
```

Ya `Bulk Edit` / `.env` paste option use karo — 6 line ek saath.

---

## 3. Deploy

**Deploy** dabao. Pehli baar env vars add kiye hain to phir:
**Deployments** → top deployment → **⋯** → **Redeploy** (env build-time padhte hain).

---

## 4. Deploy ke baad check (30 second)

| Kya dekho | ✅ Sahi | ❌ Purana/galat |
| --- | --- | --- |
| Browser tab ka naam | **Live Chat** | "Eden · Chat" → purana build |
| Tab ka icon | **hara chat bubble** | blue bubble → purana build |
| Profile screen | green logo + "Live Chat" | "Welcome to Eden" → purana build |
| Admin footer | `Firebase connected` | `Local mode…` → env vars missing |
| Photo bhejo (4-5 MB) | image bubble dikhe | kuch na ho → purana build |

---

## 5. Aapka naya URL kahan milega

Project → **Deployments** → top wali deployment ke neeche URL, jaise
`https://live-chat-xxxx.vercel.app`. Project → **Settings → Domains** me bhi dikhta hai.

Custom domain lagana ho: Settings → Domains → add → DNS me CNAME.

---

## 6. Agar build fail ho jaye

| Error | Wajah | Fix |
| --- | --- | --- |
| `Cannot find module '@coolicons/react'` | `package.json` / `package-lock.json` push nahi hua | dono files commit karke push karo |
| `Build command failed` / root me build | **Root Directory** set nahi hai | Settings → Root Directory = `chat-page` (ya `chat-manage-pannel`) |
| Site khulti hai par blank | SPA rewrite missing | `vercel.json` push karo (already bana hua hai) |
| Footer `Local mode` | env vars nahi mile / redeploy nahi kiya | §2 + Redeploy |

---

## 7. Push karne ke liye (agar zip se kaam kar rahe ho)

`eden-chat-source.zip` me sab kuch hai: dono apps, `vercel.json`, `scripts/`, docs.
Node modules **nahi** — Vercel khud install karega (`npm install`).

Naye files jo is baar add hue hain:

```
chat-page/vercel.json
chat-manage-pannel/vercel.json
chat-page/src/components/BrandLogo.jsx
chat-page/src/lib/{config,image,firebaseApi}.js   (attachments fix)
chat-manage-pannel/src/lib/{config,image,firebaseApi}.js
chat-page/package.json + package-lock.json        (@coolicons/react)
chat-page/scripts/…                               (root scripts/ folder)
```
