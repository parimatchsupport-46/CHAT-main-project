import { useEffect, useState } from 'react';

const readHash = () => {
  const raw = window.location.hash.replace(/^#/, '');
  return raw.startsWith('/') ? raw : `/${raw}`;
};

/** Chhota hash router — koi dependency nahi, preview me bhi kaam karta hai. */
export function useHashRoute() {
  const [route, setRoute] = useState(readHash);

  useEffect(() => {
    const onChange = () => setRoute(readHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export const navigate = (path) => {
  const next = path.startsWith('/') ? path : `/${path}`;
  if (readHash() === next) return;
  window.location.hash = next;
  window.scrollTo({ top: 0 });
};
