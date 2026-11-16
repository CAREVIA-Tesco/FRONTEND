import React from 'react';
import { House, Building2, Video, Timer, Users, ClipboardCheck, ListChecks, ShieldCheck, CheckCircle2, CalendarCheck, ArrowRight } from 'lucide-react';
import { SERVICE_GUIDES } from '../data/serviceGuides';
import { visitTypesForService, needsDutyHours, dutyHoursFor } from '../data/serviceRules';

const VISIT = { home: ['Home visit', House], clinic: ['Clinic visit', Building2], online: ['Online consultation', Video] };
// cards on the service pages lift and turn pink on hover (the website's secondary colour)
// soft colour per card (the website's purple, pink and deep-purple), used for headers, icons and ticks
const TONES = [
  { soft: 'bg-[color-mix(in_srgb,var(--color-accent)_12%,white)]', icon: 'bg-accent text-white', tick: 'text-accent', bar: 'bg-accent' },
  { soft: 'bg-[color-mix(in_srgb,var(--color-secondary)_12%,white)]', icon: 'bg-secondary text-white', tick: 'text-secondary', bar: 'bg-secondary' },
  { soft: 'bg-[color-mix(in_srgb,var(--color-primary)_9%,white)]', icon: 'bg-primary text-white', tick: 'text-primary', bar: 'bg-primary' },
];
export const HOVER_CARD = 'transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-secondary)_45%,transparent)]';

// In-depth explanation of a service: overview, who it is for, how it works, what is included,
// how to prepare and our quality checks – plus the visit types / duty hours the service allows.
export default function ServiceGuide({ serviceKey, serviceName, onBook, bg = 'bg-white' }) {
  const g = SERVICE_GUIDES[serviceKey];
  if (!g) return null;
  const types = visitTypesForService(serviceKey);
  const duty = needsDutyHours(serviceKey);
  const lists = [
    [Users, `Who ${serviceName} is for`, g.whoFor],
    [ListChecks, 'What’s included', g.included],
    [ClipboardCheck, 'Before your visit', g.prepare],
  ];
  return (
    <section className={`py-14 sm:py-24 ${bg}`} id="guide" data-testid="service-guide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 lg:gap-14 items-start">
          <div>
            <p className="eyebrow text-accent mb-3">Complete guide</p>
            <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary leading-tight mb-6">{g.title}</h2>
            {g.overview.map((p) => <p key={p.slice(0, 40)} className="text-[17px] text-ink-soft leading-relaxed mb-5">{p}</p>)}
          </div>
          <aside className="lg:sticky lg:top-28 rounded-3xl bg-gradient-to-br from-deep via-deep-2 to-deep-3 text-white p-6 sm:p-7" data-testid="service-at-a-glance">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-on-deep">At a glance</p>
            <p className="mt-4 text-[13px] text-white/60">How you can book</p>
            <ul className="mt-2 space-y-2">
              {types.map((t) => { const [label, Icon] = VISIT[t]; return <li key={t} className="flex items-center gap-2.5 rounded-xl bg-white/10 ring-1 ring-white/15 px-3.5 py-2.5 text-[14px] font-medium"><Icon className="w-4 h-4 text-on-deep" /> {label}</li>; })}
            </ul>
            {types.length < 3 && <p className="mt-2 text-[12.5px] text-white/60">{serviceName} is available as {types.map((t) => VISIT[t][0].toLowerCase()).join(' or ')} only.</p>}
            {duty && (
              <>
                <p className="mt-5 text-[13px] text-white/60">Duty hours</p>
                <div className="mt-2 grid grid-cols-3 gap-2">{dutyHoursFor(serviceKey).map((h) => <span key={h} className="flex items-center justify-center gap-1 rounded-xl bg-white/10 ring-1 ring-white/15 py-2.5 text-[13px] font-semibold"><Timer className="w-3.5 h-3.5 text-on-deep" />{h.replace(' Hours', ' hrs')}</span>)}</div>
              </>
            )}
            {onBook && <button type="button" onClick={onBook} className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-hover text-white py-3.5 rounded-xl font-bold transition"><CalendarCheck className="w-5 h-5" /> Book Now</button>}
          </aside>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl md:text-[28px] font-semibold font-poppins text-primary mb-6">How it works</h3>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 items-stretch">
            {g.steps.map(([t, d], i) => (
              <li key={t} className={`relative h-full bg-white rounded-2xl border border-black/[0.06] p-6 pt-7 overflow-visible ${HOVER_CARD}`}>
                <span className={`absolute inset-x-0 top-0 h-1.5 rounded-t-2xl ${TONES[i % 3].bar}`} aria-hidden="true" />
                <span className={`w-11 h-11 rounded-xl font-bold text-[17px] flex items-center justify-center ${TONES[i % 3].icon}`}>{String(i + 1).padStart(2, '0')}</span>
                {i < g.steps.length - 1 && <ArrowRight className="hidden lg:block absolute -right-3.5 top-9 w-5 h-5 text-secondary/60 z-10" aria-hidden="true" />}
                <p className="mt-4 font-semibold text-primary text-[17px]">{t}</p>
                <p className="mt-1.5 text-[14px] text-ink-soft leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {lists.map(([Icon, title, items], n) => {
            const tone = TONES[n % 3];
            return (
              <div key={title} className="h-full flex flex-col bg-white rounded-2xl border border-black/[0.07] overflow-hidden transition-all duration-300 hover:border-secondary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-secondary)_45%,transparent)]" data-testid="guide-card">
                <div className={`flex items-center gap-3.5 px-6 py-5 ${tone.soft}`}>
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${tone.icon}`}><Icon className="w-5 h-5" /></span>
                  <h3 className="text-[17px] font-semibold text-primary leading-snug">{title}</h3>
                </div>
                <ul className="px-6 py-5 space-y-3 flex-1">
                  {items.map((x) => <li key={x} className="flex items-start gap-2.5 text-[14.5px] text-ink-soft leading-snug"><CheckCircle2 className={`w-[18px] h-[18px] shrink-0 mt-px ${tone.tick}`} /> {x}</li>)}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-black/[0.05] p-6 sm:p-7 flex flex-col md:flex-row md:items-center gap-5 bg-gradient-to-r from-[color-mix(in_srgb,var(--color-accent)_12%,white)] via-white to-[color-mix(in_srgb,var(--color-secondary)_12%,white)]" data-testid="guide-quality">
          <span className="flex items-center gap-3 shrink-0 md:w-[220px]"><span className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center shadow-sm"><ShieldCheck className="w-6 h-6" /></span><span className="font-semibold text-primary text-lg">Safety & quality</span></span>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 flex-1">
            {g.quality.map((x) => <li key={x} className="flex items-start gap-2 text-[14.5px] text-primary/80"><CheckCircle2 className="w-[18px] h-[18px] text-secondary shrink-0 mt-0.5" /> {x}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
