import { useEffect, useState } from 'react';

// Current palette colours as plain hex/rgb strings, for places that cannot use CSS variables
// (chart libraries). Updates when the palette (<html data-palette>) changes.
const read = () => {
  const cs = getComputedStyle(document.documentElement);
  const v = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  return {
    primary: v('--cv-primary', '#2E1A47'),
    secondary: v('--cv-secondary', '#D9466F'),
    accent: v('--cv-accent', '#7048C2'),
    deep: v('--cv-deep', '#25133D'),
    onDeep: v('--cv-on-deep', '#D5C3FF'),
  };
};

export function useBrandColors() {
  const [colors, setColors] = useState(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setColors(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-palette'] });
    return () => obs.disconnect();
  }, []);
  return colors;
}
