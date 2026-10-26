// Consultation types a doctor offers and their timings (same rules as Backend/src/utils/slots.js).
//   consultTypes = { home: true, clinic: true, online: false }
//   hours = { clinic: { days: ['Mon', ...], sessions: [{ from: '10:00', to: '13:00' }], slotMins: 30 }, ... }
export const CONSULT_TYPES = ['home', 'clinic', 'online'];
export const CONSULT_LABEL = { home: 'Home visit', clinic: 'Clinic visit', online: 'Online consultation' };
export const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const SLOT_LENGTHS = [15, 20, 30, 45, 60];

export const DEFAULT_HOURS = {
  home: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], sessions: [{ from: '09:00', to: '13:00' }], slotMins: 60 },
  clinic: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], sessions: [{ from: '10:00', to: '13:00' }, { from: '17:00', to: '20:00' }], slotMins: 30 },
  online: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], sessions: [{ from: '18:00', to: '21:00' }], slotMins: 15 },
};

const pad = (n) => String(n).padStart(2, '0');
export const hmToMin = (hm) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(hm || '')); return m ? +m[1] * 60 + +m[2] : null; };
export const minTo12 = (min) => { const h = Math.floor(min / 60) % 24; return `${pad(h % 12 || 12)}:${pad(min % 60)} ${h >= 12 ? 'PM' : 'AM'}`; };
export const slotTo24 = (slot) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(slot || '').trim());
  if (!m) return '';
  let h = +m[1] % 12; if (m[3].toUpperCase() === 'PM') h += 12;
  return `${pad(h)}:${m[2]}`;
};
export const shortSlot = (slot) => String(slot || '').replace(/^0/, '');

export function generateSlots(h) {
  const step = Number(h?.slotMins) || 30;
  const out = new Set();
  (h?.sessions || []).forEach((s) => {
    const a = hmToMin(s.from); const b = hmToMin(s.to);
    if (a === null || b === null || b <= a) return;
    for (let t = a; t + step <= b; t += step) out.add(t);
  });
  return [...out].sort((x, y) => x - y).map(minTo12);
}

// a doctor's types: saved choice, or (older profiles) a fee means the type is offered
export function offersOf(p) {
  if (p?.offers) return p.offers;
  const ct = p?.consultTypes || {};
  if (CONSULT_TYPES.some((t) => typeof ct[t] === 'boolean')) return { home: !!ct.home, clinic: !!ct.clinic, online: !!ct.online };
  const has = (v) => v !== undefined && v !== null && v !== '';
  const o = { home: has(p?.fee) && p?.homeVisitRadiusKm !== 0, clinic: has(p?.clinicFee), online: has(p?.onlineFee) };
  if (!o.home && !o.clinic && !o.online) o.home = true;
  return o;
}

// hours to edit: saved hours, else built from the old weekly slot list, else the defaults
export function hoursForEdit(p, type) {
  const h = p?.hours?.[type];
  if (h?.days?.length && h?.sessions?.length) return { days: [...h.days], sessions: h.sessions.map((s) => ({ ...s })), slotMins: h.slotMins || 30 };
  return { ...DEFAULT_HOURS[type], days: [...DEFAULT_HOURS[type].days], sessions: DEFAULT_HOURS[type].sessions.map((s) => ({ ...s })) };
}

export const sessionsValid = (h) => (h?.sessions || []).length > 0 && h.sessions.every((s) => hmToMin(s.from) !== null && hmToMin(s.to) !== null && hmToMin(s.to) > hmToMin(s.from));

// '' when fine, else a message
export function checkConsultation({ types, hours, clinicName, clinicAddress }) {
  if (!CONSULT_TYPES.some((t) => types[t])) return 'Please choose at least one type of consultation you offer.';
  if (types.clinic && (!String(clinicName || '').trim() || !String(clinicAddress || '').trim())) return 'You offer clinic visits – please enter your clinic name and address.';
  for (const t of CONSULT_TYPES) {
    if (!types[t]) continue;
    const h = hours[t];
    if (!h?.days?.length) return `Choose the days you are available for ${CONSULT_LABEL[t].toLowerCase()}s.`;
    if (!sessionsValid(h)) return `Check the ${CONSULT_LABEL[t].toLowerCase()} timings – each end time must be after its start time.`;
    if (!generateSlots(h).length) return `The ${CONSULT_LABEL[t].toLowerCase()} timings are shorter than one slot – make the session longer or the slot shorter.`;
  }
  return '';
}
