import { ToastProvider } from './components/Toast.jsx';
import { ChatProvider } from './store/ChatProvider.jsx';
import { useHashRoute } from './hooks/useHashRoute.js';
import UserChatPage from './pages/UserChatPage.jsx';
import AdminInboxPage from './pages/AdminInboxPage.jsx';
import AdminChatPage from './pages/AdminChatPage.jsx';

export default function App() {
  const route = useHashRoute();
  const parts = route.split('/').filter(Boolean);

  // #/            → user panel (direct chat page)
  // #/admin       → admin panel (saare users ki list)
  // #/admin/chat/:id → admin panel me us user ke saath chat
  let page;
  if (parts[0] === 'admin') {
    page =
      parts[1] === 'chat' && parts[2] ? (
        <AdminChatPage threadId={decodeURIComponent(parts[2])} />
      ) : (
        <AdminInboxPage />
      );
  } else {
    page = <UserChatPage />;
  }

  return (
    <ToastProvider>
      <ChatProvider>{page}</ChatProvider>
    </ToastProvider>
  );
}
