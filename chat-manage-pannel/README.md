# chat-manage-pannel — Admin App

Admin side ka pura app. Is folder me **sirf admin (chat-manage) app ki files** hain —
chat-page ki koi file is folder me nahi hai.

## Flow

1. `#/` → **Inbox**: saare users ki list
   - avatar + **user name** + last message preview + time
   - **unread badge** (kitne messages user ne bheje hain jo padhe nahi)
   - search (name, mobile, email, message) + All / Unread filter
2. Kisi bhi user par **tap** → `#/chat/<chatId>` → us user ke saath **chat page** open
3. Chat kholte hi unread clear + user ke messages read ho jate hain (user ko ✓✓ dikhta hai)

## Features

| Feature | Detail |
| --- | --- |
| User list | Saare users, newest activity sabse upar |
| Unread | Blue badge, dono jagah (list + filter count) |
| Reply | Har user ko, image/PDF ke saath |
| Apni message | Edit + Delete (admin ki taraf se) |
| User ki message | Sirf Copy + Reply |
| User details | Naam, mobile (+91 format), email — copy karne ke options |
| Live | User ka naya message turant list me (Firebase) / ~1 sec (local) |
| Demo reset | Local mode me `Reset demo data` (menu me) |

## Run

```bash
npm install
npm run dev     # http://localhost:5174  (local backend 4317 chalu hona chahiye)
```

Local backend: `cd ../dev-server && node server.mjs`

## Firebase

Wahi steps jo root `README.md` me hain — `.env.example` → `.env`, apne project ki values.
Dono apps me **same Firebase project** ki values daalni hain (warna dono alag data dekh rahe honge).

## Structure

```
chat-manage-pannel/
├─ index.html
├─ vite.config.js          # port 5174 + /api proxy
├─ src/
│  ├─ App.jsx              # hash route: inbox / chat
│  ├─ pages/
│  │  ├─ AdminInboxPage.jsx   # users list + search + filter
│  │  └─ AdminChatPage.jsx    # user ke saath chat
│  ├─ data/constants.js    # SUPPORT identity, emojis
│  ├─ hooks/
│  │  ├─ useChatList.js    # live list of chats
│  │  ├─ useChatSession.js # live messages + actions
│  │  ├─ useHashRoute.js
│  │  └─ usePresence.js
│  ├─ lib/
│  │  ├─ api.js / firebaseApi.js / localApi.js / config.js
│  │  ├─ people.js         # initials, avatar tone, +91 formatting
│  │  ├─ image.js
│  │  └─ format.js
│  ├─ components/          # ChatScreen, Composer, bubbles, sheets (chat-page style)
│  └─ styles/global.css    # same iOS light design system
└─ preview/                # screenshots
```
