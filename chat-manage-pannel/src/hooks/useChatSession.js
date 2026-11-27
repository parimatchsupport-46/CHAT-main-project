import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

/**
 * Ek chat ka live data (Firestore snapshot ya local polling) + actions.
 */
export function useChatSession(chatId) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(chatId ? 'loading' : 'idle');
  const [error, setError] = useState(null);
  const chatIdRef = useRef(chatId);

  // ref ko render ke andar nahi likhte — effect me sync karte hain
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    if (!chatId) {
      setStatus('idle');
      return undefined;
    }
    setStatus('loading');
    setError(null);

    const unsubChat = api.subscribeChat(
      chatId,
      (data) => {
        setChat(data);
        setStatus('ready');
      },
      (err) => {
        setError(err);
        setStatus('error');
      },
    );

    const unsubMessages = api.subscribeMessages(
      chatId,
      (list) => setMessages(list),
      (err) => {
        setError(err);
        setStatus('error');
      },
    );

    return () => {
      unsubChat?.();
      unsubMessages?.();
    };
  }, [chatId]);

  const send = useCallback(
    (payload) => api.sendMessage(chatIdRef.current, payload),
    [],
  );
  const edit = useCallback(
    (messageId, text) => api.editMessage(chatIdRef.current, messageId, text),
    [],
  );
  const remove = useCallback(
    (messageId) => api.deleteMessage(chatIdRef.current, messageId),
    [],
  );
  const markRead = useCallback((who) => api.markRead(chatIdRef.current, who), []);

  return { chat, messages, status, error, send, edit, remove, markRead };
}
