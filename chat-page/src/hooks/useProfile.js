import { useCallback, useState } from 'react';
import { api } from '../lib/api.js';
import { PROFILE_KEY } from '../data/constants.js';

const readStored = () => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const profile = parsed?.profile;
    if (profile?.name && profile?.mobile && profile?.email) return parsed;
  } catch {
    /* corrupt data — form dobara dikha denge */
  }
  return null;
};

const writeStored = (session) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(session));
  } catch {
    /* private mode */
  }
};

/**
 * Profile = "login" for user panel.
 * Ek baar details bharne par localStorage me save, dobara nahi puchhenge.
 */
export function useProfile() {
  const [session, setSession] = useState(readStored);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = useCallback(async (profile) => {
    setSaving(true);
    setError(null);
    try {
      const chat = await api.upsertChat(profile);
      const next = {
        profile: {
          name: profile.name.trim(),
          mobile: profile.mobile.replace(/\D/g, ''),
          email: profile.email.trim().toLowerCase(),
        },
        chatId: chat.id,
        savedAt: Date.now(),
      };
      writeStored(next);
      setSession(next);
      return next;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(PROFILE_KEY);
    } catch {
      /* ignore */
    }
    setSession(null);
  }, []);

  return { session, saving, error, save, logout };
}
