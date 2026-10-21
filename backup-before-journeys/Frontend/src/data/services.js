import { Activity, Syringe, Stethoscope, House, Users, Baby, Leaf, HeartPulse } from 'lucide-react';

// The care services Carevia offers. Each one links to its existing service page and
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
