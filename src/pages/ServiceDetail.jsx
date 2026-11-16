import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CalendarCheck, ShieldCheck, Clock, House, Loader2, Building2, Video, FlaskConical, Check } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PageHero from '../components/PageHero';
import ServiceGuide from '../components/ServiceGuide';
import ServiceProfessionals from '../components/ServiceProfessionals';
import { useBookNow } from '../components/BookNow';
import { useServices, loadServices } from '../data/services';
import { visitTypesForService, LAB_TESTS } from '../data/serviceRules';

// Page for a service the admin added in Admin → Services (built-in services keep their own pages).
export default function ServiceDetail() {
  const { key } = useParams();
  const services = useServices();
  const [checked, setChecked] = useState(false);
  const bookNow = useBookNow();
  const service = services.find((s) => s.key === key);

  useEffect(() => { window.scrollTo(0, 0); loadServices().finally(() => setChecked(true)); }, [key]);
  const homeOk = visitTypesForService(key).includes('home');
  useEffect(() => { if (service) document.title = `${service.title}${homeOk ? ' at home' : ''} – Carevaa`; return () => { document.title = 'Carevaa | Doctors, Nurses & Home Care Services'; }; }, [service]);

  if (service && !service.custom && service.link !== `/services/${key}`) return <Navigate to={service.link} replace />;

  if (!service) {
    return (
      <div className="theme-portea font-sans text-primary bg-cream min-h-screen">
        <SiteHeader />
        <div className="pt-40 pb-24 px-5 text-center">
          {!checked ? (
            <p className="inline-flex items-center gap-2 text-primary/60"><Loader2 className="w-4 h-4 animate-spin" /> Loading service…</p>
          ) : (
            <>
              <h1 className="text-3xl font-bold font-poppins">Service not found</h1>
              <p className="mt-3 text-gray-600">This service is not available right now.</p>
              <Link to="/services" className="inline-block mt-6 bg-primary text-white rounded-full px-6 py-3 font-semibold">See all services</Link>
            </>
          )}
        </div>
        <SiteFooter />
      </div>
    );
  }

  const Icon = service.icon;
  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip" data-testid="service-detail">
      <SiteHeader />
      <PageHero eyebrow={service.short || 'Care at home'} title={homeOk ? `${service.title} at home` : `${service.title} – Clinic & Online`} desc={service.desc} crumbs={[['Our Services', '/services'], [service.title]]}>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={() => bookNow({ service: service.title })} className="bg-secondary hover:bg-secondary-hover text-white font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2"><CalendarCheck className="w-4 h-4" /> Book Now</button>
        </div>
      </PageHero>

      <section className="py-14 lg:py-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div className="rounded-3xl overflow-hidden bg-tint aspect-[4/3]">
            <img src={service.img} alt={service.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="w-12 h-12 rounded-2xl bg-tint flex items-center justify-center"><Icon className="w-6 h-6" /></span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold font-poppins">About {service.title}</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">{service.desc}</p>
            {service.price && <p className="mt-5 inline-flex bg-green-50 text-green-700 font-semibold text-sm rounded-full px-4 py-1.5">Starts at {service.price}</p>}
            <ul className="mt-6 space-y-3 text-[15px]">
              <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-accent" /> Verified, trained professionals</li>
              {homeOk ? (
                <li className="flex items-center gap-3"><House className="w-5 h-5 text-accent" /> {visitTypesForService(key).length === 1 ? 'Home visits – care delivered at your home' : 'Care delivered at your home'}</li>
              ) : (
                <li className="flex items-center gap-3"><Building2 className="w-5 h-5 text-accent" /> Clinic visit or <Video className="w-5 h-5 text-accent" /> online consultation</li>
              )}
              <li className="flex items-center gap-3"><Clock className="w-5 h-5 text-accent" /> Our care advisor calls you back to plan the visit</li>
            </ul>
          </div>
        </div>
      </section>

      {key === 'lab-tests' && (
        <section className="pb-14 lg:pb-20 px-5 sm:px-8" data-testid="lab-test-list">
          <div className="max-w-7xl mx-auto">
            <p className="text-[12px] font-bold tracking-[0.14em] uppercase text-accent">Home sample collection</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold font-poppins">Basic Lab Tests</h2>
            <p className="mt-2 text-gray-600 max-w-2xl">Pick a test and book – a trained phlebotomist collects the sample at your home and the report is shared with you.</p>
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {LAB_TESTS.map((t) => (
                <button key={t} type="button" onClick={() => bookNow({ service: service.title, labTests: [t] })} className="group flex items-center justify-between gap-3 text-left bg-white rounded-2xl border border-black/[0.07] px-5 py-4 hover:-translate-y-0.5 hover:border-secondary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-secondary)_45%,transparent)] transition-all duration-300">
                  <span className="flex items-center gap-3 font-semibold text-primary"><span className="w-9 h-9 rounded-xl bg-tint flex items-center justify-center shrink-0"><FlaskConical className="w-4 h-4 text-accent" /></span>{t}</span>
                  <span className="text-[13px] font-semibold text-secondary whitespace-nowrap group-hover:underline">Book</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-gray-500 flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> Home visit only – samples are collected at your address.</p>
          </div>
        </section>
      )}

      <ServiceGuide serviceKey={service.key} serviceName={service.title} onBook={() => bookNow({ service: service.title })} bg="bg-white" />

      <ServiceProfessionals serviceKey={service.key} />
      <SiteFooter />
    </div>
  );
}
