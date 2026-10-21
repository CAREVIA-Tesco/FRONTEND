import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, PhoneCall, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Plus, Minus, MapPin,
  ShieldCheck, Clock, Wallet, RotateCcw, ClipboardCheck, House, Activity, MessageCircleMore, ArrowUpRight,
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
  { icon: PhoneCall, title: 'Book or request a call', desc: 'Pick an open slot online, or leave your number and a Carevia care advisor calls you back.' },
  { icon: ClipboardCheck, title: 'Understand the need', desc: 'We learn about the patient’s condition and match a qualified professional to it.' },
  { icon: House, title: 'Care at your doorstep', desc: 'A verified doctor, nurse, physio or caregiver visits your home – or consults online.' },
  { icon: Activity, title: 'Records & follow-up', desc: 'Vitals, notes and prescriptions are saved to your dashboard after every visit.' },
];

const BENEFITS = [
  { icon: ShieldCheck, title: 'Verified Professionals', desc: 'Qualifications and registration checked at onboarding' },
  { icon: Clock, title: '24/7 Booking', desc: 'Book anytime and see real open slots instantly' },
  { icon: Wallet, title: 'Transparent Pricing', desc: 'See the exact fee before you pay – no hidden charges' },
  { icon: RotateCcw, title: 'Easy Refunds', desc: 'Cancelled paid appointments are refunded automatically' },
];

