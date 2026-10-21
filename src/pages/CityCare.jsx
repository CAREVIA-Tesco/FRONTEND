import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, ArrowRight, PhoneCall, Video } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PageHero from '../components/PageHero';
import ProCard, { lowestFee } from '../components/ProCard';
import BookingModal from '../components/BookingModal';
import EnquiryModal from '../components/EnquiryModal';
import { useBookNow } from '../components/BookNow';
import Reveal from '../components/Reveal';
import api from '../services/api';
import { inr } from '../services/usePublicStats';
import { useSiteContent } from '../services/useSiteContent';
import { SERVICES, BOOKING_TYPE, providersForService, citySlug } from '../data/services';

// City landing pages: /cities/Chennai (all services) and /cities/Chennai/physiotherapy (one service)
export default function CityCare() {
  const { city: cityParam, serviceKey } = useParams();
  const city = decodeURIComponent(cityParam || '');
  const service = SERVICES.find((s) => s.key === serviceKey);
  const cityList = useSiteContent('cities');
  const [providers, setProviders] = useState(null);
  const [booking, setBooking] = useState(null);
  const bookNow = useBookNow();
  const [enquiry, setEnquiry] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, [cityParam, serviceKey]);
  useEffect(() => { api.getProviders().then((d) => setProviders(d.providers || [])).catch(() => setProviders([])); }, []);

  const inCity = useMemo(() => (providers || []).filter((p) => String(p.loc || '').toLowerCase() === city.toLowerCase()), [providers, city]);
  const pros = service ? providersForService(inCity, service.key) : inCity;
  const fees = pros.map(lowestFee).filter(Boolean);
  const minFee = fees.length ? Math.min(...fees) : null;
  const state = cityList.find((c) => c.name.toLowerCase() === city.toLowerCase())?.desc;
  const otherCities = [...new Set([...cityList.map((c) => c.name), ...(providers || []).map((p) => p.loc).filter((l) => l && l !== 'Virtual')])].filter((c) => c.toLowerCase() !== city.toLowerCase());
  const servicesHere = SERVICES.map((s) => ({ ...s, count: providersForService(inCity, s.key).length }));

  const title = service ? `${service.title} at Home in ${city}` : `Home Healthcare in ${city}`;
  const desc = service
    ? `${service.desc} ${pros.length ? `${pros.length} verified ${pros.length === 1 ? 'professional' : 'professionals'} in ${city}${minFee ? `, from ${inr(minFee)}` : ''}.` : ''}`
    : `Doctors, nurses, physiotherapists and caregivers who visit homes across ${city}${state ? `, ${state}` : ''}.`;
  const crumbs = service ? [['Our Services', '/services'], [service.title, service.link], [city]] : [['Cities'], [city]];

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip">
      <SiteHeader />
      <PageHero eyebrow={state ? `${city} · ${state}` : city} title={title} desc={desc} crumbs={crumbs}>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => bookNow({ service: service?.title, city })} className="bg-secondary hover:bg-secondary-hover text-white px-7 py-3.5 rounded-lg font-bold transition-colors">Book Now</button>
          <button type="button" onClick={() => setEnquiry({})} className="bg-white border border-accent/30 text-accent px-6 py-3.5 rounded-lg font-bold inline-flex items-center gap-2 hover:bg-accent hover:text-white transition-colors"><PhoneCall className="w-4 h-4" /> Request a callback</button>
        </div>
      </PageHero>

      <section className="py-12 lg:py-16 px-5 sm:px-8">
        <div className="max-w-[1320px] mx-auto">
          <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-primary mb-6">{service ? `${service.title} professionals in ${city}` : `Verified professionals in ${city}`}</h2>
          {providers === null ? <p className="text-gray-500">Loading…</p> : pros.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="font-semibold text-primary mb-2">We are onboarding {service ? `${service.title.toLowerCase()} ` : ''}professionals in {city}.</p>
              <p className="text-gray-600 text-sm mb-5">Leave your details and our care advisor will arrange care for you, or consult a doctor online from anywhere.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => setEnquiry({})} className="bg-secondary text-white px-6 py-3 rounded-lg font-bold">Request a callback</button>
                <button type="button" onClick={() => setBooking({ type: undefined })} className="border border-accent/40 text-accent px-6 py-3 rounded-lg font-bold inline-flex items-center gap-2"><Video className="w-4 h-4" /> Consult online</button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pros.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 60}><ProCard p={p} onBook={(doc) => setBooking({ providerId: doc.id, type: service ? BOOKING_TYPE(service.key) : undefined })} /></Reveal>)}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 lg:py-16 px-5 sm:px-8 bg-white">
        <div className="max-w-[1320px] mx-auto">
          <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-primary mb-6">{service ? `Other services in ${city}` : `Services available in ${city}`}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {servicesHere.filter((s) => s.key !== service?.key).map((s) => (
              <Link key={s.key} to={`/cities/${citySlug(city)}/${s.key}`} className="group bg-cream rounded-xl p-4 flex items-center gap-3 hover:bg-mint transition-colors">
                <span className="w-11 h-11 rounded-lg overflow-hidden bg-mint shrink-0"><img src={s.img} alt="" className="w-full h-full object-cover" /></span>
                <span className="min-w-0">
                  <span className="block font-bold text-primary text-sm group-hover:text-accent">{s.title}</span>
                  <span className="block text-xs text-gray-500">{s.count ? `${s.count} ${s.count === 1 ? 'professional' : 'professionals'}` : 'On request'}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {otherCities.length > 0 && (
        <section className="py-12 lg:py-16 px-5 sm:px-8">
          <div className="max-w-[1320px] mx-auto">
            <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-primary mb-6">{service ? `${service.title} in other cities` : 'Other cities we serve'}</h2>
            <div className="flex flex-wrap gap-2.5">
              {otherCities.map((c) => (
                <Link key={c} to={`/cities/${citySlug(c)}${service ? `/${service.key}` : ''}`} className="inline-flex items-center gap-1.5 bg-white border border-black/[0.07] rounded-full px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-accent" /> {c}
                </Link>
              ))}
            </div>
            {service && <Link to={service.link} className="mt-8 inline-flex items-center gap-1.5 font-bold text-accent">Learn more about {service.title} <ArrowRight className="w-4 h-4" /></Link>}
          </div>
        </section>
      )}

      <SiteFooter />
      <BookingModal isOpen={!!booking} onClose={() => setBooking(null)} serviceType={booking?.type} providerId={booking?.providerId} />
      <EnquiryModal open={!!enquiry} onClose={() => setEnquiry(null)} service={service?.title} city={city} />
    </div>
  );
}
