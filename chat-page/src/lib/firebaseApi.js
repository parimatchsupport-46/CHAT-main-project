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
import { firebaseConfig } from './config.js';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const chatsCol = () => collection(db, 'chats');
const chatRef = (chatId) => doc(db, 'chats', chatId);
const messagesCol = (chatId) => collection(db, 'chats', chatId, 'messages');
const messageRef = (chatId, messageId) => doc(db, 'chats', chatId, 'messages', messageId);

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
  const messages = snap.docs.map(withId);
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
    return m.from === target && m.status !== 'read';
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
      (snap) => onData(snap.docs.map(withId)),
      (err) => onError?.(err),
    );
  },

  async sendMessage(chatId, payload) {
    const message = {
      from: payload.from === 'support' ? 'support' : 'user',
      text: String(payload.text || '').trim(),
      attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
      replyTo: payload.replyTo || null,
      edited: false,
      status: payload.from === 'support' ? 'read' : 'sent',
      createdAt: Date.now(),
    };
    if (!message.text && !message.attachments.length) throw new Error('Empty message');

    const ref = await addDoc(messagesCol(chatId), message);

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
    await deleteDoc(messageRef(chatId, messageId));
    await refreshChatMeta(chatId);
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
