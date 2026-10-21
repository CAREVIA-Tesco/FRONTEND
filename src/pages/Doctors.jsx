import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import BookingModal from '../components/BookingModal';
import api from '../services/api';
import { Search, MapPin, Star, Briefcase, CheckCircle, Phone, Filter } from 'lucide-react';

export default function Doctors() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookProviderId, setBookProviderId] = useState(null);
  const [params] = useSearchParams();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(params.get('city') || 'All Locations');
  const [specialty, setSpecialty] = useState(params.get('spec') || 'All Specialties');

  // specialities managed in Admin → Specializations (hidden ones are left out)
  const [catalog, setCatalog] = useState([]);
  useEffect(() => { api.getSpecializations().then((d) => setCatalog((d.specializations || []).filter((s) => s.status === 'Active'))).catch(() => {}); }, []);
  const catalogItem = catalog.find((c) => c.name === specialty);
  const specMatches = (doc) => (catalogItem ? [catalogItem.name, ...(catalogItem.matches || [])].includes(doc.spec) || [catalogItem.name, ...(catalogItem.matches || [])].includes(doc.specialization) : doc.spec === specialty);
  const covered = new Set(catalog.flatMap((c) => [c.name, ...(c.matches || [])]));
  const specOptions = [...catalog.map((c) => c.name), ...[...new Set(doctors.map((d) => d.spec).filter(Boolean))].filter((sp) => !covered.has(sp))].sort();

  useEffect(() => {
    api.getProviders()
      .then((data) => setDoctors(data.providers || []))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleDoctors = doctors.filter((doc) => {
    if (search && !`${doc.name} ${doc.spec} ${doc.clinic?.name || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (location !== 'All Locations' && doc.loc !== location) return false;
    if (specialty !== 'All Specialties' && !specMatches(doc)) return false;
    return true;
  });

  return (
    <div className="theme-portea font-sans text-gray-900 bg-cream min-h-screen">
      <SiteHeader />

      <section className="pt-24 lg:pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-poppins">Find & Book Verified Professionals</h1>
          <p className="text-gray-600 text-lg">Doctors, physiotherapists, nurses and caregivers – view profiles, fees and reviews, then book online or at home.</p>
        </div>

        <div className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 max-w-5xl mx-auto">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctor, specialty, or clinic" className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium" />
          </div>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium text-gray-600 appearance-none">
            <option>All Locations</option>
            {[...new Set(doctors.map((d) => d.loc).filter(Boolean))].sort().map((loc) => <option key={loc}>{loc}</option>)}
          </select>
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium text-gray-600 appearance-none">
            <option>All Specialties</option>
            {[...new Set([...specOptions, ...(specialty !== 'All Specialties' ? [specialty] : [])])].map((sp) => <option key={sp}>{sp}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading && <p className="text-gray-500 col-span-full text-center">Loading doctors...</p>}
          {loadError && <p className="text-red-600 col-span-full text-center">{loadError}</p>}
          {!loading && !loadError && visibleDoctors.length === 0 && <p className="text-gray-500 col-span-full text-center">No doctors match your search.</p>}
          {visibleDoctors.map(doc => (
            <div key={doc.id} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="relative mb-4 overflow-hidden rounded-[16px] aspect-square bg-gray-100">
                <Link to={`/doctors/${doc.id}`} className="block w-full h-full"><img src={doc.img} alt={doc.name} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></Link>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Available
                </div>
              </div>
              
              <Link to={`/doctors/${doc.id}`} className="font-bold text-lg text-primary hover:text-accent">{doc.name}</Link>
              <p className="text-sm font-medium text-accent mb-4">{doc.spec}</p>
              
              <div className="flex flex-col gap-2 text-xs font-medium text-gray-500 mb-6 flex-1">
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {doc.exp}</div>
                  <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-400 fill-current" /> {doc.rating}</div>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {doc.loc}</div>
                  <div className="font-bold text-gray-700">₹{doc.fee ?? doc.clinicFee ?? doc.onlineFee} / visit</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Link to={`/doctors/${doc.id}`} className="py-3 rounded-xl border border-accent/40 text-accent text-sm font-bold text-center hover:bg-accent hover:text-white transition-colors">View Profile</Link>
                <button 
                  type="button"
                  onClick={() => { setBookProviderId(doc.id); setIsBookingModalOpen(true); }}
                  className="py-3 rounded-xl bg-secondary text-white text-sm font-bold hover:bg-secondary-hover transition-colors shadow-md"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />

      <BookingModal isOpen={isBookingModalOpen} onClose={() => { setIsBookingModalOpen(false); setBookProviderId(null); }} providerId={bookProviderId} />
    </div>
  );
}
