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
import { useBookNow } from '../components/BookNow';
import Reveal from '../components/Reveal';
import HappyCustomers from '../components/HappyCustomers';
import api from '../services/api';
import { usePublicStats, serviceStats, usePricingRules, packagePrices, inr } from '../services/usePublicStats';
import { useSiteContent, useContact } from '../services/useSiteContent';
import { BOOKING_TYPE, useServicesState } from '../data/services';
import { postSlug } from '../utils/slug';

const STEPS = [
  { icon: PhoneCall, title: 'Book or request a call', desc: 'Pick an open slot online, or leave your number and a Carevaa care advisor calls you back.' },
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
    <Reveal className={`text-center max-w-3xl mx-auto mb-9 lg:mb-12 ${className}`}>
      {eyebrow && <p className={`eyebrow mb-4 ${light ? 'text-on-deep' : 'text-accent'}`}>{eyebrow}</p>}
      <h2 className={`font-poppins font-semibold text-[28px] md:text-[34px] xl:text-[40px] leading-[1.18] ${light ? 'text-white' : 'text-primary'}`}>{title}</h2>
      {desc && <p className={`mt-4 text-[15px] md:text-lg leading-relaxed font-light ${light ? 'text-white/70' : 'text-gray-600'}`}>{desc}</p>}
    </Reveal>
  );
}

// homepage numbers band – used until the admin sets their own in Website Content → Homepage numbers
const HOME_NUMBERS = [
  { value: '500+', label: 'Verified professionals' },
  { value: '10,000+', label: 'Patients served' },
  { value: '100+', label: 'Hospital partners' },
];


