import { useCallback, useEffect, useRef, useState } from 'react';
import api, { getToken } from './api';

// Loads the logged-in user's notifications and keeps them fresh
// (every 45 s while the tab is visible, and when the window regains focus).
export function useNotifications({ interval = 45000 } = {}) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const alive = useRef(true);

  const load = useCallback(async () => {
    if (!getToken()) { setLoading(false); return; }
    try {
      const d = await api.notifications(30);
      if (!alive.current) return;
      setItems(d.notifications || []);
      setUnread(d.unread || 0);
      setError('');
    } catch (e) {
      if (alive.current) setError(e.message);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const tick = () => { if (document.visibilityState === 'visible') load(); };
    const t = setInterval(tick, interval);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    return () => {
      alive.current = false;
      clearInterval(t);
      window.removeEventListener('focus', tick);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [load, interval]);

  const markRead = useCallback((id) => {
    const wasUnread = items.some((n) => n.id === id && !n.read);
    if (!wasUnread) return;
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    api.readNotification(id).catch(() => load());
  }, [items, load]);

  const markAllRead = useCallback(async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await api.readAllNotifications().catch(() => load());
  }, [load]);

  const clearAll = useCallback(async () => {
    setItems([]);
    setUnread(0);
    await api.clearNotifications().catch(() => load());
  }, [load]);

  return { items, unread, loading, error, reload: load, markRead, markAllRead, clearAll };
}
