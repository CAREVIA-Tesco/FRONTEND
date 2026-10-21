import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Loader2, PhoneCall } from 'lucide-react';
import api, { getSessionUser } from '../services/api';
import { useSiteContent, useContact } from '../services/useSiteContent';
import { SERVICES } from '../data/services';

export const TIME_SLOTS = ['Morning (8am – 12pm)', 'Afternoon (12pm – 4pm)', 'Evening (4pm – 8pm)', 'Anytime'];
export const CONTACT_SUBJECTS = ['Booking help', 'Feedback', 'Complaint', 'Billing & refunds', 'Other'];
export const PARTNER_TYPES = ['Hospital / Clinic', 'Diagnostic centre', 'Medical equipment', 'Corporate wellness', 'Insurance / TPA', 'Other'];

const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-primary placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition';
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1.5';

function Field({ label, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className={labelCls}>{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

/**
 * The website's lead form (Request a callback / care plan / requirement / contact / partner).
 * Saves to POST /api/enquiries and shows the request ID the customer can track.
 */
export default function EnquiryForm({ type = 'callback', service = '', plan = '', message = '', submitLabel, onDone, compact = false }) {
  const user = getSessionUser();
  const location = useLocation();
  const cities = useSiteContent('cities');
  const contact = useContact();
  const isLead = ['callback', 'plan', 'requirement'].includes(type);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: user?.city || '',
    service: service || '',
    plan: plan || '',
    subject: type === 'contact' ? CONTACT_SUBJECTS[0] : type === 'partner' ? PARTNER_TYPES[0] : '',
    organisation: '',
    preferredDate: '',
    preferredTime: TIME_SLOTS[3],
    message: message || '',
    consent: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(null);

  const cityOptions = useMemo(() => {
    const names = cities.map((c) => c.name);
    return form.city && !names.includes(form.city) ? [...names, form.city] : names;
  }, [cities, form.city]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (isLead && !form.service) e.service = 'Choose a service';
    if (type === 'contact' && !form.message.trim()) e.message = 'Please type your message';
    if (type === 'partner' && !form.organisation.trim()) e.organisation = 'Enter your organisation name';
    if (!form.consent) e.consent = 'Please allow us to contact you';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, type, source: location.pathname };
      if (!isLead) { delete payload.preferredDate; delete payload.preferredTime; }
      const res = await api.createEnquiry(payload);
      setDone(res);
      onDone?.(res);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    const e = done.enquiry;
    return (
      <div className="text-center py-4" data-testid="enquiry-success">
        <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-9 h-9" /></div>
        <h3 className="text-xl font-bold text-primary mb-2">{type === 'contact' ? 'Message sent!' : type === 'partner' ? 'Thank you!' : 'Request received!'}</h3>
        <p className="text-gray-600 text-sm mb-5">{done.message}</p>
        <div className="inline-flex flex-col items-center bg-tint rounded-2xl px-8 py-4 mb-6">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your request ID</span>
          <span className="text-2xl font-bold font-poppins text-primary" data-testid="enquiry-code">{e.code}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/track?code=${encodeURIComponent(e.code)}&phone=${encodeURIComponent(e.phone)}`} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors">Track your request</Link>
          {contact.phone && <a href={contact.phoneHref} className="border-2 border-primary/15 text-primary px-6 py-3 rounded-full font-semibold text-sm hover:border-primary transition-colors flex items-center justify-center gap-2"><PhoneCall className="w-4 h-4" /> Call {contact.phone}</a>}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <Field label="Full name *" error={errors.name}>
          <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Your name" autoComplete="name" />
        </Field>
        <Field label="Mobile number *" error={errors.phone}>
          <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="10-digit mobile number" inputMode="tel" autoComplete="tel" />
        </Field>

        {type === 'partner' && (
          <>
            <Field label="Organisation *" error={errors.organisation}>
              <input className={inputCls} value={form.organisation} onChange={set('organisation')} placeholder="Hospital, clinic or company name" />
            </Field>
            <Field label="Partnership type">
              <select className={inputCls} value={form.subject} onChange={set('subject')}>
                {PARTNER_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </>
        )}

        <Field label={type === 'contact' || type === 'partner' ? 'Email' : 'Email (optional)'} error={errors.email}>
          <input className={inputCls} value={form.email} onChange={set('email')} placeholder="you@example.com" type="email" autoComplete="email" />
        </Field>

        {type === 'contact' ? (
          <Field label="Subject">
            <select className={inputCls} value={form.subject} onChange={set('subject')}>
              {CONTACT_SUBJECTS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        ) : (
          <Field label="City">
            <select className={inputCls} value={form.city} onChange={set('city')}>
              <option value="">Select your city</option>
              {cityOptions.map((c) => <option key={c}>{c}</option>)}
              <option value="Other">Other</option>
            </select>
          </Field>
        )}

        {isLead && (
          <>
            <Field label="Service needed *" error={errors.service}>
              <select className={inputCls} value={form.service} onChange={set('service')}>
                <option value="">Select a service</option>
                {SERVICES.map((s) => <option key={s.key} value={s.title}>{s.title}</option>)}
              </select>
            </Field>
            {type === 'plan' && form.plan ? (
              <Field label="Care plan">
                <input className={`${inputCls} bg-gray-50`} value={form.plan} readOnly />
              </Field>
            ) : (
              <Field label="Preferred date">
                <input className={inputCls} type="date" min={todayISO()} value={form.preferredDate} onChange={set('preferredDate')} />
              </Field>
            )}
            <Field label="Best time to call" className={type === 'plan' && form.plan ? '' : compact ? '' : 'sm:col-span-2'}>
              <select className={inputCls} value={form.preferredTime} onChange={set('preferredTime')}>
                {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            {type === 'plan' && form.plan && (
              <Field label="Preferred start date">
                <input className={inputCls} type="date" min={todayISO()} value={form.preferredDate} onChange={set('preferredDate')} />
              </Field>
            )}
          </>
        )}
      </div>

      <Field label={type === 'contact' ? 'Message *' : type === 'requirement' ? 'Describe your requirement' : 'Anything we should know? (optional)'} error={errors.message}>
        <textarea
          className={`${inputCls} resize-none`}
          rows={compact ? 3 : 4}
          value={form.message}
          onChange={set('message')}
          placeholder={type === 'requirement' ? 'e.g. Day-time care taker for my father after knee surgery, 4 weeks' : type === 'partner' ? 'Tell us how you would like to work with Carevia' : type === 'contact' ? 'How can we help? Include your booking ID if you have one.' : 'Patient age, condition, address area…'}
        />
      </Field>

      <label className="flex items-start gap-2 text-xs text-gray-500">
        <input type="checkbox" checked={form.consent} onChange={set('consent')} className="mt-0.5 accent-[var(--color-primary)]" />
        <span>I agree to be contacted by Carevia by phone, SMS, WhatsApp or email about this request.</span>
      </label>
      {errors.consent && <p className="text-xs text-red-600 -mt-2">{errors.consent}</p>}
      {serverError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{serverError}</p>}

      <button type="submit" disabled={saving} className="w-full bg-secondary hover:bg-secondary-hover disabled:opacity-70 text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitLabel || (type === 'contact' ? 'Send message' : type === 'partner' ? 'Submit partnership enquiry' : 'Request a callback')}
      </button>
    </form>
  );
}
