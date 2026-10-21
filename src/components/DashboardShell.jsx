import React, { useEffect, useState } from 'react';

function Avatar({ src, initials, className }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) return <img src={src} alt="" onError={() => setFailed(true)} className={`${className} object-cover`} />;
  return <span className={`${className} shrink-0 flex items-center justify-center font-semibold text-white bg-secondary`}>{initials}</span>;
}
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, ExternalLink, Bell } from 'lucide-react';

// Shared layout for the patient and doctor dashboards (Plum & Rose theme):
// deep plum sidebar (drawer on mobile) + light top bar + content area.
export default function DashboardShell({ roleLabel, nav, active, onSelect, onLogout, user, title, headerCenter, headerActions, notifications = 0, onNotifications, children }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [active]);
  const initials = (user?.name || '?').replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="theme-portea theme-dash min-h-screen bg-tint font-sans text-primary">
      <div className={`fixed inset-0 z-40 bg-deep/50 lg:hidden transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside className={`fixed inset-y-0 left-0 z-50 w-[264px] flex flex-col bg-deep text-white transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} aria-label={`${roleLabel} navigation`}>
        <div className="h-16 lg:h-[72px] shrink-0 flex items-center justify-between gap-3 px-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-white flex items-center justify-center overflow-hidden"><img src="/logo.png" alt="Carevaa Logo" className="h-8 w-8 object-contain" /></span>
            <span className="leading-tight">
              <span className="block text-[17px] font-semibold tracking-tight">Carevaa</span>
              <span className="block text-[11px] text-white/50">{roleLabel}</span>
            </span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="lg:hidden p-2 -mr-2 rounded-lg text-white/70 hover:bg-white/10" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.15)_transparent]">
          {nav.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors ${isActive ? 'bg-white/[0.12] text-white' : 'text-white/65 hover:bg-white/[0.06] hover:text-white'}`}
              >
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-secondary-bright" aria-hidden="true" />}
                <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-secondary-soft' : 'text-white/55'}`} />
                {item.label}
                {item.badge > 0 && <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-secondary text-white text-[11px] font-semibold flex items-center justify-center">{item.badge}</span>}
              </button>
            );
          })}
          <Link to="/" className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-white/65 hover:bg-white/[0.06] hover:text-white">
            <ExternalLink className="h-[18px] w-[18px] text-white/55" /> Back to website
          </Link>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl p-2.5">
            <Avatar src={user?.img} initials={initials} className="h-10 w-10 rounded-full text-sm ring-2 ring-white/20" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-white/50">{user?.sub}</p>
            </div>
            <button type="button" onClick={onLogout} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10" aria-label="Logout" title="Logout"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 h-16 lg:h-[72px] flex items-center gap-3 border-b border-line-soft bg-white/95 backdrop-blur px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="lg:hidden -ml-1 p-2 rounded-lg text-primary hover:bg-tint" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <Link to="/" className="sm:hidden shrink-0" aria-label="Carevaa home"><img src="/logo.png" alt="Carevaa Logo" className="h-9 w-auto object-contain mix-blend-multiply" /></Link>
          <p className="sm:hidden text-[15px] font-semibold truncate">{title}</p>
          <div className="min-w-0 hidden sm:block">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-primary/50">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p className="text-[15px] font-semibold truncate">{title}</p>
          </div>
          <div className="flex-1 flex justify-end sm:justify-center min-w-0">{headerCenter}</div>
          <div className="flex items-center gap-1 sm:gap-2">
            {headerActions}
            <button type="button" onClick={onNotifications} className="relative p-2.5 rounded-xl text-primary/60 hover:text-primary hover:bg-tint" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {notifications > 0 && <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-white text-[10px] font-semibold flex items-center justify-center">{notifications}</span>}
            </button>
            <span className="hidden md:flex items-center gap-2.5 pl-2 ml-1 border-l border-line-soft">
              <Avatar src={user?.img} initials={initials} className="h-9 w-9 rounded-full text-sm" />
              <span className="hidden xl:block leading-tight">
                <span className="block text-sm font-semibold">{user?.name}</span>
                <span className="block text-[11px] text-primary/50">{user?.sub}</span>
              </span>
            </span>
          </div>
        </header>
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1440px]">{children}</main>
      </div>
    </div>
  );
}
