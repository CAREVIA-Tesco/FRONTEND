import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, Loader2, ShieldCheck, TrendingUp, Users, Check, Handshake } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PageHero from '../components/PageHero';
import PincodeFields from '../components/PincodeFields';
import DraftNotice from '../components/DraftNotice';
import api from '../services/api';
import { usePincode, pincodeErrors } from '../services/usePincode';
import { useFormDraft } from '../services/formDraft';

// Business Partner registration – for clinics, labs, pharmacies, agencies and other healthcare businesses.
// A separate workflow from doctor / professional registration: no login account is created here; the
// application goes to Admin → Business Partners for review and approval.
const CATEGORIES = [
  'Hospital', 'Clinic / Polyclinic', 'Diagnostic Laboratory', 'Imaging / Scan Centre', 'Pharmacy',
  'Home Healthcare Agency', 'Nursing / Caretaker Agency', 'Physiotherapy Centre', 'Ambulance Service',
  'Medical Equipment Supplier', 'Wellness / Ayurveda Centre', 'Other',
];
const SERVICES = [
  'Doctor consultations', 'Home visits', 'Nursing care', 'Caretaker / attendant services', 'Physiotherapy',
  'Lab tests & sample collection', 'Scans & imaging', 'Pharmacy & medicine delivery', 'Ambulance',
  'Medical equipment rental', 'Ayurveda / Homeopathy', 'Health checkup packages',
];
const BLANK = {
  businessName: '', category: '', categoryOther: '', contactPerson: '', designation: '', phone: '', email: '', website: '',
  address: '', pincode: '', city: '', district: '', state: '', locality: '',
  services: [], servicesOther: '', yearsInBusiness: '', registrationNumber: '', gstNumber: '', message: '',
};

const inputCls = 'w-full h-12 rounded-xl border border-line bg-white px-4 text-[15px] text-primary placeholder:text-placeholder outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition';
const labelCls = 'block text-[13px] font-semibold text-primary mb-1.5';
const Req = () => <span className="text-secondary"> *</span>;

