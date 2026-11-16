import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Briefcase, BadgeCheck, House, Building2, Video, ChevronRight, ChevronDown, X, SlidersHorizontal, Stethoscope, GraduationCap, Languages, CalendarCheck, UserSearch } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import BookingModal from '../components/BookingModal';
import { uniqueProviders } from '../components/ProCard';
import api from '../services/api';
import { inr } from '../services/usePublicStats';

const MODE = { home: ['Home visit', House], clinic: ['Clinic', Building2], online: ['Online', Video] };
const GROUPS = [
  ['all', 'All professionals'],
  ['doctors', 'Doctors'],
  ['Nurse', 'Nurses'],
  ['Physiotherapist', 'Physiotherapists'],
  ['Caretaker', 'Care takers'],
  ['Lab Centre', 'Lab centres'],
];
const SORTS = [['recommended', 'Recommended'], ['rating', 'Highest rated'], ['experience', 'Most experienced'], ['fee', 'Lowest fee']];
const HOVER = 'transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-secondary)_45%,transparent)]';
const fieldCls = 'w-full h-12 rounded-xl bg-white border border-black/[0.08] text-[15px] text-primary outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition';
const initials = (name = '') => name.replace(/^Dr\.?\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const lowest = (d) => { const f = [d.fee, d.clinicFee, d.onlineFee].filter((x) => x > 0); return f.length ? Math.min(...f) : null; };
const offersOf = (d) => d.offers || {};
const langsOf = (d) => (Array.isArray(d.languages) ? d.languages : [d.languages]).map((x) => String(x || '').trim()).filter(Boolean).join(', ');

function Select({ value, onChange, label, children }) {
  return (
    <span className="relative block">
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${fieldCls} appearance-none pl-4 pr-10 cursor-pointer`}>{children}</select>
      <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
    </span>
  );
}

export default function Doctors() {
  const [params] = useSearchParams();
  const [bookId, setBookId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(params.get('city') || 'All Locations');
  const [specialty, setSpecialty] = useState(params.get('spec') || 'All Specialties');
  const [group, setGroup] = useState('all');
  const [mode, setMode] = useState('any');
  const [sort, setSort] = useState('recommended');

  useEffect(() => { window.scrollTo(0, 0); document.title = 'Find Doctors & Professionals – Carevaa'; return () => { document.title = 'Carevaa | Doctors, Nurses & Home Care Services'; }; }, []);

  // specialities managed in Admin → Specializations (hidden ones are left out)
  const [catalog, setCatalog] = useState([]);
  useEffect(() => { api.getSpecializations().then((d) => setCatalog((d.specializations || []).filter((s) => s.status === 'Active'))).catch(() => {}); }, []);
  const catalogItem = catalog.find((c) => c.name === specialty);
  const specMatches = (doc) => (catalogItem ? [catalogItem.name, ...(catalogItem.matches || [])].some((x) => x === doc.spec || x === doc.specialization) : doc.spec === specialty);
  const covered = new Set(catalog.flatMap((c) => [c.name, ...(c.matches || [])]));
  const specOptions = [...catalog.map((c) => c.name), ...[...new Set(doctors.map((d) => d.spec).filter(Boolean))].filter((sp) => !covered.has(sp))].sort();
  const locations = [...new Set(doctors.map((d) => d.loc).filter((l) => l && l !== 'Virtual'))].sort();

  useEffect(() => {
    api.getProviders()
      .then((data) => setDoctors(uniqueProviders(data.providers || [])))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const inGroup = (d, g) => (g === 'all' ? true : g === 'doctors' ? d.isDoctor : d.profession === g);
  const visible = useMemo(() => {
    const list = doctors.filter((doc) => {
      if (search && !`${doc.name} ${doc.spec} ${doc.specialization || ''} ${doc.clinic?.name || ''} ${doc.loc}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (location !== 'All Locations' && doc.loc !== location) return false;
      if (specialty !== 'All Specialties' && !specMatches(doc)) return false;
      if (!inGroup(doc, group)) return false;
      if (mode !== 'any' && !offersOf(doc)[mode]) return false;
      return true;
    });
    const num = (v) => Number(v) || 0;
    if (sort === 'rating') list.sort((a, b) => num(b.rating) - num(a.rating) || (b.reviews || 0) - (a.reviews || 0));
    if (sort === 'experience') list.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    if (sort === 'fee') list.sort((a, b) => (lowest(a) ?? 1e9) - (lowest(b) ?? 1e9));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, search, location, specialty, group, mode, sort, catalog]);

  const filtersOn = search || location !== 'All Locations' || specialty !== 'All Specialties' || group !== 'all' || mode !== 'any';
  const reset = () => { setSearch(''); setLocation('All Locations'); setSpecialty('All Specialties'); setGroup('all'); setMode('any'); };

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip" data-testid="doctors-page">
      <SiteHeader />

      {/* Hero + search */}
      <section className="relative bg-tint pt-28 lg:pt-36 pb-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
            <Link to="/" className="hover:text-secondary">Home</Link><ChevronRight className="w-3.5 h-3.5" /><span className="text-primary font-medium">Find Doctors</span>
          </nav>
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-black/[0.06] px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-accent"><BadgeCheck className="w-4 h-4" /> Every profile verified</p>
            <h1 className="mt-5 font-poppins font-semibold text-[32px] sm:text-[42px] lg:text-[50px] leading-[1.1]">Find & book <span className="italic text-secondary">verified</span> healthcare professionals</h1>
            <p className="mt-4 text-lg text-gray-600">Compare doctors, nurses, physiotherapists and care takers – see their experience, fees and consultation types, then book in a minute.</p>
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-[0_18px_50px_-24px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] ring-1 ring-black/[0.05] p-3 sm:p-4 grid gap-3 md:grid-cols-[1.6fr_1fr_1fr]" data-testid="doctor-filters">
            <label className="relative block">
              <span className="sr-only">Search</span>
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, speciality or clinic" className={`${fieldCls} pl-12 pr-4`} data-testid="doctor-search" />
            </label>
            <Select label="Location" value={location} onChange={setLocation}>
              <option>All Locations</option>
              {locations.map((loc) => <option key={loc}>{loc}</option>)}
            </Select>
            <Select label="Speciality" value={specialty} onChange={setSpecialty}>
              <option>All Specialties</option>
              {[...new Set([...specOptions, ...(specialty !== 'All Specialties' ? [specialty] : [])])].map((sp) => <option key={sp}>{sp}</option>)}
            </Select>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1" role="tablist" aria-label="Type of professional">
            {GROUPS.map(([k, l]) => {
              const n = doctors.filter((d) => inGroup(d, k)).length;
              if (k !== 'all' && !n) return null;
              return (
                <button key={k} type="button" role="tab" aria-selected={group === k} onClick={() => setGroup(k)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${group === k ? 'bg-secondary border-secondary text-white' : 'bg-white border-black/[0.07] text-primary hover:border-secondary hover:text-secondary'}`}>
                  {l} <span className="ml-1 opacity-70">{n}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-poppins font-semibold text-xl sm:text-2xl" data-testid="doctor-count">{loading ? 'Loading professionals…' : `${visible.length} ${visible.length === 1 ? 'professional' : 'professionals'} found`}</p>
              {filtersOn && <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"><X className="w-4 h-4" /> Clear filters</button>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-1.5"><SlidersHorizontal className="w-4 h-4" /> Consult:</span>
              {[['any', 'Any'], ['home', 'Home'], ['clinic', 'Clinic'], ['online', 'Online']].map(([k, l]) => (
                <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(k)} className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-colors ${mode === k ? 'bg-primary border-primary text-white' : 'bg-white border-black/[0.07] text-primary hover:border-secondary hover:text-secondary'}`}>{l}</button>
              ))}
              <span className="w-px h-6 bg-black/10 mx-1 hidden sm:block" />
              <span className="relative">
                <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 rounded-lg bg-white border border-black/[0.07] pl-3 pr-8 text-[13px] font-semibold text-primary appearance-none cursor-pointer outline-none focus:border-secondary">
                  {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
              </span>
            </div>
          </div>

          {loadError && <p className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-5 text-center">{loadError}</p>}
          {loading && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-80 rounded-3xl bg-white animate-pulse" />)}</div>}
          {!loading && !loadError && visible.length === 0 && (
            <div className="bg-white rounded-3xl border border-black/[0.06] p-10 text-center">
              <span className="w-14 h-14 rounded-2xl bg-tint text-accent flex items-center justify-center mx-auto"><UserSearch className="w-7 h-7" /></span>
              <p className="mt-4 font-semibold text-lg">No professionals match your search</p>
              <p className="mt-1 text-gray-600">Try another location or speciality, or clear the filters.</p>
              {filtersOn && <button type="button" onClick={reset} className="mt-5 bg-secondary hover:bg-secondary-hover text-white px-6 py-2.5 rounded-xl font-bold">Clear filters</button>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="doctor-grid">
            {visible.map((doc) => {
              const fee = lowest(doc);
              const modes = (doc.modes?.length ? doc.modes : Object.entries(offersOf(doc)).filter(([, on]) => on).map(([type]) => ({ type }))).filter((m) => MODE[m.type]);
              return (
                <article key={doc.id} className={`group h-full flex flex-col bg-white rounded-3xl border border-black/[0.06] p-6 ${HOVER}`} data-testid="doctor-card">
                  <div className="flex items-start gap-4">
                    <Link to={`/doctors/${doc.id}`} className="relative w-[72px] h-[72px] rounded-2xl overflow-hidden bg-[color-mix(in_srgb,var(--color-accent)_12%,white)] shrink-0 flex items-center justify-center text-xl font-bold text-accent">
                      {initials(doc.name)}
                      {doc.img && <img src={doc.img} alt={doc.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/doctors/${doc.id}`} className="flex items-center gap-1.5 font-semibold text-[17px] text-primary group-hover:text-secondary transition-colors"><span className="truncate">{doc.name}</span><BadgeCheck className="w-[18px] h-[18px] text-accent shrink-0" aria-label="Verified" /></Link>
                      <p className="text-[13.5px] font-semibold text-accent truncate">{doc.spec}</p>
                      <p className="mt-1 text-[13px] text-gray-500 flex items-center gap-1"><Star className={`w-3.5 h-3.5 ${doc.rating !== 'New' ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} /> {doc.rating !== 'New' ? `${doc.rating} (${doc.reviews} review${doc.reviews === 1 ? '' : 's'})` : 'New on Carevaa'}</p>
                    </div>
                  </div>

                  <ul className="mt-5 grid grid-cols-2 gap-2 text-[13px] text-gray-600">
                    <li className="flex items-center gap-1.5 bg-cream rounded-lg px-2.5 py-2"><Briefcase className="w-3.5 h-3.5 text-accent shrink-0" /> {doc.exp} exp.</li>
                    <li className="flex items-center gap-1.5 bg-cream rounded-lg px-2.5 py-2 min-w-0"><MapPin className="w-3.5 h-3.5 text-accent shrink-0" /> <span className="truncate">{doc.loc || 'Online'}</span></li>
                    {doc.qualification && <li className="col-span-2 flex items-center gap-1.5 bg-cream rounded-lg px-2.5 py-2 min-w-0"><GraduationCap className="w-3.5 h-3.5 text-accent shrink-0" /> <span className="truncate">{doc.qualification}</span></li>}
                    {langsOf(doc) && <li className="col-span-2 flex items-center gap-1.5 bg-cream rounded-lg px-2.5 py-2 min-w-0"><Languages className="w-3.5 h-3.5 text-accent shrink-0" /> <span className="truncate">{langsOf(doc)}</span></li>}
                  </ul>

                  {modes.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {modes.map((m) => { const [l, Icon] = MODE[m.type]; return <span key={m.type} className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--color-secondary)_10%,white)] text-primary text-[12px] font-semibold px-2.5 py-1"><Icon className="w-3.5 h-3.5 text-secondary" /> {l}{m.fee ? ` · ${inr(m.fee)}` : ''}</span>; })}
                    </div>
                  )}

                  <div className="mt-auto pt-5">
                    <div className="flex items-baseline justify-between border-t border-black/[0.06] pt-4 mb-4">
                      <span className="text-[13px] text-gray-500">Consultation from</span>
                      <span className="font-bold text-lg text-primary">{fee ? inr(fee) : 'On request'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to={`/doctors/${doc.id}`} className="py-2.5 rounded-xl border border-black/[0.1] text-primary text-sm font-bold text-center hover:border-secondary hover:text-secondary transition-colors">View profile</Link>
                      <button type="button" onClick={() => setBookId(doc.id)} className="py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:bg-secondary-hover transition-colors inline-flex items-center justify-center gap-1.5"><CalendarCheck className="w-4 h-4" /> Book</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Help strip */}
          <div className="mt-14 rounded-3xl bg-gradient-to-r from-secondary to-primary text-white px-6 py-7 sm:px-10 flex flex-col md:flex-row md:items-center gap-5">
            <span className="hidden md:flex w-12 h-12 rounded-2xl bg-white/15 items-center justify-center shrink-0"><Stethoscope className="w-6 h-6" /></span>
            <div className="flex-1 text-center md:text-left">
              <p className="font-poppins font-semibold text-xl sm:text-2xl">Not sure whom to book?</p>
              <p className="mt-1 text-white/85 text-[15px]">Tell us what you need – we will match you with the right verified professional.</p>
            </div>
            <BookAny />
          </div>
        </div>
      </section>

      <SiteFooter />
      <BookingModal isOpen={!!bookId} onClose={() => setBookId(null)} providerId={bookId} />
    </div>
  );
}

// "Book Now" without a particular professional
function BookAny() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="self-center shrink-0 bg-white text-primary px-6 py-3 rounded-xl font-bold text-[15px] hover:bg-gray-50 transition shadow-lg inline-flex items-center gap-2"><CalendarCheck className="w-5 h-5" /> Book Now</button>
      <BookingModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
