/**
 * Live Chat ka logo — Iconoir ke `ChatBubbleEmpty` icon se bana hai.
 * Green tile + white bubble + chhota "live" dot. Yahi artwork favicon me bhi hai
 * (index.html), taaki tab icon aur app logo bilkul same lage.
 *
 * Rang badalna ho to neeche GRADIENT ke 3 hex values badal do.
 */
const GREEN_LIGHT = '#4ADE80';
const GREEN_DEEP = '#15803D';
const GRADIENT_ID = 'lc-brand-grad';

export default function BrandLogo({ className = 'brand-mark', size = 66 }) {
  return (
    <span className={className} style={{ width: size, height: size }} role="img" aria-label="Live Chat">
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={GRADIENT_ID} x1="7" y1="3" x2="42" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor={GREEN_LIGHT} />
            <stop offset="1" stopColor={GREEN_DEEP} />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="13.5" fill={`url(#${GRADIENT_ID})`} />
        {/* Iconoir · ChatBubbleEmpty (24×24 grid, yahan 12..36 me fit) */}
        <g transform="translate(12 12)">
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z"
            stroke="#ffffff"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.15" fill="#ffffff" />
        </g>
      </svg>
    </span>
  );
}
