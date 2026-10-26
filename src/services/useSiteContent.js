import { useEffect, useState } from 'react';
import api from './api';

import { readCache, writeCache } from './persistentCache';

// Website content stored in the database (GET /api/content/:key).
// - one request per key per page load, shared by every component that needs it
// - the last received copy is remembered (persistentCache), so a refresh starts with the same
//   content instead of an empty/default state, then the fresh copy replaces it
// - saving in the admin panel updates every open component straight away (setSiteContent)
const store = {}; // key -> { items, loaded, fetched }
const listeners = {}; // key -> Set(fn)

function entry(key) {
  if (!store[key]) {
    const saved = readCache(`content:${key}`);
    store[key] = { items: Array.isArray(saved) ? saved : [], loaded: Array.isArray(saved), fetched: false };
  }
  return store[key];
}
function publish(key, items) {
  const e = entry(key);
  e.items = items;
  e.loaded = true;
  writeCache(`content:${key}`, items);
  (listeners[key] || new Set()).forEach((fn) => fn({ ...e }));
}
function fetchContent(key) {
  const e = entry(key);
  if (e.fetched) return;
  e.fetched = true;
  api.getContent(key).then((d) => publish(key, d.items || [])).catch(() => { e.fetched = false; });
}

// called by the admin panel after saving, so the website shows the change without a reload
export function setSiteContent(key, items) { publish(key, items || []); }

// { items, loaded } – loaded is false only on the very first visit, before the content arrives
export function useSiteContentState(key) {
  const [state, setState] = useState(() => ({ ...entry(key) }));
  useEffect(() => {
    (listeners[key] = listeners[key] || new Set()).add(setState);
    setState({ ...entry(key) });
    fetchContent(key);
    return () => listeners[key].delete(setState);
  }, [key]);
  return state;
}

export function useSiteContent(key) {
  return useSiteContentState(key).items;
}

// Phone / email shown in the header, footer and call-to-action blocks
export function useContact() {
  const items = useSiteContent('contact');
  const c = items[0] || {};
  const digits = (c.whatsapp || '').replace(/\D/g, '');
  return {
    phone: c.phone || '',
    phoneHref: c.phone ? `tel:${c.phone.replace(/[^\d+]/g, '')}` : undefined,
    email: c.email || '',
    hours: c.hours || '',
    address: c.address || '',
    careersEmail: c.careersEmail || '',
    careersPhone: c.careersPhone || '',
    whatsappHref: digits ? `https://wa.me/${digits}` : undefined,
    // social media pages set in Admin → Website Content → Contact details (empty ones are hidden)
    social: [
      ['facebook', c.facebook], ['instagram', c.instagram], ['x', c.twitter], ['linkedin', c.linkedin], ['youtube', c.youtube],
      ['whatsapp', digits ? `https://wa.me/${digits}` : ''],
    ].filter(([, href]) => href && /^https?:\/\//.test(String(href).trim())).map(([key, href]) => ({ key, href: String(href).trim() })),
  };
}
