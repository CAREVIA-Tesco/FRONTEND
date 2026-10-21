import { useEffect, useState } from 'react';
import api from './api';

// Website content stored in the database (GET /api/content/:key), cached per page load.
const cache = {};
const pending = {};

export function useSiteContent(key) {
  const [items, setItems] = useState(cache[key] || []);
  useEffect(() => {
    if (cache[key]) { setItems(cache[key]); return; }
    pending[key] = pending[key] || api.getContent(key).then((d) => { cache[key] = d.items || []; return cache[key]; });
    pending[key].then(setItems).catch(() => { delete pending[key]; });
  }, [key]);
  return items;
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
  };
}
