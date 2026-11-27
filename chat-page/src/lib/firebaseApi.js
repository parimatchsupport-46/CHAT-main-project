/**
 * FIREBASE adapter (Firestore) — same API shape as localApi.
 *
 * Firestore structure:
 *   chats/{chatId}                        → { profile, createdAt, updatedAt, lastMessage, unread }
 *   chats/{chatId}/messages/{messageId}   → { from, text, attachments, replyTo, edited, status, createdAt }
 *
 * chatId = "u_<mobile digits>" — isliye ek hi mobile se dobara login karne par
 * wahi purani chat milti hai (duplicate nahi banti).
 */
import { getApps, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { CHUNK_CHARS, INLINE_ATTACHMENT_LIMIT, firebaseConfig } from './config.js';
import { dataUrlBytes } from './image.js';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const chatsCol = () => collection(db, 'chats');
const chatRef = (chatId) => doc(db, 'chats', chatId);
const messagesCol = (chatId) => collection(db, 'chats', chatId, 'messages');
const messageRef = (chatId, messageId) => doc(db, 'chats', chatId, 'messages', messageId);
/**
 * Bade attachments "parts" docs me rehte hain — wahi messages collection, par
 * `part: true` ke saath aur **createdAt ke bina**.
 * Firestore me jo doc orderBy field ke bina ho wo query result me aata hi nahi —
 * isliye ye parts message list / unread count / last message me kabhi nahi dikhte.
 */
const partId = (messageId, attId, idx) => `part_${messageId}_${attId}_${String(idx).padStart(4, '0')}`;

const attachmentCache = new Map();

const splitDataUrl = (dataUrl = '') => {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return { head: '', base64: '' };
  return { head: dataUrl.slice(0, comma + 1), base64: dataUrl.slice(comma + 1) };
};

/** Attachment ko chhote docs me todkar likhta hai (message doc me sirf metadata rehta hai). */
const writeAttachmentChunks = async (chatId, messageId, attachment) => {
  const { head, base64 } = splitDataUrl(attachment.dataUrl);
  const parts = [];
  for (let offset = 0, idx = 0; offset < base64.length; offset += CHUNK_CHARS, idx += 1) {
    parts.push({
      ref: doc(messagesCol(chatId), partId(messageId, attachment.id, idx)),
      body: {
        part: true, // message list isko ignore karti hai (createdAt nahi hai)
        owner: messageId,
        attId: attachment.id,
        idx,
        data: base64.slice(offset, offset + CHUNK_CHARS),
      },
    });
  }
  // note: writeBatch bade payloads ke saath hang karta hai — isliye seedha parallel setDoc
  const CONCURRENCY = 5;
  for (let i = 0; i < parts.length; i += CONCURRENCY) {
    await Promise.all(parts.slice(i, i + CONCURRENCY).map((p) => setDoc(p.ref, p.body)));
  }
  return { head, chunks: parts.length };
};



const deleteAttachmentChunks = async (chatId, messageId) => {
  const snap = await getDocs(messagesCol(chatId));
  const refs = snap.docs
    .filter((d) => {
      const data = d.data();
      return data.part === true && data.owner === messageId;
    })
    .map((d) => d.ref);
  for (let i = 0; i < refs.length; i += 8) {
    await Promise.all(refs.slice(i, i + 8).map((ref) => deleteDoc(ref)));
  }
};

export const chatIdFor = (profile) => `u_${String(profile?.mobile || '').replace(/\D/g, '')}`;

const withId = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

const previewOf = (msg) => {
  if (!msg) return null;
  if (msg.text) return msg.text.length > 90 ? `${msg.text.slice(0, 90)}…` : msg.text;
  const first = (msg.attachments || [])[0];
  if (!first) return 'Message';
  return first.kind === 'image' ? '📷 Photo' : `📎 ${first.name}`;
};

const cleanProfile = (profile) => ({
  name: String(profile?.name || '').trim(),
  mobile: String(profile?.mobile || '').replace(/\D/g, ''),
  email: String(profile?.email || '').trim().toLowerCase(),
});

/** Aakhri message ke hisaab se chat doc ka summary + unread count refresh. */
const refreshChatMeta = async (chatId) => {
  const snap = await getDocs(query(messagesCol(chatId), orderBy('createdAt', 'asc')));
  const messages = snap.docs.map(withId).filter((m) => m.part !== true);
  const last = messages[messages.length - 1] || null;
  const unread = messages.filter((m) => m.from === 'user' && m.status !== 'read').length;
  await updateDoc(chatRef(chatId), {
    lastMessage: last
      ? { from: last.from, text: previewOf(last), kind: last.attachments?.length ? 'file' : 'text', at: last.createdAt }
      : null,
    updatedAt: last ? last.createdAt : Date.now(),
    unread,
  });
};

const markOppositeRead = async (chatId, who) => {
  const target = who === 'support' ? 'user' : 'support';
  const snap = await getDocs(query(messagesCol(chatId), orderBy('createdAt', 'asc')));
  const pending = snap.docs.filter((d) => {
    const m = d.data();
    return m.part !== true && m.from === target && m.status !== 'read';
  });
  if (!pending.length) return;
  const batch = writeBatch(db);
  pending.forEach((d) => batch.update(d.ref, { status: 'read' }));
  if (who === 'support') batch.update(chatRef(chatId), { unread: 0 });
  await batch.commit();
};

export const api = {
  mode: 'firebase',

  async upsertChat(profile) {
    const clean = cleanProfile(profile);
    if (!clean.name || !clean.mobile || !clean.email) {
      throw new Error('Name, mobile number and email are required');
    }
    const chatId = chatIdFor(clean);
    const ref = chatRef(chatId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const createdAt = Date.now();
      const welcome = {
        from: 'support',
        text: `Hi ${clean.name.split(/\s+/)[0] || 'there'}! Welcome to Eden 👋 Main Riya hoon, Eden Care team se. Apni query batao — main yahin help karungi.`,
        attachments: [],
        replyTo: null,
        edited: false,
        status: 'read',
        createdAt,
      };
      const fresh = {
        profile: clean,
        createdAt,
        updatedAt: createdAt,
        lastMessage: {
          from: 'support',
          text: welcome.text.length > 90 ? `${welcome.text.slice(0, 90)}…` : welcome.text,
          kind: 'text',
          at: createdAt,
        },
        unread: 0,
      };
      await setDoc(ref, fresh);
      await addDoc(messagesCol(chatId), welcome);
      return { id: chatId, ...fresh };
    }
    await setDoc(ref, { profile: { ...(snap.data().profile || {}), ...clean } }, { merge: true });
    return { id: chatId, ...snap.data(), profile: clean };
  },

  subscribeChats(onData, onError) {
    const q = query(chatsCol(), orderBy('updatedAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map(withId)),
      (err) => onError?.(err),
    );
  },

  subscribeChat(chatId, onData, onError) {
    return onSnapshot(
      chatRef(chatId),
      (snap) => {
        if (snap.exists()) onData(withId(snap));
      },
      (err) => onError?.(err),
    );
  },

  subscribeMessages(chatId, onData, onError) {
    const q = query(messagesCol(chatId), orderBy('createdAt', 'asc'));
    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map(withId).filter((m) => m.part !== true)),
      (err) => onError?.(err),
    );
  },

  async sendMessage(chatId, payload) {
    const incoming = Array.isArray(payload.attachments) ? payload.attachments : [];
    const INLINE_HARD_CAP = 900 * 1024;

    // 1) metadata tay karo — kaunsa attachment inline jayega, kaunsa chunks me
    const attachments = incoming.map((att) => {
      const bytes = dataUrlBytes(att.dataUrl || '') || att.size || 0;
      return {
        id: att.id,
        name: att.name,
        mime: att.mime,
        kind: att.kind,
        size: bytes,
        dataUrl: att.dataUrl || '',
      };
    });

    const message = {
      from: payload.from === 'support' ? 'support' : 'user',
      text: String(payload.text || '').trim(),
      attachments: [],
      replyTo: payload.replyTo || null,
      edited: false,
      status: payload.from === 'support' ? 'read' : 'sent',
      createdAt: Date.now(),
    };
    if (!message.text && !attachments.length) throw new Error('Empty message');

    const ref = doc(messagesCol(chatId)); // id pehle — chunks isi id ke neeche jaate hain

    // 2) bade attachments ke chunks likho (rules allow karte hon to)
    const finalAttachments = [];
    for (const att of attachments) {
      const needsChunks = att.dataUrl && att.size > INLINE_ATTACHMENT_LIMIT;
      if (!needsChunks) {
        finalAttachments.push(att);
        continue;
      }
      try {
        const { head, chunks } = await writeAttachmentChunks(chatId, ref.id, att);
        finalAttachments.push({ ...att, dataUrl: '', chunked: true, head, chunks });
      } catch (err) {
        // Firestore rules ne parts block kiye → agar fit ho to inline bhej do
        if (att.size <= INLINE_HARD_CAP) {
          finalAttachments.push(att);
        } else {
          clearAttachmentChunks(chatId, ref.id);
          throw new Error(
            `${att.name} (${Math.round(att.size / 1024)} KB) bhejne ke liye Firestore rules update karo — FIREBASE-SETUP.md §9 (1 line)`,
            { cause: err },
          );
        }
      }
    }

    // 3) message doc
    message.attachments = finalAttachments;
    await setDoc(ref, message);

    const chatUpdate = {
      lastMessage: {
        from: message.from,
        text: previewOf(message),
        kind: message.attachments.length ? 'file' : 'text',
        at: message.createdAt,
      },
      updatedAt: message.createdAt,
    };
    if (message.from === 'user') chatUpdate.unread = increment(1);
    await updateDoc(chatRef(chatId), chatUpdate);

    if (message.from === 'support') await markOppositeRead(chatId, 'support');

    return { id: ref.id, ...message };
  },

  async editMessage(chatId, messageId, text) {
    const clean = String(text || '').trim();
    if (!clean) throw new Error('Text required');
    await updateDoc(messageRef(chatId, messageId), { text: clean, edited: true });
    await refreshChatMeta(chatId);
  },

  async deleteMessage(chatId, messageId) {
    try {
      await deleteAttachmentChunks(chatId, messageId);
    } catch {
      /* parts na ho to koi baat nahi */
    }
    await deleteDoc(messageRef(chatId, messageId));
    await refreshChatMeta(chatId);
  },

  /** Chunked attachment ka poora data (data URL) wapas laata hai. */
  async loadAttachment(chatId, messageId, attachment) {
    if (!attachment) return '';
    if (attachment.dataUrl) return attachment.dataUrl;
    const key = `${chatId}|${messageId}|${attachment.id}`;
    if (attachmentCache.has(key)) return attachmentCache.get(key);

    const snap = await getDocs(messagesCol(chatId));
    const base64 = snap.docs
      .filter((d) => {
        const data = d.data();
        return data.part === true && data.owner === messageId && data.attId === attachment.id;
      })
      .sort((a, b) => (a.data().idx ?? 0) - (b.data().idx ?? 0))
      .map((d) => d.data().data || '')
      .join('');

    const head = attachment.head || `data:${attachment.mime || 'application/octet-stream'};base64,`;
    const url = `${head}${base64}`;
    attachmentCache.set(key, url);
    return url;
  },

  markRead: (chatId, who) => markOppositeRead(chatId, who),

  async resetDemo() {
    throw new Error('Demo reset sirf local mode me hota hai');
  },

  /** start-up check: Firestore reachable hai aur rules allow karte hain? */
  health: async () => {
    const snap = await getDocs(query(chatsCol(), limit(1)));
    return { ok: true, mode: 'firebase', size: snap.size };
  },
};
