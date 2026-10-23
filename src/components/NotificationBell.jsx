import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CalendarCheck, Inbox, UserCheck, Star, AlertTriangle, Info, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { useNotifications } from '../services/useNotifications';

// Bell icon with a dropdown list of the user's notifications. Used by the patient and doctor
// dashboards (DashboardShell) and by the admin top bar. Clicking a notification marks it as read
// and opens the page it is about.
const ICONS = { appointment: CalendarCheck, request: Inbox, account: UserCheck, review: Star, urgent: AlertTriangle };
const TINT = { appointment: 'bg-sky-50 text-sky-700', request: 'bg-amber-50 text-amber-700', account: 'bg-emerald-50 text-emerald-700', review: 'bg-yellow-50 text-yellow-700', urgent: 'bg-red-50 text-red-600' };

function ago(date) {
  const s = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? 's' : ''} ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationBell({ buttonClassName = '', badgeClassName = 'bg-secondary', accentClassName = 'text-secondary' }) {
  const navigate = useNavigate();
  const { items, unread, loading, error, reload, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    reload();
    const onDown = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, reload]);

  const openItem = (n) => {
    markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2.5 rounded-xl ${buttonClassName}`}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unread > 0 && (
          <span data-testid="notif-count" className={`absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-semibold flex items-center justify-center ${badgeClassName}`}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed left-3 right-3 top-[68px] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-[380px] z-50 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-[0_24px_48px_-16px_rgba(15,23,42,0.35)] overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-[15px]">Notifications{unread > 0 && <span className="ml-2 text-xs font-medium text-slate-500">{unread} new</span>}</p>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className={`inline-flex items-center gap-1 text-[12.5px] font-semibold ${accentClassName} hover:underline`}>
                <CheckCheck className="h-4 w-4" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(70vh,440px)] overflow-y-auto overscroll-contain">
            {loading && !items.length ? (
              <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
            ) : error && !items.length ? (
              <div className="py-10 px-6 text-center text-sm text-slate-500">
                <p>Could not load notifications.</p>
                <button type="button" onClick={reload} className={`mt-2 font-semibold ${accentClassName} hover:underline`}>Try again</button>
              </div>
            ) : !items.length ? (
              <div className="py-12 px-6 text-center">
                <span className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center"><Bell className="h-5 w-5 text-slate-400" /></span>
                <p className="font-medium text-sm">You're all caught up</p>
                <p className="text-xs text-slate-500 mt-1">New bookings, requests and updates will show here.</p>
              </div>
            ) : (
              <ul>
                {items.map((n) => {
                  const Icon = ICONS[n.type] || Info;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => openItem(n)}
                        className={`w-full text-left flex gap-3 px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition ${n.read ? '' : 'bg-slate-50/70'}`}
                      >
                        <span className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${TINT[n.type] || 'bg-slate-100 text-slate-600'}`}><Icon className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[13.5px] leading-snug ${n.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>{n.title}</span>
                          {n.body && <span className="block text-[12.5px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{n.body}</span>}
                          <span className="block text-[11.5px] text-slate-400 mt-1">{ago(n.createdAt)}</span>
                        </span>
                        {!n.read && <span className={`shrink-0 mt-1.5 h-2 w-2 rounded-full ${badgeClassName}`} aria-label="Unread" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="flex justify-end px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
              <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-slate-500 hover:text-slate-800">
                <Trash2 className="h-3.5 w-3.5" /> Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
