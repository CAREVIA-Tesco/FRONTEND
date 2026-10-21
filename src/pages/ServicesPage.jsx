import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, CalendarCheck } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PageHero from '../components/PageHero';
import BookingModal from '../components/BookingModal';
import EnquiryModal from '../components/EnquiryModal';
import { useBookNow } from '../components/BookNow';
import Reveal from '../components/Reveal';
import { BOOKING_TYPE, useServices } from '../data/services';
import { usePublicStats, serviceStats, inr, plural } from '../services/usePublicStats';

// "Our Services" overview: every service with live price/count and both ways to start care
export default function ServicesPage() {
  const SERVICES = useServices();
  const stats = usePublicStats();
  const [booking, setBooking] = useState({ open: false, type: undefined });
  const [enquiry, setEnquiry] = useState(null);
  const bookNow = useBookNow();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const live = (key) => (key === 'doctor-visit' ? serviceStats(stats, key, true) : serviceStats(stats, key));

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip">
      <SiteHeader />
      <PageHero eyebrow="Our Services" title="Healthcare services at home" desc="Book a verified professional for an open slot right away, or request a callback and our care advisor will plan the right care with you." crumbs={[['Our Services']]} />

      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {SERVICES.map((s, i) => {
            const st = live(s.key);
            return (
              <Reveal key={s.key} delay={(i % 2) * 80}>
                <div className="group h-full bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden grid sm:grid-cols-[200px_1fr]">
                  <Link to={s.link} className="relative h-48 sm:h-full overflow-hidden bg-tint block">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </Link>
                  <div className="p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-10 h-10 rounded-xl bg-tint text-primary flex items-center justify-center"><s.icon className="w-5 h-5" /></span>
                      <Link to={s.link}><h2 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">{s.title}</h2></Link>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 flex-1">{s.desc}</p>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold mb-5">
                      {st?.minFee ? <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">From {inr(st.minFee)}</span> : s.price ? <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">From {s.price}</span> : null}
                      {st?.providers ? <span className="bg-tint text-primary px-3 py-1 rounded-full">{plural(st.providers, 'professional')}</span> : null}
                      {st?.rating ? <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full">★ {st.rating}</span> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => bookNow({ service: s.title })} className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2.5 rounded-full inline-flex items-center gap-1.5 transition-colors"><CalendarCheck className="w-4 h-4" /> Book Now</button>
                      <button type="button" onClick={() => setEnquiry({ service: s.title })} className="border border-primary/15 text-primary text-sm font-semibold px-4 py-2.5 rounded-full inline-flex items-center gap-1.5 hover:border-primary transition-colors"><PhoneCall className="w-4 h-4" /> Request callback</button>
                      <Link to={s.link} className="text-accent text-sm font-semibold px-2 py-2.5 inline-flex items-center gap-1 hover:gap-2 transition-all">Details <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-primary rounded-[32px] p-8 sm:p-12 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-2">Not sure which service you need?</h2>
            <p className="text-white/75">Our care advisor will understand the patient&apos;s condition and suggest the right care plan.</p>
          </div>
          <button type="button" onClick={() => setEnquiry({})} className="bg-secondary hover:bg-secondary-hover text-white px-7 py-3.5 rounded-full font-semibold shrink-0">Talk to a care advisor</button>
        </div>
      </section>

      <SiteFooter />
      <BookingModal isOpen={booking.open} onClose={() => setBooking({ open: false, type: undefined })} serviceType={booking.type} />
      <EnquiryModal open={!!enquiry} onClose={() => setEnquiry(null)} service={enquiry?.service} />
    </div>
  );
}
