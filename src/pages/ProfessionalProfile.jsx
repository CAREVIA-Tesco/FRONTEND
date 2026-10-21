import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star, MapPin, Briefcase, GraduationCap, Languages, ShieldCheck, Clock, Video, Building2, House, ArrowRight, BadgeCheck } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import BookingModal from '../components/BookingModal';
import EnquiryModal from '../components/EnquiryModal';
import api from '../services/api';
import { inr } from '../services/usePublicStats';
import { serviceForProvider, citySlug, BOOKING_TYPE } from '../data/services';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const initials = (name = '') => name.replace(/^Dr\.?\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const shortName = (n = '') => { const [a, b] = String(n).split(' '); return b ? `${a} ${b[0]}.` : a || 'Patient'; };

// Public profile of a verified professional ("View profile" / "Know more")
export default function ProfessionalProfile() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState({ reviews: [], summary: null });
  const [bookingOpen, setBookingOpen] = useState(false);
  const [enquiry, setEnquiry] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setDoc(null); setError('');
    api.getProvider(id).then((d) => setDoc(d.provider)).catch((e) => setError(e.message));
    api.getReviews({ providerId: id, limit: 20 }).then((d) => setReviews(d)).catch(() => {});
  }, [id]);

  const service = doc ? serviceForProvider(doc) : null;
  const langs = doc ? [].concat(doc.languages || []).filter(Boolean) : [];
  const fees = doc ? [
    doc.fee ? { icon: House, label: doc.isDoctor ? 'Home visit' : 'Per visit / session', value: doc.fee } : null,
    doc.clinicFee ? { icon: Building2, label: 'Clinic visit', value: doc.clinicFee } : null,
    doc.onlineFee ? { icon: Video, label: 'Online consult', value: doc.onlineFee } : null,
  ].filter(Boolean) : [];
  const summary = reviews.summary;

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip">
      <SiteHeader />
      <section className="bg-tint pt-[92px] lg:pt-[120px] pb-10">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6 flex flex-wrap gap-1.5">
            <Link to="/" className="hover:text-accent">Home</Link> /
            <Link to="/doctors" className="hover:text-accent">Our professionals</Link> /
            <span className="text-primary font-medium">{doc?.name || '…'}</span>
          </nav>
          {error && <p className="bg-white rounded-xl p-6 text-gray-600">This profile is not available. <Link to="/doctors" className="text-accent font-semibold">See all professionals</Link></p>}
          {doc && (
            <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
              <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden bg-mint shrink-0 mx-auto sm:mx-0">
                  <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-accent/60">{initials(doc.name)}</span>
                  {doc.img && <img src={doc.img} alt={doc.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="relative w-full h-full object-cover" />}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 rounded-full px-3 py-1 mb-3"><BadgeCheck className="w-4 h-4" /> Verified by Carevaa</p>
                  <h1 className="font-poppins font-semibold text-3xl sm:text-4xl text-primary">{doc.name}</h1>
                  <p className="mt-2 eyebrow !text-[12.5px] text-accent">{doc.spec}{doc.specialization && !doc.spec.toLowerCase().includes(String(doc.specialization).toLowerCase().slice(0, 5)) ? ` · ${doc.specialization}` : ''}</p>
                  <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-accent" /> {doc.exp} experience</span>
                    {doc.qualification && <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-accent" /> {doc.qualification}</span>}
                    {doc.loc && <Link to={`/cities/${citySlug(doc.loc)}`} className="flex items-center gap-1.5 hover:text-accent"><MapPin className="w-4 h-4 text-accent" /> {doc.loc}{doc.state ? `, ${doc.state}` : ''}</Link>}
                    {langs.length > 0 && <span className="flex items-center gap-1.5"><Languages className="w-4 h-4 text-accent" /> {langs.join(', ')}</span>}
                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {doc.rating === 'New' ? 'New on Carevaa' : `${doc.rating} (${doc.reviews} ${doc.reviews === 1 ? 'review' : 'reviews'})`}</span>
                  </div>
                  {doc.registrationNumber && <p className="mt-4 text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1.5"><ShieldCheck className="w-4 h-4" /> Registration no. {doc.registrationNumber}{doc.registrationCouncil ? ` · ${doc.registrationCouncil}` : ''}</p>}
                  {doc.bio && <p className="mt-4 text-[15px] leading-relaxed text-primary/75 max-w-2xl" data-testid="doctor-bio">{doc.bio}</p>}
                  {doc.homeVisitRadiusKm > 0 && <p className="mt-2 text-sm text-gray-600">Home visits within {doc.homeVisitRadiusKm} km of {doc.loc}{doc.pincode ? ` ${doc.pincode}` : ''}</p>}
                  {doc.clinic?.name && <p className="mt-2 text-sm text-gray-600"><span className="font-semibold text-primary">{doc.clinic.name}</span>{doc.clinic.address ? ` – ${doc.clinic.address}` : ''}</p>}
                </div>
              </div>

              <aside className="bg-white rounded-2xl p-6 lg:sticky lg:top-28">
                <h2 className="font-bold text-lg text-primary mb-4">Fees</h2>
                <ul className="space-y-3 mb-6">
                  {fees.length === 0 && <li className="text-sm text-gray-500">Fee shared at booking.</li>}
                  {fees.map((f) => (
                    <li key={f.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600"><f.icon className="w-4 h-4 text-accent" /> {f.label}</span>
                      <span className="font-bold text-primary">{inr(f.value)}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => setBookingOpen(true)} className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-3.5 rounded-lg transition-colors">Book with {doc.name.split(' ').slice(0, 2).join(' ')}</button>
                <button type="button" onClick={() => setEnquiry(true)} className="w-full mt-3 border border-accent/40 text-accent font-bold py-3 rounded-lg hover:bg-accent hover:text-white transition-colors">Request a callback</button>
                {service && <Link to={service.link} className="mt-4 text-sm font-semibold text-accent inline-flex items-center gap-1">About {service.title} <ArrowRight className="w-4 h-4" /></Link>}
              </aside>
            </div>
          )}
        </div>
      </section>

      {doc && (
        <section className="py-12 lg:py-16">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-6 sm:p-8">
                <h2 className="font-poppins font-semibold text-2xl text-primary mb-5">Weekly availability</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {DAYS.map((d) => {
                    const slots = doc.schedule?.[d] || [];
                    return (
                      <div key={d} className={`rounded-xl border p-4 ${slots.length ? 'border-accent/20' : 'border-black/5 bg-cream'}`}>
                        <p className="font-semibold text-primary text-sm mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> {d}</p>
                        {slots.length ? (
                          <div className="flex flex-wrap gap-1.5">{slots.map((t) => <span key={t} className="text-xs bg-mint text-accent font-semibold rounded-full px-2.5 py-1">{t}</span>)}</div>
                        ) : <p className="text-xs text-gray-400">Not available</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8">
                <h2 className="font-poppins font-semibold text-2xl text-primary mb-5">Patient reviews</h2>
                {(!summary || summary.count === 0) ? (
                  <p className="text-gray-500 text-sm">No reviews yet. Patients can rate a visit after it is completed.</p>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row gap-6 sm:items-center mb-6 pb-6 border-b border-gray-100">
                      <div className="text-center sm:text-left">
                        <p className="text-5xl font-bold text-primary">{summary.average}</p>
                        <div className="flex justify-center sm:justify-start gap-0.5 my-1">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`w-4 h-4 ${i <= Math.round(summary.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />)}</div>
                        <p className="text-sm text-gray-500">{summary.count} {summary.count === 1 ? 'review' : 'reviews'}</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {summary.distribution.map((d) => (
                          <div key={d.stars} className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="w-6">{d.stars}★</span>
                            <span className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden"><span className="block h-full bg-amber-400" style={{ width: `${d.pct}%` }} /></span>
                            <span className="w-8 text-right">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <ul className="space-y-5">
                      {reviews.reviews.map((r) => (
                        <li key={r.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-primary text-sm">{shortName(r.patient)}</span>
                            <span className="text-xs text-gray-400">{r.date}</span>
                          </div>
                          <div className="flex gap-0.5 mb-1.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />)}</div>
                          {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-bold text-primary mb-3">How booking works</h2>
              <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside">
                <li>Pick a visit type and an open slot.</li>
                <li>Confirm your details and pay securely.</li>
                <li>Get your appointment ID instantly – reschedule or cancel from your dashboard.</li>
              </ol>
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} providerId={doc?.id} serviceType={service ? BOOKING_TYPE(service.key) : undefined} />
      <EnquiryModal open={enquiry} onClose={() => setEnquiry(false)} service={service?.title} message={doc ? `I would like to book ${doc.name}.` : ''} />
    </div>
  );
}
