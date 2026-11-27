/**
 * Image ko chhota + compress karta hai.
 * Target: jitna chhota ho utna accha (Firestore me inline ja sake), par quality theek rahe —
 * isliye quality step-by-step kam karta hai jab tak target bytes se neeche na aa jaye.
 */
export const compressImage = async (
  file,
  { maxSide = 1600, quality = 0.82, targetBytes = 520 * 1024 } = {},
) => {
  if (!file || !String(file.type || '').startsWith('image/')) return null;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return null;

  try {
    const bitmap = await createImageBitmap(file);
    const encode = (side, q) => {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', q);
    };

    let best = encode(maxSide, quality);
    // zarurat pade to quality/size ghatao (max 4 koshish)
    for (const [side, q] of [
      [maxSide, 0.72],
      [Math.min(maxSide, 1280), 0.7],
      [Math.min(maxSide, 1080), 0.65],
    ]) {
      if (dataUrlBytes(best) <= targetBytes) break;
      const next = encode(side, q);
      if (next && dataUrlBytes(next) < dataUrlBytes(best)) best = next;
    }

    bitmap.close?.();
    return best;
  } catch {
    return null;
  }
};

export const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('File could not be read'));
    reader.readAsDataURL(file);
  });

/** data URL ka approx byte size */
export const dataUrlBytes = (dataUrl = '') => {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return 0;
  return Math.round(((dataUrl.length - comma - 1) * 3) / 4);
};

export const formatBytes = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
