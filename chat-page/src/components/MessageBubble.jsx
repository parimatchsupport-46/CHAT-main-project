import { useEffect, useRef, useState } from 'react';
import { Check, DoubleCheck, Download, MoreHoriz, Page } from 'iconoir-react';
import { fileKind, formatBytes, formatTime } from '../lib/format.js';
import { api } from '../lib/api.js';

const FileGlyph = ({ kind }) => (
  <span className={`file-glyph kind-${kind}`}>
    <Page width={19} height={19} strokeWidth={1.9} />
    <span className="file-ext">{kind === 'file' ? 'FILE' : kind.toUpperCase()}</span>
  </span>
);

export default function MessageBubble({
  message,
  chatId,
  meRole,
  peerName,
  isFirstInGroup,
  isLastInGroup,
  onOpenActions,
  onQuoteClick,
  onOpenImage,
}) {
  const isMe = message.from === meRole;
  const press = useRef({ timer: null, x: 0, y: 0 });
  // bade attachments chunk-docs se aate hain — jab load ho jayein tab dikhado
  const [loadedUrls, setLoadedUrls] = useState({});
  const [failedUrls, setFailedUrls] = useState({});

  const clearPress = () => {
    clearTimeout(press.current.timer);
    press.current.timer = null;
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    press.current.x = e.clientX;
    press.current.y = e.clientY;
    clearPress();
    press.current.timer = setTimeout(() => {
      press.current.timer = null;
      onOpenActions(message);
      if (navigator.vibrate) navigator.vibrate(8);
    }, 430);
  };

  const handlePointerMove = (e) => {
    if (!press.current.timer) return;
    const dx = Math.abs(e.clientX - press.current.x);
    const dy = Math.abs(e.clientY - press.current.y);
    if (dx > 8 || dy > 8) clearPress();
  };

  const attachments = message.attachments || [];

  useEffect(() => {
    let alive = true;
    const missing = (message.attachments || []).filter((a) => !a.dataUrl);
    if (!missing.length || !chatId) return undefined;
    missing.forEach(async (att) => {
      try {
        const url = await api.loadAttachment(chatId, message.id, att);
        if (alive && url) setLoadedUrls((prev) => ({ ...prev, [att.id]: url }));
        else if (alive) setFailedUrls((prev) => ({ ...prev, [att.id]: true }));
      } catch {
        if (alive) setFailedUrls((prev) => ({ ...prev, [att.id]: true }));
      }
    });
    return () => {
      alive = false;
    };
  }, [chatId, message.id, message.attachments]);

  const srcOf = (att) => att.dataUrl || loadedUrls[att.id] || '';

  const images = attachments.filter((a) => a.kind === 'image');
  const files = attachments.filter((a) => a.kind !== 'image');
  const quoteAuthor =
    message.replyTo?.from === meRole ? 'You' : peerName || 'Message';

  return (
    <div
      className={`row ${isMe ? 'me' : 'them'}${isFirstInGroup ? ' group-start' : ''}`}
      data-mid={message.id}
      id={`msg-${message.id}`}
    >
      <div
        className={`bubble ${isMe ? 'bubble-me' : 'bubble-them'}${
          isLastInGroup ? ' tail' : ''
        }${images.length ? ' has-image' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={clearPress}
        onPointerCancel={clearPress}
        onPointerLeave={clearPress}
        onContextMenu={(e) => {
          e.preventDefault();
          onOpenActions(message);
        }}
      >
        {message.replyTo && (
          <button
            type="button"
            className="quote"
            onClick={() => onQuoteClick(message.replyTo.id)}
          >
            <span className="quote-bar" />
            <span className="quote-body">
              <span className="quote-name">{quoteAuthor}</span>
              <span className="quote-text">{message.replyTo.preview}</span>
            </span>
          </button>
        )}

        {images.length > 0 && (
          <div className={`img-grid count-${Math.min(images.length, 3)}`}>
            {images.map((img) => {
              const src = srcOf(img);
              return (
                <button
                  key={img.id}
                  type="button"
                  className={`img-btn${src ? '' : ' is-loading'}`}
                  onClick={() => src && onOpenImage({ ...img, dataUrl: src })}
                  aria-label={src ? `Open image ${img.name}` : 'Image load ho rahi hai'}
                >
                  {src ? (
                    <img className="img" src={src} alt={img.name} loading="lazy" />
                  ) : (
                    <span className="img-skeleton" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {files.length > 0 && (
          <div className="file-list">
            {files.map((file) => (
              <a
                key={file.id}
                className={`file-card${srcOf(file) ? '' : ' is-loading'}`}
                href={srcOf(file) || undefined}
                download={srcOf(file) ? file.name : undefined}
                target={srcOf(file) ? undefined : '_blank'}
                rel="noreferrer"
                aria-disabled={srcOf(file) ? undefined : true}
              >
                <FileGlyph kind={fileKind(file.name)} />
                <span className="file-meta">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatBytes(file.size)}</span>
                </span>
                <span className="file-dl">
                  <Download width={16} height={16} strokeWidth={2} />
                </span>
              </a>
            ))}
          </div>
        )}

        {message.text && <p className="bubble-text">{message.text}</p>}

        <span className="meta">
          {message.edited && <span className="edited">Edited</span>}
          <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
          {isMe &&
            (message.status === 'read' ? (
              <DoubleCheck width={15} height={15} strokeWidth={2} className="tick is-read" />
            ) : (
              <Check width={14} height={14} strokeWidth={2} className="tick" />
            ))}
        </span>
      </div>

      <button
        type="button"
        className="bubble-more"
        aria-label="Message options"
        onClick={() => onOpenActions(message)}
      >
        <MoreHoriz width={18} height={18} strokeWidth={2} color="#8E8E93" />
      </button>
    </div>
  );
}
