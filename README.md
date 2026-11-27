# Chat Page — Main (Eden)

Ek hi React (Vite) project me **do panels** — **User Panel** aur **Admin Panel**. Dono ek shared store
use karte hain, isliye user panel se bheja message admin inbox me turant dikhta hai aur admin ka reply
user ke chat me aa jata hai. UI iOS jaisa simple, clean, **fully light** — white background, coloured
icons, smooth animations (koi lag nahi).

---

## Run kaise kare

```bash
cd chat-page-main
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## Routes (hash based — koi router dependency nahi)

| URL | Screen |
| --- | --- |
| `#/` | **User Panel** — direct chat page (Riya / Eden Care ke saath) |
| `#/admin` | **Admin Panel** — saare users ki list (Inbox) |
| `#/admin/chat/:id` | Admin panel me us user ke saath chat |

Panel switch karne ke liye: user panel me header avatar → **Open admin panel**, aur admin inbox me
top-right `⋯` → **Switch to user panel** (desktop par neeche footnote link bhi hai).

---

## User panel — features

| Feature | Kaise use hota hai |
| --- | --- |
| **Direct chat page** | App khulte hi chat open — koi list/login screen nahi |
| **Reply** | Bubble par long-press (mobile) / right-click ya hover par `⋯` (desktop) → **Reply** |
| **Edit (sirf apni chat)** | Same menu → **Edit message** → composer me orange "Editing message" bar → save |
| **Delete (sirf apni chat)** | Same menu → **Delete message** → iOS style confirm alert |
| **Copy** | Menu → **Copy text** (clipboard + toast) |
| **Samne wali chat** | Sirf **Copy** aur **Reply** — edit/delete ka option hi nahi dikhta |
| **Image send** | `📎` → **Photo & video** → multiple images, caption ke saath |
| **PDF / file send** | `📎` → **Document / PDF** → PDF, DOC, XLS, PPT, TXT, ZIP (max 10 MB) |
| **Image viewer** | Image par tap → full screen lightbox + download |
| **Reply quote** | Quote par tap → original message par smooth scroll + subtle highlight |
| **Read ticks** | Bheja hua ✓, admin ne padh liya to ✓✓ (state shared hai) |
| **Attachment tray** | Send se pehle thumbnail + name + size, remove (×) option |
| **Emoji picker** | Composer ke smiley button se 24 quick emojis |
| **Persistence** | Sab kuch `localStorage` me save — reload par wahi chat |

## Admin panel — features

| Feature | Detail |
| --- | --- |
| **Inbox (home page)** | Saare users ki list — naam, last message preview, time, unread count |
| **Tap → chat open** | Kisi bhi user par tap karte hi uske saath chat page khul jata hai |
| **Unread handling** | Chat kholte hi messages read ho jate hain, blue badge hat jata hai |
| **Search** | Naam ya last message se filter (iOS style search field) |
| **All / Unread filter** | Segmented control, unread count ke saath |
| **Chat features** | Reply, copy, apni messages edit/delete, image + PDF/file send, lightbox — sab same |
| **User ki messages** | Sirf **Copy** + **Reply** (edit/delete nahi) |
| **Read receipts** | Admin reply karte hi user ke messages read ho jate hain (user panel me ✓✓) |
| **User info sheet** | Phone copy, profile, clear chat history, demo reset |
| **Admin menu** | Profile, reset demo data, switch to user panel |

---

## Design system

- **Sirf light mode**, background pure white (`#FFFFFF`), fills ke liye `#F2F2F7`.
- **Colors** (htmlcolorcodes / iOS system palette):

  | Use | Hex |
  | --- | --- |
  | Primary / send / unread badge | `#007AFF` |
  | Teal accent (copy) | `#5AC8FA` |
  | Success / online | `#34C759` |
  | Edit / warning | `#FF9500` |
  | Delete / PDF | `#FF3B30` |
  | Secondary text | `#8E8E93` |
  | Hairline | `#E5E5EA` / `#EFEFF4` |

- **Icons:** [Iconoir](https://github.com/iconoir-icons/iconoir) (`iconoir-react`) — SendDiagonal,
  Attachment, Reply, EditPencil, Trash, Copy, MediaImage, Page, Download, MoreHoriz, Search,
  InfoCircle, Lock, ArrowDown, Xmark, Check, DoubleCheck, Community, LogOut.
- **Avatars:** 6 gradient tones (`tone-1 … tone-6`) — har user ka apna colour.
- **Motion:** iOS easing `cubic-bezier(.32,.72,0,1)`, sirf `transform`/`opacity` animate hote hain.

---

## Structure

```
src/
├─ App.jsx                    # hash router + providers
├─ pages/
│  ├─ UserChatPage.jsx        # user panel (thread: aarav-mehta)
│  ├─ AdminInboxPage.jsx      # admin home — all users list
│  └─ AdminChatPage.jsx       # admin ↔ ek user ki chat
├─ components/
│  ├─ ChatScreen.jsx          # dono panels ki common chat screen (reply/edit/delete/attach)
│  ├─ ChatHeader.jsx          # avatar + name + status + actions
│  ├─ MessageList.jsx         # day dividers, grouping, typing, scroll-to-bottom
│  ├─ MessageBubble.jsx       # text/image/file, quote, ticks, long-press
│  ├─ Composer.jsx            # input, reply/edit bars, attachments, emoji, send
│  ├─ ActionSheet.jsx         # iOS bottom sheet (reusable)
│  ├─ ConfirmDialog.jsx       # iOS alert (delete/clear)
│  ├─ Lightbox.jsx            # full screen image viewer
│  └─ Toast.jsx               # context based toast
├─ store/ChatProvider.jsx     # threads + messages, persistence, permissions
├─ hooks/
│  ├─ useHashRoute.js         # chhota hash router (#/ , #/admin , #/admin/chat/:id)
│  └─ usePresence.js          # enter-exit animation helper
├─ lib/format.js              # time, bytes, file kind, unread, sorting
├─ data/
│  ├─ threads.js              # 6 demo users + conversations + emojis
│  └─ seedPdf.js              # demo invoice PDF (base64)
└─ styles/global.css          # design tokens + saare components
```

### Data model

```js
thread = { id, user: { name, initials, city, phone, tone, online, lastSeen }, messages: [] }
message = { id, from: 'user' | 'support', text, attachments: [], replyTo, edited, status, createdAt }
```

- `from` se hi bubble side, ticks aur permissions decide hote hain — `meRole` prop (`'user'` ya
  `'support'`) ke against compare hota hai.
- Unread count derive hota hai: `messages` me jin messages ka `from === 'user'` aur `status !== 'read'`
  hai. Chat khulte hi `markRead()` unhe read kar deta hai — isliye badge aur ✓✓ kabhi out of sync
  nahi hote.
- Permission rule do jagah enforce hai: UI me action options filter hote hain, aur
  `ChatProvider.editMessage/deleteMessage` me `from === meRole` check hota hai.

---

## Demo notes

- 6 demo users hain — Aarav Mehta (user panel wala), Priya Nair, Rohan Gupta, Sneha Kapoor,
  Kabir Singh, Ananya Verma.
- Demo data reset: user panel info sheet → **Restore demo chat**, ya admin `⋯` → **Reset demo data**.
- Ek hi browser ke do tabs me dono panels kholo — `storage` sync se messages live exchange honge.
