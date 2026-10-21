import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PageHero from '../components/PageHero';
import RequestStatus from '../components/RequestStatus';
import EnquiryModal from '../components/EnquiryModal';
import api, { getSessionUser } from '../services/api';

export default function TrackRequest() {
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [phone, setPhone] = useState(params.get('phone') || '');
  const [enquiry, setEnquiry] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const user = getSessionUser();

  const lookup = async (c = code, p = phone) => {
    setError('');
    if (!c.trim() || p.replace(/\D/g, '').length < 10) { setError('Enter your request ID and the 10-digit mobile number you used.'); return; }
    setLoading(true);
    try {
      const res = await api.trackEnquiry(c.trim(), p);
      setEnquiry(res.enquiry);
      setParams({ code: res.enquiry.code, phone: p }, { replace: true });
    } catch (err) {
      setEnquiry(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (params.get('code') && params.get('phone')) lookup(params.get('code'), params.get('phone'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = async () => {
    setCancelling(true);
    try {
      const res = await api.cancelEnquiry(enquiry.id, phone);
      setEnquiry(res.enquiry);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip">
      <SiteHeader />
      <PageHero eyebrow="Track Request" title="Track your care request" desc="Enter the request ID we gave you and the mobile number you used to see live status and updates." crumbs={[['Track Request']]} />

      <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <form onSubmit={(e) => { e.preventDefault(); lookup(); }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 grid sm:grid-cols-[1fr_1fr_auto] gap-3 -mt-20 relative z-10">
            <input aria-label="Request ID" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Request ID e.g. ENQ-50101" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <input aria-label="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number" inputMode="tel" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Track
            </button>
          </form>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
          {enquiry && <RequestStatus enquiry={enquiry} onCancel={cancel} cancelling={cancelling} />}

          <div className="text-center text-sm text-gray-600 space-y-2">
            {user?.role === 'patient' && <p>Logged in? See all your requests in <Link to="/patient/dashboard" className="font-semibold text-accent">your dashboard</Link>.</p>}
            <p>Don&apos;t have a request ID? <button type="button" onClick={() => setCallbackOpen(true)} className="font-semibold text-accent">Request a callback</button></p>
          </div>
        </div>
      </section>

      <SiteFooter />
      <EnquiryModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />
    </div>
  );
}
