import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CalendarClock, MapPin, Stethoscope, Phone, Copy, CheckCheck, CalendarPlus, ArrowRight, PhoneCall, UserCheck, Home, ClipboardCheck, ShieldCheck } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import api from '../services/api';
import { usePublicStats } from '../services/usePublicStats';
import { useContact } from '../services/useSiteContent';

// Fixed confetti pieces (same every render): angle, distance, colour
const CONFETTI = [
  [-80, -110, 'var(--color-secondary)', 25], [70, -120, 'var(--color-accent)', -40], [120, -60, 'var(--color-secondary-soft)', 60], [-130, -40, 'var(--color-on-deep)', -20],
  [-40, -140, '#E0A33B', 80], [30, -150, 'var(--color-secondary)', -70], [140, 10, 'var(--color-accent)', 35], [-150, 20, '#E0A33B', -55],
  [95, 90, 'var(--color-on-deep)', 15], [-100, 85, 'var(--color-secondary-soft)', -30], [10, 120, 'var(--color-accent)', 45], [-20, -95, '#2F9E7A', -65],
];

const pad = (n) => String(n).padStart(2, '0');
const icsStamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

function addToCalendar(enquiry) {
  const start = new Date(enquiry.preferredDate);
  if (Number.isNaN(start.getTime())) return;
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Carevaa//Home visit//EN', 'BEGIN:VEVENT',
    `UID:${enquiry.code}@carevaa`, `DTSTAMP:${icsStamp(new Date())}`, `DTSTART:${icsStamp(start)}`, `DTEND:${icsStamp(end)}`,
    `SUMMARY:Carevaa ${enquiry.service || 'home visit'} (${enquiry.code})`,
    `LOCATION:${[enquiry.locality, enquiry.city, enquiry.pincode].filter(Boolean).join(' ')}`,
    'DESCRIPTION:Requested home visit. Our care advisor will call to confirm the professional and time.',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = `carevaa-${enquiry.code}.ics`;
  a.click();
}

