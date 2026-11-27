import { useEffect } from 'react';
import { usePresence } from '../hooks/usePresence.js';

/** iOS style alert — delete / clear jaise kaam ke liye confirm. */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onClose,
}) {
  const { mounted, visible } = usePresence(open, 220);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className={`dialog-layer${visible ? ' is-on' : ''}`}>
      <button className="dialog-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div className="dialog" role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="dialog-body">
          <h2 className="dialog-title">{title}</h2>
          {message && <p className="dialog-text">{message}</p>}
        </div>
        <div className="dialog-actions">
          <button type="button" className="d-btn" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`d-btn ${danger ? 'd-btn-danger' : 'd-btn-primary'}`}
            onClick={() => {
              onClose();
              onConfirm?.();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
