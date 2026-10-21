import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Mail, MapPin, Clock, Briefcase, Handshake, SearchCheck, ArrowRight } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PageHero from '../components/PageHero';
import EnquiryForm from '../components/EnquiryForm';
import Reveal from '../components/Reveal';
import { useContact, useSiteContent } from '../services/useSiteContent';

export default function Contact() {
  const contact = useContact();
  const cities = useSiteContent('cities');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const channels = [
    contact.phone && { icon: PhoneCall, title: 'Call us', value: contact.phone, href: contact.phoneHref, note: contact.hours },
    contact.email && { icon: Mail, title: 'Bookings & support', value: contact.email, href: `mailto:${contact.email}`, note: 'We reply within one working day' },
    contact.address && { icon: MapPin, title: 'Head office', value: contact.address },
    (contact.careersEmail || contact.careersPhone) && { icon: Briefcase, title: 'Careers', value: contact.careersEmail || contact.careersPhone, href: contact.careersEmail ? `mailto:${contact.careersEmail}` : undefined, note: contact.careersEmail ? contact.careersPhone : '' },
  ].filter(Boolean);

  const byState = cities.reduce((m, c) => ({ ...m, [c.desc || 'Other']: [...(m[c.desc || 'Other'] || []), c.name] }), {});

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip">
      <SiteHeader />
      <PageHero eyebrow="Contact Us" title="We are here for you" desc="Questions about a booking, feedback or a complaint – reach us by phone, email or the form below." crumbs={[['Contact Us']]} />

      <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {channels.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow p-6">
                <span className="w-12 h-12 rounded-xl bg-tint text-primary flex items-center justify-center mb-4"><c.icon className="w-5 h-5" /></span>
                <p className="text-sm font-semibold text-gray-500 mb-1">{c.title}</p>
                {c.href ? <a href={c.href} className="font-bold text-primary hover:text-accent break-words">{c.value}</a> : <p className="font-bold text-primary">{c.value}</p>}
                {c.note && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {c.note}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.3fr_1fr] gap-10">
          <Reveal className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
            <h2 className="text-2xl md:text-3xl font-bold font-poppins text-primary mb-2">Send us a message</h2>
            <p className="text-gray-600 mb-8">Fill in the form and our team will get back to you. For urgent care requests, please call us.</p>
            <EnquiryForm type="contact" />
          </Reveal>

          <div className="space-y-5">
            {[
              { icon: SearchCheck, title: 'Track a request', desc: 'Check the status of a callback or care request with your request ID.', to: '/track', cta: 'Track request' },
              { icon: Handshake, title: 'Partner with us', desc: 'Hospitals, clinics, diagnostic centres and companies can work with Carevaa.', to: '/partner', cta: 'Partnership enquiry' },
              { icon: Briefcase, title: 'Join our team', desc: 'Doctors, nurses, physios and caregivers – see current openings.', to: '/jobs', cta: 'View openings' },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <Link to={c.to} className="group flex gap-4 bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-primary/10 transition-all">
                  <span className="w-12 h-12 rounded-xl bg-tint text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors"><c.icon className="w-5 h-5" /></span>
                  <span>
                    <span className="block font-bold text-primary">{c.title}</span>
                    <span className="block text-sm text-gray-600 mb-2">{c.desc}</span>
                    <span className="text-sm font-semibold text-accent inline-flex items-center gap-1 group-hover:gap-2 transition-all">{c.cta} <ArrowRight className="w-4 h-4" /></span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {Object.keys(byState).length > 0 && (
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold font-poppins text-primary mb-8">Where we serve</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Object.entries(byState).map(([state, names]) => (
                <div key={state} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-primary mb-3">{state}</h3>
                  <p className="text-sm text-gray-600 flex items-start gap-2"><MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />{names.join(', ')}</p>
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
