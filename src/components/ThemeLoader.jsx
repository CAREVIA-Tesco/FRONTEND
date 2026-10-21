import { useEffect } from 'react';
import { useSiteContent } from '../services/useSiteContent';

export const PALETTES = { plum: 'Plum & Rose', navy: 'Navy & Coral', teal: 'Teal & Orange', blue: 'Medical Blue & Green' };
const KEY = 'carevaa_palette';

// Sets <html data-palette>, which recolours the whole app (website, login, dashboards, admin console),
// and remembers it so the next page load starts in the right colours (see index.html).
export function applyPalette(palette) {
  const root = document.documentElement;
  if (palette && PALETTES[palette] && palette !== 'plum') root.dataset.palette = palette;
  else delete root.dataset.palette;
  try { localStorage.setItem(KEY, palette && PALETTES[palette] ? palette : 'plum'); } catch { /* storage unavailable */ }
}

// Applies the palette chosen in Admin → Website Content → Theme colours (GET /api/content/theme)
export default function ThemeLoader() {
  const items = useSiteContent('theme');
  const palette = items[0]?.palette;
  useEffect(() => { if (items.length) applyPalette(palette); }, [palette, items.length]);
  return null;
}
