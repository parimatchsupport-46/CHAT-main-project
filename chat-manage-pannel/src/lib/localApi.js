/**
 * LOCAL DEV adapter — dev-server/ (port 4317) se baat karta hai.
 * API shape bilkul firebaseApi jaisa hai, isliye app ka code same rehta hai.
 */
import { API_BASE } from './config.js';

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error || '';
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
};

const poll = (loader, onData, onError, interval = 1200) => {
  let alive = true;
  let inFlight = false;
  const tick = async () => {
    if (!alive || inFlight) return;
    inFlight = true;
    try {
      const data = await loader();
      if (alive) onData(data);
    } catch (err) {
      if (alive) onError?.(err);
    } finally {
      inFlight = false;
    }
  };
  tick();
  const timer = setInterval(tick, interval);
  return () => {
    alive = false;
    clearInterval(timer);
  };
};

export const api = {
  mode: 'local',

  upsertChat: (profile) =>
    request('/chats', { method: 'POST', body: JSON.stringify({ profile }) }),

  subscribeChats: (onData, onError) => poll(() => request('/chats'), onData, onError),

  subscribeChat: (chatId, onData, onError) =>
    poll(() => request(`/chats/${chatId}`), onData, onError),

  subscribeMessages: (chatId, onData, onError) =>
    poll(() => request(`/chats/${chatId}/messages`), onData, onError),

  sendMessage: (chatId, message) =>
    request(`/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify(message) }),

  editMessage: (chatId, messageId, text) =>
    request(`/chats/${chatId}/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ text }),
    }),

  deleteMessage: (chatId, messageId) =>
    request(`/chats/${chatId}/messages/${messageId}`, { method: 'DELETE' }),

  markRead: (chatId, who) =>
    request(`/chats/${chatId}/read`, { method: 'POST', body: JSON.stringify({ who }) }),

  loadAttachment: async (_chatId, _messageId, attachment) => attachment?.dataUrl || '',

  resetDemo: () => request('/reset', { method: 'POST' }),

  health: () => request('/health'),
};
