import React, { useCallback, useEffect, useState } from 'react';
import { Inbox, MapPin, CalendarClock, Stethoscope, CheckCircle2, XCircle, Phone, User, MessageSquare } from 'lucide-react';
import api from '../services/api';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });

// Doctor dashboard tab: requests from the website that reach this professional
//  - "Assigned to you": the care team scheduled a visit – confirm or decline
//  - "Open requests near you": Book Now requests matching your service + city – first to accept gets the visit
export default function DoctorRequests({ appointments, isDoctor, onChanged, onCount }) {
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState(null);
  const [visitType, setVisitType] = useState({});

  const assigned = (appointments || []).filter((a) => a.status === 'Waiting');

  const load = useCallback(() => api.openRequests().then((d) => setOpen(d.requests || [])).catch((e) => { setOpen([]); setMessage({ ok: false, text: e.message }); }), []);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  useEffect(() => { onCount?.((open?.length || 0) + assigned.length); }, [open, assigned.length, onCount]);

  const act = async (key, fn, ok) => {
    setBusy(key); setMessage(null);
    try { const r = await fn(); setMessage({ ok: true, text: r?.message || ok }); await load(); onChanged?.(); } catch (e) { setMessage({ ok: false, text: e.message }); await load(); } finally { setBusy(''); }
  };

  return (
    <div className="space-y-8" data-testid="doctor-requests">
      <div>
        <h2 className="text-2xl font-bold text-primary">Care Requests</h2>
        <p className="text-gray-500 text-sm mt-1">Patients who asked for care through the website. Accepting adds the visit to your schedule and shows you the patient&apos;s contact details.</p>
      </div>
      {message && <p className={`text-sm rounded-xl px-4 py-3 ${message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{message.text}</p>}

      <section>
        <h3 className="font-bold text-primary mb-3 flex items-center gap-2">Waiting for your confirmation <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">{assigned.length}</span></h3>
        {assigned.length === 0 ? <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-100 p-5">Nothing waiting for your confirmation.</p> : (
          <div className="grid md:grid-cols-2 gap-4">
            {assigned.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-primary flex items-center gap-2"><User className="w-4 h-4" /> {a.patient}</p>
                    <p className="text-xs text-gray-500">{a.code} · {a.type} · Arranged by the Carevaa team</p>
                  </div>
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 rounded-full px-2.5 py-1">Awaiting you</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5 mb-4">
                  <li className="flex items-center gap-2"><CalendarClock className="w-4 h-4 text-accent" /> {a.date} · {a.time}</li>
                  <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> {a.location}</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent" /> {a.phone}</li>
                  {a.reason && <li className="flex items-start gap-2"><MessageSquare className="w-4 h-4 text-accent mt-0.5" /> {a.reason}</li>}
                </ul>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={!!busy} onClick={() => act(`c${a.id}`, () => api.setAppointmentStatus(a.id, 'Confirmed'), 'Visit confirmed')} className="bg-secondary text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Confirm visit</button>
                  <button type="button" disabled={!!busy} onClick={() => act(`d${a.id}`, () => api.cancelAppointment(a.id), a.fromRequest ? 'Declined – the care team will reassign it' : 'Declined – the booking is cancelled and the patient can see it')} className="border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-bold hover:bg-gray-50 disabled:opacity-60 flex items-center justify-center gap-1.5"><XCircle className="w-4 h-4" /> Can&apos;t make it</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-bold text-primary mb-3 flex items-center gap-2">Open requests near you <span className="text-xs bg-mint text-accent rounded-full px-2 py-0.5">{open?.length ?? '…'}</span></h3>
        {open === null ? <p className="text-sm text-gray-500">Loading…</p> : open.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No open requests for your service and city right now. New ones appear here automatically.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {open.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm" data-testid="open-request">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-primary">{r.patient} · {r.service}</p>
                    <p className="text-xs text-gray-500">{r.code} · requested {fmt(r.requestedAt)}</p>
                  </div>
                  <span className="text-xs font-bold bg-green-50 text-green-700 rounded-full px-2.5 py-1">New</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5 mb-4">
                  <li className="flex items-center gap-2"><CalendarClock className="w-4 h-4 text-accent" /> {r.preferredDateLabel || 'Date to be agreed'}{r.preferredTime ? ` · ${r.preferredTime}` : ''}</li>
                  <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> {[r.locality, r.city].filter(Boolean).join(', ') || '—'}{r.pincode ? ` · ${r.pincode}` : ''}</li>
                  <li className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-accent" /> {r.service}{r.plan ? ` · ${r.plan}` : ''}</li>
                  {r.message && <li className="flex items-start gap-2"><MessageSquare className="w-4 h-4 text-accent mt-0.5" /> {r.message}</li>}
                </ul>
                {isDoctor && (
                  <label className="block text-xs text-gray-500 mb-3">Visit type
                    <select aria-label={`Visit type for ${r.code}`} value={visitType[r.id] || r.visitType || 'home'} onChange={(e) => setVisitType({ ...visitType, [r.id]: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-primary">
                      <option value="home">Home visit</option><option value="clinic">Clinic visit</option><option value="online">Online consult</option>
                    </select>
                  </label>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={!!busy} onClick={() => act(`a${r.id}`, () => api.acceptRequest(r.id, { consultationType: visitType[r.id] || r.visitType || 'home' }), 'Accepted')} className="bg-secondary text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-60">{busy === `a${r.id}` ? 'Accepting…' : 'Accept request'}</button>
                  <button type="button" disabled={!!busy} onClick={() => act(`x${r.id}`, () => api.declineRequest(r.id), 'Hidden')} className="border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-bold hover:bg-gray-50 disabled:opacity-60">Not for me</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
