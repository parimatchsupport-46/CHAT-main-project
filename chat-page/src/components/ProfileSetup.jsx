import { useState } from 'react';
import { ArrowRight, Lock, Mail, Phone, User, WarningTriangle } from 'iconoir-react';
import { DATA_MODE, MODE_REASON } from '../lib/api.js';

const validName = (v) => v.trim().length >= 2;
const cleanMobile = (v) => {
  const digits = String(v).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
};
const validMobile = (v) => /^[6-9]\d{9}$/.test(cleanMobile(v));
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());

/**
 * Ek baar ki profile details — name, mobile, email.
 * Save hone ke baad localStorage se hi uthata hai, dobara nahi puchhta.
 */
export default function ProfileSetup({ initial, onSave, saving, serverError }) {
  const [name, setName] = useState(initial?.name || '');
  const [mobile, setMobile] = useState(initial?.mobile || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);

  const errors = {
    name: validName(name) ? '' : 'Please enter your full name',
    mobile: validMobile(mobile) ? '' : '10 digit mobile number chahiye',
    email: validEmail(email) ? '' : 'Valid email id daalo',
  };
  const isValid = !errors.name && !errors.mobile && !errors.email;
  const isBusy = busy || saving;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, mobile: true, email: true });
    if (!isValid || isBusy) return;
    setBusy(true);
    try {
      await onSave({ name, mobile: cleanMobile(mobile), email });
    } catch {
      /* error prop se dikhega */
    } finally {
      setBusy(false);
    }
  };

  const fieldError = (key) => (touched[key] ? errors[key] : '');

  return (
    <div className="app-shell">
      <div className="chat-card profile-card">
        <div className="profile-wrap">
          <div className="profile-top">
            <span className="profile-logo">E</span>
            <h1 className="profile-title">Welcome to Eden</h1>
            <p className="profile-sub">
              Chat shuru karne se pehle apni details bhar do — ye sirf ek baar puchha jayega.
            </p>
          </div>

          <form className="profile-form" onSubmit={submit} noValidate>
            <label className="field">
              <span className="field-label">Full name</span>
              <span className={`field-box${fieldError('name') ? ' is-error' : ''}`}>
                <User width={18} height={18} strokeWidth={1.9} color="#8E8E93" />
                <input
                  type="text"
                  value={name}
                  autoComplete="name"
                  placeholder="Aarav Mehta"
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                />
              </span>
              {fieldError('name') && <span className="field-error">{fieldError('name')}</span>}
            </label>

            <label className="field">
              <span className="field-label">Mobile number</span>
              <span className={`field-box${fieldError('mobile') ? ' is-error' : ''}`}>
                <Phone width={18} height={18} strokeWidth={1.9} color="#8E8E93" />
                <span className="field-prefix">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  autoComplete="tel"
                  placeholder="98765 43210"
                  maxLength={14}
                  onChange={(e) => setMobile(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, mobile: true }))}
                />
              </span>
              {fieldError('mobile') && <span className="field-error">{fieldError('mobile')}</span>}
            </label>

            <label className="field">
              <span className="field-label">Email id</span>
              <span className={`field-box${fieldError('email') ? ' is-error' : ''}`}>
                <Mail width={18} height={18} strokeWidth={1.9} color="#8E8E93" />
                <input
                  type="email"
                  value={email}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                />
              </span>
              {fieldError('email') && <span className="field-error">{fieldError('email')}</span>}
            </label>

            {serverError && (
              <div className="profile-alert">
                <WarningTriangle width={16} height={16} strokeWidth={2} color="#FF3B30" />
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              className={`primary-btn${isValid ? ' is-ready' : ''}`}
              disabled={!isValid || isBusy}
            >
              <span>{isBusy ? 'Saving…' : 'Continue to chat'}</span>
              <ArrowRight width={18} height={18} strokeWidth={2.2} color="#ffffff" />
            </button>
          </form>

          <p className="profile-note">
            <Lock width={13} height={13} strokeWidth={2.1} color="#8E8E93" />
            <span>Details aapke device me save hongi — dobara nahi puchhenge.</span>
          </p>

          {DATA_MODE === 'local' && (
            <p className="profile-mode">
              {MODE_REASON
                ? `Local mode · ${MODE_REASON} (Firebase console → Firestore Database → Create database)`
                : 'Local dev mode · Firebase config add karte hi cloud par shift ho jayega'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
