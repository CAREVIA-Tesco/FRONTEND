import { useEffect, useState } from 'react';
import { Activity, Syringe, Stethoscope, House, Users, Baby, Leaf, HeartPulse, FlaskConical, Pill, HeartHandshake, Brain, Eye, Bone, Smile, Ambulance } from 'lucide-react';
import { request } from '../services/api';
import { readCache, writeCache } from '../services/persistentCache';

// icon names the admin can pick for a service
export const SERVICE_ICONS = { Activity, Syringe, Stethoscope, House, Users, Baby, Leaf, HeartPulse, FlaskConical, Pill, HeartHandshake, Brain, Eye, Bone, Smile, Ambulance };

// The care services Carevaa offers. Each one links to its existing service page and
// maps to the booking modal's serviceType (prices/counts come live from /api/public/stats).
export const SERVICES = [
  { key: 'physiotherapy', title: 'Physiotherapy', short: 'Pain relief & rehab', desc: 'Recover from pain, injury or surgery with certified physios at home.', link: '/physiotherapy', img: '/service-physio.png', icon: Activity },
  { key: 'nurse-care', title: 'Nurse Care', short: 'Skilled nursing at home', desc: 'Injections, IVs, wound care and post-hospital nursing by trained nurses.', link: '/nurse-care', img: '/nurse-hero.jpg', icon: Syringe },
  { key: 'home-doctor', title: 'Home Doctor', short: 'Doctor at your doorstep', desc: 'General physicians who visit, diagnose and treat you at home.', link: '/home-doctor', img: '/doctor-hero.png', icon: House },
  { key: 'doctor-visit', title: 'Doctor Visit', short: 'Online & clinic consults', desc: 'Expert consultations online or at the clinic, with digital prescriptions.', link: '/doctor-visit', img: '/home-hero.jpg', icon: Stethoscope },
  { key: 'care-taker', title: 'Care Taker', short: 'Elder & post-op care', desc: 'Trained attendants for elderly, post-operative and bedridden patients.', link: '/care-taker', img: '/caretaker-section.png', icon: Users },
  { key: 'baby-care', title: 'Baby Care', short: 'Mother & baby support', desc: 'Paediatric care and daily support for newborns, babies and new mothers.', link: '/baby-care', img: '/service-homecare.png', icon: Baby },
  { key: 'ayurveda', title: 'Ayurveda', short: 'Natural healing', desc: 'Traditional Ayurvedic consultations and therapies at your doorstep.', link: '/ayurveda', img: '/hero.png', icon: Leaf },
  { key: 'bhs', title: 'BHS', short: 'Basic health services', desc: 'Vitals monitoring, sample collection and essential health checks.', link: '/bhs', img: '/caretaker-hero.png', icon: HeartPulse },
];

// "doctor-visit" covers every doctor; the rest map to one provider speciality
export const BOOKING_TYPE = (key) => (key === 'doctor-visit' ? undefined : key);

// Which verified professionals belong to a service (same mapping the live stats use)
const SERVICE_SPEC_MAP = {
  physiotherapy: ['Physiotherapist'],
  'nurse-care': ['Nurse'],
  'home-doctor': ['General Physician'],
  'care-taker': ['Care Taker'],
  'baby-care': ['Pediatrician'],
  ayurveda: ['Ayurveda Doctor'],
  bhs: ['BHS'],
};

// ---- live list managed in Admin → Services ------------------------------------------------
// The website shows the services saved by the admin (name, text, price, picture, order, hidden or not).
// Built-in services keep their own pages; new ones open /services/<key>. Until the list loads (or if the
// server is unreachable) the built-in list above is shown.
let live = null;
let loading = null;
const listeners = new Set();
const fromApi = (sv) => {
  const base = SERVICES.find((b) => b.key === sv.key) || {};
  return {
    ...base,
    id: sv.id,
    key: sv.key,
    title: sv.name,
    short: sv.short || base.short || '',
    desc: sv.desc || base.desc || '',
    price: sv.price || '',
    img: sv.image || base.img || '/service-homecare.png',
    icon: SERVICE_ICONS[sv.icon] || base.icon || Stethoscope,
    link: base.link || `/services/${sv.key}`,
    matches: sv.matches || [],
    custom: !base.key,
  };
};
// last list received from the API (see useServices)
{
  const saved = readCache('services');
  if (Array.isArray(saved) && saved.length) live = saved.map(fromApi);
}
export function loadServices(force = false) {
  if (loading && !force) return loading;
  loading = request('/services', { auth: false })
    .then((d) => {
      const raw = (d.services || []).filter((sv) => sv.status === 'Active' && sv.key).sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
      writeCache('services', raw);
      live = raw.map(fromApi);
      listeners.forEach((fn) => fn(live));
      return live;
    })
    .catch(() => { loading = null; return live || SERVICES; });
  return loading;
}
// Services shown everywhere on the website. Starts from the list received on the previous visit
// (so menus, counts and pages don't switch from the built-in list to the admin's list after a moment),
// and is refreshed from the API once per page load.
let refreshed = false;
export function useServices() {
  const [list, setList] = useState(live || SERVICES);
  useEffect(() => {
    listeners.add(setList);
    if (live) setList(live);
    if (!refreshed) { refreshed = true; loadServices(true); }
    return () => listeners.delete(setList);
  }, []);
  return list;
}
// { list, loaded } – loaded is false only on a first visit before the admin's service list arrives
export function useServicesState() {
  const list = useServices();
  return { list, loaded: !!live && list === live };
}
export const findService = (list, key) => list.find((s) => s.key === key);

export const specsFor = (key) => {
  const sv = live?.find((s) => s.key === key);
  if (sv?.matches?.length) return sv.matches;
  return SERVICE_SPEC_MAP[key] || [];
};
export const providersForService = (providers, key) => (key === 'doctor-visit' ? providers.filter((p) => p.isDoctor) : providers.filter((p) => specsFor(key).includes(p.spec)));
export const serviceForProvider = (p) => (live || SERVICES).find((s) => s.key !== 'doctor-visit' && specsFor(s.key).includes(p.spec)) || (p.isDoctor ? SERVICES.find((s) => s.key === 'doctor-visit') : null);
export const citySlug = (c) => encodeURIComponent(String(c || '').trim());
