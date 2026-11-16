import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Mail, MapPin, Clock, Briefcase, SearchCheck, ArrowRight, MessageCircle, ChevronRight, ChevronDown, Headphones, Building2, Siren, CalendarCheck } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import EnquiryForm from '../components/EnquiryForm';
import Reveal from '../components/Reveal';
import { useBookNow } from '../components/BookNow';
import { useContact, useSiteContent } from '../services/useSiteContent';

const TONES = [
  { soft: 'bg-[color-mix(in_srgb,var(--color-accent)_12%,white)]', icon: 'bg-accent text-white' },
  { soft: 'bg-[color-mix(in_srgb,var(--color-secondary)_12%,white)]', icon: 'bg-secondary text-white' },
  { soft: 'bg-[color-mix(in_srgb,var(--color-primary)_9%,white)]', icon: 'bg-primary text-white' },
];
const HOVER = 'transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-secondary)_45%,transparent)]';
const FAQS = [
  ['How quickly will you reply?', 'Calls are answered during our working hours. Messages sent with the form or by email get a reply within one working day – usually much sooner.'],
  ['How do I book a doctor, nurse or care taker?', 'Use “Book Now” on any page. Choose the service, your address and a time – a care advisor confirms the visit with you.'],
  ['Can I change or cancel a booking?', 'Yes. Open your booking from your account or call us. Paid bookings can be cancelled before the visit and the payment is refunded.'],
  ['I want to join Carevaa as a professional or partner.', 'Doctors and healthcare professionals can use “Register as a Professional”. Clinics, labs and other businesses can use “Register as a Business Partner”.'],
];