const initials = (name = '') => name.replace(/^Dr\.?\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const fmtNum = (n) => (typeof n === 'number' ? n.toLocaleString('en-IN') : n);

function Heading({ eyebrow, title, desc, light = false, className = '' }) {
  return (
    <Reveal className={`text-center max-w-3xl mx-auto mb-14 ${className}`}>
      {eyebrow && <p className={`eyebrow mb-4 ${light ? 'text-[#5ED3CF]' : 'text-accent'}`}>{eyebrow}</p>}
      <h2 className={`font-poppins font-semibold text-[34px] md:text-[46px] leading-[1.15] ${light ? 'text-white' : 'text-primary'}`}>{title}</h2>
      {desc && <p className={`mt-5 text-lg md:text-[21px] leading-relaxed font-light ${light ? 'text-white/70' : 'text-gray-600'}`}>{desc}</p>}
    </Reveal>
  );
}

function TestimonialCard({ t }) {
  const [open, setOpen] = useState(false);
  const long = String(t.quote || '').length > 190;
  return (
    <div className="h-full bg-white rounded-xl border border-black/[0.06] border-l-[5px] border-l-accent shadow-[0_2px_14px_rgba(15,58,60,0.05)] p-7 flex flex-col">
      <span className="font-poppins text-6xl leading-none text-accent/30 h-8 mb-4 select-none" aria-hidden="true">“</span>
      <p className={`text-[17px] leading-[1.75] text-gray-700 ${open ? '' : 'line-clamp-6'}`}>{t.quote}</p>
      {long && <button type="button" onClick={() => setOpen(!open)} className="self-start mt-2 font-bold text-accent underline underline-offset-4 text-[15px]">{open ? 'Read less' : 'Read more'}</button>}
      <div className="mt-auto pt-6">
        <div className="border-t border-gray-100 pt-5 flex items-center gap-4">
          <span className="relative w-14 h-14 rounded-full bg-mint border border-accent/25 text-accent text-xl font-bold flex items-center justify-center overflow-hidden shrink-0">
            {initials(t.name).slice(0, 1)}
            {t.img && <img src={t.img} alt={t.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />}
          </span>
          <div>
            <p className="font-bold text-primary text-[17px] capitalize">{String(t.name || '').toLowerCase()}</p>
            {t.role && <p className="text-sm text-gray-500 capitalize">{String(t.role).toLowerCase()}</p>}
          </div>
        </div>
      </div>
    </div>
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
  const [enquiry, setEnquiry] = useState(null);
  const [careChoice, setCareChoice] = useState('');
  const [slide, setSlide] = useState(0);
  const [perView, setPerView] = useState(3);
  const [openFaq, setOpenFaq] = useState(0);

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
  const selected = SERVICES.find((s) => s.key === careChoice);

  // ---- live numbers -------------------------------------------------------
  const todayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const doctors = providers.filter((p) => p.isDoctor);
  const doctorsToday = doctors.filter((p) => (p.schedule?.[todayKey] || []).length).length;
  const onlineFees = doctors.map((p) => p.onlineFee).filter(Boolean);
  const minOnlineFee = onlineFees.length ? Math.min(...onlineFees) : null;
  const experts = [...doctors].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || (b.experience || 0) - (a.experience || 0)).slice(0, 4);
  const priceFor = (key) => (key === 'doctor-visit' ? serviceStats(stats, key, true)?.minFee : serviceStats(stats, key)?.minFee);

  // hero floating cards and stats band: only real, non-zero numbers – padded with service promises
  const liveTiles = useMemo(() => (stats ? [
    { value: stats.providers, label: stats.providers === 1 ? 'Verified professional' : 'Verified professionals' },
    { value: stats.patientsServed, label: stats.patientsServed === 1 ? 'Patient served' : 'Patients served' },
    { value: stats.completedVisits, label: stats.completedVisits === 1 ? 'Home visit completed' : 'Home visits completed' },
    { value: stats.cities, label: stats.cities === 1 ? 'City served' : 'Cities served' },
    stats.rating ? { value: `${stats.rating}★`, label: `Rating · ${stats.reviews} reviews` } : null,
  ].filter((t) => t && t.value) : []), [stats]);
  const promiseTiles = [{ value: '24/7', label: 'Online booking' }, { value: '100%', label: 'Verified professionals' }, { value: `${SERVICES.length}`, label: 'Care services' }];
  const heroTiles = [...liveTiles, ...promiseTiles].slice(0, 3);
  const bandTiles = [...liveTiles, ...promiseTiles].slice(0, 3);

  // offers built from the pricing rules + live fees
  const offers = useMemo(() => {
    if (!rules) return [];
    const list = [];
    const physio = packagePrices(priceFor('physiotherapy'), rules);
    if (physio) list.push({ key: 'physiotherapy', img: '/physio-section.png', badge: `${rules.packDiscountPct}% Off`, title: 'Physiotherapy', service: 'Physiotherapy', plan: `${physio.packSessions}-Session Pack`, line: `${physio.packSessions}-session pack at ${inr(physio.perSession)} per session – save ${inr(physio.packSaving)}` });
    const care = packagePrices(priceFor('care-taker'), rules);
    if (care) list.push({ key: 'care-taker', img: '/caretaker-hero.png', badge: 'Monthly Plan', title: 'Eldercare', service: 'Care Taker', plan: 'Monthly Care Plan', line: `Full-month care taker plan from ${inr(care.monthly)}${rules.emiMinimum && care.monthly >= rules.emiMinimum ? ' · EMI available' : ''}` });
    const nurse = packagePrices(priceFor('nurse-care'), rules);
    if (nurse) list.push({ key: 'nurse-care', img: '/nurse-hero.jpg', badge: `${rules.packDiscountPct}% Off`, title: 'Nursing Care', service: 'Nurse Care', plan: `${nurse.packSessions}-Visit Pack`, line: `${nurse.packSessions}-visit nursing pack at ${inr(nurse.perSession)} per visit` });
    if (minOnlineFee) list.push({ key: 'doctor-visit', img: '/home-hero.jpg', badge: `From ${inr(minOnlineFee)}`, title: 'Doctor Consult', line: `Consult a doctor from home – private audio consult from ${inr(minOnlineFee)}` });
    return list.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, stats, minOnlineFee]);

  // cities grouped by state
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
    const t = setInterval(() => setSlide((s) => (s >= maxSlide ? 0 : s + 1)), 6000);
    return () => clearInterval(t);
  }, [maxSlide]);

  const chat = () => (contact.whatsappHref ? window.open(contact.whatsappHref, '_blank', 'noopener') : setEnquiry({}));

  return (
    <div className="theme-portea font-sans text-primary bg-white min-h-screen relative overflow-x-hidden">
      <SiteHeader />

      {/* 1. Hero */}
      <section id="home" className="relative bg-tint pt-[76px] lg:pt-[100px] overflow-hidden">
        {/* photo, fading into the cream background */}
        <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:top-[100px] w-full lg:w-[54%] h-[320px] sm:h-[420px] lg:h-auto">
          <img src="/doctor-hero.png" alt="Carevia doctor visiting a patient at home" className="absolute inset-0 w-full h-full object-cover object-[65%_center]" />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-tint via-tint/30 to-transparent lg:via-tint/10" />
        </div>

        <div className="relative max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-[5.5%] -mt-24 lg:mt-0 lg:min-h-[700px] flex items-center">
          <div className="relative z-10 w-full lg:w-[48%] py-10 lg:py-24">
            <Reveal>
              <p className="eyebrow text-accent mb-6">Home healthcare{stats?.cities ? ` across ${stats.cities} ${stats.cities === 1 ? 'city' : 'cities'}` : ''} · verified professionals</p>
              <h1 className="font-poppins font-semibold text-primary text-[42px] sm:text-[56px] xl:text-[68px] leading-[1.12] tracking-[-0.01em]">
                Trusted Medical Care,
                <span className="block italic relative w-fit pb-3">
                  Delivered to Your Home
                  <svg className="absolute left-0 -bottom-1 w-full h-4" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M3 11 C 120 3, 280 3, 397 9" stroke="#F05A22" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="mt-7 text-lg sm:text-[22px] leading-relaxed text-gray-600 font-light max-w-[640px]">
                Doctors, nurses, physiotherapists and caregivers who visit your home or consult online
                {minOnlineFee ? ` – online consultations start at just ${inr(minOnlineFee)}.` : '.'}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="bg-white rounded-full shadow-[0_12px_40px_rgba(15,58,60,0.12)] p-2 pl-4 sm:pl-6 flex items-center gap-3 w-full sm:w-auto">
                  <label className="relative flex-1 sm:w-[270px]">
                    <span className="sr-only">What care do you need?</span>
                    <select
                      aria-label="What care do you need?"
                      value={careChoice}
                      onChange={(e) => setCareChoice(e.target.value)}
                      className="w-full appearance-none bg-transparent text-primary text-[15px] sm:text-[17px] outline-none py-3 pr-7 cursor-pointer"
                    >
                      <option value="">What care do you need?</option>
                      {SERVICES.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}
                    </select>
                    <ChevronDown className="w-5 h-5 text-accent absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
                  </label>
                  <span className="w-px h-9 bg-gray-200" />
                  <button type="button" onClick={() => openBooking(selected ? BOOKING_TYPE(selected.key) : undefined)} className="bg-secondary hover:bg-secondary-hover text-white px-5 sm:px-7 py-3.5 rounded-full font-bold text-[17px] sm:text-[19px] whitespace-nowrap transition-colors">
                    Book Now
                  </button>
                </div>
                {contact.phone && (
                  <a href={contact.phoneHref} className="flex items-center gap-3 font-bold text-primary text-[18px] hover:text-accent transition-colors whitespace-nowrap">
                    <Phone className="w-5 h-5 text-accent fill-accent" /> {contact.phone}
                  </a>
                )}
              </div>
              <button type="button" onClick={() => setEnquiry({ service: selected?.title })} className="mt-6 text-[15px] font-semibold text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent">
                Talk to a care advisor
              </button>
              <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {doctorsToday} {doctorsToday === 1 ? 'Doctor is' : 'Doctors are'} available today
              </p>
            </Reveal>
          </div>

          {/* floating stat cards */}
          <div className="hidden lg:block absolute inset-y-0 left-[49%] w-[18%] pointer-events-none">
            {heroTiles.map((t, i) => (
              <div key={t.label} style={{ top: `${[16, 44, 72][i]}%`, left: `${[18, 0, 24][i]}%` }} className={`absolute bg-white rounded-xl px-7 py-6 shadow-[0_14px_40px_rgba(15,58,60,0.12)] whitespace-nowrap ${i === 1 ? 'animate-float-delayed' : 'animate-float'}`}>
                <p className="text-[28px] font-bold text-primary leading-none">{fmtNum(t.value)}{typeof t.value === 'number' && t.value >= 10 ? '+' : ''}</p>
                <p className="mt-3 text-[13px] font-semibold tracking-[0.14em] uppercase text-gray-500">{t.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* mobile stat chips */}
        <div className="lg:hidden relative px-4 sm:px-8 pb-10 grid grid-cols-3 gap-3">
          {heroTiles.map((t) => (
            <div key={t.label} className="bg-white rounded-xl p-3 shadow-sm text-center">
              <p className="text-xl font-bold text-primary">{fmtNum(t.value)}</p>
              <p className="mt-1 text-[10px] font-semibold tracking-wider uppercase text-gray-500 leading-tight">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Services */}
      <section id="services" className="py-20 lg:py-28 bg-cream">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-8 lg:px-[8%]">
          <Heading eyebrow="What we do" title="Healthcare Services at Your Doorstep" desc="Carevia brings a full range of medical and care services to patients at home, including:" />
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {SERVICES.map((s, i) => {
              const price = priceFor(s.key);
              return (
                <Reveal key={s.key} delay={(i % 3) * 70}>
                  <div className="group h-full bg-white rounded-xl border border-black/[0.07] px-5 py-4 flex items-center gap-4 hover:shadow-[0_12px_32px_rgba(15,58,60,0.10)] hover:border-accent/30 transition-all duration-300">
                    <Link to={s.link} className="w-14 h-14 sm:w-[70px] sm:h-[70px] rounded-lg overflow-hidden bg-mint shrink-0" aria-hidden="true" tabIndex={-1}>
                      <img src={s.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </Link>
                    <Link to={s.link} className="flex-1 min-w-0" aria-label={`Know more about ${s.title}`}>
                      <span className="flex items-center gap-3">
                        <span className="font-bold text-primary text-[17px] sm:text-[19px] xl:text-[21px] leading-tight group-hover:text-accent transition-colors">{s.title}</span>
                        <ArrowRight className="hidden sm:block w-4 h-4 text-gray-400 shrink-0 group-hover:translate-x-1 group-hover:text-accent transition-all" />
                      </span>
                      <span className="block text-[13px] text-gray-500 mt-0.5">{price ? `From ${inr(price)}` : s.short}</span>
                    </Link>
                    <button type="button" onClick={() => openBooking(BOOKING_TYPE(s.key))} className="shrink-0 border border-accent/40 text-accent hover:bg-accent hover:text-white rounded-full px-3 sm:px-4 py-2 text-[14px] sm:text-[15px] font-bold transition-colors">
                      Book Now
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal className="text-center mt-10">
            <Link to="/services" className="inline-flex items-center gap-2 font-bold text-accent hover:gap-3 transition-all">View all services <ArrowRight className="w-4 h-4" /></Link>
          </Reveal>
        </div>
      </section>

      {/* 3. How it works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-gradient-to-br from-[#0B2E31] via-[#0E3B3E] to-[#0F4447] relative overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="relative max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-[5.5%]">
          <Heading light eyebrow="A simple, guided process" title="How Carevia Works" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.04] p-8 overflow-hidden hover:bg-white/[0.07] transition-colors">
                  <span className="absolute -top-3 right-4 font-poppins font-bold text-[120px] leading-none text-white/[0.05] select-none" aria-hidden="true">{i + 1}</span>
                  <span className="relative w-16 h-16 rounded-xl bg-[#1E5A5C]/70 border border-white/10 flex items-center justify-center text-[#7DE0DC] mb-8"><s.icon className="w-7 h-7" /></span>
                  <h3 className="relative text-white font-bold text-[22px] mb-3">{s.title}</h3>
                  <p className="relative text-white/70 text-[16px] leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Offers */}
      {offers.length > 0 && (
        <section id="offers" className="py-20 lg:py-28 bg-white">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-[5.5%]">
            <Heading eyebrow="Limited-time savings" title="New Offers" />
            <div className="flex flex-wrap justify-center gap-8">
              {offers.map((o, i) => (
                <Reveal key={o.key} delay={i * 100} className="w-full md:w-[calc(50%-16px)] xl:w-[calc(33.333%-22px)]">
                  <div className="h-full min-h-[300px] rounded-2xl border border-black/[0.07] overflow-hidden grid grid-cols-[1.4fr_1fr] bg-[#F5F0E7] hover:shadow-xl transition-shadow">
                    <div className="p-7 lg:p-9 flex flex-col">
                      <span className="self-start bg-accent text-white text-[15px] font-medium px-3.5 py-1 rounded-full mb-4">{o.badge}</span>
                      <h3 className="font-bold text-primary text-[26px] mb-3">{o.title}</h3>
                      <p className="text-gray-600 text-[17px] leading-snug mb-6">{o.line}</p>
                      <div className="mt-auto">
                        <button type="button" onClick={() => (o.plan ? setEnquiry({ type: 'plan', service: o.service, plan: o.plan }) : openBooking(BOOKING_TYPE(o.key)))} className="bg-secondary hover:bg-secondary-hover text-white text-[16px] px-6 py-2.5 rounded-md transition-colors">
                          {o.plan ? 'Get this plan' : 'Book Now'}
                        </button>
                        <p className="text-xs text-gray-500 mt-2">*T&amp;C Apply</p>
                      </div>
                    </div>
                    <div className="bg-mint relative"><img src={o.img} alt={o.title} className="absolute inset-0 w-full h-full object-cover" /></div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Stats band */}
      <section className="bg-tint dot-grid-dark border-y border-black/[0.04]">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-[5.5%] py-14 grid grid-cols-2 lg:grid-cols-4 lg:divide-x divide-black/10">
          <div className="col-span-2 lg:col-span-1 text-center px-6 py-6">
            <p className="text-[40px] lg:text-[50px] font-bold text-accent leading-tight">Trusted Care</p>
            <p className="mt-3 text-[14px] font-bold tracking-[0.16em] uppercase text-primary">Home healthcare, done right</p>
          </div>
          {bandTiles.map((t) => (
            <div key={t.label} className="text-center px-6 py-6">
              <p className="text-[40px] lg:text-[50px] font-bold text-accent leading-tight">{fmtNum(t.value)}</p>
              <p className="mt-3 text-[14px] font-bold tracking-[0.16em] uppercase text-primary">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-20 lg:py-28 bg-white">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-[5.5%]">
            <Heading title="Happy Customers" desc={stats?.patientsServed ? `${stats.patientsServed.toLocaleString('en-IN')} ${stats.patientsServed === 1 ? 'family has' : 'families have'} trusted Carevia with their care. Here is what they say.` : 'Take it from the families we care for – here is what they say about Carevia.'} />
            <div className="relative">
              <div className="overflow-hidden -mx-3">
                <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `translateX(-${(slide * 100) / perView}%)` }}>
                  {testimonials.map((t, i) => (
                    <div key={i} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}><TestimonialCard t={t} /></div>
                  ))}
                </div>
              </div>
              {maxSlide > 0 && (
                <>
                  <button type="button" aria-label="Previous" onClick={() => setSlide((s) => (s <= 0 ? maxSlide : s - 1))} className="absolute -left-2 lg:-left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border border-black/10 shadow-lg text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                  <button type="button" aria-label="Next" onClick={() => setSlide((s) => (s >= maxSlide ? 0 : s + 1))} className="absolute -right-2 lg:-right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border border-black/10 shadow-lg text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-colors"><ChevronRight className="w-6 h-6" /></button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 7. Expert doctor panel */}
      {experts.length > 0 && (
        <section id="experts" className="py-20 lg:py-28 bg-tint">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8">
            <Heading eyebrow="Our medical team" title="Meet Our Expert Doctors" className="!mb-10" />
            <div className="flex flex-wrap justify-center gap-10">
              {experts.map((d, i) => (
                <Reveal key={d.id} delay={i * 80} className="w-full sm:w-[calc(50%-20px)] lg:w-[440px]">
                  <div className="h-full bg-white rounded-lg px-10 py-9 text-center flex flex-col items-center shadow-[0_2px_14px_rgba(15,58,60,0.04)] hover:shadow-xl transition-shadow">
                    <div className="relative w-56 h-56 rounded-full overflow-hidden bg-mint mb-8">
                      <span className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-accent/60">{initials(d.name)}</span>
                      {d.img && <img src={d.img} alt={d.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="relative w-full h-full object-cover" />}
                    </div>
                    <h3 className="font-bold text-gray-600 text-[26px]">{d.name}</h3>
                    <p className="mt-3 text-[15px] font-bold tracking-[0.1em] uppercase text-accent">{d.spec}</p>
                    <p className="mt-5 text-[17px] leading-relaxed text-gray-600 flex-1">
                      {d.name.replace(/^Dr\.?\s*/i, 'Dr ')} has {d.exp ? d.exp.toLowerCase() : 'years'} of experience
                      {d.qualification ? ` and holds ${d.qualification}` : ''}.{d.loc ? ` Consults in ${d.loc}` : ''}{d.languages?.length ? ` in ${[].concat(d.languages).join(', ')}` : ''}.
                      {d.rating && d.rating !== 'New' ? ` Rated ${d.rating}/5 by patients.` : ''}
                    </p>
                    <button type="button" onClick={() => openBooking()} className="mt-7 font-bold text-accent text-[18px] inline-flex items-center gap-1.5 hover:gap-3 transition-all">Book Appointment <ArrowRight className="w-4 h-4" /></button>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="text-center mt-10"><Link to="/doctors" className="font-bold text-accent inline-flex items-center gap-2 hover:gap-3 transition-all">View all doctors <ArrowRight className="w-4 h-4" /></Link></Reveal>
          </div>
        </section>
      )}

      {/* 8. Why Carevia */}
      <section id="about" className="py-20 lg:py-28 bg-white overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal className="relative">
            <img src="/caretaker-section.png" alt="Carevia caregiver with an elderly couple" className="w-full h-[320px] sm:h-[460px] object-cover rounded-2xl" />
            <div className="absolute -bottom-6 right-6 bg-white rounded-xl px-7 py-5 shadow-[0_14px_40px_rgba(15,58,60,0.12)]">
              <p className="text-[28px] font-bold text-primary leading-none">{SERVICES.length}</p>
              <p className="mt-2 text-[13px] font-semibold tracking-[0.14em] uppercase text-gray-500">Care services</p>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow text-accent mb-4">About Carevia</p>
              <h2 className="font-poppins font-semibold text-[34px] md:text-[46px] leading-[1.15] text-primary">Trusted care for every stage of life</h2>
              <p className="mt-5 text-lg leading-relaxed text-gray-600 font-light">Carevia brings hospital-quality care home. We connect families with qualified doctors, physiotherapists, nurses and caregivers – and keep every visit, prescription and payment in one place.</p>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-4 mt-8 mb-9">
              {BENEFITS.map((b, i) => (
                <Reveal key={b.title} delay={i * 70} className="flex gap-4 p-4 rounded-xl border border-black/[0.06] hover:border-accent/30 transition-colors">
                  <span className="w-12 h-12 rounded-lg bg-mint text-accent flex items-center justify-center shrink-0"><b.icon className="w-5 h-5" /></span>
                  <div>
                    <h3 className="font-bold text-primary">{b.title}</h3>
                    <p className="text-sm text-gray-600">{b.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="flex flex-wrap gap-4">
              <Link to="/about" className="bg-secondary hover:bg-secondary-hover text-white px-7 py-3.5 rounded-lg font-bold transition-colors">Know more about us</Link>
              <Link to="/hire-professional" className="border border-accent/40 text-accent px-7 py-3.5 rounded-lg font-bold hover:bg-accent hover:text-white transition-colors">Hire a professional</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 9. Stories & articles */}
      {blog.length > 0 && (
        <section id="stories" className="py-20 lg:py-28 bg-cream">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-[5.5%]">
            <Heading eyebrow="Health stories" title="Recovery Tips & Care Guides" />
            <div className="grid md:grid-cols-3 gap-8">
              {blog.slice(0, 3).map((b, i) => (
                <Reveal key={b.title} delay={i * 100}>
                  <Link to={`/blog/${postSlug(b)}`} className="group block h-full bg-white rounded-xl overflow-hidden border border-black/[0.06] hover:shadow-xl transition-shadow">
                    <div className="h-56 overflow-hidden bg-mint"><img src={b.img} alt={b.title} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
                    <div className="p-7">
                      <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-accent mb-3">{b.category || 'Health'} · {b.date}</p>
                      <h3 className="text-[21px] font-bold text-primary mb-3 group-hover:text-accent transition-colors">{b.title}</h3>
                      <p className="text-[15px] text-gray-600 line-clamp-2 mb-5">{b.desc}</p>
                      <span className="font-bold text-accent inline-flex items-center gap-1.5 group-hover:gap-3 transition-all">Read story <ArrowUpRight className="w-4 h-4" /></span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Presence */}
      {states.length > 0 && (
        <section id="cities" className="py-20 lg:py-28 bg-white">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8">
            <Heading eyebrow="Our presence" title={`Care in ${cityList.length} ${cityList.length === 1 ? 'city' : 'cities'} across ${states.length} ${states.length === 1 ? 'state' : 'states'}`} desc="Expanding every week. Online consultations are available from anywhere." />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {states.map(([state, names], i) => (
                <Reveal key={state} delay={i * 70}>
                  <div className="h-full rounded-xl border border-black/[0.07] p-6 hover:border-accent/40 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-primary text-lg">{state}</h3>
                      <span className="text-xs font-bold bg-mint text-accent rounded-full px-2.5 py-1">{names.length}</span>
                    </div>
                    <ul className="space-y-2">
                      {names.map((n) => <li key={n} className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4 text-accent" />{n}</li>)}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. Partner / join */}
      <section className="py-20 bg-tint">
        <Reveal className="max-w-[1500px] mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl overflow-hidden grid lg:grid-cols-2 items-center border border-black/[0.05]">
            <div className="p-8 sm:p-12 lg:p-16">
              <p className="eyebrow text-accent mb-4">Partner with us</p>
              <h2 className="font-poppins font-semibold text-[32px] md:text-[42px] leading-tight text-primary mb-4">Are you a healthcare professional?</h2>
              <p className="text-gray-600 text-lg mb-8 font-light">Doctors, physiotherapists, nurses and caregivers can join Carevia, set their own fees and schedule, and start receiving bookings as soon as their profile is live.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login" className="bg-secondary hover:bg-secondary-hover text-white px-7 py-3.5 rounded-lg font-bold transition-colors">Register as a professional</Link>
                <Link to="/jobs" className="border border-accent/40 text-accent px-7 py-3.5 rounded-lg font-bold hover:bg-accent hover:text-white transition-colors">View openings</Link>
              </div>
            </div>
            <img src="/career-hero.jpg" alt="Carevia healthcare professionals" className="w-full h-72 lg:h-full object-cover" />
          </div>
        </Reveal>
      </section>

      {/* 12. FAQ */}
      {faqs.length > 0 && (
        <section id="faq" className="py-20 lg:py-28 bg-white">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-8">
            <Heading eyebrow="Got questions?" title="Frequently Asked Questions" desc="Everything you need to know about booking care with Carevia." />
            <div className="space-y-4">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={f.q} delay={Math.min(i, 5) * 40}>
                    <div className={`rounded-xl border transition-colors ${open ? 'border-accent/40 bg-cream' : 'border-black/[0.08] bg-white'}`}>
                      <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)} className="w-full flex items-center justify-between gap-4 text-left px-7 py-6">
                        <span className="font-bold text-primary text-[18px]">{f.q}</span>
                        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-accent text-white' : 'bg-mint text-accent'}`}>{open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</span>
                      </button>
                      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden"><p className="px-7 pb-6 text-gray-600 text-[16px] leading-relaxed">{f.a}</p></div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            {contact.phone && (
              <Reveal className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                <span className="text-gray-600">Still have questions? Speak to a care advisor{contact.hours ? ` – ${contact.hours.toLowerCase()}` : ''}.</span>
                <a href={contact.phoneHref} className="inline-flex items-center gap-2 font-bold text-primary"><Phone className="w-4 h-4 text-accent fill-accent" /> {contact.phone}</a>
                <button type="button" onClick={() => setEnquiry({})} className="font-bold text-accent underline underline-offset-4">Request a callback</button>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* 13. Closing CTA */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-[#0B2E31] via-[#0E3B3E] to-[#0F4447] relative overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <Reveal className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="font-poppins font-semibold text-[34px] md:text-[50px] leading-tight mb-5">Need care at home? We are one call away.</h2>
          <p className="text-lg md:text-xl text-white/75 mb-10 font-light">Book a verified professional in under 60 seconds, or let our care advisor plan it with you.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button type="button" onClick={() => openBooking()} className="bg-secondary hover:bg-secondary-hover text-white px-9 py-4 rounded-lg font-bold text-lg transition-colors">Book Now</button>
            <button type="button" onClick={() => setEnquiry({})} className="border border-white/40 text-white px-9 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors">Request a Callback</button>
            {contact.phone && <a href={contact.phoneHref} className="flex items-center justify-center gap-2 px-6 py-4 font-bold text-lg"><Phone className="w-5 h-5 fill-[#7DE0DC] text-[#7DE0DC]" /> {contact.phone}</a>}
          </div>
        </Reveal>
      </section>

      <SiteFooter />

      {/* Floating chat bubble */}
      <button type="button" onClick={chat} aria-label="Chat with us" className="fixed bottom-6 right-6 z-40 w-[72px] h-[64px] text-accent hover:scale-105 transition-transform drop-shadow-lg">
        <MessageCircleMore className="w-full h-full fill-accent text-white" strokeWidth={1.4} />
      </button>

      <EnquiryModal open={!!enquiry} onClose={() => setEnquiry(null)} type={enquiry?.type} service={enquiry?.service} plan={enquiry?.plan} />
      <BookingModal isOpen={booking.open} onClose={() => setBooking({ open: false, type: undefined })} serviceType={booking.type} />
    </div>
  );
}
