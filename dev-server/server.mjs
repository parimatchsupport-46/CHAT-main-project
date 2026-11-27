/**
 * LOCAL DEV BACKEND (sirf development ke liye)
 * ------------------------------------------------------------
 * Ye chhota server dono apps (chat-page + chat-manage-pannel) ke liye
 * ek "cloud" play karta hai — jab tak Firebase config nahi daalte.
 *
 *  - Data: dev-server/.data/db.json
 *  - Port: 4317  (apps isko /api par proxy karte hain)
 *
 * Firebase daalne ke baad ye server band kar sakte ho.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT || 4317);
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

/** @type {{ chats: any[] }} */
let db = { chats: [] };
let writeTimer = null;

const now = () => Date.now();
const minsAgo = (m) => now() - m * 60_000;

const makeChatId = (mobile) => `u_${String(mobile).replace(/\D/g, '')}`;

const welcomeMessage = (name) => ({
  id: randomUUID(),
  from: 'support',
  text: `Hi ${String(name).trim().split(/\s+/)[0] || 'there'}! Welcome to Eden 👋 Main Riya hoon, Eden Care team se. Apni query batao — main yahin help karungi.`,
  attachments: [],
  replyTo: null,
  edited: false,
  status: 'read',
  createdAt: now(),
});

const newMessage = (data) => ({
  id: randomUUID(),
  from: data.from === 'support' ? 'support' : 'user',
  text: (data.text || '').trim(),
  attachments: Array.isArray(data.attachments) ? data.attachments : [],
  replyTo: data.replyTo || null,
  edited: false,
  status: data.from === 'support' ? 'read' : 'sent',
  createdAt: now(),
});

const previewOf = (msg) => {
  if (!msg) return null;
  if (msg.text) return msg.text.length > 90 ? `${msg.text.slice(0, 90)}…` : msg.text;
  const first = (msg.attachments || [])[0];
  if (!first) return 'Message';
  return first.kind === 'image' ? '📷 Photo' : `📎 ${first.name}`;
};

const lastOf = (chat) => chat.messages[chat.messages.length - 1] || null;

const syncChatMeta = (chat) => {
  const last = lastOf(chat);
  chat.lastMessage = last
    ? { from: last.from, text: previewOf(last), kind: last.attachments?.length ? 'file' : 'text', at: last.createdAt }
    : null;
  chat.updatedAt = last ? last.createdAt : chat.createdAt;
  chat.unread = chat.messages.filter((m) => m.from === 'user' && m.status !== 'read').length;
};

const chatView = (chat) => ({
  id: chat.id,
  profile: chat.profile,
  createdAt: chat.createdAt,
  updatedAt: chat.updatedAt,
  lastMessage: chat.lastMessage || null,
  unread: chat.unread || 0,
  messageCount: chat.messages.length,
});

/* ------------------------------- seed data -------------------------------- */

const seedMessages = (chatId, rows) => {
  const built = [];
  rows.forEach(([from, text, minutesAgo, extra = {}]) => {
    built.push({
      id: randomUUID(),
      from,
      text,
      attachments: [],
      replyTo: null,
      edited: false,
      status: from === 'support' ? 'read' : extra.status || 'read',
      createdAt: minsAgo(minutesAgo),
    });
  });
  return built;
};

const seed = () => {
  const aarav = {
    id: makeChatId('9829041127'),
    profile: { name: 'Aarav Mehta', mobile: '9829041127', email: 'aarav.mehta@example.com' },
    createdAt: minsAgo(26 * 60),
    messages: seedMessages(makeChatId('9829041127'), [
      ['support', 'Hey Aarav 👋 Welcome to Eden.', 26 * 60 + 6],
      ['support', "I'm Riya from the Eden Care team — I'll be looking after your order today.", 26 * 60 + 5],
      ['user', 'Hi Riya! Thanks. I have a quick question about my order.', 26 * 60 + 2],
      ['support', 'Sure, go ahead 🙂', 26 * 60 + 1],
      ['user', "I placed order #EDN-48217 yesterday but I still haven't received the tracking link.", 46],
      ['support', 'Let me check that for you right away.', 44],
      ['support', 'Your parcel was picked up this morning and it is on the way. Delivery is expected on 29 Nov, between 10 am and 2 pm.', 42],
      ['user', 'Perfect, that was fast 😄 Thanks for the update!', 20],
      ['support', 'Anytime! Anything else I can help you with?', 19],
    ]),
  };

  const priya = {
    id: makeChatId('9833022941'),
    profile: { name: 'Priya Nair', mobile: '9833022941', email: 'priya.nair@example.com' },
    createdAt: minsAgo(58),
    messages: seedMessages(makeChatId('9833022941'), [
      ['user', "Hi, my order was supposed to arrive today but it's still showing 'out for delivery'.", 58, { status: 'read' }],
      ['support', 'Sorry about that, Priya. Let me check with the courier right away.', 55],
      ['support', 'Courier says it will be delivered before 7 pm today.', 40],
      ['user', 'Okay, please confirm once it is delivered 🙏', 12],
    ]),
  };

  db = { chats: [aarav, priya] };
  db.chats.forEach(syncChatMeta);
};

/* --------------------------------- storage -------------------------------- */

const load = async () => {
  try {
    const raw = await readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.chats)) {
      db = parsed;
      return;
    }
  } catch {
    /* file nahi hai — seed kar denge */
  }
  seed();
  await saveNow();
};

