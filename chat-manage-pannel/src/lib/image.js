/** Image ko chhota + compress karta hai taaki Firestore doc limit ke andar rahe. */
export const compressImage = async (file, { maxSide = 1400, quality = 0.82 } = {}) => {
  if (!file || !String(file.type || '').startsWith('image/')) return null;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return null;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return canvas.toDataURL('image/jpeg', quality);
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