export default function Contact() {
  const contact = useContact();
  const cities = useSiteContent('cities');
  const bookNow = useBookNow();
  const [openFaq, setOpenFaq] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); document.title = 'Contact Us – Carevaa'; return () => { document.title = 'Carevaa | Doctors, Nurses & Home Care Services'; }; }, []);

  const channels = [
    contact.phone && { icon: PhoneCall, title: 'Call us', value: contact.phone, href: contact.phoneHref, note: contact.hours || 'Talk to our care team' },
    contact.whatsappHref && { icon: MessageCircle, title: 'WhatsApp', value: 'Chat with us', href: contact.whatsappHref, note: 'Quick replies on WhatsApp', external: true },
    contact.email && { icon: Mail, title: 'Email', value: contact.email, href: `mailto:${contact.email}`, note: 'Reply within one working day' },
    contact.address && { icon: MapPin, title: 'Head office', value: contact.address, note: 'Visits by appointment' },
  ].filter(Boolean);

  const byState = cities.reduce((m, c) => ({ ...m, [c.desc || 'Other']: [...(m[c.desc || 'Other'] || []), c.name] }), {});
  const mapSrc = contact.address ? `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed` : '';

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip" data-testid="contact-page">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-tint pt-28 lg:pt-36 pb-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
            <Link to="/" className="hover:text-secondary">Home</Link><ChevronRight className="w-3.5 h-3.5" /><span className="text-primary font-medium">Contact Us</span>
          </nav>
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-black/[0.06] px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-accent"><Headphones className="w-4 h-4" /> We’re here to help</p>
              <h1 className="mt-5 font-poppins font-semibold text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.1]">Get in touch with <span className="italic text-secondary">Carevaa</span></h1>
              <p className="mt-4 text-lg text-gray-600 max-w-xl">Questions about a booking, feedback or a partnership – our care team is happy to help by phone, WhatsApp, email or the form below.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {contact.phone && <a href={contact.phoneHref} className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-hover text-white px-6 py-3.5 rounded-xl font-bold transition shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)]"><PhoneCall className="w-5 h-5" /> Call {contact.phone}</a>}
              <button type="button" onClick={() => bookNow()} className="inline-flex items-center gap-2 bg-white border border-primary/15 text-primary px-6 py-3.5 rounded-xl font-bold hover:border-secondary hover:text-secondary transition"><CalendarCheck className="w-5 h-5" /> Book Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* Channels */}
      {channels.length > 0 && (
        <section className="relative z-10 -mt-14 px-4 sm:px-6 lg:px-8">
          <div className={`max-w-7xl mx-auto grid sm:grid-cols-2 ${channels.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 sm:gap-5`} data-testid="contact-channels">
            {channels.map((c, i) => {
              const Body = (
                <>
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center ${TONES[i % 3].icon}`}><c.icon className="w-5 h-5" /></span>
                  <p className="mt-4 text-[13px] font-semibold uppercase tracking-wider text-gray-500">{c.title}</p>
                  <p className="mt-1 font-semibold text-[16.5px] text-primary break-words group-hover:text-secondary transition-colors">{c.value}</p>
                  {c.note && <p className="mt-1.5 text-[13px] text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5 shrink-0" /> {c.note}</p>}
                </>
              );
              return (
                <Reveal key={c.title} delay={i * 70} className="h-full">
                  {c.href
                    ? <a href={c.href} target={c.external ? '_blank' : undefined} rel={c.external ? 'noreferrer' : undefined} className={`group block h-full bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 ${HOVER}`}>{Body}</a>
                    : <div className={`group h-full bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 ${HOVER}`}>{Body}</div>}
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Form + side panel */}
      <section className="py-14 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.35fr_1fr] gap-8 items-start">
          <Reveal className="bg-white rounded-3xl border border-black/[0.06] shadow-sm overflow-hidden">
            <div className="px-6 sm:px-10 py-6 bg-[color-mix(in_srgb,var(--color-accent)_10%,white)] border-b border-black/[0.05]">
              <h2 className="text-2xl md:text-3xl font-semibold font-poppins">Send us a message</h2>
              <p className="mt-1 text-gray-600">Fill in the form and our team will get back to you. For urgent care, please call us.</p>
            </div>
            <div className="p-6 sm:p-10" data-testid="contact-form">
              <EnquiryForm type="contact" />
            </div>
          </Reveal>

          <div className="space-y-5 lg:sticky lg:top-28">
            {mapSrc && (
              <div className="bg-white rounded-3xl border border-black/[0.06] overflow-hidden">
                <iframe title="Carevaa head office on the map" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-56 border-0 bg-tint" />
                <div className="p-5 flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></span>
                  <span><span className="block font-semibold">Head office</span><span className="block text-[14px] text-gray-600">{contact.address}</span></span>
                </div>
              </div>
            )}
            {[
              { icon: SearchCheck, title: 'Track a request', desc: 'Check the status of your care request with its request ID.', to: '/track', cta: 'Track request' },
              { icon: Briefcase, title: 'Join our team', desc: 'Doctors, nurses, physios and caregivers – see current openings.', to: '/jobs', cta: 'View openings' },
              { icon: Building2, title: 'Partner with us', desc: 'Clinics, labs and healthcare businesses can register as partners.', to: '/business-partner/register', cta: 'Register your business' },
            ].map((c, i) => (
              <Link key={c.title} to={c.to} className={`group flex gap-4 bg-white rounded-2xl border border-black/[0.06] p-5 ${HOVER}`}>
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${TONES[i % 3].soft}`}><c.icon className="w-5 h-5 text-primary" /></span>
                <span>
                  <span className="block font-semibold text-primary">{c.title}</span>
                  <span className="block text-sm text-gray-600 mb-1.5">{c.desc}</span>
                  <span className="text-sm font-bold text-secondary inline-flex items-center gap-1 group-hover:gap-2 transition-all">{c.cta} <ArrowRight className="w-4 h-4" /></span>
                </span>
              </Link>
            ))}
            <div className="rounded-2xl bg-red-50 border border-red-100 p-5 flex gap-3 text-[14px] text-red-900">
              <Siren className="w-5 h-5 shrink-0 text-red-600" />
              <span><span className="font-semibold">Medical emergency?</span> Please call <a href="tel:108" className="font-bold underline">108</a> or go to the nearest hospital. Carevaa is not an emergency service.</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-14 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold font-poppins text-center mb-8">Common questions</h2>
          <div className="space-y-3">
            {FAQS.map(([q, a], i) => (
              <div key={q} className={`rounded-2xl border bg-white overflow-hidden transition-colors ${openFaq === i ? 'border-secondary/50' : 'border-black/[0.06] hover:border-secondary/40'}`}>
                <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-semibold">
                  {q} <ChevronDown className={`w-5 h-5 shrink-0 text-secondary transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-5 text-gray-600 leading-relaxed">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      {Object.keys(byState).length > 0 && (
        <section className="pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold font-poppins mb-6">Where we serve</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(byState).map(([state, names], i) => (
                <div key={state} className={`bg-white rounded-2xl border border-black/[0.06] overflow-hidden ${HOVER}`}>
                  <p className={`px-5 py-3 font-semibold ${TONES[i % 3].soft}`}>{state}</p>
                  <div className="p-5 flex flex-wrap gap-2">
                    {names.map((n) => <Link key={n} to={`/cities/${encodeURIComponent(n)}`} className="inline-flex items-center gap-1 text-[13.5px] text-gray-700 hover:text-secondary"><MapPin className="w-3.5 h-3.5 text-accent" /> {n}</Link>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
