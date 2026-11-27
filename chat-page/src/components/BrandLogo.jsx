import { useState } from 'react';

/**
 * App ka logo.
 *
 * Apna logo lagane ke liye bas file yahan rakho:  chat-page/public/logo.png
 * (PNG / JPG / SVG — file ka naam exactly `logo.png` ho, warna neeche wala
 * default mark dikhega.)
 */
export default function BrandLogo({ className = 'auth-logo', alt = 'Live Chat' }) {
  const [loaded, setLoaded] = useState(true);

  if (loaded) {
    return (
      <img
        className={className}
        src="/logo.png"
        alt={alt}
        draggable={false}
        onError={() => setLoaded(false)}
      />
    );
  }

  return (
    <span className={`${className} brand-fallback`} role="img" aria-label={alt}>
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M10 17.5A5.5 5.5 0 0 1 15.5 12h17A5.5 5.5 0 0 1 38 17.5v9A5.5 5.5 0 0 1 32.5 32H22.8l-5.9 4.3c-.8.6-1.9 0-1.9-1V32h-.5A5.5 5.5 0 0 1 10 26.5z"
          fill="#fff"
        />
        <circle cx="30.5" cy="17.5" r="3.4" fill="#34C759" stroke="#fff" strokeWidth="1.6" />
      </svg>
    </span>
  );
}
