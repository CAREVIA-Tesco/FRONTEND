import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Heart, Stethoscope, Leaf, HeartPulse, Activity, User, ChevronRight, ChevronDown, CheckCircle2, Wallet, Award, Sparkles, Send, Loader2 } from 'lucide-react';
import api from '../services/api';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import Reveal from '../components/Reveal';
import { useSiteContent } from '../services/useSiteContent';
import { cleanMobile, isEmail, isName, MSG } from '../utils/validate';

// Careers page – openings come from Admin → Website Content → Job openings, and the headings / text from
// Admin → Website Content → Careers page text. Applications go to Admin → Job Applications.
const ICONS = { Activity, Heart, User, Stethoscope, Leaf, HeartPulse };
const ACCENTS = {
  indigo: 'bg-[color-mix(in_srgb,var(--color-accent)_14%,white)] text-accent',
  rose: 'bg-[color-mix(in_srgb,var(--color-secondary)_14%,white)] text-secondary',
  blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', teal: 'bg-teal-50 text-teal-600',
};
const DEFAULT = {
  heroTitle: 'Build Your Career With Carevaa',
  heroText: 'Join a team of healthcare professionals shaping the future of home care with medical integrity, compassion and innovation.',
  hiringTitle: 'Current openings',
  hiringText: 'Find a role that fits your skills and the way you want to work.',
  applyTitle: 'Apply for your dream role',
  applyText: 'Share a few details and our hiring team will contact you. We value compassion, safety and clinical excellence in every home we serve.',
  perks: 'Flexible shifts and home visits near you\nSteady flow of patients through the Carevaa app\nTimely payouts and transparent earnings\nTraining and support from our care team',
};
const HOVER = 'transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-secondary)_45%,transparent)]';
const field = 'w-full h-12 rounded-xl bg-white border border-black/[0.08] px-4 text-[15px] text-primary placeholder:text-placeholder outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition';
const label = 'block text-[13px] font-semibold text-primary mb-1.5';
const lines = (t) => String(t || '').split('\n').map((x) => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

export default function FindJobs() {
  useEffect(() => { window.scrollTo(0, 0); document.title = 'Careers – Carevaa'; return () => { document.title = 'Carevaa | Doctors, Nurses & Home Care Services'; }; }, []);
  const page = { ...DEFAULT, ...Object.fromEntries(Object.entries(useSiteContent('careers-page')[0] || {}).filter(([, v]) => String(v || '').trim())) };

  const emptyApplication = { name: '', phone: '', email: '', role: 'Select Role', city: '', experience: '', about: '' };
  const [application, setApplication] = useState(emptyApplication);
  const [submitState, setSubmitState] = useState({ loading: false, error: '', success: '' });
  const setField = (key) => (e) => setApplication((a) => ({ ...a, [key]: e.target.value }));
  const [openJob, setOpenJob] = useState(null);
  const [category, setCategory] = useState('All');

  const [jobOpenings, setJobOpenings] = useState(null);
  useEffect(() => { api.getContent('jobs').then((d) => setJobOpenings(d.items || [])).catch(() => setJobOpenings([])); }, []);
  const jobs = useMemo(() => (jobOpenings || []).filter((j) => j && j.title && j.show !== 'hide'), [jobOpenings]);
  const categories = [...new Set(jobs.map((j) => j.category).filter(Boolean))];
  const visibleJobs = category === 'All' ? jobs : jobs.filter((j) => j.category === category);
  const roles = [...new Set(jobs.map((j) => j.title))];

  const applyFor = (title) => {
    setApplication((a) => ({ ...a, role: title }));
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const problem = !isName(application.name) ? `${MSG.name}.`
      : !cleanMobile(application.phone) ? `${MSG.phone}.`
        : application.email.trim() && !isEmail(application.email) ? `${MSG.email}.`
          : application.role === 'Select Role' ? 'Please select the role you are applying for.'
            : !application.city.trim() ? 'Please enter your city.'
              : application.experience.trim() && !/^\d{1,2}(\.\d)?$/.test(application.experience.trim()) ? 'Experience must be a number of years, e.g. 5.'
                : '';
    if (problem) { setSubmitState({ loading: false, error: problem, success: '' }); return; }
    setSubmitState({ loading: true, error: '', success: '' });
    try {
      await api.applyForJob({ ...application, source: 'jobs' });
      setApplication(emptyApplication);
      setSubmitState({ loading: false, error: '', success: 'Thank you! Your application has been submitted. Our team will contact you soon.' });
    } catch (err) {
      setSubmitState({ loading: false, error: err.message, success: '' });
    }
  };

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip" data-testid="careers-page">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-tint pt-28 lg:pt-36 pb-12 lg:pb-16 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-5"><Link to="/" className="hover:text-secondary">Home</Link><ChevronRight className="w-3.5 h-3.5" /><span className="text-primary font-medium">Careers</span></nav>
            <p className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-black/[0.06] px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-accent"><Sparkles className="w-4 h-4" /> Careers at Carevaa</p>
            <h1 className="mt-5 font-poppins font-semibold text-[32px] sm:text-[44px] lg:text-[50px] leading-[1.1]" data-testid="careers-title">{page.heroTitle}</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-xl">{page.heroText}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#openings" className="bg-secondary hover:bg-secondary-hover text-white px-7 py-3.5 rounded-xl font-bold transition shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)]">View openings{jobs.length ? ` (${jobs.length})` : ''}</a>
              <a href="#apply" className="bg-white border border-primary/15 text-primary px-7 py-3.5 rounded-xl font-bold hover:border-secondary hover:text-secondary transition">Apply now</a>
            </div>
          </div>
          <div className="relative">
            <img src="/career-hero.jpg" alt="Carevaa healthcare team" className="w-full h-[260px] sm:h-[400px] object-cover rounded-[2rem] shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Perks */}
      {lines(page.perks).length > 0 && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white border-b border-black/[0.04]">
          <ul className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {lines(page.perks).map((p, i) => (
              <li key={p} className={`flex items-start gap-3 rounded-2xl p-4 ${['bg-[color-mix(in_srgb,var(--color-accent)_10%,white)]', 'bg-[color-mix(in_srgb,var(--color-secondary)_10%,white)]', 'bg-[color-mix(in_srgb,var(--color-primary)_8%,white)]'][i % 3]}`}>
                <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" /><span className="text-[14.5px] font-medium">{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Openings */}
      <section id="openings" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="font-poppins font-semibold text-3xl md:text-[40px]">{page.hiringTitle}</h2>
            <p className="mt-3 text-gray-600">{page.hiringText}</p>
          </div>
          {categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-8 sm:justify-center" role="tablist" aria-label="Filter openings">
              {['All', ...categories].map((c) => <button key={c} type="button" role="tab" aria-selected={category === c} onClick={() => setCategory(c)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${category === c ? 'bg-secondary border-secondary text-white' : 'bg-white border-black/[0.07] hover:border-secondary hover:text-secondary'}`}>{c}</button>)}
            </div>
          )}
          {jobOpenings === null && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2].map((i) => <div key={i} className="h-64 rounded-3xl bg-white animate-pulse" />)}</div>}
          {jobOpenings !== null && jobs.length === 0 && <p className="bg-white rounded-3xl border border-black/[0.06] p-10 text-center text-gray-600">No open positions right now – you can still send us your application below.</p>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="job-grid">
            {visibleJobs.map((job, idx) => {
              const Icon = ICONS[job.icon] || Stethoscope;
              const reqs = lines(job.requirements);
              const open = openJob === `${job.title}-${idx}`;
              return (
                <Reveal key={`${job.title}-${idx}`} delay={(idx % 3) * 60} className="h-full min-w-0">
                  <article className={`h-full flex flex-col bg-white rounded-3xl border border-black/[0.06] p-6 ${HOVER}`} data-testid="job-card">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${ACCENTS[job.accent] || ACCENTS.indigo}`}><Icon className="w-6 h-6" /></span>
                      {job.category && <span className="text-[12px] font-bold uppercase tracking-wider rounded-full px-3 py-1 bg-tint text-accent truncate max-w-[60%]">{job.category}</span>}
                    </div>
                    <h3 className="mt-4 text-[19px] font-semibold leading-snug">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-gray-500">
                      {job.loc && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-accent" /> {job.loc}</span>}
                      {job.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent" /> {job.time}</span>}
                      {job.experience && <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-accent" /> {job.experience}</span>}
                      {job.salary && <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5 text-accent" /> {job.salary}</span>}
                    </div>
                    <p className={`mt-3 text-[14.5px] text-gray-600 leading-relaxed ${open ? '' : 'line-clamp-3'}`}>{job.desc}</p>
                    {reqs.length > 0 && (
                      <>
                        <button type="button" onClick={() => setOpenJob(open ? null : `${job.title}-${idx}`)} className="mt-3 self-start text-[13.5px] font-semibold text-accent inline-flex items-center gap-1">{open ? 'Hide requirements' : 'View requirements'} <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} /></button>
                        {open && <ul className="mt-2 space-y-1.5">{reqs.map((r) => <li key={r} className="flex items-start gap-2 text-[14px] text-gray-600"><CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" /> {r}</li>)}</ul>}
                      </>
                    )}
                    <button type="button" onClick={() => applyFor(job.title)} className="mt-auto pt-5 w-full">
                      <span className="block w-full py-3 rounded-xl bg-secondary hover:bg-secondary-hover text-white font-bold text-sm transition">Apply now</span>
                    </button>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Apply form */}
      <section id="apply" className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-10 items-start">
          <div className="rounded-3xl bg-gradient-to-br from-deep via-deep-2 to-deep-3 text-white p-6 sm:p-9">
            <span className="w-12 h-12 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center"><Briefcase className="w-6 h-6" /></span>
            <h2 className="mt-5 font-poppins font-semibold text-2xl sm:text-3xl">{page.applyTitle}</h2>
            <p className="mt-3 text-white/80 leading-relaxed">{page.applyText}</p>
            <ol className="mt-6 space-y-3 text-[14.5px] text-white/85">
              {['Send your application', 'Our team calls you for a short interview', 'Document & ID verification', 'Start receiving patients'].map((s, i) => <li key={s} className="flex items-center gap-3"><span className="w-7 h-7 rounded-full bg-secondary text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>{s}</li>)}
            </ol>
          </div>

          <form onSubmit={handleApply} noValidate className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-5 sm:p-8 grid gap-4 min-w-0" data-testid="job-form">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="min-w-0"><label htmlFor="ja-name" className={label}>Full name <span className="text-secondary">*</span></label><input id="ja-name" value={application.name} onChange={setField('name')} placeholder="Your full name" autoComplete="name" className={field} /></div>
              <div className="min-w-0"><label htmlFor="ja-phone" className={label}>Mobile number <span className="text-secondary">*</span></label><input id="ja-phone" type="tel" inputMode="numeric" value={application.phone} onChange={setField('phone')} placeholder="10-digit mobile" autoComplete="tel" className={field} /></div>
            </div>
            <div><label htmlFor="ja-email" className={label}>Email</label><input id="ja-email" type="email" value={application.email} onChange={setField('email')} placeholder="you@example.com" autoComplete="email" className={field} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label htmlFor="ja-role" className={label}>Applying for <span className="text-secondary">*</span></label>
                <span className="relative block">
                  <select id="ja-role" value={application.role} onChange={setField('role')} className={`${field} appearance-none pr-10`}>
                    <option>Select Role</option>
                    {roles.map((title) => <option key={title}>{title}</option>)}
                    <option>Other / General application</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/50" />
                </span>
              </div>
              <div className="min-w-0"><label htmlFor="ja-city" className={label}>Preferred city <span className="text-secondary">*</span></label><input id="ja-city" value={application.city} onChange={setField('city')} placeholder="e.g. Chennai" className={field} /></div>
            </div>
            <div><label htmlFor="ja-exp" className={label}>Years of experience</label><input id="ja-exp" inputMode="decimal" value={application.experience} onChange={setField('experience')} placeholder="e.g. 5" className={field} /></div>
            <div><label htmlFor="ja-about" className={label}>About you</label><textarea id="ja-about" rows={4} value={application.about} onChange={setField('about')} placeholder="Your qualification, experience and the kind of work you are looking for" className={`${field} h-auto py-3`} /></div>
            {submitState.error && <p role="alert" className="text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{submitState.error}</p>}
            {submitState.success && <p role="status" className="text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">{submitState.success}</p>}
            <button type="submit" disabled={submitState.loading} className="w-full h-12 bg-secondary hover:bg-secondary-hover disabled:opacity-70 text-white rounded-xl font-bold text-[16px] transition inline-flex items-center justify-center gap-2">
              {submitState.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} {submitState.loading ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
