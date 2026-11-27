// chhote helpers — time, size, ids

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const formatTime = (iso) => {
  const d = new Date(iso);
  return d
    .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(/\s/g, ' ')
    .toUpperCase();
};

export const formatBytes = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

export const dayLabel = (iso) => {
  const today = startOfDay(new Date());
  const day = startOfDay(iso);
  const diff = Math.round((today - day) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

export const isSameDay = (a, b = new Date()) => startOfDay(a) === startOfDay(b);

export const extOf = (name = '') => {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'file';
};

export const fileKind = (name) => {
  const ext = extOf(name);
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'rtf', 'txt', 'odt'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'sheet';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'slide';
  if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'svg'].includes(ext)) return 'image';
  return 'file';
};

export const trimPreview = (text = '', max = 90) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

export const messagePreview = (msg) => {
  if (msg.text) return trimPreview(msg.text, 90);
  const first = (msg.attachments || [])[0];
  if (!first) return 'Message';
  return first.kind === 'image' ? '📷 Photo' : `📎 ${first.name}`;
};

/** Inbox row ke liye chhota timestamp: 9:41 AM · Yesterday · Mon · 24 Nov */
export const listTime = (iso) => {
  if (!iso) return '';
  const day = startOfDay(iso);
  const today = startOfDay(new Date());
  const diffDays = Math.round((today - day) / 86400000);
  if (diffDays === 0) return formatTime(iso);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short' });
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const threadLast = (thread) => thread?.messages?.[thread.messages.length - 1] || null;

export const threadUnread = (thread) =>
  thread ? thread.messages.filter((m) => m.from === 'user' && m.status !== 'read').length : 0;

export const sortThreads = (threads = []) =>
  [...threads].sort((a, b) => {
    const at = threadLast(a)?.createdAt || 0;
    const bt = threadLast(b)?.createdAt || 0;
    return new Date(bt) - new Date(at);
  });
