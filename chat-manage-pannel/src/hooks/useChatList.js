import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

/** Admin inbox — saare users ki chats (live). */
export function useChatList() {
  const [chats, setChats] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = api.subscribeChats(
      (list) => {
        setChats(list);
        setStatus('ready');
      },
      (err) => {
        setError(err);
        setStatus('error');
      },
    );
    return () => unsub?.();
  }, []);

  return { chats, status, error };
}
