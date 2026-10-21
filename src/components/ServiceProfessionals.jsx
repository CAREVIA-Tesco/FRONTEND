import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import ProCard from './ProCard';
import BookingModal from './BookingModal';
import api from '../services/api';
import { useSiteContent } from '../services/useSiteContent';
import { SERVICES, BOOKING_TYPE, providersForService, specsFor, citySlug } from '../data/services';

// "Our physiotherapists" block on each service page: featured professionals + city links
export default function ServiceProfessionals({ serviceKey }) {
  const service = SERVICES.find((s) => s.key === serviceKey);
  const cities = useSiteContent('cities');
  const [providers, setProviders] = useState([]);
  const [bookId, setBookId] = useState(null);

  useEffect(() => { api.getProviders().then((d) => setProviders(d.providers || [])).catch(() => {}); }, []);
  if (!service) return null;

  const pros = providersForService(providers, serviceKey).slice(0, 6);
  const cityNames = [...new Set([...providersForService(providers, serviceKey).map((p) => p.loc).filter((l) => l && l !== 'Virtual'), ...cities.map((c) => c.name)])];
  const spec = specsFor(serviceKey)[0];

  return (
    <section className="py-16 lg:py-20 bg-cream" id="professionals">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow text-accent mb-2">Verified professionals</p>
            <h2 className="font-poppins font-semibold text-[28px] md:text-[36px] text-primary">Meet our {service.title.toLowerCase()} experts</h2>
          </div>
          <Link to={spec ? `/doctors?spec=${encodeURIComponent(spec)}` : '/doctors'} className="font-bold text-accent inline-flex items-center gap-1.5 hover:gap-3 transition-all">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {pros.length === 0 ? (
          <p className="bg-white rounded-2xl p-6 text-gray-600 text-sm">Our {service.title.toLowerCase()} team is growing – request a callback and our care advisor will arrange a professional for you.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pros.map((p) => <ProCard key={p.id} p={p} onBook={(doc) => setBookId(doc.id)} />)}
          </div>
        )}
        {cityNames.length > 0 && (
          <div className="mt-10">
            <h3 className="font-bold text-primary mb-3">{service.title} by city</h3>
            <div className="flex flex-wrap gap-2.5">
              {cityNames.map((c) => (
                <Link key={c} to={`/cities/${citySlug(c)}/${serviceKey}`} className="inline-flex items-center gap-1.5 bg-white border border-black/[0.07] rounded-full px-4 py-2 text-sm text-primary hover:border-accent hover:text-accent transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-accent" /> {service.title} in {c}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <BookingModal isOpen={!!bookId} onClose={() => setBookId(null)} providerId={bookId} serviceType={BOOKING_TYPE(serviceKey)} />
    </section>
  );
}
