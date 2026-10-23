import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Check, ChevronDown, Loader2, ShieldCheck, UserCheck, MapPin, CalendarDays, Clock, Phone, ArrowLeft, Sun, Sunset, Moon, Stethoscope, House, Video, Building2 } from 'lucide-react';
import api, { getSessionUser } from '../services/api';
import { useContact } from '../services/useSiteContent';
import { useServices } from '../data/services';
import PincodeFields from './PincodeFields';
import { usePincode, pincodeErrors } from '../services/usePincode';

// "Book Now": step 1 contact details -> step 2 date & time -> /thank-you.
// Any page calls useBookNow()({ service, city }) to open it.
const BookNowContext = createContext(() => {});
export const useBookNow = () => useContext(BookNowContext);

const pad = (n) => String(n).padStart(2, '0');
const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const nextSlot = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000); // at least an hour from now, rounded up to :00 / :30
  d.setMinutes(d.getMinutes() <= 30 ? 30 : 60, 0, 0);
  if (d.getHours() >= 21 || d.getHours() < 7) { // outside visiting hours -> next morning 9:00
    if (d.getHours() >= 21) d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
  }
  return d;
};
const label12 = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};
const SLOT_GROUPS = [
  { name: 'Morning', icon: Sun, from: 7, to: 12 },
  { name: 'Afternoon', icon: Sunset, from: 12, to: 17 },
  { name: 'Evening', icon: Moon, from: 17, to: 21 },
];
const slotsFor = (g) => Array.from({ length: (g.to - g.from) * 2 }, (_, i) => `${pad(g.from + Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`);

const fieldCls = 'w-full h-12 rounded-xl border border-line bg-white px-4 text-[15px] text-primary placeholder:text-placeholder outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition';
const labelCls = 'block text-[13px] font-semibold text-primary mb-1.5';

// where the visit happens – the care team and professionals see this with the request
const VISIT_TYPES = [
  ['home', 'Home visit', 'At your address', House],
  ['online', 'Online', 'Video / phone call', Video],
  ['clinic', 'Clinic', 'Visit the clinic', Building2],
];

