import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Clock, Wallet, RotateCcw, CheckCircle, PhoneCall, MessageCircle, ArrowRight, ArrowUpRight,
  CalendarCheck, UserCheck, House, ClipboardList, Star, Quote, ChevronLeft, ChevronRight, Plus, Minus,
  MapPin, BadgePercent, Briefcase, Users, Stethoscope, HeartPulse,
} from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import BookingModal from '../components/BookingModal';
import EnquiryModal from '../components/EnquiryModal';
import Reveal from '../components/Reveal';
import api from '../services/api';
import { usePublicStats, serviceStats, usePricingRules, packagePrices, inr } from '../services/usePublicStats';
import { useSiteContent, useContact } from '../services/useSiteContent';
import { SERVICES, BOOKING_TYPE } from '../data/services';
import { postSlug } from '../utils/slug';

const STEPS = [
  { icon: CalendarCheck, title: 'Book online or call', desc: 'Choose the care you need, pick a date and an open time slot, or call our care team.' },
  { icon: UserCheck, title: 'Pick your professional', desc: 'Compare verified doctors, physios, nurses and caregivers by experience, fee and rating.' },
  { icon: House, title: 'Care begins at home', desc: 'Your professional visits your home, sees you at the clinic or consults online.' },
  { icon: ClipboardList, title: 'Records & follow-up', desc: 'Vitals, notes and prescriptions are saved to your dashboard after every visit.' },
];

const BENEFITS = [
  { icon: ShieldCheck, title: 'Verified Professionals', desc: 'Qualifications and registration checked at onboarding' },
  { icon: Clock, title: '24/7 Booking', desc: 'Book anytime and see real open slots instantly' },
  { icon: Wallet, title: 'Transparent Pricing', desc: 'See the exact fee before you pay — no hidden charges' },
  { icon: RotateCcw, title: 'Easy Refunds', desc: 'Cancelled paid appointments are refunded automatically' },
];

