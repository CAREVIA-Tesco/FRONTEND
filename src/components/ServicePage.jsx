import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Phone, ChevronRight, ChevronDown, MessageCircle } from 'lucide-react';
import { usePublicStats, serviceStats, plural, usePricingRules, packagePrices, inr } from '../services/usePublicStats';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ServiceProfessionals from './ServiceProfessionals';
import EnquiryModal from './EnquiryModal';
import { useBookNow } from './BookNow';
import { useContact } from '../services/useSiteContent';
import AnimatedCTA from './AnimatedCTA';
import { SERVICE_CONTENT } from '../data/serviceContent';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Shared layout of the service pages (/physiotherapy, /nurse-care …). Text lives in data/serviceContent.js;
// prices, counts and ratings come live from the database.
export default function ServicePage({ serviceKey }) {
  const c = SERVICE_CONTENT[serviceKey];
  const liveStats = serviceStats(usePublicStats(), c.statsKey, !!c.allDoctors);
  const pricingRules = usePricingRules();
  const prices = packagePrices(liveStats?.minFee, pricingRules);
  const bookNow = useBookNow();
  const [enquiry, setEnquiry] = useState(null);
  const contact = useContact();
  const chatOnWhatsApp = () => (contact.whatsappHref ? window.open(contact.whatsappHref, '_blank', 'noopener') : setEnquiry({}));
  const [openFaq, setOpenFaq] = useState(0);
  const book = () => bookNow({ service: c.service });
  const packs = prices?.packSessions || 10;
  const Unit = cap(c.unit);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${c.service} at Home – Carevaa`;
    return () => { document.title = 'Carevaa | Doctors, Nurses & Home Care Services'; };
  }, [c.service]);

  const Price = ({ value, suffix }) => (prices
    ? <><span className="text-4xl font-bold text-primary">{inr(value)}</span><span className="text-ink-soft">{suffix}</span></>
    : <span className="text-2xl font-bold text-primary">Price on request</span>);
  const Points = ({ items, strongFirst }) => (
    <ul className="space-y-4 mb-8">
      {items.map((p, i) => <li key={p} className={`flex items-start gap-2 text-sm text-primary ${strongFirst && i === 0 ? 'font-medium' : ''}`}><CheckCircle className="w-5 h-5 text-accent shrink-0" /> {p}</li>)}
    </ul>
  );

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen relative overflow-x-clip selection:bg-primary selection:text-white" data-testid={`service-page-${serviceKey}`}>
      <SiteHeader />

      {/* Hero */}
      <section className="pt-28 pb-14 sm:pt-32 sm:pb-20 lg:pt-44 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-white to-tint overflow-hidden">
        <div className="lg:w-[55%] flex flex-col items-start z-10">
          <div className="bg-accent/5 text-accent px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 mb-6 border border-accent/20">{c.badge}</div>
          <div className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-2">
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight className="w-3 h-3" />
            <Link to="/services" className="hover:text-primary">Services</Link> <ChevronRight className="w-3 h-3" />
            <span className="text-primary">{c.service}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] mb-6 font-poppins text-primary">{c.title[0]} <br className="hidden sm:block" />{c.title[1]}</h1>
          <p className="text-lg text-ink-soft mb-8 max-w-[520px] leading-relaxed">{c.intro}</p>

          <div className="flex flex-wrap gap-2.5 sm:gap-4 mb-8 sm:mb-10 items-center text-sm font-medium text-primary">
            {liveStats?.providers > 0 && <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm"><span className="text-green-500">✅</span> {plural(liveStats.providers, c.pro[0], c.pro[1])}</span>}
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm"><span className="text-yellow-400">⭐</span> {liveStats?.rating ? `${liveStats.rating} Rated` : 'New'}</span>
            {liveStats?.visits > 0 && <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm">🏥 {`${liveStats.visits.toLocaleString('en-IN')} ${liveStats.visits === 1 ? 'Visit' : 'Visits'} Completed`}</span>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full sm:w-auto">
            <AnimatedCTA onClick={book}>{c.cta}</AnimatedCTA>
            <button type="button" onClick={() => setEnquiry({})} className="bg-transparent border-2 border-primary text-primary hover:bg-tint px-6 py-3 rounded-xl font-medium text-base transition flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> {c.talk}
            </button>
          </div>
          <p className="text-sm text-ink-soft">🕐 Book open slots online • 🛡️ Verified {c.proNounPlural} • 📄 Visit summary after every visit</p>
        </div>

        <div className="lg:w-[45%] relative mt-10 lg:mt-0 w-full">
          <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_color-mix(in_srgb,var(--color-primary)_15%,transparent)] animate-[float_4s_ease-in-out_infinite]">
            <img src={c.heroImg} alt={c.heroAlt} className="w-full h-[320px] sm:h-[450px] lg:h-[550px] object-cover" />
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section className="bg-accent/5 py-10 border-y border-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ['💰', 'Starting Price', prices ? `${inr(prices.single)} per ${c.unit}` : 'Price on request'],
            ['⚡', 'Easy Booking', 'See open slots and book online'],
            ['✅', 'Verified Profiles', 'Qualifications and ID checked'],
            ['💯', 'Easy Refunds', 'Cancel paid bookings before the visit'],
          ].map(([icon, t, d]) => (
            <div key={t} className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">{icon}</span>
              <h4 className="font-bold text-primary mb-1">{t}</h4>
              <p className="text-sm text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="w-full md:w-[60%]">
            <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary mb-6 leading-tight">{c.aboutTitle}</h2>
            {c.about.map((p) => <p key={p} className="text-lg text-ink-soft mb-6 leading-relaxed">{p}</p>)}
            <ul className="space-y-4 mt-2">
              {c.aboutPoints.map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg text-primary font-medium"><span className="text-accent">✔</span> {item}</li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-[40%] relative">
            <div className="absolute inset-0 bg-tint rounded-[40px] transform rotate-3 scale-105 -z-10"></div>
            <img src={c.aboutImg} alt={`${c.service} at home`} className="rounded-[32px] shadow-2xl object-cover w-full h-[280px] sm:h-[400px] md:h-[450px]" />
          </div>
        </div>
      </section>

      {/* Conditions / what's included */}
      <section className="py-14 sm:py-24 bg-tint">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary mb-4">{c.conditionsTitle}</h2>
            <p className="text-lg text-ink-soft">{c.conditionsSub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {c.conditions.map(([icon, name, desc], i) => (
              <div key={name} className="bg-white p-6 rounded-[20px] shadow-sm hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-primary)_12%,transparent)] transition-all duration-300 hover:-translate-y-1.5 border border-transparent hover:border-tint">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${i % 2 === 0 ? 'bg-blue-50' : 'bg-red-50'}`}>{icon}</div>
                <h3 className="text-lg font-semibold text-primary mb-2">{name}</h3>
                <p className="text-sm text-ink-soft mb-4">{desc}</p>
                <button type="button" onClick={() => setEnquiry({ message: `I need help with ${name}.` })} className="text-accent font-medium flex items-center gap-1 text-sm hover:gap-2 transition-all">
                  Ask an Expert <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceProfessionals serviceKey={serviceKey} />

      {/* Pricing */}
      <section className="py-14 sm:py-24 bg-tint relative border-t border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-ink-soft">No hidden fees. Save more with packs and monthly plans.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-2">{c.plans.single.name}</h3>
              <div className="flex items-baseline gap-1 mb-2"><Price value={prices?.single} suffix={`/ ${c.unit}`} /></div>
              <p className="text-sm text-ink-soft mb-8 pb-8 border-b border-gray-100">{c.plans.single.note}</p>
              <Points items={c.plans.single.points} />
              <button type="button" onClick={book} className="w-full bg-transparent border-2 border-primary text-primary hover:bg-tint py-3 rounded-xl font-semibold transition">Book Single {Unit}</button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-accent relative lg:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-md whitespace-nowrap">⭐ Most Popular</div>
              <h3 className="text-xl font-bold text-primary mb-2 mt-2">{packs}-{Unit} Pack</h3>
              <div className="flex items-baseline gap-1 mb-2"><Price value={prices?.pack} suffix={`/ ${packs} ${c.units}`} /></div>
              <p className="text-sm font-medium text-accent mb-8 pb-8 border-b border-gray-100">{prices ? `Save ${inr(prices.packSaving)} (${inr(prices.perSession)} per ${c.unit})` : 'Pack savings shown once prices are set'}</p>
              <Points items={c.plans.pack.points} strongFirst />
              <button type="button" onClick={() => setEnquiry({ type: 'plan', plan: `${packs}-${Unit} Pack${prices ? ` (${inr(prices.pack)})` : ''}` })} className="w-full bg-secondary hover:bg-secondary-hover text-white py-3.5 rounded-xl font-bold text-lg transition shadow-md">Get This Pack</button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-2">{c.plans.monthly.name}</h3>
              <div className="flex items-baseline gap-1 mb-2"><Price value={prices?.monthly} suffix="/ month" /></div>
              <p className="text-sm text-ink-soft mb-8 pb-8 border-b border-gray-100">{c.plans.monthly.note}</p>
              <Points items={c.plans.monthly.points} />
              <button type="button" onClick={() => setEnquiry({ type: 'plan', plan: `${c.plans.monthly.name}${prices ? ` (${inr(prices.monthly)}/month)` : ''}` })} className="w-full bg-transparent border-2 border-primary text-primary hover:bg-tint py-3 rounded-xl font-semibold transition">Start Monthly Plan</button>
            </div>
          </div>
          {(prices?.emiMinimum ?? pricingRules?.emiMinimum) ? (
            <p className="text-center mt-10 text-sm text-ink-soft">💳 EMI available on packs above {inr(prices?.emiMinimum ?? pricingRules?.emiMinimum)}</p>
          ) : null}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary text-center mb-8 sm:mb-12">{c.service}: Common Questions</h2>
          <div className="space-y-3">
            {c.faqs.map(([q, a], i) => (
              <div key={q} className="rounded-2xl border border-gray-100 bg-cream overflow-hidden">
                <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-semibold text-primary">
                  {q} <ChevronDown className={`w-5 h-5 shrink-0 text-accent transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-5 text-ink-soft leading-relaxed">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-secondary to-primary rounded-[32px] px-6 py-10 sm:p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-[40px] font-bold font-poppins mb-6 leading-tight">{c.ctaTitle}</h2>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">{c.ctaText}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button type="button" onClick={book} className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-lg">📱 {c.ctaButton}</button>
              <button type="button" onClick={chatOnWhatsApp} className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition flex items-center justify-center gap-2">💬 Chat on WhatsApp</button>
            </div>
            <p className="text-sm mt-6 opacity-80">⚡ Booking takes about a minute</p>
          </div>
        </div>
      </section>

      <SiteFooter />

      <a href={contact.whatsappHref || contact.phoneHref || '#'} target={contact.whatsappHref ? '_blank' : undefined} rel="noreferrer" aria-label="Contact us" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group">
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-50 animate-ping group-hover:animate-none pointer-events-none"></span>
        <MessageCircle className="w-6 h-6 relative z-10" />
      </a>

      <EnquiryModal open={!!enquiry} onClose={() => setEnquiry(null)} type={enquiry?.type} service={c.service} plan={enquiry?.plan} message={enquiry?.message} />
    </div>
  );
}
