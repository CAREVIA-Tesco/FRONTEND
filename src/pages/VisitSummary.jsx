import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';
import api, { getSessionUser } from '../services/api';
import { useContact } from '../services/useSiteContent';

// Printable visit summary & prescription (Download PDF = the browser's "Save as PDF").
// Only the patient, the professional and admins can open it (the API checks this).
export default function VisitSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contact = useContact();
  const [appt, setAppt] = useState(null);
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getSessionUser()) { navigate(`/login?redirect=/visit-summary/${id}`); return; }
    api.getAppointment(id)
      .then(({ appointment }) => {
        setAppt(appointment);
        document.title = `Visit summary ${appointment.code} – Carevaa`;
        if (appointment.providerId) api.getProvider(appointment.providerId).then((d) => setDoc(d.provider)).catch(() => {});
      })
      .catch((e) => setError(e.message));
    return () => { document.title = 'Carevaa – Healthcare at home'; };
  }, [id, navigate]);

  const back = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));
  const v = appt?.visitNotes || {};
  const completedAt = v.completedAt ? new Date(v.completedAt) : null;
  const when = appt ? new Date(appt.scheduledAt).toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '';

  return (
    <div className="theme-portea min-h-screen bg-tint font-sans text-primary print:bg-white">
      <style>{'@page { size: A4; margin: 14mm; } @media print { .no-print { display: none !important; } .sheet { box-shadow: none !important; border: 0 !important; margin: 0 !important; max-width: none !important; padding: 0 !important; } }'}</style>

      <div className="no-print sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-line-soft">
        <div className="max-w-[820px] mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button type="button" onClick={back} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary/70 hover:text-primary"><ArrowLeft className="w-4 h-4" /> Back</button>
          <button type="button" onClick={() => window.print()} disabled={!appt} className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-secondary text-white text-[14px] font-semibold hover:brightness-95 disabled:opacity-50"><Download className="w-4 h-4" /> Download PDF</button>
        </div>
      </div>

      {error && <p className="max-w-[820px] mx-auto mt-10 px-4 text-red-700">{error} <Link to="/" className="underline">Go home</Link></p>}
      {!appt && !error && <p className="max-w-[820px] mx-auto mt-16 px-4 flex items-center gap-2 text-primary/60"><Loader2 className="w-4 h-4 animate-spin" /> Loading summary…</p>}

      {appt && (
        <article className="sheet max-w-[820px] mx-auto my-8 bg-white rounded-2xl ring-1 ring-line-soft shadow-sm p-8 sm:p-10" data-testid="visit-summary">
          {/* Letterhead */}
          <header className="flex items-start justify-between gap-6 pb-6 border-b-2 border-primary">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Carevaa" className="w-16 h-16 object-contain" />
              <div>
                <p className="font-serif text-[24px] font-semibold leading-none">Carevaa</p>
                <p className="text-[12px] text-primary/60 mt-1">Healthcare at home</p>
              </div>
            </div>
            <div className="text-right text-[12px] text-primary/70 leading-relaxed">
              {contact.phone && <p>{contact.phone}</p>}
              {contact.email && <p>{contact.email}</p>}
              {contact.address && <p className="max-w-[240px]">{contact.address}</p>}
            </div>
          </header>

          <div className="flex flex-wrap items-end justify-between gap-3 mt-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Visit summary and prescription</p>
              <h1 className="font-serif text-[26px] font-semibold mt-1">{appt.title || 'Consultation'}</h1>
            </div>
            <p className="text-[13px] text-primary/70">Appointment <span className="font-semibold text-primary">{appt.code}</span></p>
          </div>

          <section className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="rounded-xl bg-tint p-4 text-[13.5px] print:border print:border-line">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/50 mb-2">Patient</p>
              <p className="font-semibold text-[15px]">{appt.patient}</p>
              {appt.phone && appt.phone !== '-' && <p className="text-primary/70">{appt.phone}</p>}
              {appt.patientEmail && <p className="text-primary/70">{appt.patientEmail}</p>}
            </div>
            <div className="rounded-xl bg-tint p-4 text-[13.5px] print:border print:border-line">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/50 mb-2">Professional</p>
              <p className="font-semibold text-[15px]">{appt.provider}</p>
              <p className="text-primary/70">{appt.specialization}{doc?.qualification ? ` · ${doc.qualification}` : ''}</p>
              {doc?.registrationNumber && <p className="text-primary/70">Reg. no. {doc.registrationNumber}{doc.registrationCouncil ? ` (${doc.registrationCouncil})` : ''}</p>}
            </div>
          </section>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-[13px]">
            <div><dt className="text-primary/50">Visit</dt><dd className="font-medium">{appt.type}</dd></div>
            <div className="col-span-2 sm:col-span-1"><dt className="text-primary/50">Date and time</dt><dd className="font-medium">{when}</dd></div>
            <div><dt className="text-primary/50">Location</dt><dd className="font-medium">{appt.location}</dd></div>
            <div><dt className="text-primary/50">Status</dt><dd className="font-medium">{appt.status}</dd></div>
          </dl>

          {appt.status !== 'Completed' ? (
            <p className="mt-8 rounded-xl bg-amber-50 text-amber-800 px-4 py-3 text-[14px]">This visit has not been completed yet, so there are no notes or prescription.</p>
          ) : (
            <>
              <section className="mt-8">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary/60 mb-3">Vitals</h2>
                <div className="grid grid-cols-2 gap-4 max-w-sm text-[14px]">
                  <div className="rounded-xl ring-1 ring-line p-3"><p className="text-[12px] text-primary/50">Blood pressure</p><p className="font-semibold">{v.bloodPressure ? `${v.bloodPressure} mmHg` : 'Not recorded'}</p></div>
                  <div className="rounded-xl ring-1 ring-line p-3"><p className="text-[12px] text-primary/50">Weight</p><p className="font-semibold">{v.weight ? `${v.weight} kg` : 'Not recorded'}</p></div>
                </div>
              </section>
              <section className="mt-7">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary/60 mb-2">Symptoms and observations</h2>
                <p className="text-[14.5px] leading-relaxed whitespace-pre-line">{v.symptoms || '—'}</p>
              </section>
              <section className="mt-7">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary/60 mb-2 flex items-center gap-2"><span className="font-serif text-[22px] normal-case tracking-normal text-primary">℞</span> Prescription and advice</h2>
                <div className="rounded-xl ring-1 ring-line p-4 text-[14.5px] leading-relaxed whitespace-pre-line">{v.prescription || '—'}</div>
              </section>
            </>
          )}

          <footer className="mt-10 pt-5 border-t border-line flex flex-wrap justify-between gap-3 text-[11.5px] text-primary/55">
            <p>Generated by Carevaa{completedAt ? ` · visit completed ${completedAt.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}` : ''}</p>
            <p>Based on notes entered by the professional. In an emergency, call 108.</p>
          </footer>
        </article>
      )}
    </div>
  );
}
