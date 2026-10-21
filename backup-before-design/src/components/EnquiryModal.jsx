import React, { useEffect } from 'react';
import { X, ShieldCheck, Clock, Headphones } from 'lucide-react';
import EnquiryForm from './EnquiryForm';

const TITLES = {
  callback: ['Talk to a care advisor', 'Share a few details and we will call you back to plan the right care.'],
  plan: ['Get this care plan', 'Our care advisor will confirm the plan, schedule and price with you.'],
  requirement: ['Post your requirement', 'Tell us what you need and we will match you with the right professional.'],
};

// Pop-up version of the lead form, opened from "Request a callback" / "Get this pack" buttons.
export default function EnquiryModal({ open, onClose, type = 'callback', service, plan, message }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  const [title, sub] = TITLES[type] || TITLES.callback;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl grid md:grid-cols-[0.8fr_1.2fr]">
        <div className="hidden md:flex flex-col justify-between bg-primary text-white p-8 rounded-l-3xl">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-3">{title}</h2>
            <p className="text-white/75 text-sm">{sub}</p>
          </div>
          <ul className="space-y-4 text-sm text-white/85 mt-8">
            <li className="flex items-center gap-3"><Headphones className="w-5 h-5 text-secondary shrink-0" /> Free consultation with a care advisor</li>
            <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-secondary shrink-0" /> Verified, qualified professionals</li>
            <li className="flex items-center gap-3"><Clock className="w-5 h-5 text-secondary shrink-0" /> Track your request any time</li>
          </ul>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-5 md:mb-6">
            <div className="md:hidden">
              <h2 className="text-xl font-bold font-poppins text-primary">{title}</h2>
              <p className="text-gray-500 text-sm">{sub}</p>
            </div>
            <span className="hidden md:block text-sm font-semibold text-gray-500">{service ? `Service: ${service}` : 'Your details'}</span>
            <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 shrink-0"><X className="w-4 h-4" /></button>
          </div>
          <EnquiryForm type={type} service={service} plan={plan} message={message} compact />
        </div>
      </div>
    </div>
  );
}