export default function BusinessPartnerRegister() {
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(null);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })); };
  const patch = (p) => { setForm((f) => ({ ...f, ...p })); setErrors((er) => ({ ...er, ...Object.fromEntries(Object.keys(p).map((k) => [k, undefined])) })); };
  const pin = usePincode(form, patch);
  // saved on this device until submitted
  const draft = useFormDraft('business-partner', done ? null : form, { onRestore: (d) => d && setForm({ ...BLANK, ...d }) });

  useEffect(() => { window.scrollTo(0, 0); document.title = 'Register as a Business Partner – Carevaa'; return () => { document.title = 'Carevaa | Doctors, Nurses & Home Care Services'; }; }, []);

  const toggleService = (s) => patch({ services: form.services.includes(s) ? form.services.filter((x) => x !== s) : [...form.services, s] });

  const validate = () => {
    const er = {};
    if (!form.businessName.trim()) er.businessName = 'Enter your business name';
    if (!form.category) er.category = 'Choose your business category';
    if (form.category === 'Other' && !form.categoryOther.trim()) er.categoryOther = 'Type your business category';
    if (!form.contactPerson.trim()) er.contactPerson = 'Enter the contact person’s name';
    if (!/^[6-9]\d{9}$/.test(form.phone)) er.phone = 'Enter a valid 10-digit mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = 'Enter a valid email address';
    if (!form.address.trim()) er.address = 'Enter the business address';
    Object.assign(er, pincodeErrors(form, pin));
    if (!form.services.length && !form.servicesOther.trim()) er.services = 'Choose at least one service you offer';
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) {
      const first = document.querySelector(`[data-field="${Object.keys(er)[0]}"]`);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSaving(true);
    try {
      const res = await api.registerBusinessPartner({ ...form, email: form.email.trim() });
      draft.clear();
      setDone(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const Err = ({ k }) => (errors[k] ? <p role="alert" className="text-[12.5px] text-red-600 mt-1">{errors[k]}</p> : null);

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip">
      <SiteHeader />
      <PageHero eyebrow="Business partners" title="Register as a Business Partner" desc="Are you running a healthcare business, clinic, laboratory, or healthcare service? Partner with Carevaa and expand your business opportunities." crumbs={[['Register as a Business Partner']]} />

      <section className="px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 -mt-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
          {done ? (
            <div className="bg-white rounded-3xl ring-1 ring-line-soft shadow-sm p-8 sm:p-12 text-center" data-testid="partner-done">
              <span className="w-16 h-16 rounded-full bg-mint text-accent flex items-center justify-center mx-auto"><CheckCircle2 className="w-8 h-8" /></span>
              <h2 className="mt-5 font-poppins font-semibold text-2xl sm:text-3xl">Application received</h2>
              <p className="mt-3 text-gray-600 max-w-lg mx-auto">{done.message}</p>
              {done.partner?.code && <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-tint px-5 py-2 font-semibold">Application ID: <span className="text-secondary" data-testid="partner-code">{done.partner.code}</span></p>}
              <div className="mt-8"><Link to="/" className="inline-flex bg-secondary hover:bg-secondary-hover text-white px-7 py-3 rounded-xl font-bold">Back to home</Link></div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="bg-white rounded-3xl ring-1 ring-line-soft shadow-sm p-5 sm:p-8 lg:p-10 space-y-8" data-testid="partner-form">
              <DraftNotice draft={draft} />

              <fieldset className="space-y-4">
                <legend className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-3">Business details</legend>
                <div data-field="businessName">
                  <label htmlFor="bp-name" className={labelCls}>Business name<Req /></label>
                  <input id="bp-name" className={inputCls} value={form.businessName} onChange={set('businessName')} placeholder="e.g. Sri Lakshmi Diagnostics" autoComplete="organization" />
                  <Err k="businessName" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div data-field="category">
                    <label htmlFor="bp-category" className={labelCls}>Business category<Req /></label>
                    <select id="bp-category" className={inputCls} value={form.category} onChange={set('category')}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <Err k="category" />
                  </div>
                  <div>
                    <label htmlFor="bp-years" className={labelCls}>Years in business</label>
                    <input id="bp-years" type="number" min="0" className={inputCls} value={form.yearsInBusiness} onChange={set('yearsInBusiness')} placeholder="e.g. 5" />
                  </div>
                </div>
                {form.category === 'Other' && (
                  <div data-field="categoryOther">
                    <label htmlFor="bp-category-other" className={labelCls}>Your business category<Req /></label>
                    <input id="bp-category-other" className={inputCls} value={form.categoryOther} onChange={set('categoryOther')} placeholder="Type your category" />
                    <Err k="categoryOther" />
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bp-reg" className={labelCls}>Registration / licence number</label>
                    <input id="bp-reg" className={inputCls} value={form.registrationNumber} onChange={set('registrationNumber')} placeholder="Optional" />
                  </div>
                  <div>
                    <label htmlFor="bp-gst" className={labelCls}>GST number</label>
                    <input id="bp-gst" className={inputCls} value={form.gstNumber} onChange={set('gstNumber')} placeholder="Optional" />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4 pt-6 border-t border-line-soft">
                <legend className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-3">Contact person</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div data-field="contactPerson">
                    <label htmlFor="bp-contact" className={labelCls}>Contact person<Req /></label>
                    <input id="bp-contact" className={inputCls} value={form.contactPerson} onChange={set('contactPerson')} placeholder="Full name" autoComplete="name" />
                    <Err k="contactPerson" />
                  </div>
                  <div>
                    <label htmlFor="bp-designation" className={labelCls}>Designation</label>
                    <input id="bp-designation" className={inputCls} value={form.designation} onChange={set('designation')} placeholder="e.g. Owner, Manager" />
                  </div>
                  <div data-field="phone">
                    <label htmlFor="bp-phone" className={labelCls}>Mobile number<Req /></label>
                    <div className="flex">
                      <span className="h-12 px-3.5 flex items-center rounded-l-xl border border-r-0 border-line bg-tint text-[15px] text-primary/70">+91</span>
                      <input id="bp-phone" className={`${inputCls} rounded-l-none`} value={form.phone} onChange={(e) => patch({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} inputMode="numeric" placeholder="10-digit mobile" autoComplete="tel-national" />
                    </div>
                    <Err k="phone" />
                  </div>
                  <div data-field="email">
                    <label htmlFor="bp-email" className={labelCls}>Email<Req /></label>
                    <input id="bp-email" type="email" className={inputCls} value={form.email} onChange={set('email')} placeholder="name@business.com" autoComplete="email" />
                    <Err k="email" />
                  </div>
                </div>
                <div>
                  <label htmlFor="bp-website" className={labelCls}>Website</label>
                  <input id="bp-website" className={inputCls} value={form.website} onChange={set('website')} placeholder="Optional, e.g. www.yourbusiness.com" autoComplete="url" />
                </div>
              </fieldset>

              <fieldset className="space-y-4 pt-6 border-t border-line-soft">
                <legend className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-3">Business address</legend>
                <div data-field="address">
                  <label htmlFor="bp-address" className={labelCls}>Address<Req /></label>
                  <textarea id="bp-address" rows={2} className={`${inputCls} h-auto py-3`} value={form.address} onChange={set('address')} placeholder="Building, street, landmark" autoComplete="street-address" />
                  <Err k="address" />
                </div>
                <div data-field="pincode">
                  <PincodeFields idPrefix="bp" value={form} onChange={patch} lookup={pin} errors={errors} fieldCls={inputCls} labelCls={labelCls} className="space-y-4" />
                </div>
              </fieldset>

              <fieldset className="pt-6 border-t border-line-soft" data-field="services">
                <legend className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-1">Services offered<Req /></legend>
                <p className="text-[13px] text-primary/55 mb-4">Choose everything your business provides.</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Services offered" data-testid="partner-services">
                  {SERVICES.map((s) => {
                    const on = form.services.includes(s);
                    return <button key={s} type="button" aria-pressed={on} onClick={() => toggleService(s)} className={`min-h-10 px-4 py-2 rounded-full border text-[13.5px] font-medium transition ${on ? 'border-secondary bg-secondary text-white' : 'border-line bg-white text-primary hover:border-secondary/60'}`}>{on && <Check className="w-3.5 h-3.5 inline -mt-0.5 mr-1" strokeWidth={3} />}{s}</button>;
                  })}
                </div>
                <label htmlFor="bp-services-other" className={`${labelCls} mt-4`}>Other services</label>
                <input id="bp-services-other" className={inputCls} value={form.servicesOther} onChange={set('servicesOther')} placeholder="Optional – anything not listed above" />
                <Err k="services" />
              </fieldset>

              <div className="pt-6 border-t border-line-soft">
                <label htmlFor="bp-message" className={labelCls}>Message</label>
                <textarea id="bp-message" rows={3} className={`${inputCls} h-auto py-3`} value={form.message} onChange={set('message')} placeholder="Optional – tell us how you would like to partner with Carevaa" />
              </div>

              {serverError && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{serverError}</p>}
              <button type="submit" disabled={saving} className="w-full sm:w-auto h-12 px-10 bg-secondary hover:brightness-95 disabled:opacity-70 text-white font-semibold text-[16px] rounded-xl shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)] transition inline-flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-5 h-5 animate-spin" />} Submit application
              </button>
              <p className="text-[12px] text-primary/50">Your details are saved on this device until you submit. Our partnerships team reviews every application before approval.</p>
            </form>
          )}

          <aside className="lg:sticky lg:top-28 space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-deep via-deep-2 to-deep-3 text-white p-6 sm:p-7">
              <span className="w-12 h-12 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center"><Handshake className="w-6 h-6 text-on-deep" /></span>
              <h2 className="mt-4 font-poppins font-semibold text-xl">Why partner with Carevaa?</h2>
              <ul className="mt-5 space-y-4 text-[14px] text-white/80">
                <li className="flex gap-3"><TrendingUp className="w-5 h-5 text-on-deep shrink-0" /> Reach families looking for care in your city</li>
                <li className="flex gap-3"><Users className="w-5 h-5 text-on-deep shrink-0" /> Receive referrals from our care advisors</li>
                <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-on-deep shrink-0" /> Listed as a verified Carevaa partner</li>
                <li className="flex gap-3"><Building2 className="w-5 h-5 text-on-deep shrink-0" /> For clinics, labs, pharmacies, agencies and more</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-white ring-1 ring-line-soft p-6 text-[14px] text-primary/70">
              <p className="font-semibold text-primary">Are you an individual doctor or professional?</p>
              <p className="mt-1">Use the professional registration instead.</p>
              <Link to="/doctor/register" className="mt-3 inline-block font-semibold text-secondary hover:underline">Register as a Professional →</Link>
            </div>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