const saveNow = async () => {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_FILE, JSON.stringify(db, null, 2));
};

const save = () => {
  clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    saveNow().catch((e) => console.error('[dev-server] save failed', e));
  }, 120);
};

/* --------------------------------- helpers -------------------------------- */

const send = (res, status, payload) => {
  const body = payload === undefined ? '' : JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
  });
  res.end(body);
};

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 12 * 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

const findChat = (id) => db.chats.find((c) => c.id === id);

/* --------------------------------- routes --------------------------------- */

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (req.method === 'OPTIONS') return send(res, 204);

  const parts = pathname.split('/').filter(Boolean); // ['api', 'chats', ':id', ...]

  try {
    if (parts[0] !== 'api') return send(res, 404, { error: 'not found' });

    // GET /api/health
    if (parts[1] === 'health' && req.method === 'GET') {
      return send(res, 200, { ok: true, mode: 'local', chats: db.chats.length });
    }

    // /api/chats
    if (parts[1] === 'chats' && parts.length === 2) {
      if (req.method === 'GET') {
        const list = [...db.chats].sort(
          (a, b) => (b.lastMessage?.at || b.updatedAt) - (a.lastMessage?.at || a.updatedAt),
        );
        return send(res, 200, list.map(chatView));
      }

      if (req.method === 'POST') {
        const body = await readBody(req);
        const profile = body.profile || {};
        const mobile = String(profile.mobile || '').replace(/\D/g, '');
        const name = String(profile.name || '').trim();
        const email = String(profile.email || '').trim().toLowerCase();
        if (!mobile || !name || !email) {
          return send(res, 400, { error: 'name, mobile and email are required' });
        }

        const id = makeChatId(mobile);
        let chat = findChat(id);
        if (!chat) {
          chat = {
            id,
            profile: { name, mobile, email },
            createdAt: now(),
            messages: [welcomeMessage(name)],
          };
          db.chats.push(chat);
        } else {
          chat.profile = { ...chat.profile, name, email, mobile };
        }
        syncChatMeta(chat);
        save();
        return send(res, 200, chatView(chat));
      }
    }

    // /api/chats/:id
    if (parts[1] === 'chats' && parts[2] && parts.length === 3 && req.method === 'GET') {
      const chat = findChat(parts[2]);
      if (!chat) return send(res, 404, { error: 'chat not found' });
      return send(res, 200, chatView(chat));
    }

    // /api/chats/:id/messages
    if (parts[1] === 'chats' && parts[2] && parts[3] === 'messages' && parts.length === 4) {
      const chat = findChat(parts[2]);
      if (!chat) return send(res, 404, { error: 'chat not found' });

      if (req.method === 'GET') return send(res, 200, chat.messages);

      if (req.method === 'POST') {
        const body = await readBody(req);
        const msg = newMessage(body);
        if (!msg.text && msg.attachments.length === 0) {
          return send(res, 400, { error: 'empty message' });
        }
        chat.messages.push(msg);

        // support reply karte hi user ke messages read ho jate hain
        if (msg.from === 'support') {
          chat.messages.forEach((m) => {
            if (m.from === 'user' && m.status !== 'read') m.status = 'read';
          });
        }
        syncChatMeta(chat);
        save();
        return send(res, 201, msg);
      }
    }

    // /api/chats/:id/messages/:mid
    if (
      parts[1] === 'chats' &&
      parts[2] &&
      parts[3] === 'messages' &&
      parts[4] &&
      parts.length === 5
    ) {
      const chat = findChat(parts[2]);
      if (!chat) return send(res, 404, { error: 'chat not found' });
      const msg = chat.messages.find((m) => m.id === parts[4]);
      if (!msg) return send(res, 404, { error: 'message not found' });

      if (req.method === 'PATCH') {
        const body = await readBody(req);
        const text = String(body.text || '').trim();
        if (!text) return send(res, 400, { error: 'text required' });
        msg.text = text;
        msg.edited = true;
        syncChatMeta(chat);
        save();
        return send(res, 200, msg);
      }

      if (req.method === 'DELETE') {
        chat.messages = chat.messages.filter((m) => m.id !== parts[4]);
        syncChatMeta(chat);
        save();
        return send(res, 204);
      }
    }

    // /api/chats/:id/read
    if (parts[1] === 'chats' && parts[2] && parts[3] === 'read' && req.method === 'POST') {
      const chat = findChat(parts[2]);
      if (!chat) return send(res, 404, { error: 'chat not found' });
      const body = await readBody(req);
      const who = body.who === 'user' ? 'user' : 'support';
      const target = who === 'support' ? 'user' : 'support';
      chat.messages.forEach((m) => {
        if (m.from === target && m.status !== 'read') m.status = 'read';
      });
      syncChatMeta(chat);
      save();
      return send(res, 200, { ok: true });
    }

    // /api/reset — demo data wapas
    if (parts[1] === 'reset' && req.method === 'POST') {
      seed();
      save();
      return send(res, 200, { ok: true, chats: db.chats.length });
    }

    return send(res, 404, { error: 'not found' });
  } catch (error) {
    console.error('[dev-server]', error);
    return send(res, 500, { error: String(error?.message || error) });
  }
});

await load();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[dev-server] local chat backend ready → http://localhost:${PORT}/api/health`);
});
