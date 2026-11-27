import { useEffect } from 'react';
import { Download, Xmark } from 'iconoir-react';
import { usePresence } from '../hooks/usePresence.js';

/** Image viewer — poora screen, download ke saath. */
export default function Lightbox({ attachment, onClose }) {
  const { mounted, visible } = usePresence(Boolean(attachment), 220);

  useEffect(() => {
    if (!attachment) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [attachment, onClose]);

  if (!mounted || !attachment) return null;

  return (
    <div className={`lightbox${visible ? ' is-on' : ''}`} role="dialog" aria-modal="true">
      <div className="lb-top">
        <button type="button" className="lb-btn" onClick={onClose} aria-label="Close image">
          <Xmark width={18} height={18} strokeWidth={2.2} color="#111" />
        </button>
        <a
          className="lb-btn"
          href={attachment.dataUrl}
          download={attachment.name || 'eden-image.jpg'}
          aria-label="Download image"
        >
          <Download width={17} height={17} strokeWidth={2} color="#007AFF" />
        </a>
      </div>
      <img className="lb-img" src={attachment.dataUrl} alt={attachment.name || 'Shared image'} />
    </div>
  );
}
