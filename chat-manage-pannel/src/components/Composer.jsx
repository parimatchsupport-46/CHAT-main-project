import { useEffect, useRef, useState } from 'react';
import {
  Attachment,
  Check,
  EditPencil,
  Emoji,
  MediaImage,
  Page,
  Reply,
  SendDiagonal,
  Xmark,
} from 'iconoir-react';
import ActionSheet from './ActionSheet.jsx';
import { QUICK_EMOJIS } from '../data/constants.js';
import { extOf } from '../lib/format.js';
import { MAX_BYTES } from '../lib/api.js';
import { compressImage, dataUrlBytes, formatBytes, readAsDataUrl } from '../lib/image.js';
import { useToast } from './Toast.jsx';

export default function Composer({
  value,
  onChange,
  onSend,
  sending = false,
  replyTarget,
  onCancelReply,
  editing,
  onCancelEdit,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  maxBytes = MAX_BYTES,
}) {
  const notify = useToast();
  const [attachOpen, setAttachOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiWrapRef = useRef(null);

  // textarea auto grow
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 124)}px`;
  }, [value]);

  useEffect(() => {
    if (editing || replyTarget) textRef.current?.focus();
  }, [editing, replyTarget]);

  useEffect(() => {
    if (!emojiOpen) return undefined;
    const onDown = (e) => {
      if (!emojiWrapRef.current?.contains(e.target)) setEmojiOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [emojiOpen]);

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !sending;

  const readFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    for (const file of files) {
      const label = file.name || 'file';
      try {
        let dataUrl = null;
        let mime = file.type || 'application/octet-stream';

        if (String(mime).startsWith('image/')) {
          const compressed = await compressImage(file);
          if (compressed) {
            dataUrl = compressed;
            mime = 'image/jpeg';
          }
        }

        if (!dataUrl) {
          if (file.size > maxBytes) {
            notify(`${label} is too large · max ${formatBytes(maxBytes)}`, 'warn');
            continue;
          }
          dataUrl = await readAsDataUrl(file);
        }

        const bytes = dataUrlBytes(dataUrl);
        if (bytes > maxBytes) {
          notify(`${label} is too large · max ${formatBytes(maxBytes)}`, 'warn');
          continue;
        }

        onAddAttachment({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name || (mime.startsWith('image/') ? 'photo.jpg' : 'file'),
          size: bytes,
          mime,
          kind: mime.startsWith('image/') ? 'image' : 'file',
          dataUrl,
        });
      } catch {
        notify(`${label} read nahi hui`, 'warn');
      }
    }
  };

  const insertEmoji = (emoji) => {
    const el = textRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}${emoji}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + emoji.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="composer-shell">
      {editing && (
        <div className="context-bar is-edit">
          <span className="ctx-icon">
            <EditPencil width={17} height={17} strokeWidth={2} color="#FF9500" />
          </span>
          <span className="ctx-body">
            <span className="ctx-title">Editing message</span>
            <span className="ctx-text">{editing.text || 'Attachment'}</span>
          </span>
          <button type="button" className="ctx-close" onClick={onCancelEdit} aria-label="Cancel edit">
            <Xmark width={16} height={16} strokeWidth={2.2} color="#8E8E93" />
          </button>
        </div>
      )}

      {!editing && replyTarget && (
        <div className="context-bar is-reply">
          <span className="ctx-icon">
            <Reply width={17} height={17} strokeWidth={2} color="#007AFF" />
          </span>
          <span className="ctx-body">
            <span className="ctx-title">Replying to {replyTarget.author}</span>
            <span className="ctx-text">{replyTarget.preview}</span>
          </span>
          <button type="button" className="ctx-close" onClick={onCancelReply} aria-label="Cancel reply">
            <Xmark width={16} height={16} strokeWidth={2.2} color="#8E8E93" />
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="attach-tray">
          {attachments.map((item) => (
            <div className="chip" key={item.id}>
              {item.kind === 'image' ? (
                <img className="chip-thumb" src={item.dataUrl} alt={item.name} />
              ) : (
                <span className="chip-icon">
                  <Page width={16} height={16} strokeWidth={1.9} color="#FF3B30" />
                </span>
              )}
              <span className="chip-info">
                <span className="chip-name">{item.name}</span>
                <span className="chip-size">
                  {formatBytes(item.size)} · {extOf(item.name).toUpperCase()}
                </span>
              </span>
              <button
                type="button"
                className="chip-remove"
                onClick={() => onRemoveAttachment(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                <Xmark width={12} height={12} strokeWidth={2.6} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="composer">
        <button
          type="button"
          className="round-btn is-blue"
          aria-label="Attach a file"
          onClick={() => setAttachOpen(true)}
        >
          <Attachment width={20} height={20} strokeWidth={1.9} color="#007AFF" />
        </button>

        <textarea
          ref={textRef}
          className="composer-input"
          rows={1}
          value={value}
          placeholder={editing ? 'Edit your message…' : 'Message'}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          onPaste={(e) => {
            const files = Array.from(e.clipboardData?.files || []);
            if (files.length) {
              e.preventDefault();
              readFiles(files);
            }
          }}
        />

        <div className="emoji-wrap" ref={emojiWrapRef}>
          <button
            type="button"
            className={`round-btn is-gray${emojiOpen ? ' is-open' : ''}`}
            aria-label="Emoji picker"
            onClick={() => setEmojiOpen((v) => !v)}
          >
            <Emoji width={20} height={20} strokeWidth={1.9} color={emojiOpen ? '#FF9500' : '#8E8E93'} />
          </button>
          {emojiOpen && (
            <div className="emoji-pop">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="emoji-cell"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`send-btn${canSend ? ' is-active' : ''}`}
          disabled={!canSend}
          onClick={onSend}
          aria-label={editing ? 'Save changes' : 'Send message'}
        >
          {editing ? (
            <Check width={20} height={20} strokeWidth={2.6} color="#ffffff" />
          ) : (
            <SendDiagonal width={19} height={19} strokeWidth={2.1} color="#ffffff" />
          )}
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          readFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,application/pdf"
        multiple
        hidden
        onChange={(e) => {
          readFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <ActionSheet
        open={attachOpen}
        title="Send attachment"
        subtitle={`Photos, PDFs or documents · max ${formatBytes(maxBytes)}`}
        onClose={() => setAttachOpen(false)}
        actions={[
          {
            key: 'photo',
            label: 'Photo & video',
            icon: <MediaImage width={21} height={21} strokeWidth={1.9} color="#007AFF" />,
            onClick: () => imageInputRef.current?.click(),
          },
          {
            key: 'pdf',
            label: 'Document / PDF',
            icon: <Page width={21} height={21} strokeWidth={1.9} color="#FF9500" />,
            onClick: () => fileInputRef.current?.click(),
          },
        ]}
      />
    </div>
  );
}
