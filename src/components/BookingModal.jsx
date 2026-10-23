import { useEffect, useRef } from 'react';
import api from '../services/api';
import { useBookNow } from './BookNow';
import { useServices } from '../data/services';

// "Book" / "Book Appointment" buttons (doctor cards, doctor profile, Find Doctors, service pages).
// Patients no longer book a professional directly: this opens the same Book Now form, with the
// chosen doctor named on the request. The request goes to the admin team, who arrange the
// appointment with the doctor (Admin → Enquiries).
//
// Props are kept the same as the old booking popup so every page keeps working unchanged:
//   isOpen, onClose, providerId (optional), serviceType (optional service key, e.g. 'physiotherapy')
export default function BookingModal({ isOpen, onClose, serviceType, providerId }) {
  const bookNow = useBookNow();
  const SERVICES = useServices();
  const opened = useRef(false);
  const latest = useRef({ onClose, SERVICES });
  latest.current = { onClose, SERVICES };

  useEffect(() => {
    if (!isOpen) { opened.current = false; return undefined; }
    if (opened.current) return undefined;
    opened.current = true;
    let cancelled = false;
    const service = latest.current.SERVICES.find((s) => s.key === serviceType)?.title;
    const open = (doctor) => {
      if (cancelled) return;
      bookNow({ ...(service ? { service } : {}), ...(doctor ? { doctor } : {}) });
      latest.current.onClose?.();
    };
    if (!providerId) { open(null); return () => { cancelled = true; }; }
    api.getProvider(providerId)
      .then((d) => {
        const p = d.provider || d;
        open({ id: p.id || providerId, name: p.name, spec: p.spec || p.specialization || '' });
      })
      .catch(() => open({ id: providerId, name: 'the selected doctor', spec: '' }));
    return () => { cancelled = true; };
  }, [isOpen, providerId, serviceType, bookNow]);

  return null;
}
