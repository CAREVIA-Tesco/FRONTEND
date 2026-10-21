import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PageHero from '../components/PageHero';
import EnquiryModal from '../components/EnquiryModal';
import api from '../services/api';
import { useSiteContent } from '../services/useSiteContent';
import { SERVICES, specsFor } from '../data/services';

const shortName = (n = '') => { const [a, b] = String(n).split(' '); return b ? `${a} ${b[0]}.` : a || 'Patient'; };
const Stars = ({ n, size = 'w-4 h-4' }) => <span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`${size} ${i <= Math.round(n) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />)}</span>;

// All patient reviews (verified visits) + featured stories, filterable by service
export default function Reviews() {
  const testimonials = useSiteContent('testimonials');
  const [filter, setFilter] = useState('');
  const [data, setData] = useState(null);
  const [enquiry, setEnquiry] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    setData(null);
    const svc = SERVICES.find((s) => s.key === filter);
    const spec = svc ? (svc.key === 'doctor-visit' ? '' : specsFor(svc.key).join(',')) : '';
    api.getReviews({ limit: 100, spec }).then(setData).catch(() => setData({ reviews: [], summary: null }));
  }, [filter]);

  const summary = data?.summary;

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip">
      <SiteHeader />
      <PageHero eyebrow="Patient reviews" title="What our patients say" desc="Ratings and comments from patients after completed Carevia visits." crumbs={[['Reviews']]} />

      <section className="py-12 lg:py-16 px-5 sm:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Filter by service">
            {[['', 'All services'], ...SERVICES.filter((s) => s.key !== 'doctor-visit').map((s) => [s.key, s.title])].map(([k, l]) => (
              <button key={k || 'all'} type="button" onClick={() => setFilter(k)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === k ? 'bg-accent text-white' : 'bg-white text-primary border border-black/[0.07] hover:border-accent'}`}>{l}</button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
            <aside className="bg-white rounded-2xl p-6 lg:sticky lg:top-28">
              {summary && summary.count > 0 ? (
                <>
                  <p className="text-5xl font-bold text-primary">{summary.average}</p>
                  <div className="my-2"><Stars n={summary.average} /></div>
                  <p className="text-sm text-gray-500 mb-5">{summary.count} verified {summary.count === 1 ? 'review' : 'reviews'}</p>
                  <div className="space-y-1.5">
                    {summary.distribution.map((d) => (
                      <div key={d.stars} className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="w-6">{d.stars}★</span>
                        <span className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden"><span className="block h-full bg-amber-400" style={{ width: `${d.pct}%` }} /></span>
                        <span className="w-6 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="text-sm text-gray-500">{data ? 'No reviews for this service yet.' : 'Loading…'}</p>}
              <p className="text-xs text-gray-400 mt-6">Only patients with a completed visit can leave a review, from their dashboard.</p>
            </aside>

            <div className="space-y-4">
              {(data?.reviews || []).map((r) => (
                <article key={r.id} className="bg-white rounded-2xl p-6 border-l-4 border-l-accent">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-primary">{shortName(r.patient)}</span>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <Stars n={r.rating} />
                  {r.comment && <p className="mt-3 text-gray-700 leading-relaxed">{r.comment}</p>}
                  {r.providerName && (
                    <p className="mt-3 text-sm text-gray-500">Visit with <Link to={`/doctors/${r.providerId}`} className="font-semibold text-accent hover:underline">{r.providerName}</Link>{r.providerSpec ? ` · ${r.providerSpec}` : ''}</p>
                  )}
                </article>
              ))}

              {!filter && testimonials.length > 0 && (
                <>
                  <h2 className="font-poppins font-semibold text-2xl text-primary pt-6">Patient stories</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {testimonials.map((t, i) => (
                      <figure key={i} className="bg-white rounded-2xl p-6">
                        <Quote className="w-6 h-6 text-accent/40 mb-3" />
                        <blockquote className="text-gray-700 leading-relaxed">{t.quote}</blockquote>
                        <figcaption className="mt-4 font-bold text-primary capitalize">{String(t.name || '').toLowerCase()}<span className="block text-xs font-normal text-gray-500 capitalize">{String(t.role || '').toLowerCase()}</span></figcaption>
                      </figure>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 px-5 sm:px-8">
        <div className="max-w-[1200px] mx-auto bg-gradient-to-br from-deep via-deep-2 to-deep-3 rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h2 className="font-poppins font-semibold text-2xl sm:text-3xl mb-1">Ready to experience it yourself?</h2>
            <p className="text-white/75">Book a verified professional or talk to a care advisor.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/services" className="bg-secondary hover:bg-secondary-hover text-white px-6 py-3 rounded-lg font-bold">Book Now</Link>
            <button type="button" onClick={() => setEnquiry(true)} className="border border-white/40 px-6 py-3 rounded-lg font-bold hover:bg-white/10">Request callback</button>
          </div>
        </div>
      </section>

      <SiteFooter />
      <EnquiryModal open={enquiry} onClose={() => setEnquiry(false)} />
    </div>
  );
}