export default function Home() {
  const { list: SERVICES, loaded: servicesLoaded } = useServicesState();
  const stats = usePublicStats();
  const rules = usePricingRules();
  const contact = useContact();
  const cityList = useSiteContent('cities');
  const blog = useSiteContent('blog');
  const faqs = useSiteContent('faqs');

  const [providers, setProviders] = useState([]);
  const [providersLoaded, setProvidersLoaded] = useState(false);
  const [booking, setBooking] = useState({ open: false, type: undefined });
  const [enquiry, setEnquiry] = useState(null);
  const [careChoice, setCareChoice] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    api.getProviders().then((d) => { setProviders(d.providers || []); setProvidersLoaded(true); }).catch(() => {});
  }, []);

  const bookNow = useBookNow();
  const selected = SERVICES.find((s) => s.key === careChoice);

  // ---- live numbers -------------------------------------------------------
  const doctors = providers.filter((p) => p.isDoctor);
  const onlineFees = doctors.map((p) => p.onlineFee).filter(Boolean);
  const minOnlineFee = onlineFees.length ? Math.min(...onlineFees) : null;
  const experts = [...doctors].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || (b.experience || 0) - (a.experience || 0)).slice(0, 4);
  const priceFor = (key) => (key === 'doctor-visit' ? serviceStats(stats, key, true)?.minFee : serviceStats(stats, key)?.minFee);

  // hero: fixed values, so the first screen never changes while live data is loading
  const heroTiles = [{ value: '24/7', label: 'Online booking' }, { value: '100%', label: 'Verified professionals' }, { value: servicesLoaded ? `${SERVICES.length}` : null, label: SERVICES.length === 1 ? 'Care service' : 'Care services' }];
  // numbers band: Admin → Website Content → Homepage numbers (defaults below)
  const numberItems = useSiteContent('home-numbers').filter((x) => x && x.value && x.label && x.show !== 'hide');
  const bandTiles = (numberItems.length ? numberItems : HOME_NUMBERS).slice(0, 3);

  // offers: the admin's own list (Admin → Website Content → Offers); while that is empty,
  // automatic offers built from the pricing rules + live fees
  const customOffers = useSiteContent('offers');
  // Admin → Website Content → Homepage sections: any section can be hidden
  const sectionSettings = useSiteContent('home-sections')[0] || {};
  const on = (k) => sectionSettings[k] !== 'hide';
  const howSteps = useSiteContent('how-it-works');
  const whyPoints = useSiteContent('why-carevaa');
  const steps = howSteps.length ? howSteps.filter((x) => x && x.title).map((x, i) => ({ ...x, icon: STEPS[i % STEPS.length].icon })) : STEPS;
  const benefits = whyPoints.length ? whyPoints.filter((x) => x && x.title).map((x, i) => ({ ...x, icon: BENEFITS[i % BENEFITS.length].icon })) : BENEFITS;
  const autoOffers = useMemo(() => {
    // wait until every input is known, so cards don't appear one by one or change their numbers
    if (!rules || !stats || !providersLoaded) return [];
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
  }, [rules, stats, minOnlineFee, providersLoaded]);
  const offers = customOffers.length
    ? customOffers.filter((o) => o && o.show !== 'hide' && o.title).map((o, i) => ({ key: `offer-${i}`, img: o.img || '/home-hero.jpg', badge: o.badge, title: o.title, line: o.line, service: o.service || o.title, plan: o.plan, terms: o.terms }))
    : on('offersAuto') ? autoOffers : [];

  // cities grouped by state
  const states = useMemo(() => {
    const map = new Map();
    cityList.forEach((c) => { const s = c.desc || 'Other'; map.set(s, [...(map.get(s) || []), c.name]); });
    return [...map.entries()];
  }, [cityList]);

  const chat = () => (contact.whatsappHref ? window.open(contact.whatsappHref, '_blank', 'noopener') : setEnquiry({}));

  return (
    <div className="theme-portea font-sans text-primary bg-white min-h-screen relative overflow-x-hidden">
      <SiteHeader />

      {/* 1. Hero */}
      <section id="home" className="relative bg-tint pt-[72px] lg:pt-[88px] overflow-hidden">
        {/* desktop photo, fading into the background */}
        <div className="hidden lg:block absolute right-0 top-[88px] bottom-0 w-[52%]">
          <img src="/doctor-hero.png" alt="Carevaa doctor visiting a patient at home" className="absolute inset-0 w-full h-full object-cover object-[65%_center]" />
          <div className="absolute inset-0 bg-gradient-to-r from-tint via-tint/5 to-transparent" />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 lg:min-h-[600px] flex items-center">
          <div className="relative z-10 w-full lg:w-[50%] pt-8 pb-6 lg:py-16">
            <Reveal>
              <p className="eyebrow text-accent mb-4 lg:mb-5 !text-[11px] sm:!text-[12.5px]">Home healthcare · verified professionals</p>
              <h1 className="font-poppins font-semibold text-primary text-[34px] sm:text-[44px] lg:text-[46px] xl:text-[54px] leading-[1.12] tracking-[-0.01em]">
                Trusted Medical Care,
                <span className="block italic relative w-fit pb-2">
                  Delivered to Your Home
                  <svg className="absolute left-0 -bottom-1 w-full h-3 text-secondary" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M3 11 C 120 3, 280 3, 397 9" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="mt-5 lg:mt-6 text-base sm:text-lg xl:text-[19px] leading-relaxed text-gray-600 font-light max-w-[560px]">
                Doctors, nurses, physiotherapists and caregivers who visit your home or consult online.
              </p>

              {/* care selector: pill on desktop, card on mobile */}
              <div className="mt-7 lg:mt-9 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="bg-white rounded-2xl sm:rounded-full shadow-[0_12px_40px_color-mix(in_srgb,var(--color-primary)_12%,transparent)] p-2 sm:pl-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <label className="relative flex-1 sm:w-[240px] px-3 sm:px-0">
                    <span className="sr-only">What care do you need?</span>
                    <select
                      aria-label="What care do you need?"
                      value={careChoice}
                      onChange={(e) => setCareChoice(e.target.value)}
                      className="w-full appearance-none bg-transparent text-primary text-[15px] xl:text-base outline-none py-3 pr-7 cursor-pointer"
                    >
                      <option value="">What care do you need?</option>
                      {SERVICES.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}
                    </select>
                    <ChevronDown className="w-5 h-5 text-accent absolute right-3 sm:right-0 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
                  </label>
                  <span className="hidden sm:block w-px h-8 bg-gray-200" />
                  <button type="button" onClick={() => bookNow({ service: selected?.title })} className="bg-secondary hover:bg-secondary-hover text-white px-6 py-3.5 sm:py-3 rounded-xl sm:rounded-full font-bold text-base xl:text-[17px] whitespace-nowrap transition-colors">
                    Book Now
                  </button>
                </div>
              </div>

            </Reveal>
          </div>

          {/* floating stat cards (desktop) */}
          <div className="hidden lg:block absolute inset-y-0 left-[51%] w-[20%] pointer-events-none">
            {heroTiles.map((t, i) => (
              <div key={t.label} style={{ top: `${[14, 42, 70][i]}%`, left: `${[16, 0, 22][i]}%` }} className={`absolute bg-white rounded-xl px-5 xl:px-6 py-4 xl:py-5 shadow-[0_14px_40px_color-mix(in_srgb,var(--color-primary)_12%,transparent)] whitespace-nowrap ${i === 1 ? 'animate-float-delayed' : 'animate-float'}`}>
                <p className="text-[22px] xl:text-[26px] font-bold text-primary leading-none">{t.value === null ? <span className="inline-block h-6 w-8 rounded bg-black/[0.07] animate-pulse align-middle" aria-hidden="true" /> : fmtNum(t.value)}</p>
                <p className="mt-2.5 text-[11px] xl:text-[12px] font-semibold tracking-[0.14em] uppercase text-gray-500">{t.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* mobile / tablet photo with stat chips */}
        <div className="lg:hidden px-5 sm:px-8 pb-10">
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <img src="/doctor-hero.png" alt="Carevaa doctor visiting a patient at home" className="w-full h-60 sm:h-80 object-cover object-[60%_center]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
            <div className="absolute left-3 right-3 bottom-3 grid grid-cols-3 gap-2">
              {heroTiles.map((t) => (
                <div key={t.label} className="bg-white/95 backdrop-blur rounded-xl px-2 py-2.5 text-center">
                  <p className="text-lg font-bold text-primary leading-none">{t.value === null ? <span className="inline-block h-4 w-6 rounded bg-black/[0.07] animate-pulse" aria-hidden="true" /> : fmtNum(t.value)}</p>
                  <p className="mt-1 text-[9px] font-semibold tracking-wider uppercase text-gray-500 leading-tight">{t.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Services */}
      {on('services') && (<>
      <section id="services" className="py-14 lg:py-24 bg-cream">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
          <Heading eyebrow="What we do" title="Healthcare Services at Your Doorstep" desc="From doctor visits and nursing to physiotherapy, elder care and lab tests – verified professionals bring complete, compassionate care to your home." />
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
            {SERVICES.map((s, i) => {
              return (
                <Reveal key={s.key} delay={(i % 3) * 70}>
                  <div className="group h-full bg-white rounded-xl border border-black/[0.07] p-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:border-accent/30 transition-all duration-300">
                    <Link to={s.link} className="w-full h-24 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-mint shrink-0 block" aria-hidden="true" tabIndex={-1}>
                      <img src={s.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </Link>
                    <Link to={s.link} className="flex-1 min-w-0" aria-label={`Know more about ${s.title}`}>
                      <span className="flex items-center gap-3">
                        <span className="font-bold text-primary text-[15px] sm:text-[17px] xl:text-[19px] leading-tight group-hover:text-accent transition-colors">{s.title}</span>
                        <ArrowRight className="hidden sm:block w-4 h-4 text-gray-400 shrink-0 group-hover:translate-x-1 group-hover:text-accent transition-all" />
                      </span>
                      {s.short && <span className="block text-[13px] text-gray-500 mt-0.5">{s.short}</span>}
                    </Link>
                    <button type="button" onClick={() => bookNow({ service: s.title })} className="shrink-0 w-full sm:w-auto border border-accent/40 text-accent hover:bg-accent hover:text-white rounded-full px-3 sm:px-4 py-2 text-[13px] sm:text-[14px] font-bold transition-colors">
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
      </>)}

      {/* 3. How it works */}
      {on('how') && (<>
      <section id="how-it-works" className="py-14 lg:py-24 bg-gradient-to-br from-deep via-deep-2 to-deep-3 relative overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <Heading light eyebrow="A simple, guided process" title="How Carevaa Works" />
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 pb-2">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100} className="w-[80%] shrink-0 snap-start sm:w-auto">
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:p-7 overflow-hidden hover:bg-white/[0.07] transition-colors">
                  <span className="absolute -top-3 right-4 font-poppins font-bold text-[96px] leading-none text-white/[0.06] select-none" aria-hidden="true">{i + 1}</span>
                  <span className="relative w-14 h-14 rounded-xl bg-on-deep/10 border border-white/10 flex items-center justify-center text-on-deep mb-6"><s.icon className="w-6 h-6" /></span>
                  <h3 className="relative text-white font-bold text-lg xl:text-[19px] mb-2.5">{s.title}</h3>
                  <p className="relative text-white/70 text-[15px] leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      </>)}

      {/* 4. Offers */}
      {on('offers') && (<>
      {offers.length > 0 && (
        <section id="offers" className="py-14 lg:py-24 bg-white">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
            <Heading eyebrow="Limited-time savings" title="New Offers" />
            <div className="flex flex-wrap justify-center gap-5 lg:gap-7">
              {offers.map((o, i) => (
                <Reveal key={o.key} delay={i * 100} className="w-full md:w-[calc(50%-16px)] xl:w-[calc(33.333%-22px)]">
                  <div className="h-full min-h-[240px] rounded-2xl border border-black/[0.07] overflow-hidden grid grid-cols-[1.4fr_1fr] bg-tint hover:shadow-xl transition-shadow">
                    <div className="p-5 sm:p-7 flex flex-col">
                      {o.badge && <span className="self-start bg-accent text-white text-[13px] font-medium px-3 py-1 rounded-full mb-3">{o.badge}</span>}
                      <h3 className="font-bold text-primary text-xl lg:text-[22px] mb-2">{o.title}</h3>
                      <p className="text-gray-600 text-[14px] sm:text-[15px] leading-snug mb-5">{o.line}</p>
                      <div className="mt-auto">
                        <button type="button" onClick={() => (o.plan ? setEnquiry({ type: 'plan', service: o.service, plan: o.plan }) : bookNow({ service: o.service || o.title }))} className="bg-secondary hover:bg-secondary-hover text-white text-[15px] px-5 py-2.5 rounded-md transition-colors">
                          {o.plan ? 'Get this plan' : 'Book Now'}
                        </button>
                        {o.terms !== '' && <p className="text-xs text-gray-500 mt-2">{o.terms || '*T&C Apply'}</p>}
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
      </>)}

      {/* 5. Stats band */}
      {on('stats') && (<>
      <section className="bg-tint dot-grid-dark border-y border-black/[0.04]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 py-8 lg:py-12 grid grid-cols-2 lg:grid-cols-4 lg:divide-x divide-black/10">
          <div className="col-span-2 lg:col-span-1 text-center px-4 py-4 lg:py-6">
            <p className="text-[28px] sm:text-[34px] lg:text-[42px] font-bold text-accent leading-tight">Trusted Care</p>
            <p className="mt-2 text-[11px] sm:text-[12.5px] font-bold tracking-[0.14em] uppercase text-primary">Home healthcare, done right</p>
          </div>
          {bandTiles.length ? bandTiles.map((t) => (
            <div key={t.label} className="text-center px-4 py-4 lg:py-6">
              <p className="text-[28px] sm:text-[34px] lg:text-[42px] font-bold text-accent leading-tight">{fmtNum(t.value)}</p>
              <p className="mt-2 text-[11px] sm:text-[12.5px] font-bold tracking-[0.14em] uppercase text-primary">{t.label}</p>
            </div>
          )) : [0, 1, 2].map((i) => (
            <div key={i} className="text-center px-4 py-4 lg:py-6" aria-hidden="true">
              <span className="block mx-auto h-9 lg:h-11 w-16 rounded-lg bg-black/[0.06] animate-pulse" />
              <span className="block mx-auto mt-3 h-3 w-28 rounded bg-black/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
      </section>
      </>)}

      {/* 6. Happy Customers – text and video reviews from Admin → Customer Reviews */}
      {on('testimonials') && <HappyCustomers Heading={Heading} />}

      {/* 7. Expert doctor panel */}
      {on('doctors') && (<>
      {experts.length > 0 && (
        <section id="experts" className="py-14 lg:py-24 bg-tint">
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
            <Heading eyebrow="Our medical team" title="Meet Our Expert Doctors" className="!mb-10" />
            <div className="flex flex-wrap justify-center gap-5 lg:gap-8">
              {experts.map((d, i) => (
                <Reveal key={d.id} delay={i * 80} className="w-full sm:w-[calc(50%-12px)] lg:w-[380px]">
                  <div className="h-full bg-white rounded-xl px-6 sm:px-8 py-8 text-center flex flex-col items-center shadow-[0_2px_14px_color-mix(in_srgb,var(--color-primary)_4%,transparent)] hover:shadow-xl transition-shadow">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden bg-mint mb-6">
                      <span className="absolute inset-0 flex items-center justify-center text-4xl lg:text-5xl font-bold text-accent/60">{initials(d.name)}</span>
                      {d.img && <img src={d.img} alt={d.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="relative w-full h-full object-cover" />}
                    </div>
                    <h3 className="font-bold text-gray-700 text-xl lg:text-[22px]">{d.name}</h3>
                    <p className="mt-2 text-[12.5px] font-bold tracking-[0.12em] uppercase text-accent">{d.spec}</p>
                    <p className="mt-4 text-[15px] leading-relaxed text-gray-600 flex-1">
                      {d.name.replace(/^Dr\.?\s*/i, 'Dr ')} has {d.exp ? d.exp.toLowerCase() : 'years'} of experience
                      {d.qualification ? ` and holds ${d.qualification}` : ''}.{d.loc ? ` Consults in ${d.loc}` : ''}{d.languages?.length ? ` in ${[].concat(d.languages).join(', ')}` : ''}.
                      {d.rating && d.rating !== 'New' ? ` Rated ${d.rating}/5 by patients.` : ''}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
                      <Link to={`/doctors/${d.id}`} className="font-bold text-accent text-base inline-flex items-center gap-1.5 hover:gap-3 transition-all">Know More <ArrowRight className="w-4 h-4" /></Link>
                      <button type="button" onClick={() => setBooking({ open: true, type: undefined, providerId: d.id })} className="font-bold text-secondary text-base">Book</button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="text-center mt-10"><Link to="/doctors" className="font-bold text-accent inline-flex items-center gap-2 hover:gap-3 transition-all">View all doctors <ArrowRight className="w-4 h-4" /></Link></Reveal>
          </div>
        </section>
      )}
      </>)}

      {/* 8. Why Carevaa */}
      {on('why') && (<>
      <section id="about" className="py-14 lg:py-24 bg-white overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal className="relative">
            <img src="/caretaker-section.png" alt="Carevaa caregiver with an elderly couple" className="w-full h-[260px] sm:h-[400px] object-cover rounded-2xl" />
            <div className="absolute -bottom-6 right-6 bg-white rounded-xl px-7 py-5 shadow-[0_14px_40px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]">
              <p className="text-[28px] font-bold text-primary leading-none">{servicesLoaded ? SERVICES.length : <span className="inline-block h-7 w-8 rounded bg-black/[0.07] animate-pulse" aria-hidden="true" />}</p>
              <p className="mt-2 text-[13px] font-semibold tracking-[0.14em] uppercase text-gray-500">Care services</p>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow text-accent mb-4">About Carevaa</p>
              <h2 className="font-poppins font-semibold text-[28px] md:text-[34px] xl:text-[40px] leading-[1.18] text-primary">Trusted care for every stage of life</h2>
              <p className="mt-4 text-[15px] md:text-lg leading-relaxed text-gray-600 font-light">Carevaa brings hospital-quality care home. We connect families with qualified doctors, physiotherapists, nurses and caregivers – and keep every visit, prescription and payment in one place.</p>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-4 mt-8 mb-9">
              {benefits.map((b, i) => (
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
      </>)}

      {/* 9. Stories & articles */}
      {on('articles') && (<>
      {blog.length > 0 && (
        <section id="stories" className="py-14 lg:py-24 bg-cream">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
            <Heading eyebrow="Health stories" title="Recovery Tips & Care Guides" />
            <div className="grid md:grid-cols-3 gap-5 lg:gap-7">
              {blog.slice(0, 3).map((b, i) => (
                <Reveal key={b.title} delay={i * 100}>
                  <Link to={`/blog/${postSlug(b)}`} className="group block h-full bg-white rounded-xl overflow-hidden border border-black/[0.06] hover:shadow-xl transition-shadow">
                    <div className="h-44 lg:h-52 overflow-hidden bg-mint"><img src={b.img} alt={b.title} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
                    <div className="p-5 lg:p-6">
                      <p className="text-[12px] font-bold tracking-[0.12em] uppercase text-accent mb-3">{b.category || 'Health'} · {b.date}</p>
                      <h3 className="text-lg lg:text-[19px] font-bold text-primary mb-2 group-hover:text-accent transition-colors">{b.title}</h3>
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
      </>)}

      {/* 10. Presence */}
      {on('cities') && (<>
      {states.length > 0 && (
        <section id="cities" className="py-14 lg:py-24 bg-white">
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
            <Heading eyebrow="Our presence" title={`Care in ${cityList.length} ${cityList.length === 1 ? 'city' : 'cities'} across ${states.length} ${states.length === 1 ? 'state' : 'states'}`} desc="Expanding every week. Online consultations are available from anywhere." />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {states.map(([state, names], i) => (
                <Reveal key={state} delay={i * 70}>
                  <div className="h-full rounded-xl border border-black/[0.07] p-4 sm:p-6 hover:border-accent/40 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-primary text-lg">{state}</h3>
                      <span className="text-xs font-bold bg-mint text-accent rounded-full px-2.5 py-1">{names.length}</span>
                    </div>
                    <ul className="space-y-2">
                      {names.map((n) => <li key={n}><Link to={`/cities/${encodeURIComponent(n)}`} className="flex items-center gap-2 text-gray-600 text-sm sm:text-base hover:text-accent"><MapPin className="w-4 h-4 text-accent" />{n}</Link></li>)}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
      </>)}

      {/* 11. Partner / join */}
      {on('partner') && (<>
      <section className="py-20 bg-tint">
        <Reveal className="max-w-[1320px] mx-auto px-5 sm:px-8">
          <div className="bg-white rounded-2xl overflow-hidden grid lg:grid-cols-2 items-center border border-black/[0.05]">
            <div className="p-6 sm:p-10 lg:p-14">
              <p className="eyebrow text-accent mb-4">Partner with us</p>
              <h2 className="font-poppins font-semibold text-[26px] md:text-[34px] leading-tight text-primary mb-4">Are you a healthcare professional?</h2>
              <p className="text-gray-600 text-[15px] md:text-lg mb-7 font-light">Doctors, physiotherapists, nurses and caregivers can join Carevaa, set their own fees and schedule, and start receiving bookings as soon as their profile is live.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login" className="bg-secondary hover:bg-secondary-hover text-white px-7 py-3.5 rounded-lg font-bold transition-colors">Register as a professional</Link>
                <Link to="/jobs" className="border border-accent/40 text-accent px-7 py-3.5 rounded-lg font-bold hover:bg-accent hover:text-white transition-colors">View openings</Link>
              </div>
            </div>
            <img src="/career-hero.jpg" alt="Carevaa healthcare professionals" className="w-full h-72 lg:h-full object-cover" />
          </div>
        </Reveal>
      </section>
      </>)}

      {/* 12. FAQ */}
      {on('faq') && (<>
      {faqs.length > 0 && (
        <section id="faq" className="py-14 lg:py-24 bg-white">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-8">
            <Heading eyebrow="Got questions?" title="Frequently Asked Questions" desc="Everything you need to know about booking care with Carevaa." />
            <div className="space-y-3">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={f.q} delay={Math.min(i, 5) * 40}>
                    <div className={`rounded-xl border transition-colors ${open ? 'border-accent/40 bg-cream' : 'border-black/[0.08] bg-white'}`}>
                      <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)} className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-7 py-4 sm:py-5">
                        <span className="font-bold text-primary text-[15px] sm:text-[17px]">{f.q}</span>
                        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-accent text-white' : 'bg-mint text-accent'}`}>{open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</span>
                      </button>
                      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden"><p className="px-5 sm:px-7 pb-5 text-gray-600 text-[15px] leading-relaxed">{f.a}</p></div>
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
      </>)}

      {/* 13. Closing CTA */}
      {on('cta') && (<>
      <section className="py-20 lg:py-24 bg-gradient-to-br from-deep via-deep-2 to-deep-3 relative overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <Reveal className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="font-poppins font-semibold text-[28px] md:text-[40px] leading-tight mb-4">Need care at home? We are one call away.</h2>
          <p className="text-base md:text-lg text-white/75 mb-8 font-light">Book a verified professional in under 60 seconds, or let our care advisor plan it with you.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button type="button" onClick={() => bookNow()} className="bg-secondary hover:bg-secondary-hover text-white px-8 py-3.5 rounded-lg font-bold text-base transition-colors">Book Now</button>
            <button type="button" onClick={() => setEnquiry({})} className="border border-white/40 text-white px-8 py-3.5 rounded-lg font-bold text-base hover:bg-white/10 transition-colors">Request a Callback</button>
            {contact.phone && <a href={contact.phoneHref} className="flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-base"><Phone className="w-5 h-5 fill-on-deep text-on-deep" /> {contact.phone}</a>}
          </div>
        </Reveal>
      </section>

      <SiteFooter />
      <div className="sm:hidden h-[72px] bg-primary" />
      </>)}

      {/* Floating chat bubble */}
      {on('chat') && (<>
      <button type="button" onClick={chat} aria-label="Chat with us" className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40 w-14 h-14 sm:w-[64px] sm:h-[58px] text-accent hover:scale-105 transition-transform drop-shadow-lg">
        <MessageCircleMore className="w-full h-full fill-accent text-white" strokeWidth={1.4} />
      </button>
      </>)}

      {/* Mobile sticky action bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-black/5 px-4 py-3 grid grid-cols-2 gap-3 shadow-[0_-8px_24px_color-mix(in_srgb,var(--color-primary)_8%,transparent)]">
        {contact.phone ? (
          <a href={contact.phoneHref} className="flex items-center justify-center gap-2 rounded-xl border border-accent/40 text-accent font-bold py-3 text-sm"><Phone className="w-4 h-4 fill-accent" /> Call us</a>
        ) : (
          <button type="button" onClick={() => setEnquiry({})} className="rounded-xl border border-accent/40 text-accent font-bold py-3 text-sm">Request Callback</button>
        )}
        <button type="button" onClick={() => bookNow()} className="rounded-xl bg-secondary text-white font-bold py-3 text-sm">Book Now</button>
      </div>

      <EnquiryModal open={!!enquiry} onClose={() => setEnquiry(null)} type={enquiry?.type} service={enquiry?.service} plan={enquiry?.plan} />
      <BookingModal isOpen={booking.open} onClose={() => setBooking({ open: false, type: undefined })} serviceType={booking.type} providerId={booking.providerId} />
    </div>
  );
}