function BookNowModal({ open, onClose, preset }) {
  const SERVICES = useServices();
  const navigate = useNavigate();
  const location = useLocation();
  const contact = useContact();
  const user = getSessionUser();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', city: '', pincode: '', district: '', state: '', locality: '', service: '', visitType: 'home', date: '', time: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const slot = nextSlot();
    setStep(1); setErrors({}); setServerError('');
    setForm({
      name: user?.name || '',
      phone: String(user?.phone || '').replace(/\D/g, '').slice(-10),
      // the saved address is reused unless this booking is for another city (city pages pass one)
      ...(!preset?.city || !user?.city || preset.city === user.city
        ? { city: preset?.city || user?.city || '', pincode: user?.pincode || '', district: user?.district || '', state: user?.state || '', locality: user?.locality || '' }
        : { city: preset.city, pincode: '', district: '', state: '', locality: '' }),
      service: preset?.service || '',
      visitType: preset?.visitType || 'home',
      date: localDate(slot),
      time: `${pad(slot.getHours())}:${pad(slot.getMinutes())}`,
    });
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const patchForm = (patch) => { setForm((f) => ({ ...f, ...patch })); setErrors((er) => ({ ...er, ...Object.fromEntries(Object.keys(patch).map((k) => [k, undefined])) })); };
  const pin = usePincode(form, patchForm);

  if (!open) return null;
  const setVal = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((er) => ({ ...er, [k]: undefined })); };
  const set = (k) => (e) => setVal(k, e.target.value);

  const nextFromContact = () => {
    const er = {};
    if (String(form.phone).replace(/\D/g, '').length !== 10) er.phone = 'Enter a valid 10-digit mobile number';
    Object.assign(er, pincodeErrors(form, pin, { requireLocality: true }));
    if (er.city) er.city = 'Enter the city where you need the service';
    setErrors(er);
    if (!Object.keys(er).length) setStep(2);
  };

  // date & time
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
  const isToday = form.date === localDate(today);
  const slotPast = (t) => isToday && new Date(`${form.date}T${t}`).getTime() < Date.now() + 30 * 60 * 1000;
  const when = form.date && form.time ? new Date(`${form.date}T${form.time}`) : null;
  const whenLabel = when && !Number.isNaN(when.getTime())
    ? when.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
    : '';

  const submit = async () => {
    const er = {};
    if (!form.date) er.date = 'Choose a date';
    if (!form.time) er.time = 'Choose a time';
    if (when && when.getTime() < Date.now() - 5 * 60 * 1000) er.time = 'Choose a time later than now';
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true); setServerError('');
    try {
      const res = await api.createEnquiry({
        type: 'booking', name: form.name, phone: form.phone, city: form.city.trim(), pincode: form.pincode, district: form.district.trim() || undefined, state: form.state.trim() || undefined, locality: form.locality.trim() || undefined, service: form.service || undefined, visitType: form.visitType,
        preferredDate: form.date, preferredTime: form.time, source: location.pathname,
      });
      onClose();
      navigate(`/thank-you?code=${encodeURIComponent(res.enquiry.code)}&phone=${encodeURIComponent(res.enquiry.phone)}`, { state: res });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const Err = ({ k }) => (errors[k] ? <p role="alert" className="text-[13px] text-red-600 mt-1.5">{errors[k]}</p> : null);
  const STEPS = [['Contact details', 'Who should we call?'], ['Visit & time', 'Home, online or clinic']];

  return (
    <div className="theme-portea fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4 font-sans" role="dialog" aria-modal="true" aria-label="Book medical services at home">
      <div className="absolute inset-0 bg-deep/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="cv-rise relative w-full sm:max-w-[880px] max-h-[94vh] overflow-y-auto sm:overflow-hidden bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_30px_80px_-20px_color-mix(in_srgb,var(--color-deep)_60%,transparent)] grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[290px_minmax(0,1fr)]">
        {/* Brand / progress panel */}
        <aside className="relative overflow-hidden bg-deep text-white px-6 py-6 sm:px-7 sm:py-8 flex flex-col">
          <div className="absolute -top-16 -right-14 w-52 h-52 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-accent/40 blur-3xl pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <span className="h-11 w-11 rounded-xl bg-white flex items-center justify-center"><img src="/logo.png" alt="Carevaa" className="h-9 w-9 object-contain" /></span>
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.16em] text-on-deep">Carevaa</p>
              <p className="font-serif text-[20px] font-semibold">{form.visitType === 'online' ? 'Book a consultation' : form.visitType === 'clinic' ? 'Book a clinic visit' : 'Book a home visit'}</p>
            </div>
          </div>
          {form.service && <p className="relative mt-4 self-start text-[13px] font-semibold bg-white/10 ring-1 ring-white/20 rounded-full px-3 py-1">{form.service}</p>}

          <ol className="relative mt-6 sm:mt-8 flex sm:flex-col gap-4 sm:gap-0">
            {STEPS.map(([title, sub], i) => {
              const n = i + 1; const done = step > n; const active = step === n;
              return (
                <li key={title} className="relative flex items-start gap-3 sm:pb-7 last:pb-0">
                  {i === 0 && <span className={`hidden sm:block absolute left-[17px] top-10 bottom-1 w-px ${step > 1 ? 'bg-secondary-bright' : 'bg-white/20'}`} aria-hidden="true" />}
                  <span className={`relative z-10 w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${done ? 'bg-secondary text-white' : active ? 'bg-white text-deep' : 'bg-white/10 text-white/60 ring-1 ring-white/20'}`}>
                    {done ? <Check className="w-4 h-4" strokeWidth={3} /> : n}
                  </span>
                  <span className="leading-tight pt-0.5">
                    <span className={`block text-[14px] font-semibold ${active || done ? 'text-white' : 'text-white/60'}`}>{title}</span>
                    <span className="hidden sm:block text-[12px] text-white/55 mt-0.5">{sub}</span>
                  </span>
                </li>
              );
            })}
          </ol>

          <ul className="relative hidden sm:block mt-auto pt-8 space-y-3 text-[13px] text-white/75">
            <li className="flex items-center gap-2.5"><UserCheck className="w-4 h-4 text-secondary-soft" /> Verified, experienced professionals</li>
            <li className="flex items-center gap-2.5"><ShieldCheck className="w-4 h-4 text-secondary-soft" /> Your details stay private</li>
            <li className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-secondary-soft" /> Track your request online</li>
            {contact.phone && <li className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-secondary-soft" /> <a href={contact.phoneHref} className="hover:text-white">{contact.phone}</a></li>}
          </ul>
        </aside>

        {/* Form panel */}
        <div className="relative px-5 py-6 sm:px-9 sm:py-8 sm:max-h-[94vh] sm:overflow-y-auto">
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 w-9 h-9 flex items-center justify-center text-primary/60 hover:text-primary hover:bg-tint rounded-full transition"><X className="w-5 h-5" /></button>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Step {step} of 2</p>
          <h2 className="font-serif text-[24px] sm:text-[28px] font-semibold text-primary leading-tight mt-1 pr-10">{step === 1 ? 'Your contact details' : 'Visit type, date and time'}</h2>
          <p className="text-[14px] text-primary/60 mt-1.5">{step === 1 ? 'A care advisor will call you on this number to confirm the visit.' : 'Pick a slot that suits you. We will confirm it with the professional.'}</p>

          {step === 1 ? (
            <div key="s1" className="cv-slide-in mt-6 space-y-4">
              <div>
                <label htmlFor="bn-name" className={labelCls}>Full name</label>
                <input id="bn-name" className={fieldCls} value={form.name} onChange={set('name')} placeholder="Please provide your name" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="bn-phone" className={labelCls}>Mobile number <span className="text-secondary">*</span></label>
                <div className="flex">
                  <span className="h-12 px-3.5 flex items-center rounded-l-xl border border-r-0 border-line bg-tint text-[15px] text-primary/70">+91</span>
                  <input id="bn-phone" className={`${fieldCls} rounded-l-none`} value={form.phone} onChange={(e) => setVal('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="To coordinate with you" inputMode="numeric" autoComplete="tel-national" aria-invalid={!!errors.phone} />
                </div>
                <Err k="phone" />
              </div>
              <PincodeFields idPrefix="bn" value={form} onChange={patchForm} lookup={pin} errors={errors} fieldCls={fieldCls} labelCls={labelCls} errCls="text-[13px] text-red-600 mt-1" hintCls="text-[13px] mt-1" />
              {!preset?.service && (
                <div>
                  <label htmlFor="bn-service" className={labelCls}>Service <span className="font-normal text-primary/45">(optional)</span></label>
                  <span className="relative block">
                    <select id="bn-service" aria-label="Service" className={`${fieldCls} appearance-none pr-10`} value={form.service} onChange={set('service')}>
                      <option value="">Not sure yet</option>
                      {SERVICES.map((s) => <option key={s.key} value={s.title}>{s.title}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/60" />
                  </span>
                </div>
              )}
              <button type="button" onClick={nextFromContact} className="w-full h-12 mt-2 bg-secondary hover:brightness-95 text-white font-semibold text-[16px] rounded-xl shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)] transition hover:-translate-y-0.5">Next</button>
            </div>
          ) : (
            <div key="s2" className="cv-slide-in mt-6 space-y-5">
              <div>
                <p className={`${labelCls} flex items-center gap-1.5`}><Stethoscope className="w-4 h-4 text-accent" /> How should we see the patient?</p>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Visit type">
                  {VISIT_TYPES.map(([v, l, sub, Icon]) => {
                    const on = form.visitType === v;
                    return (
                      <button key={v} type="button" role="radio" aria-checked={on} onClick={() => setVal('visitType', v)} className={`rounded-xl border px-2 py-2.5 text-center transition ${on ? 'border-primary bg-primary text-white shadow-md' : 'border-line bg-white text-primary hover:border-secondary/60'}`}>
                        <Icon className={`w-5 h-5 mx-auto ${on ? 'text-white' : 'text-accent'}`} />
                        <span className="block text-[13px] font-semibold mt-1 leading-tight">{l}</span>
                        <span className={`block text-[11px] leading-tight mt-0.5 ${on ? 'text-white/70' : 'text-primary/50'}`}>{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className={`${labelCls} flex items-center gap-1.5`}><CalendarDays className="w-4 h-4 text-accent" /> Date</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1" role="group" aria-label="Upcoming days">
                  {days.map((d, i) => {
                    const v = localDate(d); const on = form.date === v;
                    return (
                      <button key={v} type="button" onClick={() => setVal('date', v)} aria-pressed={on} className={`shrink-0 w-[68px] rounded-xl border px-2 py-2 text-center transition ${on ? 'border-primary bg-primary text-white shadow-md' : 'border-line bg-white text-primary hover:border-secondary/60'}`}>
                        <span className={`block text-[11px] uppercase tracking-wide ${on ? 'text-white/70' : 'text-primary/50'}`}>{i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                        <span className="block text-[18px] font-semibold leading-tight">{d.getDate()}</span>
                        <span className={`block text-[11px] ${on ? 'text-white/70' : 'text-primary/50'}`}>{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[13px] text-primary/60">
                  <label htmlFor="bn-date">Another date:</label>
                  <input id="bn-date" type="date" aria-label="Date" className="h-9 rounded-lg border border-line px-2 text-[13px] text-primary outline-none focus:border-secondary" min={localDate(today)} value={form.date} onChange={set('date')} />
                </div>
                <Err k="date" />
              </div>

              <div>
                <p className={`${labelCls} flex items-center gap-1.5`}><Clock className="w-4 h-4 text-accent" /> Time</p>
                <div className="space-y-2.5">
                  {SLOT_GROUPS.map((g) => {
                    const slots = slotsFor(g).filter((t) => !slotPast(t));
                    if (!slots.length) return null;
                    const Icon = g.icon;
                    return (
                      <div key={g.name} className="flex items-start gap-3">
                        <span className="w-[78px] sm:w-[86px] shrink-0 pt-1.5 text-[12px] text-primary/55 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" /> {g.name}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {slots.map((t) => {
                            const on = form.time === t;
                            return <button key={t} type="button" onClick={() => setVal('time', t)} aria-pressed={on} className={`h-8 px-2.5 rounded-lg border text-[12.5px] transition ${on ? 'border-secondary bg-secondary text-white' : 'border-line text-primary hover:border-secondary/60'}`}>{label12(t)}</button>;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[13px] text-primary/60">
                  <label htmlFor="bn-time">Exact time:</label>
                  <input id="bn-time" type="time" aria-label="Time" className="h-9 rounded-lg border border-line px-2 text-[13px] text-primary outline-none focus:border-secondary" value={form.time} onChange={set('time')} />
                </div>
                <Err k="time" />
              </div>

              <div className="rounded-2xl bg-tint ring-1 ring-line-soft p-4 text-[14px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/50 mb-1.5">Visit summary</p>
                {whenLabel && <p className="font-semibold text-primary" data-testid="booknow-when">{whenLabel}</p>}
                <p className="text-primary/65 mt-0.5">{[form.service || 'Care visit', VISIT_TYPES.find(([v]) => v === form.visitType)?.[1], [form.locality, form.city].filter(Boolean).join(', ') + (form.pincode ? ` ${form.pincode}` : ''), form.name || null, `+91 ${form.phone}`].filter(Boolean).join(' · ')}</p>
              </div>
              {serverError && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{serverError}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="h-12 px-4 rounded-xl border border-line text-primary/70 hover:text-primary hover:bg-tint flex items-center gap-1.5 text-[14px] font-medium"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button type="button" onClick={submit} disabled={saving} className="flex-1 h-12 bg-secondary hover:brightness-95 disabled:opacity-70 text-white font-semibold text-[16px] rounded-xl shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)] transition flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />} Confirm request
                </button>
              </div>
            </div>
          )}
          <p className="text-[12px] text-primary/45 mt-5">By continuing you agree to be contacted by Carevaa about this request.</p>
        </div>
      </div>
    </div>
  );
}

export function BookNowProvider({ children }) {
  const [state, setState] = useState({ open: false, preset: null });
  const open = useCallback((preset = {}) => setState({ open: true, preset }), []);
  const value = useMemo(() => open, [open]);
  return (
    <BookNowContext.Provider value={value}>
      {children}
      <BookNowModal open={state.open} preset={state.preset} onClose={() => setState((s) => ({ ...s, open: false }))} />
    </BookNowContext.Provider>
  );
}