export default function ThankYou() {
  const { state } = useLocation();
  const [params] = useSearchParams();
  const stats = usePublicStats();
  const contact = useContact();
  const [enquiry, setEnquiry] = useState(state?.enquiry || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const code = params.get('code'); const phone = params.get('phone');
    if (!enquiry && code && phone) api.trackEnquiry(code, phone).then((d) => setEnquiry(d.enquiry)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstName = enquiry?.name && enquiry.name !== 'Website visitor' ? enquiry.name.split(' ')[0] : '';
  const counter = stats?.patientsServed
    ? `${stats.patientsServed.toLocaleString('en-IN')}${stats.patientsServed >= 10 ? '+' : ''} ${stats.patientsServed === 1 ? 'family' : 'families'} cared for and counting`
    : stats?.providers ? `${stats.providers.toLocaleString('en-IN')} verified ${stats.providers === 1 ? 'professional' : 'professionals'} ready to help` : '';
  const copy = () => {
    if (!enquiry) return;
    navigator.clipboard?.writeText(enquiry.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {});
  };

  const next = [
    { icon: ClipboardCheck, title: 'Request received', text: 'Your details reached our care team.', done: true },
    { icon: PhoneCall, title: 'Care advisor calls you', text: 'We confirm the patient\'s needs, address and preferred time.' },
    { icon: UserCheck, title: 'Professional assigned', text: 'A verified professional near your PIN code accepts the visit.' },
    { icon: Home, title: 'Care at your doorstep', text: enquiry?.preferredDateLabel ? `Planned for ${enquiry.preferredDateLabel}${enquiry.preferredTime ? `, ${enquiry.preferredTime}` : ''}.` : 'At the date and time you chose.' },
  ];

  return (
    <div className="theme-portea font-sans text-primary bg-tint min-h-screen overflow-x-clip">
      <SiteHeader />
      <section className="relative pt-[120px] lg:pt-[160px] pb-20 px-4 sm:px-6">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-mint via-tint to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          {/* Animated success mark */}
          <div className="relative mx-auto w-28 h-28 flex items-center justify-center" aria-hidden="true">
            <span className="cv-ring absolute inset-0 rounded-full bg-secondary/25" />
            <span className="cv-ring absolute inset-0 rounded-full bg-secondary/20" style={{ animationDelay: '.6s' }} />
            {CONFETTI.map(([dx, dy, c, rot], i) => (
              <span key={i} className="cv-confetti absolute left-1/2 top-1/2 w-2 h-3 rounded-[2px]" style={{ background: c, '--dx': `${dx}px`, '--dy': `${dy}px`, '--rot': `${rot * 6}deg`, animationDelay: `${0.35 + (i % 4) * 0.05}s` }} />
            ))}
            <span className="cv-pop relative w-24 h-24 rounded-full bg-secondary flex items-center justify-center shadow-[0_18px_40px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)]">
              <svg viewBox="0 0 32 32" className="w-12 h-12"><path className="cv-draw" d="M8 16.5l5.5 5.5L24 11" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>

          <div className="text-center mt-7">
            <p className="cv-rise eyebrow text-accent" style={{ animationDelay: '.15s' }}>Request confirmed</p>
            <h1 className="cv-rise font-serif text-[36px] sm:text-[48px] font-semibold leading-tight mt-2" style={{ animationDelay: '.25s' }}>Thank you{firstName ? `, ${firstName}` : ''}!</h1>
            <p className="cv-rise mt-3 text-[16px] sm:text-[18px] text-primary/70 max-w-xl mx-auto" style={{ animationDelay: '.35s' }}>Our care advisor will call you shortly to confirm your visit. Thank you for trusting Carevaa with your health.</p>
          </div>

          <div className="mt-10 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-5 lg:gap-6 items-start">
            {/* Request ticket */}
            {enquiry ? (
              <div className="cv-rise bg-white rounded-3xl ring-1 ring-line-soft shadow-[0_24px_60px_-28px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] overflow-hidden" style={{ animationDelay: '.45s' }}>
                <div className="bg-deep text-white px-6 py-5 relative overflow-hidden" data-testid="thankyou-request">
                  <span className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-secondary/30 blur-2xl" />
                  <p className="relative text-[12px] uppercase tracking-[0.14em] text-white/60">Your request ID</p>
                  <p className="relative text-[28px] font-semibold tracking-wide">{enquiry.code}</p>
                  <button type="button" onClick={copy} className="relative mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-white/75 hover:text-white">
                    {copied ? <><CheckCheck className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy ID</>}
                  </button>
                </div>
                <div className="relative h-0">
                  <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-tint" /><span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-tint" />
                </div>
                <ul className="px-6 pt-5 pb-2 space-y-3.5 text-[15px]">
                  {enquiry.preferredDateLabel && <li className="flex items-start gap-3"><CalendarClock className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><span className="block text-[12px] text-primary/50">Preferred visit</span>{enquiry.preferredDateLabel}{enquiry.preferredTime ? `, ${enquiry.preferredTime}` : ''}</span></li>}
                  {enquiry.city && <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><span className="block text-[12px] text-primary/50">Location</span>{[enquiry.locality, enquiry.city, enquiry.state].filter(Boolean).join(', ')}{enquiry.pincode ? ` – ${enquiry.pincode}` : ''}</span></li>}
                  <li className="flex items-start gap-3"><Stethoscope className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><span className="block text-[12px] text-primary/50">Service</span>{enquiry.service || 'Our advisor will help you choose'}</span></li>
                  {enquiry.phone && <li className="flex items-start gap-3"><Phone className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><span className="block text-[12px] text-primary/50">We will call</span>+91 {String(enquiry.phone).replace(/\D/g, '').slice(-10)}</span></li>}
                </ul>
                <div className="px-6 pb-6 pt-3 grid sm:grid-cols-2 gap-2.5">
                  <Link to={`/track?code=${encodeURIComponent(enquiry.code)}&phone=${encodeURIComponent(enquiry.phone)}`} className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-white text-[14px] font-semibold shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)] hover:brightness-95 transition">Track this request <ArrowRight className="w-4 h-4" /></Link>
                  {enquiry.preferredDate && <button type="button" onClick={() => addToCalendar(enquiry)} className="h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-line text-primary text-[14px] font-semibold hover:bg-tint transition"><CalendarPlus className="w-4 h-4" /> Add to calendar</button>}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl ring-1 ring-line-soft p-6 h-56 animate-pulse" />
            )}

            {/* What happens next */}
            <div className="cv-rise bg-white rounded-3xl ring-1 ring-line-soft p-6 sm:p-7" style={{ animationDelay: '.6s' }}>
              <h2 className="text-[18px] font-semibold">What happens next</h2>
              <ol className="relative mt-5">
                <span className="cv-grow absolute left-[19px] top-3 bottom-6 w-px bg-gradient-to-b from-secondary via-line to-line" style={{ animationDelay: '.8s' }} aria-hidden="true" />
                {next.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.title} className="cv-rise relative flex gap-4 pb-6 last:pb-0" style={{ animationDelay: `${0.75 + i * 0.15}s` }}>
                      <span className={`relative z-10 w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${s.done ? 'bg-secondary text-white' : 'bg-white ring-1 ring-line text-accent'}`}><Icon className="w-[18px] h-[18px]" /></span>
                      <div className="pt-1">
                        <p className="font-semibold text-[15px] flex items-center gap-2">{s.title}{s.done && <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">Done</span>}</p>
                        <p className="text-[14px] text-primary/60 mt-0.5">{s.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <div className="cv-rise mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white ring-1 ring-line-soft px-6 py-4" style={{ animationDelay: '1.3s' }}>
            <p className="flex items-center gap-2 text-[14px] text-primary/70"><ShieldCheck className="w-5 h-5 text-accent" /> {counter ? <span className="font-semibold text-primary">{counter.charAt(0).toUpperCase() + counter.slice(1)}</span> : 'Verified professionals, private and secure.'}</p>
            <div className="flex items-center gap-3 text-[14px]">
              {contact.phone && <a href={contact.phoneHref} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-secondary"><Phone className="w-4 h-4" /> {contact.phone}</a>}
              <Link to="/" className="inline-flex items-center gap-1.5 text-primary/70 hover:text-primary">Back to home <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
