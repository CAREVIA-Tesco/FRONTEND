import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse, ShieldCheck, Award, ArrowRight, CalendarCheck, Target, Eye, Sparkles, Handshake, Clock,
  BadgeCheck, FileSearch, IdCard, UserCheck, Star, Home as HomeIcon, Stethoscope, Building2, MapPin, CheckCircle2, Lock,
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import Reveal from '../components/Reveal';
import { useBookNow } from '../components/BookNow';
import { usePublicStats } from '../services/usePublicStats';
import { useSiteContent } from '../services/useSiteContent';
import { useServices } from '../data/services';

// purple / pink / deep-purple accents used across the cards
const TONES = [
  { soft: 'bg-[color-mix(in_srgb,var(--color-accent)_12%,white)]', icon: 'bg-accent text-white', text: 'text-accent' },
  { soft: 'bg-[color-mix(in_srgb,var(--color-secondary)_12%,white)]', icon: 'bg-secondary text-white', text: 'text-secondary' },
  { soft: 'bg-[color-mix(in_srgb,var(--color-primary)_9%,white)]', icon: 'bg-primary text-white', text: 'text-primary' },
];
const HOVER = 'transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-secondary)_45%,transparent)]';

const VALUES = [
  [ShieldCheck, 'Safety first', 'Every professional is verified before their first visit, and every visit is recorded so families always know who came and what was done.'],
  [HeartPulse, 'Compassion', 'We treat every patient the way we would want our own parents treated – with patience, dignity and respect for their home.'],
  [Award, 'Clinical quality', 'Qualified doctors, nurses and therapists follow the treatment plan, keep notes and escalate when something needs a doctor’s attention.'],
  [Eye, 'Transparency', 'Fees, consultation types and open slots are shown before you book. No hidden charges, and paid bookings can be cancelled before the visit.'],
  [Lock, 'Privacy', 'Your health records, prescriptions and contact details stay private. Professionals see only what they need to care for you.'],
  [Clock, 'Reliability', 'We confirm every request, keep you updated and arrange a replacement if your professional is unavailable.'],
];

const STEPS = [
  ['Choose a service', 'Pick the care you need – a doctor, nurse, physiotherapist, care taker, lab test and more.'],
  ['Book a time', 'Choose a home visit, clinic visit or online consultation where offered, and a slot that suits you.'],
  ['Verified professional', 'A verified professional is assigned and confirms the visit. You can track every step online.'],
  ['Care & records', 'After the visit, the summary and prescription are saved to your account for follow-ups.'],
];

const VERIFY = [
  [FileSearch, 'Application review', 'Profession, experience and services offered are reviewed by our team.'],
  [Award, 'Qualification check', 'Degrees and council registration numbers are checked for doctors and nurses.'],
  [IdCard, 'Identity verification', 'Aadhaar / government ID is collected and verified before approval.'],
  [UserCheck, 'Approval', 'Only approved professionals appear on the website and can receive bookings.'],
  [Star, 'Ongoing feedback', 'Patient ratings and reviews after every visit keep quality high.'],
];

const AUDIENCES = [
  [HomeIcon, 'Patients & families', 'Book trusted care at home or online for yourself, your parents or your children – and keep every record in one place.', '/services', 'Explore services'],
  [Stethoscope, 'Doctors & professionals', 'Grow your practice: set your own fees and timings, receive bookings and manage visits from one dashboard.', '/doctor/register', 'Register as a professional'],
  [Building2, 'Healthcare businesses', 'Clinics, laboratories, pharmacies and care agencies can partner with Carevaa and reach more families.', '/business-partner/register', 'Register your business'],
];

