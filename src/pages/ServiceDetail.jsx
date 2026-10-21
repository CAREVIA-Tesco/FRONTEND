import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CalendarCheck, PhoneCall, ShieldCheck, Clock, House, Loader2 } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PageHero from '../components/PageHero';
import EnquiryModal from '../components/EnquiryModal';
import ServiceProfessionals from '../components/ServiceProfessionals';
import { useBookNow } from '../components/BookNow';
import { useServices, loadServices } from '../data/services';

// Page for a service the admin added in Admin → Services (built-in services keep their own pages).
export default function ServiceDetail() {
  const { key } = useParams();
  const services = useServices();
  const [checked, setChecked] = useState(false);
  const [enquiry, setEnquiry] = useState(false);
  const bookNow = useBookNow();
  const service = services.find((s) => s.key === key);

  useEffect(() => { window.scrollTo(0, 0); loadServices().finally(() => setChecked(true)); }, [key]);
  useEffect(() => { if (service) document.title = `${service.title} at home – Carevaa`; return () => { document.title = 'Carevaa – Healthcare at home'; }; }, [service]);

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
      <PageHero eyebrow={service.short || 'Care at home'} title={`${service.title} at home`} desc={service.desc} crumbs={[['Our Services', '/services'], [service.title]]}>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={() => bookNow({ service: service.title })} className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2"><CalendarCheck className="w-4 h-4" /> Book Now</button>
          <button type="button" onClick={() => setEnquiry(true)} className="bg-white border border-primary/15 text-primary font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 hover:border-primary"><PhoneCall className="w-4 h-4" /> Request callback</button>
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
              <li className="flex items-center gap-3"><House className="w-5 h-5 text-accent" /> Care delivered at your home</li>
              <li className="flex items-center gap-3"><Clock className="w-5 h-5 text-accent" /> Our care advisor calls you back to plan the visit</li>
            </ul>
          </div>
        </div>
      </section>

      <ServiceProfessionals serviceKey={service.key} />
      <SiteFooter />
      <EnquiryModal open={enquiry} onClose={() => setEnquiry(false)} service={service.title} />
    </div>
  );
}