const initials = (name = '') => name.replace(/^Dr\.?\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

function SectionHeading({ eyebrow, title, desc, center = true, light = false }) {
  return (
    <Reveal className={`${center ? 'text-center mx-auto' : ''} max-w-2xl mb-12`}>
      {eyebrow && (
        <span className={`inline-flex items-center gap-2 text-sm font-semibold mb-3 ${light ? 'text-secondary' : 'text-secondary'}`}>
          <span className="w-6 h-0.5 bg-secondary" /> {eyebrow}
        </span>
      )}
      <h2 className={`text-3xl md:text-4xl lg:text-[42px] font-bold font-poppins leading-tight ${light ? 'text-white' : 'text-primary'}`}>{title}</h2>
      {desc && <p className={`mt-4 text-base md:text-lg ${light ? 'text-white/70' : 'text-gray-600'}`}>{desc}</p>}
    </Reveal>
  );
}

export default function Home() {
  const stats = usePublicStats();
  const rules = usePricingRules();
  const contact = useContact();
  const testimonials = useSiteContent('testimonials');
  const cityList = useSiteContent('cities');
  const blog = useSiteContent('blog');
  const faqs = useSiteContent('faqs');

  const [providers, setProviders] = useState([]);
  const [booking, setBooking] = useState({ open: false, type: undefined });
  const [careChoice, setCareChoice] = useState('');
  const [slide, setSlide] = useState(0);
  const [perView, setPerView] = useState(3);
  const [openFaq, setOpenFaq] = useState(0);
  const [enquiry, setEnquiry] = useState(null);

  useEffect(() => {
    api.getProviders().then((d) => setProviders(d.providers || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const update = () => setPerView(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const openBooking = (type) => setBooking({ open: true, type });

  // ---- live numbers -------------------------------------------------------
  const todayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const doctors = providers.filter((p) => p.isDoctor);
  const doctorsToday = doctors.filter((p) => (p.schedule?.[todayKey] || []).length).length;
  const onlineFees = doctors.map((p) => p.onlineFee).filter(Boolean);
  const minOnlineFee = onlineFees.length ? Math.min(...onlineFees) : null;
  const experts = [...doctors].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || (b.experience || 0) - (a.experience || 0)).slice(0, 4);
  const avatars = experts.filter((p) => p.img).slice(0, 3);

  const priceFor = (key) => (key === 'doctor-visit' ? serviceStats(stats, key, true)?.minFee : serviceStats(stats, key)?.minFee);

  // stat bar: real numbers first (only ones that are non-zero), padded with service promises
  const statTiles = useMemo(() => {
    const live = stats ? [
      { value: stats.providers, label: stats.providers === 1 ? 'Verified professional' : 'Verified professionals', icon: Users },
      { value: stats.patientsServed, label: stats.patientsServed === 1 ? 'Patient served' : 'Patients served', icon: HeartPulse },
      { value: stats.completedVisits, label: stats.completedVisits === 1 ? 'Visit completed' : 'Visits completed', icon: Stethoscope },
      { value: stats.cities, label: stats.cities === 1 ? 'City covered' : 'Cities covered', icon: MapPin },
      stats.rating ? { value: `${stats.rating}★`, label: `Average rating · ${stats.reviews} reviews`, icon: Star } : null,
    ].filter((t) => t && t.value) : [];
    const fill = BENEFITS.map((b) => ({ value: b.title, label: b.desc, icon: b.icon, text: true }));
    return [...live, ...fill].slice(0, 4);
  }, [stats]);

  // offers built from the pricing rules + live fees
  const offers = useMemo(() => {
    if (!rules) return [];
    const list = [];
    const physio = packagePrices(priceFor('physiotherapy'), rules);
    if (physio) list.push({ key: 'physiotherapy', img: '/physio-section.png', badge: `${rules.packDiscountPct}% OFF`, title: 'Physiotherapy', service: 'Physiotherapy', plan: `${physio.packSessions}-Session Pack`, line: `${physio.packSessions}-session pack at ${inr(physio.perSession)} per session — save ${inr(physio.packSaving)}` });
    const care = packagePrices(priceFor('care-taker'), rules);
    if (care) list.push({ key: 'care-taker', img: '/caretaker-hero.png', badge: 'MONTHLY PLAN', title: 'Elder Care', service: 'Care Taker', plan: 'Monthly Care Plan', line: `Full-month care taker plan from ${inr(care.monthly)}${rules.emiMinimum && care.monthly >= rules.emiMinimum ? ' · EMI available' : ''}` });
    const nurse = packagePrices(priceFor('nurse-care'), rules);
    if (nurse) list.push({ key: 'nurse-care', img: '/nurse-hero.jpg', badge: `${rules.packDiscountPct}% OFF`, title: 'Nursing Care', service: 'Nurse Care', plan: `${nurse.packSessions}-Visit Pack`, line: `${nurse.packSessions}-visit nursing pack at ${inr(nurse.perSession)} per visit` });
    if (minOnlineFee) list.push({ key: 'doctor-visit', img: '/home-hero.jpg', badge: 'FROM ' + inr(minOnlineFee), title: 'Online Consultation', line: `Consult a doctor from home — private audio consult from ${inr(minOnlineFee)}` });
    return list.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, stats, minOnlineFee]);

  // cities grouped by state (Portea-style presence block)
  const states = useMemo(() => {
    const map = new Map();
    cityList.forEach((c) => { const s = c.desc || 'Other'; map.set(s, [...(map.get(s) || []), c.name]); });
    return [...map.entries()];
  }, [cityList]);

  // testimonials slider
  const maxSlide = Math.max(0, testimonials.length - perView);
  useEffect(() => { setSlide((s) => Math.min(s, maxSlide)); }, [maxSlide]);
  useEffect(() => {
    if (maxSlide === 0) return undefined;
    const t = setInterval(() => setSlide((s) => (s >= maxSlide ? 0 : s + 1)), 5000);
    return () => clearInterval(t);
  }, [maxSlide]);

  const selected = SERVICES.find((s) => s.key === careChoice);

  return (
    <div className="theme-portea font-sans text-primary bg-[#F7FAFC] min-h-screen relative overflow-x-hidden">
      <SiteHeader />

      {/* 1. Hero */}
      <section id="home" className="relative bg-tint pt-28 md:pt-32 lg:pt-40 pb-28 lg:pb-36 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-40 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 bg-white text-primary text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Home healthcare · verified professionals
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold font-poppins text-primary leading-[1.12] mb-6">
              Quality medical care in the <span className="text-secondary">comfort of your home</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              Doctors, physiotherapists, nurses and trained caregivers who visit your home or consult online
              {minOnlineFee ? ` — online consultations start at just ${inr(minOnlineFee)}.` : '.'}
            </p>

            {/* care selector */}
            <div className="bg-white rounded-2xl shadow-xl shadow-primary/5 p-3 flex flex-col sm:flex-row gap-3 max-w-xl mb-6">
              <label className="flex-1 flex flex-col px-3 py-1">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">What care do you need?</span>
                <select
                  aria-label="What care do you need?"
                  value={careChoice}
                  onChange={(e) => setCareChoice(e.target.value)}
                  className="bg-transparent text-primary font-semibold outline-none py-1 cursor-pointer"
                >
                  <option value="">Select a service</option>
                  {SERVICES.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}
                </select>
              </label>
              <button
                type="button"
                onClick={() => openBooking(selected ? BOOKING_TYPE(selected.key) : undefined)}
                className="bg-secondary hover:bg-secondary-hover text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                Book Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-primary/80">
              {contact.phone && (
                <a href={contact.phoneHref} className="flex items-center gap-2 hover:text-secondary transition-colors">
                  <PhoneCall className="w-4 h-4 text-secondary" /> Call {contact.phone}
                </a>
              )}
              <button type="button" onClick={() => setEnquiry({ service: selected?.title })} className="flex items-center gap-2 underline decoration-secondary/40 underline-offset-4 hover:text-secondary transition-colors">
                <MessageCircle className="w-4 h-4 text-secondary" /> Talk to a care advisor
              </button>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-secondary" /> Verified professionals</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-secondary" /> Digital prescriptions</span>
            </div>
          </Reveal>

          <Reveal delay={150} className="relative">
            <div className="absolute inset-0 bg-primary rounded-[40px] rotate-3 scale-[1.03] opacity-10" />
            <img src="/doctor-hero.png" alt="Carevia doctor visiting a patient at home" className="relative w-full h-[340px] sm:h-[440px] lg:h-[520px] object-cover rounded-[32px] shadow-2xl border-4 border-white" />

            <div className="absolute -left-2 sm:-left-8 bottom-10 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-float">
              {avatars.length > 0 && (
                <div className="flex -space-x-3">
                  {avatars.map((d) => <img key={d.id} src={d.img} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-10 h-10 rounded-full border-2 border-white object-cover bg-tint" />)}
                </div>
              )}
              <div>
                <p className="font-bold text-primary text-sm">{doctorsToday} {doctorsToday === 1 ? 'Doctor is' : 'Doctors are'} available today</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Book a slot in under a minute</p>
              </div>
            </div>

            {stats?.rating ? (
              <div className="absolute -right-2 sm:-right-6 top-10 bg-white rounded-2xl shadow-xl p-4 animate-float-delayed">
                <div className="flex items-center gap-1 text-yellow-400 mb-1">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                <p className="font-bold text-primary text-sm">{stats.rating} / 5 rating</p>
                <p className="text-xs text-gray-500">from {stats.reviews} patient {stats.reviews === 1 ? 'review' : 'reviews'}</p>
              </div>
            ) : (
              <div className="absolute -right-2 sm:-right-6 top-10 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-float-delayed">
                <span className="w-10 h-10 rounded-full bg-tint text-primary flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></span>
                <div>
                  <p className="font-bold text-primary text-sm">Verified care</p>
                  <p className="text-xs text-gray-500">Qualified professionals only</p>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* 2. Stats bar (overlaps hero) */}
      <section className="relative z-10 -mt-16 px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl shadow-primary/5 border border-gray-100 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {statTiles.map((t, i) => (
            <div key={i} className={`p-5 sm:p-7 flex items-start gap-4 ${i === 1 ? 'border-l border-gray-100 lg:border-l-0' : ''} ${i === 3 ? 'border-l border-gray-100 lg:border-l-0' : ''}`}>
              <span className="hidden sm:flex w-12 h-12 rounded-2xl bg-tint text-primary items-center justify-center shrink-0"><t.icon className="w-5 h-5" /></span>
              <div>
                <p className={`font-bold font-poppins text-primary ${t.text ? 'text-base sm:text-lg' : 'text-2xl sm:text-3xl'}`}>{typeof t.value === 'number' ? t.value.toLocaleString('en-IN') : t.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{t.label}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* 3. Services */}
      <section id="services" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeading eyebrow="Our Services" title="Medical services offered at home" desc="From doctor consultations and physiotherapy to full-time caregiving — choose the care you need and book a verified professional." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((s, i) => {
            const price = priceFor(s.key);
            return (
              <Reveal key={s.key} delay={(i % 4) * 80}>
                <div className="group h-full bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col">
                  <Link to={s.link} className="relative h-44 overflow-hidden block bg-tint">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                    {price && <span className="absolute top-3 right-3 bg-white/95 text-primary text-xs font-bold px-3 py-1 rounded-full shadow">From {inr(price)}</span>}
                  </Link>
                  <div className="relative px-6 pb-6 pt-9 flex flex-col flex-1">
                    <span className="absolute -top-7 left-6 w-14 h-14 rounded-2xl bg-white shadow-lg text-primary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                      <s.icon className="w-6 h-6" />
                    </span>
                    <Link to={s.link}><h3 className="text-lg font-bold text-primary mb-2 group-hover:text-secondary transition-colors">{s.title}</h3></Link>
                    <p className="text-sm text-gray-600 mb-5 flex-1">{s.desc}</p>
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => openBooking(BOOKING_TYPE(s.key))} className="text-sm font-semibold bg-tint text-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors">
                        Book Now
                      </button>
                      <Link to={s.link} className="text-sm font-semibold text-secondary flex items-center gap-1 hover:gap-2 transition-all">
                        Know more <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 4. How it works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How Carevia Works" title="Care at home in 4 simple steps" />
          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] border-t-2 border-dashed border-primary/15" />
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 120} className="relative text-center group">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="w-20 h-20 rounded-full bg-tint ring-8 ring-white flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <s.icon className="w-8 h-8" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-secondary text-white text-sm font-bold flex items-center justify-center shadow-md">{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 max-w-[250px] mx-auto">{s.desc}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center mt-12">
            <button type="button" onClick={() => openBooking()} className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2">
              Book your first visit <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>
        </div>
      </section>

      {/* 5. Offers & care plans */}
      {offers.length > 0 && (
        <section id="offers" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SectionHeading eyebrow="Offers & Care Plans" title="Save more on ongoing care" desc="Packs and monthly plans priced from our professionals' current fees." />
          <div className="flex flex-wrap justify-center gap-6">
            {offers.map((o, i) => (
              <Reveal key={o.key} delay={i * 100} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                <div className="group h-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src={o.img} alt={o.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <span className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1"><BadgePercent className="w-3.5 h-3.5" /> {o.badge}</span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-primary mb-2">{o.title}</h3>
                    <p className="text-gray-600 text-sm mb-6 flex-1">{o.line}</p>
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => (o.plan ? setEnquiry({ type: 'plan', service: o.service, plan: o.plan }) : openBooking(BOOKING_TYPE(o.key)))} className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">{o.plan ? 'Get this plan' : 'Book Now'}</button>
                      <span className="text-[11px] text-gray-400">T&amp;C apply</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 6. About + key benefits */}
      <section id="about" className="py-20 lg:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal className="relative">
            <img src="/caretaker-section.png" alt="Carevia caregiver with an elderly couple" className="w-full h-[320px] sm:h-[440px] object-cover rounded-[32px] shadow-xl" />
            <img src="/physio-section.png" alt="Physiotherapy session" className="hidden sm:block absolute -bottom-10 -right-4 w-48 h-48 object-cover rounded-3xl border-8 border-white shadow-xl" />
            <div className="absolute -top-5 -left-3 sm:left-6 bg-secondary text-white rounded-2xl px-5 py-4 shadow-xl">
              <p className="text-2xl font-bold font-poppins">{SERVICES.length}</p>
              <p className="text-xs font-medium opacity-90">care services</p>
            </div>
          </Reveal>
          <div>
            <SectionHeading center={false} eyebrow="About Carevia" title="Trusted care for every stage of life" desc="Carevia brings hospital-quality care home. We connect families with qualified doctors, physiotherapists, nurses and caregivers — and keep every visit, prescription and payment in one place." />
            <div className="grid sm:grid-cols-2 gap-5 -mt-4 mb-8">
              {BENEFITS.map((b, i) => (
                <Reveal key={b.title} delay={i * 80} className="flex gap-4 p-4 rounded-2xl hover:bg-tint transition-colors">
                  <span className="w-12 h-12 rounded-xl bg-tint text-primary flex items-center justify-center shrink-0"><b.icon className="w-5 h-5" /></span>
                  <div>
                    <h3 className="font-bold text-primary">{b.title}</h3>
                    <p className="text-sm text-gray-600">{b.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="flex flex-wrap gap-4">
              <Link to="/about" className="bg-primary hover:bg-primary-hover text-white px-7 py-3 rounded-full font-semibold transition-colors inline-flex items-center gap-2">Know more about us <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/hire-professional" className="border-2 border-primary/15 text-primary px-7 py-3 rounded-full font-semibold hover:border-primary transition-colors">Hire a professional</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-20 lg:py-28 bg-gradient-to-b from-tint to-[#F7FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <SectionHeading center={false} eyebrow="Happy Customers" title={stats?.patientsServed ? `${stats.patientsServed.toLocaleString('en-IN')} ${stats.patientsServed === 1 ? 'family trusts' : 'families trust'} Carevia` : 'What families say about us'} />
              {maxSlide > 0 && (
                <div className="flex gap-3 md:mb-12">
                  <button type="button" aria-label="Previous" onClick={() => setSlide((s) => (s <= 0 ? maxSlide : s - 1))} className="w-12 h-12 rounded-full border border-primary/15 bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                  <button type="button" aria-label="Next" onClick={() => setSlide((s) => (s >= maxSlide ? 0 : s + 1))} className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
              )}
            </div>
            <div className="overflow-hidden -mx-3">
              <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `translateX(-${(slide * 100) / perView}%)` }}>
                {testimonials.map((t, i) => (
                  <div key={i} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
                    <div className="h-full bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                      <Quote className="w-9 h-9 text-secondary/40 mb-4" />
                      <p className="text-gray-700 leading-relaxed flex-1 mb-6">“{t.quote}”</p>
                      <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                        <span className="relative w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 overflow-hidden">
                          {initials(t.name)}
                          {t.img && <img src={t.img} alt={t.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />}
                        </span>
                        <div>
                          <p className="font-bold text-primary capitalize">{String(t.name || '').toLowerCase()}</p>
                          {t.role && <p className="text-xs text-gray-500 capitalize">{String(t.role).toLowerCase()}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {maxSlide > 0 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                  <button key={i} type="button" aria-label={`Go to slide ${i + 1}`} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all ${slide === i ? 'w-8 bg-secondary' : 'w-2 bg-primary/20'}`} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. Expert panel */}
      {experts.length > 0 && (
        <section id="experts" className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <SectionHeading center={false} eyebrow="Our Expert Panel" title="Meet our doctors" desc="Qualified, experienced doctors available for home visits, clinic visits and online consultations." />
              <Reveal className="mb-12"><Link to="/doctors" className="text-secondary font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">View all doctors <ArrowRight className="w-4 h-4" /></Link></Reveal>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {experts.map((d, i) => (
                <Reveal key={d.id} delay={i * 80}>
                  <div className="group h-full bg-[#F7FAFC] rounded-3xl p-5 border border-gray-100 hover:bg-white hover:shadow-2xl transition-all duration-300 flex flex-col">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-tint">
                      <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold font-poppins text-primary/70">{initials(d.name)}</div>
                      {d.img && <img src={d.img} alt={d.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      <span className="absolute top-3 left-3 bg-white/95 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 text-primary">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" /> {d.rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-primary">{d.name}</h3>
                    <p className="text-sm font-medium text-secondary mb-3">{d.spec}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-5 flex-1">
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {d.exp}</span>
                      {d.loc && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {d.loc}</span>}
                    </div>
                    <button type="button" onClick={() => openBooking()} className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors">Book Appointment</button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. Stories & articles */}
      {blog.length > 0 && (
        <section id="stories" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <SectionHeading center={false} eyebrow="Health Stories" title="Recovery tips & care guides" />
            <Reveal className="mb-12"><Link to="/blog" className="text-secondary font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">Read all articles <ArrowRight className="w-4 h-4" /></Link></Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {blog.slice(0, 3).map((b, i) => (
              <Reveal key={b.title} delay={i * 100}>
                <Link to={`/blog/${postSlug(b)}`} className="group block h-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300">
                  <div className="h-52 overflow-hidden"><img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
                  <div className="p-6">
                    <p className="text-xs font-semibold text-secondary mb-2">{b.date}</p>
                    <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-secondary transition-colors">{b.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{b.desc}</p>
                    <span className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">Read story <ArrowUpRight className="w-4 h-4" /></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 10. Presence */}
      {states.length > 0 && (
        <section id="cities" className="py-20 lg:py-28 bg-primary relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading light eyebrow="Our Presence" title={`Care in ${cityList.length} ${cityList.length === 1 ? 'city' : 'cities'} across ${states.length} ${states.length === 1 ? 'state' : 'states'}`} desc="Expanding every week. Online consultations are available from anywhere." />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {states.map(([state, names], i) => (
                <Reveal key={state} delay={i * 80}>
                  <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white">{state}</h3>
                      <span className="text-xs font-bold bg-secondary text-white rounded-full px-2.5 py-1">{names.length}</span>
                    </div>
                    <ul className="space-y-2">
                      {names.map((n) => <li key={n} className="flex items-center gap-2 text-sm text-white/75"><MapPin className="w-3.5 h-3.5 text-secondary" />{n}</li>)}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. Join as a professional */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-7xl mx-auto bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden grid lg:grid-cols-2 items-center">
          <div className="p-8 sm:p-12 lg:p-14">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary mb-3"><span className="w-6 h-0.5 bg-secondary" /> Partner With Us</span>
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary mb-4">Are you a healthcare professional?</h2>
            <p className="text-gray-600 mb-8">Doctors, physiotherapists, nurses and caregivers can join Carevia, set their own fees and schedule, and start receiving bookings as soon as their profile is live.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="bg-secondary hover:bg-secondary-hover text-white px-7 py-3 rounded-full font-semibold transition-colors inline-flex items-center gap-2">Register as a professional <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/jobs" className="border-2 border-primary/15 text-primary px-7 py-3 rounded-full font-semibold hover:border-primary transition-colors">View openings</Link>
            </div>
          </div>
          <img src="/career-hero.jpg" alt="Carevia healthcare professionals" className="w-full h-72 lg:h-full object-cover" />
        </Reveal>
      </section>

      {/* 12. FAQ */}
      {faqs.length > 0 && (
        <section id="faq" className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1.6fr] gap-12">
            <div>
              <SectionHeading center={false} eyebrow="FAQ" title="Frequently asked questions" desc="Everything you need to know about booking care with Carevia." />
              {contact.phone && (
                <Reveal className="bg-tint rounded-3xl p-7 -mt-4">
                  <p className="font-bold text-primary mb-1">Still have questions?</p>
                  <p className="text-sm text-gray-600 mb-5">Speak to a care advisor{contact.hours ? ` — ${contact.hours.toLowerCase()}` : ''}.</p>
                  <div className="flex flex-wrap gap-3">
                    <a href={contact.phoneHref} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-hover transition-colors"><PhoneCall className="w-4 h-4" /> {contact.phone}</a>
                    <button type="button" onClick={() => setEnquiry({})} className="inline-flex items-center gap-2 border-2 border-primary/15 text-primary px-6 py-3 rounded-full font-semibold hover:border-primary transition-colors">Request a callback</button>
                  </div>
                </Reveal>
              )}
            </div>
            <div className="space-y-3">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={f.q} delay={Math.min(i, 5) * 50}>
                    <div className={`rounded-2xl border transition-colors ${open ? 'border-primary/20 bg-[#F7FAFC]' : 'border-gray-100 bg-white'}`}>
                      <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)} className="w-full flex items-center justify-between gap-4 text-left px-6 py-5">
                        <span className="font-semibold text-primary">{f.q}</span>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-secondary text-white' : 'bg-tint text-primary'}`}>{open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</span>
                      </button>
                      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden"><p className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">{f.a}</p></div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 13. Closing CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-5xl mx-auto bg-gradient-to-r from-secondary to-secondary-hover rounded-[32px] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins mb-5">Ready to bring care home?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-10">Book a verified professional in under 60 seconds.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button type="button" onClick={() => openBooking()} className="bg-white text-secondary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition shadow-lg">Book Your Visit Now</button>
              <button type="button" onClick={() => setEnquiry({})} className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition">Request a Callback</button>
              {contact.phone && (
                <a href={contact.phoneHref} className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition flex items-center justify-center gap-2"><PhoneCall className="w-5 h-5" /> {contact.phone}</a>
              )}
              {contact.whatsappHref && (
                <a href={contact.whatsappHref} target="_blank" rel="noreferrer" className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition flex items-center justify-center gap-2"><MessageCircle className="w-5 h-5" /> WhatsApp</a>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />

      {/* Floating WhatsApp button */}
      <a href={contact.whatsappHref || contact.phoneHref || '#'} target={contact.whatsappHref ? '_blank' : undefined} rel="noreferrer" aria-label="Contact us" className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group">
        <span className="absolute w-full h-full rounded-full bg-[#25D366] opacity-50 animate-ping group-hover:animate-none" />
        <MessageCircle className="w-6 h-6 relative z-10" />
      </a>

      <EnquiryModal open={!!enquiry} onClose={() => setEnquiry(null)} type={enquiry?.type} service={enquiry?.service} plan={enquiry?.plan} />
      <BookingModal isOpen={booking.open} onClose={() => setBooking({ open: false, type: undefined })} serviceType={booking.type} />
    </div>
  );
}
