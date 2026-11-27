import { useEffect } from 'react';
import { Copy, Mail, Page, User } from 'iconoir-react';
import ChatScreen from '../components/ChatScreen.jsx';
import { useToast } from '../components/Toast.jsx';
import { useChatSession } from '../hooks/useChatSession.js';
import { api, DATA_MODE, MAX_BYTES } from '../lib/api.js';
import { formatIndianMobile, firstNameOf, initialsOf, toneOf } from '../lib/people.js';
import { navigate } from '../hooks/useHashRoute.js';

/** ADMIN — ek user ke saath chat. User ki messages par sirf copy/reply. */
export default function AdminChatPage({ chatId }) {
  const notify = useToast();
  const { chat, messages, send, edit, remove, markRead } = useChatSession(chatId);

  // admin ne chat kholi → user ke messages read
  useEffect(() => {
    if (messages.some((m) => m.from === 'user' && m.status !== 'read')) {
      markRead('support');
    }
  }, [messages, markRead]);

  const profile = chat?.profile;
  const peer = {
    name: profile?.name || 'Loading…',
    shortName: profile ? firstNameOf(profile.name) : 'User',
    initials: initialsOf(profile?.name || ''),
    tone: toneOf(profile?.mobile),
    online: false,
    subtitle: profile ? formatIndianMobile(profile.mobile) : 'Connecting…',
    highlightSubtitle: false,
  };

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      notify(`${label} copied`);
    } catch {
      notify(value);
    }
  };

  return (
    <ChatScreen
      messages={messages}
      chatId={chatId}
      meRole="support"
      peer={peer}
      maxBytes={MAX_BYTES}
      onSend={({ text, attachments, replyTo }) =>
        send({ from: 'support', text, attachments, replyTo })
      }
      onEdit={(messageId, text) => edit(messageId, text)}
      onDelete={(messageId) => remove(messageId)}
      onBack={() => navigate('/')}
      infoSheet={{
        title: profile?.name || 'User',
        subtitle: profile
          ? `${formatIndianMobile(profile.mobile)} · ${profile.email}`
          : 'Details load ho rahi hain…',
        actions: [
          {
            key: 'copy-mobile',
            label: 'Copy mobile number',
            icon: <Copy width={20} height={20} strokeWidth={1.9} color="#5AC8FA" />,
            onClick: () => profile && copy(formatIndianMobile(profile.mobile), 'Mobile number'),
          },
          {
            key: 'copy-email',
            label: 'Copy email id',
            icon: <Mail width={20} height={20} strokeWidth={1.9} color="#007AFF" />,
            onClick: () => profile && copy(profile.email, 'Email id'),
          },
          {
            key: 'profile',
            label: 'View user profile',
            icon: <User width={20} height={20} strokeWidth={1.9} color="#8E8E93" />,
            onClick: () =>
              notify(
                profile ? `${profile.name} · ${profile.email}` : 'Profile load ho rahi hai',
              ),
          },
          ...(DATA_MODE === 'local'
            ? [
                {
                  key: 'reset',
                  label: 'Restore demo data',
                  icon: <Page width={20} height={20} strokeWidth={1.9} color="#8E8E93" />,
                  onClick: async () => {
                    try {
                      await api.resetDemo();
                      notify('Demo data restored');
                      navigate('/');
                    } catch (err) {
                      notify(err?.message || 'Reset nahi hua', 'warn');
                    }
                  },
                },
              ]
            : []),
        ],
      }}
      footnote={
        <>
          <span>{DATA_MODE === 'firebase' ? 'Firebase' : 'Local dev'}</span>
          <span>·</span>
          <button type="button" className="footnote-link" onClick={() => navigate('/')}>
            Back to inbox →
          </button>
        </>
      }
    />
  );
}
