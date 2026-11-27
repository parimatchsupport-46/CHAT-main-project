import { ToastProvider } from './components/Toast.jsx';
import { useHashRoute } from './hooks/useHashRoute.js';
import AdminInboxPage from './pages/AdminInboxPage.jsx';
import AdminChatPage from './pages/AdminChatPage.jsx';

export default function App() {
  const route = useHashRoute();
  const parts = route.split('/').filter(Boolean);

  // #/            → saare users (inbox)
  // #/chat/:id    → us user ke saath chat
  const page =
    parts[0] === 'chat' && parts[1] ? (
      <AdminChatPage chatId={decodeURIComponent(parts[1])} />
    ) : (
      <AdminInboxPage />
    );

  return <ToastProvider>{page}</ToastProvider>;
}
