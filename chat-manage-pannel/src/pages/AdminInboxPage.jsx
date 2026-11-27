import { useMemo, useState } from 'react';
import { Cloud, MoreHoriz, Page, Refresh, Search, ServerConnection, Xmark } from 'iconoir-react';
import ActionSheet from '../components/ActionSheet.jsx';
import { useToast } from '../components/Toast.jsx';
import { useChatList } from '../hooks/useChatList.js';
import { api, DATA_MODE, MODE_REASON } from '../lib/api.js';
import { listTime } from '../lib/format.js';
import { formatIndianMobile, initialsOf, toneOf } from '../lib/people.js';
import { SUPPORT } from '../data/constants.js';
import { navigate } from '../hooks/useHashRoute.js';

/** ADMIN HOME — saare users (profile details ke saath), tap par chat khulti hai. */
export default function AdminInboxPage() {
  const notify = useToast();
  const { chats, status } = useChatList();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...chats].sort((a, b) => {
        const at = a.lastMessage?.at || a.updatedAt || 0;
        const bt = b.lastMessage?.at || b.updatedAt || 0;
        return bt - at;
      }),
    [chats],
  );

  const unreadTotal = useMemo(
    () => sorted.reduce((sum, chat) => sum + (chat.unread || 0), 0),
    [sorted],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((chat) => {
      const p = chat.profile || {};
      const matchesQuery =
        !q ||
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.mobile || '').includes(q) ||
        String(p.email || '').toLowerCase().includes(q) ||
        String(chat.lastMessage?.text || '').toLowerCase().includes(q);
      const matchesFilter = filter === 'all' || (chat.unread || 0) > 0;
      return matchesQuery && matchesFilter;
    });
  }, [sorted, query, filter]);

  const resetDemo = async () => {
    try {
      await api.resetDemo();
      notify('Demo data restored');
    } catch (err) {
      notify(err?.message || 'Reset nahi hua', 'warn');
    }
  };

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
            {chats.length} users · {unreadTotal} unread
          </p>
        </div>

        <div className="inbox-tools">
          <label className="search-field">
            <Search width={17} height={17} strokeWidth={2} color="#8E8E93" />
            <input
              type="search"
              value={query}
              placeholder="Search name, mobile, email"
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

          {status === 'loading' && <p className="list-foot">Loading users…</p>}

          {status === 'error' && (
            <p className="list-foot">
              {DATA_MODE === 'local'
                ? 'Backend se connect nahi ho paya — dev-server chalu hai? (npm run dev-server)'
                : 'Firebase se connect nahi ho paya — config/rules check karo.'}
            </p>
          )}

          {status === 'ready' && list.length === 0 && (
            <div className="inbox-empty">
              <span className="empty-icon">
                <Search width={22} height={22} strokeWidth={1.9} color="#007AFF" />
              </span>
              <p className="empty-title">No users found</p>
              <p className="empty-text">
                {filter === 'unread'
                  ? 'Sab chats read ho chuki hain 🎉'
                  : 'Jab koi user chat-page par profile save karega, woh yahan dikhega.'}
              </p>
            </div>
          )}

          {list.length > 0 && (
            <ul className="user-list">
              {list.map((chat) => {
                const profile = chat.profile || {};
                const unread = chat.unread || 0;
                const last = chat.lastMessage;
                return (
                  <li key={chat.id}>
                    <button
                      type="button"
                      className={`user-row${unread ? ' has-unread' : ''}`}
                      onClick={() => navigate(`/chat/${chat.id}`)}
                    >
                      <span className={`avatar tone-${toneOf(profile.mobile)}`}>
                        <span className="avatar-initials">{initialsOf(profile.name)}</span>
                      </span>

                      <span className="user-main">
                        <span className="user-line">
                          <span className="user-name">{profile.name || 'Unknown user'}</span>
                          <span className="user-time">{listTime(last?.at)}</span>
                        </span>
                        <span className="user-line">
                          <span className="user-preview">
                            {last
                              ? `${last.from === 'support' ? 'You: ' : ''}${last.text}`
                              : `${formatIndianMobile(profile.mobile)} · new user`}
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

          {list.length > 0 && <p className="list-foot">Tap a user to open the chat</p>}
        </div>

        <ActionSheet
          open={menuOpen}
          title="Eden Admin"
          subtitle={`${SUPPORT.name} · ${SUPPORT.role}`}
          onClose={() => setMenuOpen(false)}
          actions={[
            {
              key: 'refresh',
              label: 'Refresh list',
              icon: <Refresh width={20} height={20} strokeWidth={1.9} color="#007AFF" />,
              onClick: () => {
                setQuery('');
                setFilter('all');
                notify('List refreshed');
              },
            },
            ...(DATA_MODE === 'local'
              ? [
                  {
                    key: 'reset',
                    label: 'Reset demo data',
                    icon: <Page width={20} height={20} strokeWidth={1.9} color="#FF9500" />,
                    onClick: resetDemo,
                  },
                ]
              : []),
          ]}
        />
      </div>

      <p className="footnote inbox-mode">
        {DATA_MODE === 'firebase' ? (
          <>
            <Cloud width={12} height={12} strokeWidth={2} color="#34C759" />
            <span>Firebase connected</span>
          </>
        ) : (
          <>
            <ServerConnection width={12} height={12} strokeWidth={2} color="#FF9500" />
            <span>{MODE_REASON ? `Local mode · ${MODE_REASON}` : 'Local dev server'}</span>
          </>
        )}
      </p>
    </div>
  );
}