export default function About() {
  const platform = usePublicStats();
  const services = useServices();
  const cities = useSiteContent('cities');
  const bookNow = useBookNow();
  useEffect(() => { window.scrollTo(0, 0); document.title = 'About Us – Carevaa'; return () => { document.title = 'Carevaa | Doctors, Nurses & Home Care Services'; }; }, []);

  const stats = useMemo(() => [
    [platform ? (platform.providers ? platform.providers.toLocaleString('en-IN') : '100%') : '…', platform?.providers ? 'Verified professionals' : 'Verified professionals'],
    [services.length || '…', 'Care services'],
    [cities.length || '…', cities.length === 1 ? 'City served' : 'Cities served'],
    ['24/7', 'Online booking'],
  ], [platform, services.length, cities.length]);

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen relative overflow-x-clip" data-testid="about-page">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-tint pt-28 lg:pt-36 pb-14 lg:pb-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-black/[0.06] px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-accent"><Sparkles className="w-4 h-4" /> About Carevaa</p>
            <h1 className="mt-5 font-poppins font-semibold text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.1] text-primary">Healthcare that comes home – <span className="italic text-secondary">with care</span></h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-xl">Carevaa connects families with verified doctors, nurses, physiotherapists, care takers and labs – so quality care reaches people where they heal best: at home, at a nearby clinic or online.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => bookNow()} className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-hover text-white px-7 py-3.5 rounded-xl font-bold transition shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)]"><CalendarCheck className="w-5 h-5" /> Book Now</button>
              <Link to="/services" className="inline-flex items-center gap-2 bg-white border border-primary/15 text-primary px-7 py-3.5 rounded-xl font-bold hover:border-secondary hover:text-secondary transition">Our services <ArrowRight className="w-5 h-5" /></Link>
            </div>
          </Reveal>
          <Reveal delay={100} className="relative">
            <img src="/caretaker-section.png" alt="Carevaa caregiver with an elderly couple at home" className="w-full h-[280px] sm:h-[420px] object-cover rounded-[2rem] shadow-2xl" />
            <div className="absolute -bottom-6 left-6 sm:left-8 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-secondary text-white flex items-center justify-center"><BadgeCheck className="w-6 h-6" /></span>
              <span><span className="block font-bold text-primary leading-tight">100% verified</span><span className="block text-[13px] text-gray-500">professionals on every visit</span></span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-12 bg-white border-y border-black/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(([v, l], i) => (
            <div key={l} className={`rounded-2xl px-5 py-6 text-center ${TONES[i % 3].soft}`}>
              <p className={`text-3xl sm:text-4xl font-bold ${TONES[i % 3].text}`}>{v}</p>
              <p className="mt-1 text-[12.5px] sm:text-sm font-semibold uppercase tracking-wider text-gray-600">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-14 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
          <Reveal className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <img src="/nurse-hero.jpg" alt="Carevaa nurse at a patient’s home" className="w-full h-56 sm:h-72 object-cover rounded-3xl" />
              <img src="/doctor-hero.png" alt="Carevaa doctor on a home visit" className="w-full h-56 sm:h-72 object-cover rounded-3xl mt-10" />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <p className="eyebrow text-accent mb-3">Our story</p>
            <h2 className="font-poppins font-semibold text-3xl md:text-[40px] leading-tight text-primary">Why we started Carevaa</h2>
            <p className="mt-5 text-[17px] text-gray-600 leading-relaxed">For many families, getting good care is harder than it should be. An elderly parent who struggles with stairs, a patient just discharged from hospital, a new mother who needs rest – travelling to a clinic and waiting in a queue is often the most difficult part.</p>
            <p className="mt-4 text-[17px] text-gray-600 leading-relaxed">Carevaa was built to change that. We bring together qualified healthcare professionals and make them easy to find, book and trust – with clear fees, verified profiles and every visit recorded online.</p>
            <p className="mt-4 text-[17px] text-gray-600 leading-relaxed">Today Carevaa offers doctor visits, nursing, physiotherapy, care takers, baby care, lab tests, Ayurveda and Homeopathy – at home, at the clinic or online, depending on what each service needs.</p>
          </Reveal>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="py-14 sm:py-20 bg-tint">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-5 lg:gap-7">
          {[[Target, 'Our mission', 'To make safe, professional healthcare accessible at home for every family – with verified professionals, transparent fees and simple online booking.', 0], [Eye, 'Our vision', 'A future where quality care follows the patient – where no one has to choose between comfort and good medical care.', 1]].map(([Icon, t, d, n]) => (
            <Reveal key={t} className="h-full">
              <div className={`h-full bg-white rounded-3xl border border-black/[0.06] p-7 sm:p-9 ${HOVER}`}>
                <span className={`w-14 h-14 rounded-2xl flex items-center justify-center ${TONES[n].icon}`}><Icon className="w-7 h-7" /></span>
                <h2 className="mt-5 font-poppins font-semibold text-2xl md:text-[28px] text-primary">{t}</h2>
                <p className="mt-3 text-[16.5px] text-gray-600 leading-relaxed">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-14 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="eyebrow text-accent mb-3">What we stand for</p>
            <h2 className="font-poppins font-semibold text-3xl md:text-[40px] leading-tight text-primary">Our core values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="about-values">
            {VALUES.map(([Icon, t, d], i) => (
              <Reveal key={t} delay={(i % 3) * 70} className="h-full">
                <div className={`h-full bg-white rounded-2xl border border-black/[0.07] p-6 sm:p-7 ${HOVER}`}>
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center ${TONES[i % 3].icon}`}><Icon className="w-6 h-6" /></span>
                  <h3 className="mt-4 text-lg font-semibold text-primary">{t}</h3>
                  <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="py-14 sm:py-24 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="eyebrow text-accent mb-3">What we do</p>
                <h2 className="font-poppins font-semibold text-3xl md:text-[40px] leading-tight text-primary">Care services we offer</h2>
              </div>
              <Link to="/services" className="font-bold text-accent hover:text-secondary inline-flex items-center gap-1.5 hover:gap-3 transition-all">All services <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s, i) => {
                const Icon = s.icon || Stethoscope;
                return (
                  <Link key={s.key} to={s.link} className={`group flex items-start gap-4 bg-white rounded-2xl border border-black/[0.06] p-5 ${HOVER}`}>
                    <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${TONES[i % 3].soft}`}><Icon className={`w-6 h-6 ${TONES[i % 3].text}`} /></span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-primary group-hover:text-secondary transition-colors">{s.title}</span>
                      <span className="block text-[14px] text-gray-600 mt-0.5 line-clamp-2">{s.desc || s.short}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-14 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="eyebrow text-accent mb-3">Simple and guided</p>
            <h2 className="font-poppins font-semibold text-3xl md:text-[40px] leading-tight text-primary">How Carevaa works</h2>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {STEPS.map(([t, d], i) => (
              <li key={t} className={`relative h-full bg-white rounded-2xl border border-black/[0.06] p-6 pt-7 ${HOVER}`}>
                <span className={`absolute inset-x-0 top-0 h-1.5 rounded-t-2xl ${['bg-accent', 'bg-secondary', 'bg-primary'][i % 3]}`} aria-hidden="true" />
                <span className={`w-11 h-11 rounded-xl font-bold text-[17px] flex items-center justify-center ${TONES[i % 3].icon}`}>{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-4 font-semibold text-primary text-[17px]">{t}</p>
                <p className="mt-1.5 text-[14px] text-gray-600 leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Verification */}
      <section className="py-14 sm:py-24 bg-gradient-to-br from-deep via-deep-2 to-deep-3 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-on-deep mb-3">Trust & safety</p>
            <h2 className="font-poppins font-semibold text-3xl md:text-[40px] leading-tight">How we verify every professional</h2>
            <p className="mt-4 text-white/75 text-[16.5px]">No professional can receive bookings on Carevaa until they pass our review.</p>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="about-verify">
            {VERIFY.map(([Icon, t, d], i) => (
              <li key={t} className="h-full rounded-2xl bg-white/[0.07] ring-1 ring-white/15 p-5 transition hover:bg-white/[0.12] hover:ring-secondary/60">
                <span className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-xl bg-secondary text-white flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                  <span className="text-white/35 font-bold text-2xl">{String(i + 1).padStart(2, '0')}</span>
                </span>
                <p className="mt-4 font-semibold">{t}</p>
                <p className="mt-1.5 text-[13.5px] text-white/70 leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Who we serve */}
      <section className="py-14 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="eyebrow text-accent mb-3">Who we serve</p>
            <h2 className="font-poppins font-semibold text-3xl md:text-[40px] leading-tight text-primary">One platform, three communities</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {AUDIENCES.map(([Icon, t, d, to, cta], i) => (
              <div key={t} className="h-full flex flex-col bg-white rounded-2xl border border-black/[0.07] overflow-hidden transition-all duration-300 hover:border-secondary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-secondary)_45%,transparent)]">
                <div className={`flex items-center gap-3.5 px-6 py-5 ${TONES[i].soft}`}>
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${TONES[i].icon}`}><Icon className="w-5 h-5" /></span>
                  <h3 className="text-[17px] font-semibold text-primary">{t}</h3>
                </div>
                <p className="px-6 pt-5 text-[15px] text-gray-600 leading-relaxed flex-1">{d}</p>
                <Link to={to} className="px-6 py-5 font-bold text-secondary inline-flex items-center gap-1.5 hover:gap-3 transition-all">{cta} <ArrowRight className="w-4 h-4" /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presence */}
      {cities.length > 0 && (
        <section className="py-14 sm:py-20 bg-tint">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1.4fr] gap-8 items-center">
            <div>
              <p className="eyebrow text-accent mb-3">Where we are</p>
              <h2 className="font-poppins font-semibold text-3xl md:text-[36px] leading-tight text-primary">Caring for families across {cities.length} {cities.length === 1 ? 'city' : 'cities'}</h2>
              <p className="mt-4 text-[16.5px] text-gray-600">Home visits in the cities below, and online consultations from anywhere in India.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {cities.map((c) => (
                <Link key={c.name} to={`/cities/${encodeURIComponent(c.name)}`} className="inline-flex items-center gap-1.5 bg-white border border-black/[0.07] rounded-full px-4 py-2.5 text-[14.5px] font-medium text-primary hover:border-secondary hover:text-secondary transition-colors"><MapPin className="w-4 h-4 text-accent" /> {c.name}</Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promise + CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-secondary to-primary rounded-3xl px-6 py-8 sm:px-10 text-white shadow-xl flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-[28px] font-bold font-poppins leading-tight">Experience the Carevaa difference</h2>
            <ul className="mt-3 flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-[14.5px] text-white/90">
              {['Verified professionals', 'Transparent fees', 'Records in one place'].map((x) => <li key={x} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {x}</li>)}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center shrink-0">
            <button type="button" onClick={() => bookNow()} className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-[15px] hover:bg-gray-50 transition shadow-lg inline-flex items-center justify-center gap-2"><CalendarCheck className="w-5 h-5" /> Book Now</button>
            <Link to="/contact" className="border-2 border-white/80 text-white px-6 py-3 rounded-xl font-bold text-[15px] hover:bg-white/10 transition inline-flex items-center justify-center gap-2"><Handshake className="w-5 h-5" /> Contact us</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
