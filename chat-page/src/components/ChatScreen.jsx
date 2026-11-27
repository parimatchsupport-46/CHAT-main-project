import { useCallback, useEffect, useState } from 'react';
import { Copy, EditPencil, Reply, Trash, Xmark } from 'iconoir-react';
import ChatHeader from './ChatHeader.jsx';
import MessageList from './MessageList.jsx';
import Composer from './Composer.jsx';
import ActionSheet from './ActionSheet.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import Lightbox from './Lightbox.jsx';
import { useToast } from './Toast.jsx';
import { messagePreview } from '../lib/format.js';

/**
 * Ek hi chat screen dono apps me — bas props badalte hain.
 * meRole = 'user' (chat-page) ya 'support' (chat-manage-pannel).
 */
export default function ChatScreen({
  messages,
  meRole,
  peer,
  onSend,
  onEdit,
  onDelete,
  onClearThread,
  onBack,
  infoSheet,
  footnote,
  typing = false,
  maxBytes,
}) {
  const notify = useToast();

  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [replyTarget, setReplyTarget] = useState(null);
  const [editing, setEditing] = useState(null);
  const [sending, setSending] = useState(false);

  const [actionsTarget, setActionsTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  // dusre chat par jaane par composer saaf
  useEffect(() => {
    setDraft('');
    setAttachments([]);
    setReplyTarget(null);
    setEditing(null);
    setActionsTarget(null);
  }, [peer.name]);

  const resetComposer = () => {
    setDraft('');
    setAttachments([]);
    setReplyTarget(null);
    setEditing(null);
  };

  const handleSend = async () => {
    if (sending) return;

    if (editing) {
      setSending(true);
      try {
        await onEdit(editing.id, draft);
        notify('Message updated');
        resetComposer();
      } catch (err) {
        notify(err?.message || 'Update nahi hua', 'warn');
      } finally {
        setSending(false);
      }
      return;
    }

    if (!draft.trim() && attachments.length === 0) return;

    setSending(true);
    try {
      await onSend({ text: draft, attachments, replyTo: replyTarget });
      setDraft('');
      setAttachments([]);
      setReplyTarget(null);
    } catch (err) {
      notify(err?.message || 'Message send nahi hui', 'warn');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    notify('Copied to clipboard');
  };

  const handleCopy = (message) => {
    const text =
      message.text || (message.attachments || []).map((a) => a.name).join(', ') || 'Message';
    copyToClipboard(text);
  };

  const handleQuoteClick = useCallback(
    (id) => {
      const el = document.getElementById(`msg-${id}`);
      if (!el) {
        notify('Original message is not available', 'warn');
        return;
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const bubble = el.querySelector('.bubble');
      bubble?.classList.add('is-flash');
      setTimeout(() => bubble?.classList.remove('is-flash'), 1200);
      if (navigator.vibrate) navigator.vibrate(6);
    },
    [notify],
  );

  const isMine = actionsTarget?.from === meRole;

  const messageActions = actionsTarget
    ? [
        {
          key: 'reply',
          label: 'Reply',
          tone: 'primary',
          icon: <Reply width={21} height={21} strokeWidth={1.9} color="#007AFF" />,
          onClick: () => {
            setEditing(null);
            setReplyTarget({
              id: actionsTarget.id,
              from: actionsTarget.from,
              preview: messagePreview(actionsTarget),
              author: actionsTarget.from === meRole ? 'You' : peer.shortName || peer.name,
            });
          },
        },
        {
          key: 'copy',
          label: 'Copy text',
          icon: <Copy width={20} height={20} strokeWidth={1.9} color="#5AC8FA" />,
          onClick: () => handleCopy(actionsTarget),
        },
        ...(isMine
          ? [
              {
                key: 'edit',
                label: 'Edit message',
                icon: <EditPencil width={20} height={20} strokeWidth={1.9} color="#FF9500" />,
                onClick: () => {
                  setReplyTarget(null);
                  setEditing(actionsTarget);
                  setDraft(actionsTarget.text || '');
                },
              },
              {
                key: 'delete',
                label: 'Delete message',
                tone: 'danger',
                icon: <Trash width={20} height={20} strokeWidth={1.9} color="#FF3B30" />,
                onClick: () => setDeleteTarget(actionsTarget),
              },
            ]
          : []),
      ]
    : [];

  return (
    <div className="app-shell">
      <div className="chat-card">
        <ChatHeader
          peer={peer}
          typing={typing}
          onOpenInfo={() => setInfoOpen(true)}
          onBack={onBack}
        />

        <MessageList
          messages={messages}
          meRole={meRole}
          peerName={peer.shortName || peer.name}
          typing={typing}
          onOpenActions={setActionsTarget}
          onOpenImage={setLightbox}
          onQuoteClick={handleQuoteClick}
        />

        <Composer
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          sending={sending}
          replyTarget={replyTarget}
          onCancelReply={() => setReplyTarget(null)}
          editing={editing}
          onCancelEdit={() => {
            setEditing(null);
            setDraft('');
          }}
          attachments={attachments}
          onAddAttachment={(item) => setAttachments((prev) => [...prev, item])}
          onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
          maxBytes={maxBytes}
        />

        <ActionSheet
          open={Boolean(actionsTarget)}
          title={isMine ? 'Your message' : `${peer.shortName || peer.name}'s message`}
          subtitle={
            isMine ? 'You can edit or delete this message' : 'Only copy and reply are allowed'
          }
          actions={messageActions}
          onClose={() => setActionsTarget(null)}
        />

        <ActionSheet
          open={infoOpen}
          title={infoSheet?.title}
          subtitle={infoSheet?.subtitle}
          actions={[
            ...(infoSheet?.actions || []),
            ...(onClearThread
              ? [
                  {
                    key: 'delete-chat',
                    label: 'Clear chat history',
                    tone: 'danger',
                    icon: <Xmark width={20} height={20} strokeWidth={2.1} color="#FF3B30" />,
                    onClick: () => setClearOpen(true),
                  },
                ]
              : []),
          ]}
          onClose={() => setInfoOpen(false)}
        />

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Delete message?"
          message="Ye message sabke liye hat jayegi. Undo nahi hoga."
          confirmLabel="Delete"
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            try {
              await onDelete(deleteTarget.id);
              if (editing?.id === deleteTarget.id) resetComposer();
              notify('Message deleted');
            } catch (err) {
              notify(err?.message || 'Delete nahi hua', 'warn');
            }
          }}
        />

        <ConfirmDialog
          open={clearOpen}
          title="Clear chat history?"
          message="Is chat ke saare messages hat jayenge."
          confirmLabel="Clear"
          onClose={() => setClearOpen(false)}
          onConfirm={async () => {
            try {
              await onClearThread();
              resetComposer();
              notify('Chat cleared');
            } catch (err) {
              notify(err?.message || 'Clear nahi hua', 'warn');
            }
          }}
        />

        <Lightbox attachment={lightbox} onClose={() => setLightbox(null)} />
      </div>

      {footnote && <p className="footnote">{footnote}</p>}
    </div>
  );
}
