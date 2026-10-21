import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Star, TrendingUp, CalendarCheck, IndianRupee, Users, CheckCircle2, XCircle, Home, Video, Building2, MessageSquareQuote, KeyRound, UserCog, CalendarClock, LogOut } from 'lucide-react';
import api, { getSessionUser } from '../services/api';
import { saveCurrentUser } from '../utils/storage';
import { useBrandColors } from '../services/useBrandColors';

const inr = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;
const card = 'bg-white rounded-3xl ring-1 ring-line-soft shadow-[0_24px_60px_-34px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function PageHead({ title, sub, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        <h2 className="font-serif text-[28px] font-semibold text-primary leading-tight">{title}</h2>
        <p className="text-sm text-primary/60 mt-1">{sub}</p>
      </div>
      {action}
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className={`${card} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-primary/60">{label}</p>
        <span className="w-10 h-10 rounded-xl bg-mint text-accent flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></span>
      </div>
      <p className="text-[26px] font-semibold text-primary leading-none mt-2">{value}</p>
      {hint && <p className="text-[12px] text-primary/50 mt-2">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- Analytics
export function AnalyticsTab({ appointments = [], profile }) {
  const brand = useBrandColors();
  const data = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, name: MONTHS[d.getMonth()], visits: 0, earnings: 0 };
    });
    const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
    const completed = appointments.filter((a) => a.status === 'Completed');
    completed.forEach((a) => {
      const d = new Date(a.visitNotes?.completedAt || a.scheduledAt);
      const m = byKey[`${d.getFullYear()}-${d.getMonth()}`];
      if (m) { m.visits += 1; if (a.paymentStatus === 'Paid') m.earnings += a.fee || 0; }
    });
    const decided = appointments.filter((a) => ['Completed', 'Cancelled'].includes(a.status));
    const types = ['home', 'clinic', 'online'].map((t) => ({ t, n: appointments.filter((a) => a.consultationType === t && a.status !== 'Cancelled').length }));
    const patients = new Set(appointments.map((a) => a.patientId || a.phone || a.patient)).size;
    return {
      months,
      completed: completed.length,
      earnings: completed.filter((a) => a.paymentStatus === 'Paid').reduce((t, a) => t + (a.fee || 0), 0),
      pending: appointments.filter((a) => a.paymentStatus === 'Pending' && a.status !== 'Cancelled').reduce((t, a) => t + (a.fee || 0), 0),
      completion: decided.length ? Math.round((completed.length / decided.length) * 100) : null,
      cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
      upcoming: appointments.filter((a) => ['Waiting', 'Confirmed'].includes(a.status)).length,
      fromRequests: appointments.filter((a) => a.fromRequest).length,
      types, patients,
    };
  }, [appointments]);
  const totalTypes = data.types.reduce((t, x) => t + x.n, 0) || 1;
  const TYPE = { home: ['Home visits', Home], clinic: ['Clinic visits', Building2], online: ['Online consults', Video] };

  return (
    <div className="space-y-6" data-testid="doctor-analytics">
      <PageHead title="Analytics" sub="How your practice on Carevaa is doing, from your real appointments." />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat icon={CalendarCheck} label="Completed visits" value={data.completed} hint={`${data.upcoming} upcoming`} />
        <Stat icon={IndianRupee} label="Earnings received" value={inr(data.earnings)} hint={data.pending ? `${inr(data.pending)} still to be collected` : 'Nothing pending'} />
        <Stat icon={Users} label="Patients served" value={data.patients} hint={`${data.fromRequests} came through care requests`} />
        <Stat icon={Star} label="Rating" value={profile?.reviews ? profile.rating : 'New'} hint={profile?.reviews ? `${profile.reviews} ${profile.reviews === 1 ? 'review' : 'reviews'}` : 'No reviews yet'} />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">Completed visits, last 6 months</h3>
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.months} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#ECEAF0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#8C8C99" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="#8C8C99" />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} formatter={(v, k) => (k === 'visits' ? [v, 'Visits'] : [inr(v), 'Earnings'])} contentStyle={{ borderRadius: 12, border: '1px solid #ECEAF0' }} />
                <Bar dataKey="visits" fill={brand.accent} radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`${card} p-6 space-y-5`}>
          <div>
            <h3 className="font-semibold text-primary">Visit types</h3>
            <ul className="mt-4 space-y-3">
              {data.types.map(({ t, n }) => {
                const [label, Icon] = TYPE[t];
                return (
                  <li key={t}>
                    <div className="flex items-center justify-between text-[13px] mb-1.5"><span className="flex items-center gap-2 text-primary/75"><Icon className="w-4 h-4 text-accent" /> {label}</span><span className="font-semibold text-primary">{n}</span></div>
                    <div className="h-2 rounded-full bg-tint overflow-hidden"><div className="h-full rounded-full bg-accent" style={{ width: `${(n / totalTypes) * 100}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="pt-5 border-t border-line-soft grid grid-cols-2 gap-3 text-[13px]">
            <p className="flex items-center gap-2 text-primary/70"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> {data.completion === null ? 'No finished visits yet' : `${data.completion}% completed`}</p>
            <p className="flex items-center gap-2 text-primary/70"><XCircle className="w-4 h-4 text-rose-600" /> {data.cancelled} cancelled</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Reviews
export function ReviewsTab({ providerId, profile }) {
  const [reviews, setReviews] = useState(null);
  useEffect(() => {
    if (!providerId) return;
    api.getReviews({ providerId, limit: 200 }).then((d) => setReviews(d.reviews || [])).catch(() => setReviews([]));
  }, [providerId]);
  const list = reviews || [];
  const avg = list.length ? list.reduce((t, r) => t + r.rating, 0) / list.length : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: list.filter((r) => r.rating === s).length }));

  return (
    <div className="space-y-6" data-testid="doctor-reviews">
      <PageHead title="Reviews" sub="What patients said after their visit. Reviews appear on your public profile."
        action={providerId && <Link to={`/doctors/${providerId}`} className="h-10 px-4 inline-flex items-center rounded-xl border border-line text-[14px] font-semibold text-primary hover:bg-tint">View public profile</Link>} />
      <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-4 items-start">
        <div className={`${card} p-6`}>
          <p className="text-[13px] text-primary/60">Average rating</p>
          <p className="text-[44px] font-semibold text-primary leading-none mt-1">{list.length ? avg.toFixed(1) : '–'}</p>
          <div className="flex gap-0.5 mt-2">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-5 h-5 ${n <= Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />)}</div>
          <p className="text-[13px] text-primary/55 mt-2">{list.length} {list.length === 1 ? 'review' : 'reviews'}</p>
          <ul className="mt-5 space-y-2">
            {dist.map(({ s, n }) => (
              <li key={s} className="flex items-center gap-2 text-[12.5px] text-primary/70">
                <span className="w-3">{s}</span><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="flex-1 h-2 rounded-full bg-tint overflow-hidden"><span className="block h-full bg-amber-400 rounded-full" style={{ width: `${list.length ? (n / list.length) * 100 : 0}%` }} /></span>
                <span className="w-6 text-right">{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          {reviews === null && <div className={`${card} p-6 h-28 animate-pulse`} />}
          {reviews && list.length === 0 && (
            <div className={`${card} p-10 text-center`}>
              <MessageSquareQuote className="w-10 h-10 text-accent/40 mx-auto mb-3" />
              <p className="font-semibold text-primary">No reviews yet</p>
              <p className="text-sm text-primary/60 mt-1">Patients can rate a visit after you complete it. {profile?.name ? 'Completed visits appear in Appointments.' : ''}</p>
            </div>
          )}
          {list.map((r) => (
            <article key={r.id} className={`${card} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-mint text-accent flex items-center justify-center font-semibold">{(r.patient || 'P').charAt(0)}</span>
                  <div><p className="font-semibold text-primary text-[14px]">{r.patient || 'Patient'}</p><p className="text-[12px] text-primary/50">{r.date}</p></div>
                </div>
                <span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />)}</span>
              </div>
              {r.comment && <p className="mt-3 text-[14px] text-primary/80 leading-relaxed">“{r.comment}”</p>}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Settings
export function SettingsTab({ profile, onLogout }) {
  const user = getSessionUser() || {};
  const [account, setAccount] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  const [pw, setPw] = useState({ next: '', confirm: '' });
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState('');
  const field = 'w-full h-11 px-4 rounded-xl border border-line bg-white text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition';

  const saveAccount = async (e) => {
    e.preventDefault(); setBusy('account'); setMsg({});
    try {
      const { user: u } = await api.updateMe({ name: account.name.trim(), email: account.email.trim(), phone: account.phone.trim() });
      saveCurrentUser({ ...getSessionUser(), ...u });
      setMsg({ account: { ok: true, text: 'Account details saved.' } });
    } catch (err) { setMsg({ account: { ok: false, text: err.message } }); } finally { setBusy(''); }
  };
  const savePassword = async (e) => {
    e.preventDefault(); setMsg({});
    if (pw.next.length < 6) { setMsg({ pw: { ok: false, text: 'Use at least 6 characters.' } }); return; }
    if (pw.next !== pw.confirm) { setMsg({ pw: { ok: false, text: 'The two passwords do not match.' } }); return; }
    setBusy('pw');
    try { await api.updateMe({ password: pw.next }); setPw({ next: '', confirm: '' }); setMsg({ pw: { ok: true, text: 'Password changed.' } }); } catch (err) { setMsg({ pw: { ok: false, text: err.message } }); } finally { setBusy(''); }
  };
  const Note = ({ m }) => (m ? <p role="status" className={`text-[13px] rounded-xl px-3 py-2 ${m.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{m.text}</p> : null);
  const STATUS = { ACTIVE: ['Live – patients can book you', 'bg-emerald-50 text-emerald-700'], PENDING: ['Waiting for verification', 'bg-amber-50 text-amber-700'], REJECTED: ['Not approved – contact support', 'bg-red-50 text-red-700'], SUSPENDED: ['Paused by the care team', 'bg-red-50 text-red-700'] };
  const st = STATUS[profile?.status] || ['Profile not completed', 'bg-tint text-primary/70'];

  return (
    <div className="space-y-6" data-testid="doctor-settings">
      <PageHead title="Settings" sub="Your sign-in details, password and professional profile." />
      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <form onSubmit={saveAccount} className={`${card} p-6 space-y-4`}>
          <h3 className="font-semibold text-primary flex items-center gap-2"><UserCog className="w-5 h-5 text-accent" /> Account details</h3>
          <label className="block"><span className="block text-[13px] font-semibold text-primary mb-1.5">Full name</span><input className={field} value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} /></label>
          <label className="block"><span className="block text-[13px] font-semibold text-primary mb-1.5">Email</span><input type="email" className={field} value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} placeholder="name@example.com" /></label>
          <label className="block"><span className="block text-[13px] font-semibold text-primary mb-1.5">Mobile number</span><input className={field} value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value })} placeholder="10-digit mobile" /></label>
          <Note m={msg.account} />
          <button disabled={busy === 'account'} className="h-11 px-6 rounded-xl bg-secondary text-white font-semibold text-[14px] hover:brightness-95 disabled:opacity-60">{busy === 'account' ? 'Saving…' : 'Save details'}</button>
        </form>

        <div className="space-y-4">
          <form onSubmit={savePassword} className={`${card} p-6 space-y-4`}>
            <h3 className="font-semibold text-primary flex items-center gap-2"><KeyRound className="w-5 h-5 text-accent" /> Change password</h3>
            <label className="block"><span className="block text-[13px] font-semibold text-primary mb-1.5">New password</span><input type="password" autoComplete="new-password" className={field} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></label>
            <label className="block"><span className="block text-[13px] font-semibold text-primary mb-1.5">Confirm new password</span><input type="password" autoComplete="new-password" className={field} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></label>
            <Note m={msg.pw} />
            <button disabled={busy === 'pw'} className="h-11 px-6 rounded-xl border border-line text-primary font-semibold text-[14px] hover:bg-tint disabled:opacity-60">{busy === 'pw' ? 'Saving…' : 'Change password'}</button>
          </form>

          <div className={`${card} p-6`}>
            <h3 className="font-semibold text-primary flex items-center gap-2"><CalendarClock className="w-5 h-5 text-accent" /> Professional profile</h3>
            <p className={`inline-block mt-3 text-[12.5px] font-semibold rounded-full px-3 py-1 ${st[1]}`}>{st[0]}</p>
            <p className="text-[13px] text-primary/60 mt-3">Update your photo, qualifications, PIN code, fees, clinic, bank details and weekly time slots.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link to="/professional/onboarding" className="h-10 px-4 inline-flex items-center rounded-xl bg-primary text-white text-[13px] font-semibold hover:opacity-90">Edit profile and availability</Link>
              <button type="button" onClick={onLogout} className="h-10 px-4 inline-flex items-center gap-1.5 rounded-xl border border-line text-[13px] font-semibold text-primary/70 hover:text-primary hover:bg-tint"><LogOut className="w-4 h-4" /> Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
