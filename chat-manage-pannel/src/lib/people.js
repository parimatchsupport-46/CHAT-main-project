/** Profile se display-friendly values nikalne ke helpers. */

export const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';

export const toneOf = (mobile = '') => {
  const digits = String(mobile).replace(/\D/g, '');
  const last = Number(digits.slice(-2)) || 0;
  return (last % 6) + 1;
};

export const formatIndianMobile = (mobile = '') => {
  const d = String(mobile).replace(/\D/g, '');
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  return mobile;
};

export const firstNameOf = (name = '') => name.trim().split(/\s+/)[0] || 'User';
