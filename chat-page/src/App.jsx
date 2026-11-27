import { useEffect, useState } from 'react';
import { EditPencil, LogOut, WarningTriangle } from 'iconoir-react';
import ProfileSetup from './components/ProfileSetup.jsx';
import ChatScreen from './components/ChatScreen.jsx';
import { ToastProvider, useToast } from './components/Toast.jsx';
import { useProfile } from './hooks/useProfile.js';
import { useChatSession } from './hooks/useChatSession.js';
import { MAX_BYTES } from './lib/api.js';
import { SUPPORT } from './data/constants.js';

const PEER = {
  name: SUPPORT.name,
  shortName: SUPPORT.shortName,
  initials: SUPPORT.initials,
  tone: SUPPORT.tone,
  online: SUPPORT.online,
  subtitle: SUPPORT.role,
};

function ChatApp({ session, onEditProfile, onLogout }) {
  const notify = useToast();
  const { messages, status, send, edit, remove, markRead } = useChatSession(session.chatId);

  // support ke messages user ne padh liye → read receipts
  useEffect(() => {
    if (messages.some((m) => m.from === 'support' && m.status !== 'read')) {
      markRead('user');
    }
  }, [messages, markRead]);

  return (
    <>
      {status === 'error' && (
        <div className="conn-banner">
          <WarningTriangle width={15} height={15} strokeWidth={2} color="#FF9500" />
          <span>Connection issue — retry ho raha hai…</span>
        </div>
      )}

      <ChatScreen
        messages={messages}
        meRole="user"
        peer={PEER}
        maxBytes={MAX_BYTES}
        onSend={({ text, attachments, replyTo }) =>
          send({ from: 'user', text, attachments, replyTo })
        }
        onEdit={(messageId, text) => edit(messageId, text)}
        onDelete={(messageId) => remove(messageId)}
        onBack={() => notify('This is your only conversation')}
        infoSheet={{
          title: SUPPORT.name,
          subtitle: SUPPORT.role,
          actions: [
            {
              key: 'edit-profile',
              label: 'Edit my profile',
              icon: <EditPencil width={20} height={20} strokeWidth={1.9} color="#FF9500" />,
              onClick: onEditProfile,
            },
            {
              key: 'logout',
              label: 'Log out',
              tone: 'danger',
              icon: <LogOut width={20} height={20} strokeWidth={1.9} color="#FF3B30" />,
              onClick: onLogout,
            },
          ],
        }}
        footnote={
          <>
            <span>{session.profile.name}</span>
            <span>·</span>
            <span>{session.profile.email}</span>
          </>
        }
      />
    </>
  );
}

function AppInner() {
  const notify = useToast();
  const { session, saving, error, save, logout } = useProfile();
  const [editing, setEditing] = useState(false);

  const handleSave = async (profile) => {
    await save(profile);
    setEditing(false);
    notify('Profile saved');
  };

  if (!session || editing) {
    return (
      <ProfileSetup
        initial={session?.profile}
        saving={saving}
        serverError={error ? error.message : ''}
        onSave={handleSave}
      />
    );
  }

  return (
    <ChatApp
      session={session}
      onEditProfile={() => setEditing(true)}
      onLogout={() => {
        logout();
        setEditing(false);
      }}
    />
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
