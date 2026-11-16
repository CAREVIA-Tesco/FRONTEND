import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Briefcase, MapPin } from 'lucide-react';
import { inr } from '../services/usePublicStats';

const initials = (name = '') => name.replace(/^Dr\.?\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
// the same professional saved more than once (same id, or same name + speciality + phone/city) is listed once
export function uniqueProviders(list = []) {
  const seen = new Set();
  return list.filter((p) => {
    const name = String(p.name || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const keys = [`id:${p.id}`, p.code && `code:${p.code}`, name && `np:${name}|${p.spec || ''}|${p.loc || p.city || ''}|${p.experience ?? p.exp ?? ''}`].filter(Boolean);
    if (keys.some((k) => seen.has(k))) return false;
    keys.forEach((k) => seen.add(k));
    return true;
  });
}
export const lowestFee = (p) => { const f = [p.fee, p.clinicFee, p.onlineFee].filter((x) => x > 0); return f.length ? Math.min(...f) : null; };

// Professional summary card with "View profile" and "Book" actions
export default function ProCard({ p, onBook }) {
  const fee = lowestFee(p);
  return (
    <div className="group h-full bg-white rounded-2xl border border-black/[0.06] p-5 flex flex-col hover:-translate-y-1 hover:border-secondary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-secondary)_45%,transparent)] transition-all duration-300">
      <Link to={`/doctors/${p.id}`} className="flex items-center gap-4 mb-4">
        <span className="relative w-16 h-16 rounded-full overflow-hidden bg-mint shrink-0 flex items-center justify-center text-xl font-bold text-accent/70">
          {initials(p.name)}
          {p.img && <img src={p.img} alt={p.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />}
        </span>
        <span className="min-w-0">
          <span className="block font-bold text-primary group-hover:text-secondary transition-colors truncate">{p.name}</span>
          <span className="block text-xs font-bold tracking-wider uppercase text-accent">{p.spec}</span>
        </span>
      </Link>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4 flex-1">
        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {p.exp}</span>
        {p.loc && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.loc}</span>}
        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {p.rating}</span>
        {fee && <span className="font-semibold text-primary">From {inr(fee)}</span>}
        {p.isDoctor && p.modes?.length > 0 && <span className="w-full text-[11.5px] text-primary/60" data-testid="pro-modes">{p.modes.map((m) => ({ home: 'Home visit', clinic: 'Clinic', online: 'Online' }[m.type])).join(' · ')}</span>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link to={`/doctors/${p.id}`} className="text-center border border-accent/40 text-accent rounded-lg py-2 text-sm font-bold hover:bg-secondary hover:border-secondary hover:text-white transition-colors">View profile</Link>
        <button type="button" onClick={() => onBook?.(p)} className="bg-secondary hover:bg-secondary-hover text-white rounded-lg py-2 text-sm font-bold transition-colors">Book</button>
      </div>
    </div>
  );
}
