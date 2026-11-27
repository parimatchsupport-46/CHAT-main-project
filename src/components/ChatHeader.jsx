import { ArrowLeft, InfoCircle, Search } from 'iconoir-react';
import { useToast } from './Toast.jsx';

/**
 * Chat screen ka header — dono panels me same, sirf data badalta hai.
 * peer: { name, initials, tone, online, subtitle }
 */
export default function ChatHeader({ peer, typing, onOpenInfo, onBack, backLabel = 'Go back' }) {
  const notify = useToast();

  return (
    <header className="chat-header">
      <button type="button" className="header-back" onClick={onBack} aria-label={backLabel}>
        <ArrowLeft width={22} height={22} strokeWidth={2} color="#007AFF" />
      </button>

      <button type="button" className="header-id" onClick={onOpenInfo}>
        <span className={`avatar tone-${peer.tone ?? 1}`}>
          <span className="avatar-initials">{peer.initials}</span>
          {peer.online && <span className="avatar-dot" />}
        </span>
        <span className="header-text">
          <span className="header-name">{peer.name}</span>
          <span
            className={`header-status${typing ? ' is-typing' : ''}${
              peer.highlightSubtitle && !typing ? ' is-online' : ''
            }`}
          >
            {typing ? 'typing…' : peer.subtitle}
          </span>
        </span>
      </button>

      <div className="header-actions">
        <button
          type="button"
          className="icon-btn is-gray"
          aria-label="Search in chat"
          onClick={() => notify('In-chat search is coming soon', 'warn')}
        >
          <Search width={19} height={19} strokeWidth={1.9} color="#8E8E93" />
        </button>
        <button
          type="button"
          className="icon-btn is-gray hide-sm"
          aria-label="Chat info"
          onClick={onOpenInfo}
        >
          <InfoCircle width={20} height={20} strokeWidth={1.9} color="#8E8E93" />
        </button>
      </div>
    </header>
  );
}
