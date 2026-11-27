import { Community, Page, User } from 'iconoir-react';
import ChatScreen from '../components/ChatScreen.jsx';
import { useToast } from '../components/Toast.jsx';
import { useChat } from '../store/ChatProvider.jsx';
import { CURRENT_USER, SUPPORT, USER_PANEL_THREAD_ID } from '../data/threads.js';
import { navigate } from '../hooks/useHashRoute.js';

/** USER PANEL — app khulte hi direct chat page. */
export default function UserChatPage() {
  const { getThread, clearThread, resetDemo } = useChat();
  const notify = useToast();
  const thread = getThread(USER_PANEL_THREAD_ID);

  if (!thread) {
    return (
      <div className="app-shell">
        <div className="chat-card">
          <div className="empty-state">
            <p className="empty-title">Conversation not found</p>
            <button type="button" className="d-btn d-btn-primary" onClick={resetDemo}>
              Restore demo chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  const peer = {
    name: SUPPORT.name,
    shortName: SUPPORT.shortName,
    initials: SUPPORT.initials,
    tone: 1,
    online: true,
    subtitle: SUPPORT.role,
  };

  return (
    <ChatScreen
      thread={thread}
      meRole="user"
      peer={peer}
      onBack={() => notify('This is your only conversation in the demo')}
      onClearThread={() => clearThread(thread.id)}
      infoSheet={{
        title: SUPPORT.name,
        subtitle: SUPPORT.role,
        actions: [
          {
            key: 'admin',
            label: 'Open admin panel',
            icon: <Community width={20} height={20} strokeWidth={1.9} color="#007AFF" />,
            onClick: () => navigate('/admin'),
          },
          {
            key: 'profile',
            label: 'View contact',
            icon: <User width={20} height={20} strokeWidth={1.9} color="#5AC8FA" />,
            onClick: () => notify('Contact profile is coming soon', 'warn'),
          },
          {
            key: 'reset',
            label: 'Restore demo chat',
            icon: <Page width={20} height={20} strokeWidth={1.9} color="#8E8E93" />,
            onClick: () => {
              resetDemo();
              notify('Demo chat restored');
            },
          },
        ],
      }}
      footnote={
        <>
          <span>
            {CURRENT_USER.name} · user panel
          </span>
          <button type="button" className="footnote-link" onClick={() => navigate('/admin')}>
            Open admin panel →
          </button>
        </>
      }
    />
  );
}
