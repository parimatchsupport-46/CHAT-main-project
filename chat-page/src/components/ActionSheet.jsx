import { useEffect } from 'react';
import { usePresence } from '../hooks/usePresence.js';

/**
 * iOS jaisa bottom action sheet.
 * actions: [{ key, label, icon, tone: 'default' | 'primary' | 'danger', onClick }]
 */
export default function ActionSheet({ open, title, subtitle, actions = [], onClose }) {
  const { mounted, visible } = usePresence(open, 260);

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
    <div className={`sheet-layer${visible ? ' is-on' : ''}`}>
      <button className="sheet-backdrop" aria-label="Close menu" onClick={onClose} />
      <div className="sheet" role="menu" aria-label={title}>
        <div className="sheet-grabber" />
        {title && (
          <div className="sheet-head">
            <p className="sheet-title">{title}</p>
            {subtitle && <p className="sheet-subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="sheet-group">
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              className={`sheet-action tone-${action.tone || 'default'}`}
              onClick={() => {
                onClose();
                action.onClick?.();
              }}
            >
              <span className="sheet-icon">{action.icon}</span>
              <span className="sheet-label">{action.label}</span>
            </button>
          ))}
        </div>
        <button type="button" className="sheet-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
