import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, MessageCircle, Wallet, Zap, BadgeCheck, RotateCcw, CalendarCheck } from 'lucide-react';
import { usePublicStats, serviceStats, plural, usePricingRules, packagePrices, inr } from '../services/usePublicStats';
import ServiceGuide, { HOVER_CARD } from './ServiceGuide';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ServiceProfessionals from './ServiceProfessionals';
import { useBookNow } from './BookNow';
import { useContact } from '../services/useSiteContent';
import AnimatedCTA from './AnimatedCTA';
import { SERVICE_CONTENT } from '../data/serviceContent';

// Shared layout of the service pages (/physiotherapy, /nurse-care …). Text lives in data/serviceContent.js;
// prices, counts and ratings come live from the database.
export default function ServicePage({ serviceKey }) {
  const c = SERVICE_CONTENT[serviceKey];
  const liveStats = serviceStats(usePublicStats(), c.statsKey, !!c.allDoctors);
  const pricingRules = usePricingRules();
  const prices = packagePrices(liveStats?.minFee, pricingRules);
  const bookNow = useBookNow();
  const contact = useContact();
  const [openFaq, setOpenFaq] = useState(0);
  const book = () => bookNow({ service: c.service });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${c.service} at Home – Carevaa`;
    return () => { document.title = 'Carevaa | Doctors, Nurses & Home Care Services'; };
  }, [c.service]);

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
      <section className="bg-tint py-12 sm:py-14 border-y border-black/[0.04]" data-testid="service-facts">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {[
            [Wallet, 'Starting Price', prices ? `${inr(prices.single)} per ${c.unit}` : 'Price on request'],
            [Zap, 'Easy Booking', 'See open slots and book online'],
            [BadgeCheck, 'Verified Profiles', 'Qualifications and ID checked'],
            [RotateCcw, 'Easy Refunds', 'Cancel paid bookings before the visit'],
          ].map(([Icon, t, d], i) => (
            <div key={t} className={`group bg-white rounded-2xl border border-black/[0.06] p-5 sm:p-6 flex flex-col items-start ${HOVER_CARD}`}>
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:bg-secondary ${['bg-[color-mix(in_srgb,var(--color-accent)_14%,white)]', 'bg-[color-mix(in_srgb,var(--color-secondary)_14%,white)]', 'bg-[color-mix(in_srgb,var(--color-primary)_10%,white)]', 'bg-[color-mix(in_srgb,var(--color-secondary)_14%,white)]'][i]}`}><Icon className={`w-6 h-6 transition-colors group-hover:text-white ${['text-accent', 'text-secondary', 'text-primary', 'text-secondary'][i]}`} /></span>
              <h4 className="mt-4 font-semibold text-primary text-[16px] sm:text-[17px]">{t}</h4>
              <p className="mt-1 text-[13.5px] sm:text-sm text-ink-soft leading-snug">{d}</p>
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
              <div key={name} className={`bg-white p-6 rounded-[20px] shadow-sm border border-black/[0.05] flex flex-col ${HOVER_CARD}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${i % 2 === 0 ? 'bg-blue-50' : 'bg-red-50'}`}>{icon}</div>
                <h3 className="text-lg font-semibold text-primary mb-2">{name}</h3>
                <p className="text-sm text-ink-soft mb-4 flex-1">{desc}</p>
                <button type="button" onClick={book} className="self-start text-secondary font-semibold flex items-center gap-1 text-sm hover:gap-2 transition-all">
                  Book Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceGuide serviceKey={serviceKey} serviceName={c.service} onBook={book} />

      <ServiceProfessionals serviceKey={serviceKey} />

      {/* FAQs */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary text-center mb-8 sm:mb-12">{c.service}: Common Questions</h2>
          <div className="space-y-3">
            {c.faqs.map(([q, a], i) => (
              <div key={q} className={`rounded-2xl border overflow-hidden transition-colors ${openFaq === i ? 'border-secondary/50 bg-cream' : 'border-gray-100 bg-cream hover:border-secondary/40'}`}>
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
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-secondary to-primary rounded-3xl px-6 py-7 sm:px-10 sm:py-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center gap-5 md:gap-8" data-testid="service-cta">
          <div className="relative z-10 flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-[28px] font-bold font-poppins leading-tight">{c.ctaTitle}</h2>
            <p className="text-[15px] md:text-base mt-2 opacity-90">{c.ctaText} <span className="opacity-80">· Booking takes about a minute</span></p>
          </div>
          <button type="button" onClick={book} className="relative z-10 shrink-0 self-center bg-white text-primary px-6 py-3 rounded-xl font-bold text-[15px] hover:bg-gray-50 transition shadow-lg inline-flex items-center justify-center gap-2"><CalendarCheck className="w-5 h-5" /> {c.ctaButton}</button>
        </div>
      </section>

      <SiteFooter />

      <a href={contact.whatsappHref || contact.phoneHref || '#'} target={contact.whatsappHref ? '_blank' : undefined} rel="noreferrer" aria-label="Contact us" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group">
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-50 animate-ping group-hover:animate-none pointer-events-none"></span>
        <MessageCircle className="w-6 h-6 relative z-10" />
      </a>

    </div>
  );
}
