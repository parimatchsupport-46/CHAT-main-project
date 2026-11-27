import { useMemo, useState } from 'react';
import { LogOut, MoreHoriz, Page, Search, User, Xmark } from 'iconoir-react';
import ActionSheet from '../components/ActionSheet.jsx';
import { useToast } from '../components/Toast.jsx';
import { useChat } from '../store/ChatProvider.jsx';
import { SUPPORT } from '../data/threads.js';
import { listTime, messagePreview, sortThreads, threadLast, threadUnread } from '../lib/format.js';
import { navigate } from '../hooks/useHashRoute.js';

/** ADMIN PANEL HOME — saare users ki list, tap par chat khulti hai. */
export default function AdminInboxPage() {
  const { threads, resetDemo } = useChat();
  const notify = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);

  const sorted = useMemo(() => sortThreads(threads), [threads]);
  const unreadTotal = useMemo(
    () => sorted.reduce((sum, thread) => sum + threadUnread(thread), 0),
    [sorted],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((thread) => {
      const last = threadLast(thread);
      const matchesQuery =
        !q ||
        thread.user.name.toLowerCase().includes(q) ||
        (last?.text || '').toLowerCase().includes(q);
      const matchesFilter = filter === 'all' || threadUnread(thread) > 0;
      return matchesQuery && matchesFilter;
    });
  }, [sorted, query, filter]);

  return (
    <div className="app-shell">
      <div className="chat-card">
        <header className="chat-header admin-top">
          <span className="avatar tone-6">
            <span className="avatar-initials">{SUPPORT.initials}</span>
            <span className="avatar-dot" />
          </span>
          <span className="header-text">
            <span className="header-name">Eden Admin</span>
            <span className="header-status">{SUPPORT.name} · Support</span>
          </span>
          <div className="header-actions">
            <button
              type="button"
              className="icon-btn is-gray"
              aria-label="Admin options"
              onClick={() => setMenuOpen(true)}
            >
              <MoreHoriz width={20} height={20} strokeWidth={2} color="#8E8E93" />
            </button>
          </div>
        </header>

        <div className="inbox-head">
          <h1 className="inbox-title">Inbox</h1>
          <p className="inbox-sub">
            {threads.length} users · {unreadTotal} unread
          </p>
        </div>

        <div className="inbox-tools">
          <label className="search-field">
            <Search width={17} height={17} strokeWidth={2} color="#8E8E93" />
            <input
              type="search"
              value={query}
              placeholder="Search users"
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search users"
            />
            {query && (
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => setQuery('')}
              >
                <Xmark width={13} height={13} strokeWidth={2.6} color="#8E8E93" />
              </button>
            )}
          </label>

          <div className="segmented" role="tablist" aria-label="Filter conversations">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              className={filter === 'all' ? 'is-active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'unread'}
              className={filter === 'unread' ? 'is-active' : ''}
              onClick={() => setFilter('unread')}
            >
              Unread{unreadTotal ? ` (${unreadTotal})` : ''}
            </button>
          </div>
        </div>

        <div className="inbox-scroll">
          <p className="list-label">
            {filter === 'unread' ? 'Unread chats' : 'All users'} · {list.length}
          </p>

          {list.length === 0 ? (
            <div className="inbox-empty">
              <span className="empty-icon">
                <Search width={22} height={22} strokeWidth={1.9} color="#007AFF" />
              </span>
              <p className="empty-title">No users found</p>
              <p className="empty-text">
                {filter === 'unread'
                  ? 'Sab chats read ho chuki hain 🎉'
                  : 'Doosra naam search karke dekho.'}
              </p>
            </div>
          ) : (
            <ul className="user-list">
              {list.map((thread) => {
                const last = threadLast(thread);
                const unread = threadUnread(thread);
                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      className={`user-row${unread ? ' has-unread' : ''}`}
                      onClick={() => navigate(`/admin/chat/${thread.id}`)}
                    >
                      <span className={`avatar tone-${thread.user.tone ?? 1}`}>
                        <span className="avatar-initials">{thread.user.initials}</span>
                        {thread.user.online && <span className="avatar-dot" />}
                      </span>

                      <span className="user-main">
                        <span className="user-line">
                          <span className="user-name">{thread.user.name}</span>
                          <span className="user-time">{listTime(last?.createdAt)}</span>
                        </span>
                        <span className="user-line">
                          <span className="user-preview">
                            {last
                              ? `${last.from === 'support' ? 'You: ' : ''}${messagePreview(last)}`
                              : 'No messages yet'}
                          </span>
                          {unread > 0 && <span className="unread-badge">{unread}</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="list-foot">Tap a user to open the chat</p>
        </div>

        <ActionSheet
          open={menuOpen}
          title="Eden Admin"
          subtitle={`${SUPPORT.name} · ${SUPPORT.role}`}
          onClose={() => setMenuOpen(false)}
          actions={[
            {
              key: 'profile',
              label: 'Admin profile',
              icon: <User width={20} height={20} strokeWidth={1.9} color="#007AFF" />,
              onClick: () => notify('Profile settings are coming soon', 'warn'),
            },
            {
              key: 'reset',
              label: 'Reset demo data',
              icon: <Page width={20} height={20} strokeWidth={1.9} color="#FF9500" />,
              onClick: () => {
                resetDemo();
                notify('Demo data restored');
              },
            },
            {
              key: 'user-panel',
              label: 'Switch to user panel',
              icon: <LogOut width={20} height={20} strokeWidth={1.9} color="#34C759" />,
              onClick: () => navigate('/'),
            },
          ]}
        />
      </div>

      <p className="footnote">
        <span>{SUPPORT.name} · admin panel</span>
        <button type="button" className="footnote-link" onClick={() => navigate('/')}>
          Open user panel →
        </button>
      </p>
    </div>
  );
}
