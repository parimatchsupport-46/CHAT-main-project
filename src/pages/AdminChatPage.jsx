import { ArrowLeft, Copy, Page, User } from 'iconoir-react';
import ChatScreen from '../components/ChatScreen.jsx';
import { useToast } from '../components/Toast.jsx';
import { useChat } from '../store/ChatProvider.jsx';
import { SUPPORT } from '../data/threads.js';
import { navigate } from '../hooks/useHashRoute.js';

/** ADMIN PANEL — ek user ke saath chat (user ki messages par sirf copy/reply). */
export default function AdminChatPage({ threadId }) {
  const { getThread, clearThread, resetDemo } = useChat();
  const notify = useToast();
  const thread = getThread(threadId);

  if (!thread) {
    return (
      <div className="app-shell">
        <div className="chat-card">
          <header className="chat-header">
            <button
              type="button"
              className="header-back"
              onClick={() => navigate('/admin')}
              aria-label="Back to inbox"
            >
              <ArrowLeft width={22} height={22} strokeWidth={2} color="#007AFF" />
            </button>
            <span className="header-text">
              <span className="header-name">Chat not found</span>
              <span className="header-status">Ye user available nahi hai</span>
            </span>
          </header>
          <div className="empty-state">
            <p className="empty-title">Conversation not found</p>
            <p className="empty-text">Inbox par wapas jaake koi doosra user kholo.</p>
            <button
              type="button"
              className="footnote-link"
              onClick={() => {
                resetDemo();
                navigate('/admin');
              }}
            >
              Restore demo data
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user } = thread;
  const peer = {
    name: user.name,
    shortName: user.name.split(' ')[0],
    initials: user.initials,
    tone: user.tone,
    online: Boolean(user.online),
    highlightSubtitle: Boolean(user.online),
    subtitle: user.online ? `Online · ${user.city}` : user.lastSeen || `Customer · ${user.city}`,
  };

  return (
    <ChatScreen
      thread={thread}
      meRole="support"
      peer={peer}
      markReadOnOpen
      onBack={() => navigate('/admin')}
      onClearThread={() => clearThread(thread.id)}
      infoSheet={{
        title: user.name,
        subtitle: `${user.city} · ${user.phone}`,
        actions: [
          {
            key: 'copy-phone',
            label: 'Copy phone number',
            icon: <Copy width={20} height={20} strokeWidth={1.9} color="#5AC8FA" />,
            onClick: async () => {
              try {
                await navigator.clipboard.writeText(user.phone);
                notify('Phone number copied');
              } catch {
                notify(user.phone);
              }
            },
          },
          {
            key: 'profile',
            label: 'View user profile',
            icon: <User width={20} height={20} strokeWidth={1.9} color="#007AFF" />,
            onClick: () => notify('User profile is coming soon', 'warn'),
          },
          {
            key: 'unread',
            label: 'Restore demo data',
            icon: <Page width={20} height={20} strokeWidth={1.9} color="#8E8E93" />,
            onClick: () => {
              resetDemo();
              notify('Demo data restored');
            },
          },
        ],
      }}
      footnote={
        <>
          <span>{SUPPORT.name} · admin panel</span>
          <button type="button" className="footnote-link" onClick={() => navigate('/admin')}>
            Back to inbox →
          </button>
        </>
      }
    />
  );
}
