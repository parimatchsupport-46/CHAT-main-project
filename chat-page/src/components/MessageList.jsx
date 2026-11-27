import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ChatBubbleEmpty, Lock } from 'iconoir-react';
import MessageBubble from './MessageBubble.jsx';
import { dayLabel, isSameDay } from '../lib/format.js';

const GROUP_GAP = 5 * 60 * 1000;

const shouldBreak = (a, b) => {
  if (!a || !b) return true;
  if (a.from !== b.from) return true;
  if (!isSameDay(a.createdAt, b.createdAt)) return true;
  return new Date(b.createdAt) - new Date(a.createdAt) > GROUP_GAP;
};

export default function MessageList({
  messages,
  meRole,
  peerName,
  typing,
  onOpenActions,
  onOpenImage,
  onQuoteClick,
}) {
  const scrollRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const lastCount = useRef(messages.length);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // naya message / typing aaye to neeche hi raho (agar user upar scroll nahi kiya)
  useEffect(() => {
    const grew = messages.length !== lastCount.current;
    lastCount.current = messages.length;
    if (atBottom || grew) {
      const id = requestAnimationFrame(() => scrollToBottom(grew ? 'smooth' : 'auto'));
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [messages, typing, atBottom, scrollToBottom]);

  useLayoutEffect(() => {
    scrollToBottom('auto');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distance < 90);
  };

  const empty = messages.length === 0 && !typing;

  return (
    <div className="list-wrap">
      <div className="message-scroll" ref={scrollRef} onScroll={handleScroll}>
        <div className="message-inner">
          <div className="chat-notice">
            <Lock width={12} height={12} strokeWidth={2.2} color="#A1A1A6" />
            <span>
              End-to-end encrypted · only you and {peerName} can read this
            </span>
          </div>
          {empty ? (
            <div className="empty-state">
              <span className="empty-icon">
                <ChatBubbleEmpty width={26} height={26} strokeWidth={1.7} color="#007AFF" />
              </span>
              <p className="empty-title">No messages yet</p>
              <p className="empty-text">
                Say hi to {peerName} — you can share photos, PDFs and files too.
              </p>
            </div>
          ) : (
            messages.map((message, i) => {
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const newDay = !isSameDay(message.createdAt, prev?.createdAt);
              return (
                <div key={message.id}>
                  {newDay && (
                    <div className="day-divider">
                      <span className="day-pill">{dayLabel(message.createdAt)}</span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    meRole={meRole}
                    peerName={peerName}
                    isFirstInGroup={shouldBreak(prev, message)}
                    isLastInGroup={shouldBreak(message, next)}
                    onOpenActions={onOpenActions}
                    onOpenImage={onOpenImage}
                    onQuoteClick={onQuoteClick}
                  />
                </div>
              );
            })
          )}

          {typing && (
            <div className="row them typing-row">
              <div className="bubble bubble-them tail typing-bubble">
                <span className="typing">
                  <i className="dot" />
                  <i className="dot" />
                  <i className="dot" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!atBottom && (
        <button
          type="button"
          className="scroll-fab"
          aria-label="Scroll to latest"
          onClick={() => {
            setAtBottom(true);
            scrollToBottom('smooth');
          }}
        >
          <ArrowDown width={18} height={18} strokeWidth={2.2} color="#007AFF" />
        </button>
      )}
    </div>
  );
}
