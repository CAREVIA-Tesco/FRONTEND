import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, HeartHandshake, PhoneCall, CheckCircle2, Loader2 } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PageHero from '../components/PageHero';
import api, { getSessionUser } from '../services/api';
import { useSiteContent } from '../services/useSiteContent';
import { SERVICES } from '../data/services';

const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-primary placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition';

// "Refer a friend": the friend becomes a callback lead in the admin Enquiries pipeline
export default function Refer() {
  const user = getSessionUser();
  const cities = useSiteContent('cities');
  const [form, setForm] = useState({ referrerName: user?.name || '', referrerPhone: user?.phone || '', name: '', phone: '', service: '', city: '', message: '', consent: true });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(null);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })); };
  const digits = (v) => String(v).replace(/\D/g, '');

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.referrerName.trim()) er.referrerName = 'Enter your name';
    if (digits(form.referrerPhone).length < 10) er.referrerPhone = 'Enter your 10-digit mobile number';
    if (!form.name.trim()) er.name = "Enter your friend's name";
    if (digits(form.phone).length < 10) er.phone = "Enter your friend's 10-digit mobile number";
    if (!form.service) er.service = 'Choose a service';
    if (!form.consent) er.consent = 'Please confirm your friend is happy to be contacted';
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true); setServerError('');
    try {
      setDone(await api.createEnquiry({ ...form, type: 'referral', source: '/refer' }));
    } catch (err) { setServerError(err.message); } finally { setSaving(false); }
  };

  const Err = ({ k }) => (errors[k] ? <span className="block text-xs text-red-600 mt-1">{errors[k]}</span> : null);

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip">
      <SiteHeader />
      <PageHero eyebrow="Refer a friend" title="Know someone who needs care at home?" desc="Share their details and a Carevaa care advisor will call them to understand what they need – no obligation." crumbs={[['Refer a Friend']]} />

      <section className="py-12 lg:py-16 px-5 sm:px-8">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_1.3fr] gap-10 items-start">
          <div className="space-y-5">
            {[
              { icon: HeartHandshake, t: 'Help someone you care about', d: 'Elders living alone, a friend recovering from surgery, a new parent – we can help.' },
              { icon: PhoneCall, t: 'We call them, gently', d: 'Our care advisor explains the options. Nothing is booked without their consent.' },
              { icon: Gift, t: 'Track every referral', d: 'You get a request ID to follow progress on the Track Request page.' },
            ].map((x) => (
              <div key={x.t} className="flex gap-4 bg-white rounded-2xl p-5">
                <span className="w-12 h-12 rounded-xl bg-mint text-accent flex items-center justify-center shrink-0"><x.icon className="w-5 h-5" /></span>
                <div><h3 className="font-bold text-primary">{x.t}</h3><p className="text-sm text-gray-600">{x.d}</p></div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8">
            {done ? (
              <div className="text-center py-6" data-testid="referral-success">
                <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-primary mb-2">Thank you!</h2>
                <p className="text-gray-600 text-sm mb-4">{done.message}</p>
                <p className="text-sm text-gray-500">Request ID <span className="font-bold text-primary">{done.enquiry.code}</span></p>
                <Link to={`/track?code=${done.enquiry.code}&phone=${done.enquiry.phone}`} className="inline-block mt-5 bg-primary text-white px-6 py-3 rounded-lg font-bold">Track referral</Link>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-5">
                <fieldset className="grid sm:grid-cols-2 gap-4">
                  <legend className="font-bold text-primary mb-3">Your details</legend>
                  <label className="block"><span className="block text-xs font-semibold text-gray-500 mb-1.5">Your name *</span><input className={inputCls} value={form.referrerName} onChange={set('referrerName')} placeholder="Your name" /><Err k="referrerName" /></label>
                  <label className="block"><span className="block text-xs font-semibold text-gray-500 mb-1.5">Your mobile *</span><input className={inputCls} value={form.referrerPhone} onChange={set('referrerPhone')} placeholder="Your 10-digit mobile" inputMode="tel" /><Err k="referrerPhone" /></label>
                </fieldset>
                <fieldset className="grid sm:grid-cols-2 gap-4">
                  <legend className="font-bold text-primary mb-3">Friend&apos;s details</legend>
                  <label className="block"><span className="block text-xs font-semibold text-gray-500 mb-1.5">Friend&apos;s name *</span><input className={inputCls} value={form.name} onChange={set('name')} placeholder="Friend's name" /><Err k="name" /></label>
                  <label className="block"><span className="block text-xs font-semibold text-gray-500 mb-1.5">Friend&apos;s mobile *</span><input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="Friend's 10-digit mobile" inputMode="tel" /><Err k="phone" /></label>
                  <label className="block"><span className="block text-xs font-semibold text-gray-500 mb-1.5">Care needed *</span>
                    <select className={inputCls} value={form.service} onChange={set('service')}><option value="">Select a service</option>{SERVICES.map((s) => <option key={s.key} value={s.title}>{s.title}</option>)}</select><Err k="service" />
                  </label>
                  <label className="block"><span className="block text-xs font-semibold text-gray-500 mb-1.5">City</span>
                    <select className={inputCls} value={form.city} onChange={set('city')}><option value="">Select city</option>{cities.map((c) => <option key={c.name}>{c.name}</option>)}<option>Other</option></select>
                  </label>
                </fieldset>
                <label className="block"><span className="block text-xs font-semibold text-gray-500 mb-1.5">Anything we should know?</span><textarea rows={3} className={`${inputCls} resize-none`} value={form.message} onChange={set('message')} placeholder="e.g. My uncle, 70, needs physiotherapy after a fall" /></label>
                <label className="flex items-start gap-2 text-xs text-gray-500"><input type="checkbox" checked={form.consent} onChange={set('consent')} className="mt-0.5" /> My friend knows I am sharing their details and is happy to be contacted by Carevaa.</label>
                <Err k="consent" />
                {serverError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{serverError}</p>}
                <button type="submit" disabled={saving} className="w-full bg-secondary hover:bg-secondary-hover text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Refer my friend</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
