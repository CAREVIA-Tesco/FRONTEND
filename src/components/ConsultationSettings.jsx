import React from 'react';
import { House, Building2, Video, Plus, Trash2, Clock, Loader2, CheckCircle2, CalendarDays } from 'lucide-react';
import api from '../services/api';
import {
  CONSULT_TYPES, CONSULT_LABEL, WEEK, SLOT_LENGTHS, generateSlots, offersOf, hoursForEdit, checkConsultation, shortSlot,
} from '../services/consultation';

export const TYPE_ICON = { home: House, clinic: Building2, online: Video };
const TYPE_SUB = { home: 'You visit the patient at home', clinic: 'Patients come to your clinic', online: 'Video / phone consultation' };
const FEE_KEY = { home: 'homeFee', clinic: 'clinicFee', online: 'onlineFee' };

const inputCls = 'w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition';
const timeCls = 'h-10 bg-white border border-line rounded-lg px-2.5 text-[14px] text-primary focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition';

// "Which consultations do you offer?" – three cards with a checkbox and a fee each
export function ConsultTypePicker({ types, onToggle, fees, onFee, allowed = CONSULT_TYPES, idPrefix = 'ct' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3" data-testid="consult-types">
      {allowed.map((t) => {
        const Icon = TYPE_ICON[t];
        const on = !!types[t];
        return (
          <div key={t} className={`rounded-2xl border-2 p-4 transition ${on ? 'border-secondary bg-secondary/5' : 'border-line bg-white'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={on} onChange={(e) => onToggle(t, e.target.checked)} aria-label={`I offer ${CONSULT_LABEL[t].toLowerCase()}s`} className="mt-1 w-4 h-4 accent-[var(--color-secondary)]" />
              <span className="leading-tight">
                <span className="flex items-center gap-1.5 text-[15px] font-semibold text-primary"><Icon className="w-4 h-4 text-accent" /> {CONSULT_LABEL[t]}</span>
                <span className="block text-[12.5px] text-primary/55 mt-0.5">{TYPE_SUB[t]}</span>
              </span>
            </label>
            {on && onFee && (
              <div className="mt-3">
                <label htmlFor={`${idPrefix}-fee-${t}`} className="block text-[12.5px] font-semibold text-primary mb-1">Fee (₹)</label>
                <input id={`${idPrefix}-fee-${t}`} type="number" min="0" value={fees[t] ?? ''} onChange={(e) => onFee(t, e.target.value)} placeholder={t === 'home' ? '800' : t === 'clinic' ? '600' : '500'} className={inputCls} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Working days + one or more sessions (from – to) + slot length, with a live preview of the slots
export function HoursEditor({ value, onChange, idPrefix = 'hrs', title }) {
  const h = value || { days: [], sessions: [], slotMins: 30 };
  const set = (patch) => onChange({ ...h, ...patch });
  const toggleDay = (d) => set({ days: h.days.includes(d) ? h.days.filter((x) => x !== d) : WEEK.filter((x) => x === d || h.days.includes(x)) });
  const setSession = (i, k, v) => set({ sessions: h.sessions.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });
  const slots = generateSlots(h);
  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 sm:p-5 space-y-4" data-testid={`${idPrefix}-editor`}>
      {title && <p className="font-semibold text-primary flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> {title}</p>}
      <div>
        <p className="text-[12.5px] font-semibold text-primary mb-1.5">Working days</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Working days">
          {WEEK.map((d) => {
            const on = h.days.includes(d);
            return <button key={d} type="button" aria-pressed={on} onClick={() => toggleDay(d)} className={`w-12 h-9 rounded-lg text-[13px] font-semibold border transition ${on ? 'bg-primary text-white border-primary' : 'bg-white text-primary/60 border-gray-200 hover:border-primary/40'}`}>{d}</button>;
          })}
        </div>
      </div>
      <div>
        <p className="text-[12.5px] font-semibold text-primary mb-1.5">Timings</p>
        <div className="space-y-2">
          {h.sessions.map((s, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input type="time" aria-label={`Session ${i + 1} from`} id={`${idPrefix}-from-${i}`} value={s.from} onChange={(e) => setSession(i, 'from', e.target.value)} className={timeCls} />
              <span className="text-[13px] text-primary/50">to</span>
              <input type="time" aria-label={`Session ${i + 1} to`} id={`${idPrefix}-to-${i}`} value={s.to} onChange={(e) => setSession(i, 'to', e.target.value)} className={timeCls} />
              {h.sessions.length > 1 && (
                <button type="button" onClick={() => set({ sessions: h.sessions.filter((_, j) => j !== i) })} aria-label={`Remove session ${i + 1}`} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>
        {h.sessions.length < 3 && (
          <button type="button" onClick={() => set({ sessions: [...h.sessions, { from: '17:00', to: '20:00' }] })} className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-secondary hover:underline"><Plus className="w-4 h-4" /> Add another session</button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`${idPrefix}-len`} className="text-[12.5px] font-semibold text-primary">Each appointment</label>
        <select id={`${idPrefix}-len`} value={h.slotMins} onChange={(e) => set({ slotMins: Number(e.target.value) })} className={timeCls}>
          {SLOT_LENGTHS.map((m) => <option key={m} value={m}>{m} minutes</option>)}
        </select>
      </div>
      <div className="text-[12.5px] text-primary/60" data-testid={`${idPrefix}-preview`}>
        {h.days.length && slots.length
          ? <>{slots.length} {slots.length === 1 ? "slot" : "slots"} a day: {slots.slice(0, 8).map(shortSlot).join(', ')}{slots.length > 8 ? ' …' : ''}</>
          : <span className="text-amber-700">No slots yet – choose days and a time range.</span>}
      </div>
    </div>
  );
}

// Doctor Dashboard → "Availability": consultation types, fees, clinic details and timings for each type
export default function ConsultationSettings({ profile, onSaved }) {
  const isCare = profile && profile.isDoctor === false && ['Nurse', 'Care Taker'].includes(profile.spec);
  const allowed = isCare ? ['home'] : CONSULT_TYPES;
  const init = React.useCallback(() => {
    const offers = offersOf(profile);
    return {
      types: Object.fromEntries(CONSULT_TYPES.map((t) => [t, allowed.includes(t) && !!offers[t]])),
      fees: { home: profile?.fee ?? '', clinic: profile?.clinicFee ?? '', online: profile?.onlineFee ?? '' },
      hours: Object.fromEntries(CONSULT_TYPES.map((t) => [t, hoursForEdit(profile, t)])),
      clinic: { name: profile?.clinic?.name || '', address: profile?.clinic?.address || '', phone: profile?.clinic?.phone || '', website: profile?.clinic?.website || '' },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);
  const [state, setState] = React.useState(init);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => { setState(init()); }, [init]);
  if (!profile) return null;

  const patch = (k, v) => { setState((s) => ({ ...s, [k]: { ...s[k], ...v } })); setSaved(false); };

  const save = async () => {
    const msg = checkConsultation({ types: state.types, hours: state.hours, clinicName: state.clinic.name, clinicAddress: state.clinic.address });
    setError(msg);
    if (msg) return;
    setSaving(true);
    try {
      const body = {
        consultTypes: state.types,
        hours: Object.fromEntries(CONSULT_TYPES.filter((t) => state.types[t]).map((t) => [t, state.hours[t]])),
        clinic: state.clinic,
      };
      CONSULT_TYPES.forEach((t) => { if (state.types[t] && state.fees[t] !== '') body[FEE_KEY[t]] = state.fees[t]; });
      const { provider } = await api.updateProvider(profile.id, body);
      setSaved(true);
      onSaved?.(provider);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="availability-settings">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">Availability</h1>
        <p className="text-gray-500 font-medium">Choose how patients can consult you and when. Patients only see the options you turn on, and only your free slots.</p>
      </div>

      <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-primary mb-4">Consultations you offer</h2>
        <ConsultTypePicker idPrefix="av" allowed={allowed} types={state.types} onToggle={(t, on) => patch('types', { [t]: on })} fees={state.fees} onFee={(t, v) => patch('fees', { [t]: v })} />
      </section>

      {state.types.clinic && (
        <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2"><Building2 className="w-5 h-5" /> Clinic details and timings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="av-clinic-name" className="block text-[13px] font-semibold text-primary mb-1.5">Clinic name *</label>
              <input id="av-clinic-name" value={state.clinic.name} onChange={(e) => patch('clinic', { name: e.target.value })} placeholder="Carevaa Health Clinic" className={inputCls} />
            </div>
            <div>
              <label htmlFor="av-clinic-phone" className="block text-[13px] font-semibold text-primary mb-1.5">Clinic phone</label>
              <input id="av-clinic-phone" value={state.clinic.phone} onChange={(e) => patch('clinic', { phone: e.target.value })} placeholder="+91 98765 43210" className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="av-clinic-address" className="block text-[13px] font-semibold text-primary mb-1.5">Clinic address *</label>
              <textarea id="av-clinic-address" rows={2} value={state.clinic.address} onChange={(e) => patch('clinic', { address: e.target.value })} placeholder="Door no., street, area, city" className={`${inputCls} resize-none`} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="av-clinic-web" className="block text-[13px] font-semibold text-primary mb-1.5">Google Maps link / website</label>
              <input id="av-clinic-web" value={state.clinic.website} onChange={(e) => patch('clinic', { website: e.target.value })} placeholder="https://maps.google.com/..." className={inputCls} />
            </div>
          </div>
          <HoursEditor idPrefix="av-clinic" title="Clinic timings" value={state.hours.clinic} onChange={(v) => setState((s) => ({ ...s, hours: { ...s.hours, clinic: v } }))} />
        </section>
      )}

      {['online', 'home'].filter((t) => state.types[t]).map((t) => (
        <section key={t} className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">{React.createElement(TYPE_ICON[t], { className: 'w-5 h-5' })} {t === 'online' ? 'Online consultation timings' : 'Home visit timings'}</h2>
          <HoursEditor idPrefix={`av-${t}`} value={state.hours[t]} onChange={(v) => setState((s) => ({ ...s, hours: { ...s.hours, [t]: v } }))} />
        </section>
      ))}

      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl px-5 py-4 text-[13.5px] text-primary/75 flex items-start gap-2.5">
        <CalendarDays className="w-5 h-5 text-secondary shrink-0" />
        <p>A slot booked by one patient is no longer shown to others – for any consultation type, since you can only be in one place at a time. New bookings appear under Appointments for you to confirm.</p>
      </div>

      {error && <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
      <div className="flex items-center gap-4">
        <button type="button" onClick={save} disabled={saving} className="bg-secondary hover:brightness-95 disabled:opacity-70 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)] inline-flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save availability
        </button>
        {saved && <span role="status" className="text-sm font-semibold text-green-700 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Saved – patients now see these timings</span>}
      </div>
    </div>
  );
}
