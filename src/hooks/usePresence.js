import { useEffect, useState } from 'react';

/**
 * Mount/unmount ke saath chhota enter-exit animation support.
 * open=false hone par element turant gayab nahi hota, exit transition chalti hai.
 */
export function usePresence(open, duration = 240) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf1;
    let raf2;
    let timer;
    if (open) {
      setMounted(true);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      timer = setTimeout(() => setMounted(false), duration);
    }
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timer);
    };
  }, [open, duration]);

  return { mounted, visible };
}
