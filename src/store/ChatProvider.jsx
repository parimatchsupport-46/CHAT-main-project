import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { seedThreads } from '../data/threads.js';
import { messagePreview, uid } from '../lib/format.js';

const STORAGE_KEY = 'eden.threads.v1';
const ChatContext = createContext(null);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
};

const loadThreads = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* private mode / quota — demo chalega hi */
  }
  return null;
};

/**
 * Dono panels (user + admin) ek hi state share karte hain, isliye user panel se
 * bheja message admin inbox me turant dikhta hai aur admin ka reply user ke paas.
 * Har message me `from: 'user' | 'support'` hota hai.
 */
export function ChatProvider({ children }) {
  const [threads, setThreads] = useState(() => loadThreads() ?? seedThreads());
  const saveTimer = useRef(null);

  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
      } catch {
        /* bahut badi attachments par quota full ho sakta hai */
      }
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [threads]);

  // dusre tab me ho rahi activity sync rahe
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) setThreads(parsed);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const getThread = useCallback(
    (threadId) => threads.find((t) => t.id === threadId) || null,
    [threads],
  );

  const sendMessage = useCallback((threadId, { from, text = '', attachments = [], replyTo = null }) => {
    const clean = text.trim();
    if (!clean && attachments.length === 0) return null;

    const message = {
      id: uid(),
      from,
      text: clean,
      attachments,
      replyTo,
      edited: false,
      status: from === 'user' ? 'sent' : 'read',
      createdAt: new Date().toISOString(),
    };

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        // support reply karte hi user ke messages read ho jate hain
        const messages =
          from === 'support'
            ? thread.messages.map((m) =>
                m.from === 'user' && m.status !== 'read' ? { ...m, status: 'read' } : m,
              )
            : thread.messages;
        return { ...thread, messages: [...messages, message] };
      }),
    );

    return message;
  }, []);

  const editMessage = useCallback((threadId, messageId, text, from) => {
    const clean = text.trim();
    if (!clean) return;
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        return {
          ...thread,
          messages: thread.messages.map((m) =>
            m.id === messageId && m.from === from ? { ...m, text: clean, edited: true } : m,
          ),
        };
      }),
    );
  }, []);

  const deleteMessage = useCallback((threadId, messageId, from) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        return {
          ...thread,
          messages: thread.messages.filter((m) => !(m.id === messageId && m.from === from)),
        };
      }),
    );
  }, []);

  const markRead = useCallback((threadId) => {
    setThreads((prev) => {
      const thread = prev.find((t) => t.id === threadId);
      if (!thread) return prev;
      const hasUnread = thread.messages.some((m) => m.from === 'user' && m.status !== 'read');
      if (!hasUnread) return prev;
      return prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: t.messages.map((m) =>
                m.from === 'user' ? { ...m, status: 'read' } : m,
              ),
            }
          : t,
      );
    });
  }, []);

  const clearThread = useCallback((threadId) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, messages: [] } : t)),
    );
  }, []);

  const resetDemo = useCallback(() => setThreads(seedThreads()), []);

  const replySnapshot = useCallback(
    (message) =>
      message
        ? {
            id: message.id,
            from: message.from,
            preview: messagePreview(message),
          }
        : null,
    [],
  );

  const value = useMemo(
    () => ({
      threads,
      getThread,
      sendMessage,
      editMessage,
      deleteMessage,
      markRead,
      clearThread,
      resetDemo,
      replySnapshot,
    }),
    [
      threads,
      getThread,
      sendMessage,
      editMessage,
      deleteMessage,
      markRead,
      clearThread,
      resetDemo,
      replySnapshot,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
