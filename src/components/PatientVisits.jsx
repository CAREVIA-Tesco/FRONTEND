import React, { useCallback, useEffect, useState } from 'react';
import {
  Users, CalendarCheck, CalendarDays, Plus, Search, X, Loader2, Pencil, Trash2,
  FileDown, ClipboardList, BarChart3, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Phone, History,
  Share2, Link2, Copy, Check, MessageCircle, ExternalLink,
  UserPlus, Clock, CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { useFormDraft } from '../services/formDraft';
import DraftNotice from './DraftNotice';

// Patient Visit Management – walk-in clinic patients, in the Doctor Dashboard ("Patient Visits" tab).
// The nurse can:
// 1. Add Patient Manually (direct nurse entry)
// 2. Share Patient Registration Link (generates unique link for patient to complete on phone)
// Both methods use the same unified ClinicPatient & ClinicVisit system and synchronize across Doctor & Admin dashboards.

const field = 'w-full h-11 px-3.5 rounded-xl border border-line bg-white text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition';
const area = 'w-full px-3.5 py-2.5 rounded-xl border border-line bg-white text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition resize-y';
const label = 'block text-[12.5px] font-semibold text-primary/80 mb-1.5';
const card = 'bg-white rounded-[20px] border border-gray-100 shadow-sm';
const btn = 'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-secondary hover:brightness-95 text-white font-semibold text-[14px] transition disabled:opacity-60 cursor-pointer';
const btnGhost = 'inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-gray-200 bg-white text-primary font-semibold text-[14px] hover:bg-gray-50 transition cursor-pointer';

const pad = (n) => String(n).padStart(2, '0');
const localDay = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const NURSE_KEY = 'carevaa_entered_by';
const savedNurse = () => { try { return localStorage.getItem(NURSE_KEY) || ''; } catch { return ''; } };
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '—');

const VISIT_FIELDS = [
  ['symptoms', 'Symptoms & Complaints', 'e.g. Fever for 3 days, body ache'],
  ['diagnosis', 'Diagnosis', 'e.g. Viral fever'],
  ['treatment', 'Treatment', 'e.g. Rest, fluids, injection given'],
  ['prescription', 'Prescription', 'e.g. Paracetamol 650 mg – 1-0-1 × 3 days'],
  ['nurseNotes', "Nurse's notes", 'e.g. BP 130/85, temp 101°F, weight 68 kg'],
];

export function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  a.download = filename;
  a.click();
}

export const visitCsvRows = (visits, withDoctor = false) => [
  [...(withDoctor ? ['Doctor'] : []), 'Appointment No.', 'Appointment Date', 'Visit Time', 'Patient ID', 'Patient', 'Age', 'Gender', 'Mobile', 'Source', 'Symptoms', 'Diagnosis', 'Treatment', 'Prescription', "Nurse's notes", 'Entered by'],
  ...visits.map((v) => [
    ...(withDoctor ? [v.doctor] : []),
    v.appointmentNumber || (v.dailySequence ? String(v.dailySequence).padStart(3, '0') : '') || v.code || '',
    v.appointmentDate || (v.visitDate ? String(v.visitDate).slice(0, 10) : ''),
    fmtDateTime(v.visitDate),
    v.patient?.code,
    v.patient?.name || v.patientName,
    v.patient?.age,
    v.patient?.gender,
    v.patient?.phone,
    v.source === 'shared_link' ? 'Online Link' : 'Manual',
    v.symptoms,
    v.diagnosis,
    v.treatment,
    v.prescription,
    v.nurseNotes,
    v.enteredBy
  ]),
];

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-deep/50" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-xl'} max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl`}>
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 -mr-2 rounded-lg text-primary/60 hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const Msg = ({ m }) => (m ? <p role={m.ok ? 'status' : 'alert'} className={`text-[13.5px] rounded-xl px-3.5 py-2.5 ${m.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{m.text}</p> : null);

// ---------------------------------------------------------------- manual new / edit visit
function VisitForm({ initialPatient, visit, onSaved, onClose, onOpenVisit }) {
  const editing = !!visit;
  const [phone, setPhone] = useState(initialPatient?.phone || '');
  const [matches, setMatches] = useState([]);
  const [patientId, setPatientId] = useState(initialPatient?.id || '');
  const [p, setP] = useState({ name: initialPatient?.name || '', age: initialPatient?.age ?? '', gender: initialPatient?.gender || '' });
  const [v, setV] = useState(() => ({
    visitDate: visit ? localDay(new Date(visit.visitDate)) : localDay(),
    recordedBy: visit ? visit.recordedBy || '' : savedNurse(),
    ...Object.fromEntries(VISIT_FIELDS.map(([k]) => [k, visit?.[k] || ''])),
  }));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [dup, setDup] = useState(null);

  // existing patients with this mobile number -> pick one instead of creating a duplicate
  useEffect(() => {
    if (editing || initialPatient || phone.length !== 10) { setMatches([]); return undefined; }
    let live = true;
    api.clinicMatch(phone).then((d) => { if (live) setMatches(d.patients || []); }).catch(() => {});
    return () => { live = false; };
  }, [phone, editing, initialPatient]);

  // auto-saved draft (this device) until the visit is saved – reopening the form continues where it stopped
  const draft = useFormDraft(editing ? `clinic-visit:edit:${visit.id}` : `clinic-visit:new:${initialPatient?.id || 'any'}`, { phone, patientId, p, v }, {
    onRestore: (d) => {
      if (!d) return;
      if (!initialPatient && !editing && d.phone !== undefined) { setPhone(d.phone); setPatientId(d.patientId || ''); if (d.p) setP((x) => ({ ...x, ...d.p })); }
      if (d.v) setV((x) => ({ ...x, ...d.v }));
    },
  });

  const choose = (m) => { setPatientId(m.id); setP({ name: m.name, age: m.age ?? '', gender: m.gender || '' }); };
  const setVal = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setMsg(null); setDup(null); };

  const save = async (e, allowSameDay = false) => {
    e?.preventDefault();
    setMsg(null);
    if (!editing) {
      if (!/^[6-9]\d{9}$/.test(phone)) { setMsg({ ok: false, text: 'Please enter a valid 10-digit mobile number.' }); return; }
      if (!p.name.trim()) { setMsg({ ok: false, text: "Please enter the patient's name." }); return; }
    }
    if (!VISIT_FIELDS.some(([k]) => String(v[k]).trim())) { setMsg({ ok: false, text: 'Please fill in at least the symptoms, diagnosis, treatment, prescription or notes.' }); return; }
    setBusy(true);
    try { localStorage.setItem(NURSE_KEY, String(v.recordedBy || '').trim()); } catch { /* storage unavailable */ }
    try {
      if (editing) {
        const r = await api.updateClinicVisit(visit.id, v);
        draft.clear();
        onSaved(r, 'Visit updated');
      } else {
        const body = { ...v, allowSameDay, patient: { name: p.name.trim(), age: p.age, gender: p.gender, phone } };
        if (patientId) body.patientId = patientId;
        const r = await api.addClinicVisit(body);
        draft.clear();
        onSaved(r, r.message);
      }
    } catch (err) {
      if (err.status === 409 && err.data?.duplicate) setDup(err.data);
      else setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} noValidate className="space-y-5" data-testid="visit-form">
      <DraftNotice draft={draft} />
      {!editing && (
        <fieldset className="space-y-3">
          <legend className="text-[13px] font-bold uppercase tracking-wider text-primary/50 mb-1">Patient Details</legend>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block"><span className={label}>Mobile number *</span>
              <div className="flex"><span className="h-11 px-3 flex items-center rounded-l-xl border border-r-0 border-line bg-tint text-[14px] text-primary/70">+91</span>
                <input id="cv-phone" inputMode="numeric" className={`${field} rounded-l-none`} value={phone} disabled={!!initialPatient} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setPatientId(''); }} placeholder="10-digit mobile" autoFocus={!initialPatient} /></div>
            </label>
            <label className="block"><span className={label}>Patient name *</span>
              <input id="cv-name" className={field} value={p.name} disabled={!!patientId} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="Full name" /></label>
          </div>
          {matches.length > 0 && !patientId && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-2" data-testid="patient-matches">
              <p className="text-[13px] font-semibold text-amber-900">Already registered with this mobile – choose to add the visit to their record:</p>
              <div className="flex flex-wrap gap-2">
                {matches.map((m) => <button key={m.id} type="button" onClick={() => choose(m)} className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-[13px] font-semibold text-primary hover:bg-amber-100">{m.name} · {m.code}{m.age != null ? ` · ${m.age}y` : ''}</button>)}
              </div>
              <p className="text-[12px] text-amber-800">Or type a different name for a new family member.</p>
            </div>
          )}
          {patientId && !initialPatient && (
            <p className="text-[13px] text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2 flex items-center justify-between gap-2">Adding a visit to {p.name}'s existing record.
              <button type="button" onClick={() => { setPatientId(''); setP({ name: '', age: '', gender: '' }); }} className="font-semibold underline">New patient instead</button></p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className={label}>Age (years)</span>
              <input id="cv-age" type="number" min="0" max="120" className={field} value={p.age} onChange={(e) => setP({ ...p, age: e.target.value })} /></label>
            <label className="block"><span className={label}>Gender</span>
              <select id="cv-gender" className={field} value={p.gender} onChange={(e) => setP({ ...p, gender: e.target.value })}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select></label>
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-3">
        <legend className="text-[13px] font-bold uppercase tracking-wider text-primary/50 mb-1">Visit Information</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block"><span className={label}>Visit date *</span>
            <input id="cv-date" type="date" max={localDay()} className={field} value={v.visitDate} onChange={setVal('visitDate')} /></label>
          <label className="block"><span className={label}>Entered by (nurse's name)</span>
            <input id="cv-by" className={field} value={v.recordedBy} onChange={setVal('recordedBy')} placeholder="Leave empty if the doctor enters it" /></label>
        </div>
        {VISIT_FIELDS.map(([k, l, ph]) => (
          <label key={k} className="block"><span className={label}>{l}</span>
            <textarea id={`cv-${k}`} rows={k === 'prescription' ? 3 : 2} className={area} value={v[k]} onChange={setVal(k)} placeholder={ph} /></label>
        ))}
      </fieldset>

      <Msg m={msg} />
      {dup && (
        <div role="alert" className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-[13.5px] text-amber-900 space-y-2.5">
          <p>{dup.message}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onOpenVisit(dup.visit, dup.patient)} className="px-3 py-2 rounded-lg bg-white border border-amber-300 font-semibold">Open existing visit</button>
            <button type="button" onClick={(e) => save(e, true)} className="px-3 py-2 rounded-lg bg-amber-600 text-white font-semibold">Save as another visit</button>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
        <button type="submit" disabled={busy} className={btn}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}{editing ? 'Save changes' : 'Save visit'}</button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- Share Patient Registration Link Modal
function ShareLinkModal({ onLinkCreated, onClose, onOpenPatient }) {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [recordedBy, setRecordedBy] = useState(savedNurse());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('Pending');
  const [submittedData, setSubmittedData] = useState(null);

  // Poll status while link is active and open in modal
  useEffect(() => {
    if (!createdLink || status === 'Submitted') return;
    const timer = setInterval(async () => {
      try {
        const res = await api.getRegistrationLink(createdLink.id);
        if (res.link?.status === 'Submitted') {
          setStatus('Submitted');
          setSubmittedData(res.link);
          onLinkCreated?.();
        }
      } catch {
        // ignore polling failures
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [createdLink, status, onLinkCreated]);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      localStorage.setItem(NURSE_KEY, recordedBy.trim());
    } catch { /* storage */ }
    try {
      const res = await api.createRegistrationLink({
        patientName: patientName.trim(),
        patientPhone: patientPhone.replace(/\D/g, ''),
        notes: notes.trim(),
        recordedBy: recordedBy.trim(),
      });
      setCreatedLink(res.link);
      setStatus(res.link.status || 'Pending');
      setMsg({ ok: true, text: 'Unique registration link generated successfully!' });
      onLinkCreated?.();
    } catch (err) {
      setMsg({ ok: false, text: err.message || 'Failed to generate link' });
    } finally {
      setBusy(false);
    }
  };

  const getFullUrl = () => {
    if (!createdLink?.token) return '';
    return `${window.location.origin}/register-patient/${createdLink.token}`;
  };

  const copyToClipboard = () => {
    const url = getFullUrl();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      const t = document.createElement('textarea');
      t.value = url;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareWhatsApp = () => {
    const url = getFullUrl();
    const phone = (patientPhone || createdLink?.patientPhone || '').replace(/\D/g, '').slice(-10);
    const doctor = createdLink?.doctor || 'your doctor';
    const text = encodeURIComponent(`Hello! Please click this link to fill out your patient registration form for Dr. ${doctor}: ${url}`);
    const waUrl = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(waUrl, '_blank', 'noreferrer');
  };

  return (
    <div className="space-y-5" data-testid="share-link-modal">
      {!createdLink ? (
        <form onSubmit={handleGenerate} className="space-y-4">
          <p className="text-[13.5px] text-gray-600 leading-relaxed">
            Generate a unique patient registration link and share it via WhatsApp or message. The patient can open it on their mobile phone, enter their details and symptoms, and submit. The details will automatically appear in your <strong>Patient Visits</strong> list.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className={label}>Patient Name <span className="text-gray-400 font-normal">(Optional prefill)</span></span>
              <input
                className={field}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Anita Sharma"
              />
            </label>

            <label className="block">
              <span className={label}>Patient Mobile <span className="text-gray-400 font-normal">(Optional prefill)</span></span>
              <div className="flex">
                <span className="h-11 px-3 flex items-center rounded-l-xl border border-r-0 border-line bg-tint text-[14px] text-primary/70">+91</span>
                <input
                  inputMode="numeric"
                  className={`${field} rounded-l-none`}
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile"
                />
              </div>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className={label}>Shared by (Nurse's Name)</span>
              <input
                className={field}
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                placeholder="Nurse / Desk Staff Name"
              />
            </label>

            <label className="block">
              <span className={label}>Note / Purpose <span className="text-gray-400 font-normal">(Optional)</span></span>
              <input
                className={field}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Walk-in token #4"
              />
            </label>
          </div>

          <Msg m={msg} />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
            <button type="submit" disabled={busy} className={btn}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              Generate & Copy Link
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <Msg m={msg} />

          {/* Registration Live Status */}
          <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${status === 'Submitted' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <div>
              <p className="text-[14px] font-bold flex items-center gap-2">
                {status === 'Submitted' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Patient Form Submitted!</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                    <span>Status: Pending Patient Submission</span>
                  </>
                )}
              </p>
              <p className="text-[12.5px] mt-1 opacity-90">
                {status === 'Submitted'
                  ? `Patient details have been synchronized and are now available in your Patient Visits.`
                  : `Waiting for the patient to open the link and complete the form on their phone.`}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${status === 'Submitted' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
              {status}
            </span>
          </div>

          {/* Link Box */}
          <div className="p-4 rounded-2xl bg-tint border border-line-soft space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
              <span>Unique Link Reference: <strong className="text-primary">{createdLink.code}</strong></span>
              <span>Valid for 7 days</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                readOnly
                value={getFullUrl()}
                className={`${field} font-mono text-[13px] bg-white select-all`}
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className={`h-11 px-4 rounded-xl font-semibold text-sm inline-flex items-center gap-1.5 transition shrink-0 ${copied ? 'bg-emerald-600 text-white' : 'bg-secondary text-white hover:brightness-95'}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={shareWhatsApp}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] inline-flex items-center gap-2 transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> Share via WhatsApp
              </button>
              <a
                href={getFullUrl()}
                target="_blank"
                rel="noreferrer"
                className="h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-primary font-semibold text-[13px] inline-flex items-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" /> Preview Patient Form
              </a>
            </div>
          </div>

          {/* Record Ready CTA */}
          {status === 'Submitted' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13.5px] font-bold text-emerald-900">Record Ready in Patient Visits</p>
                  {(submittedData?.appointmentNumber || submittedData?.visit?.appointmentNumber || createdLink?.appointmentNumber) && (
                    <span className="font-mono text-xs font-extrabold bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-300">
                      {submittedData?.appointmentNumber || submittedData?.visit?.appointmentNumber || createdLink?.appointmentNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">Patient: {submittedData?.patient?.name || createdLink.patientName || 'Patient'}</p>
              </div>
              {submittedData?.patientId && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPatient?.(submittedData.patientId);
                  }}
                  className="h-10 px-4 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition shrink-0"
                >
                  View Patient Record →
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                setCreatedLink(null);
                setPatientName('');
                setPatientPhone('');
                setStatus('Pending');
              }}
              className="text-xs font-semibold text-secondary hover:underline"
            >
              + Generate Another Link
            </button>
            <button type="button" onClick={onClose} className={btnGhost}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Registration Links List Component
function RegistrationLinksPanel({ onOpenPatient, onNewLink }) {
  const [links, setLinks] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [err, setErr] = useState('');

  const loadLinks = useCallback(() => {
    api.getRegistrationLinks({ status: filter, search })
      .then((d) => setLinks(d.links || []))
      .catch((e) => setErr(e.message));
  }, [filter, search]);

  useEffect(() => {
    loadLinks();
    const interval = setInterval(loadLinks, 6000);
    return () => clearInterval(interval);
  }, [loadLinks]);

  const copyUrl = (token, id) => {
    const url = `${window.location.origin}/register-patient/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const shareWa = (link) => {
    const url = `${window.location.origin}/register-patient/${link.token}`;
    const phone = link.patientPhone ? link.patientPhone.replace(/\D/g, '').slice(-10) : '';
    const text = encodeURIComponent(`Hello! Please click this link to complete your patient registration form for Dr. ${link.doctor}: ${url}`);
    const waUrl = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(waUrl, '_blank', 'noreferrer');
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this registration link? The patient will no longer be able to submit using this link.')) return;
    try {
      await api.cancelRegistrationLink(id);
      loadLinks();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="space-y-4" data-testid="registration-links-panel">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-tint w-fit">
          {[['all', 'All Links'], ['Pending', 'Pending'], ['Submitted', 'Submitted']].map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition ${filter === k ? 'bg-white shadow-sm text-primary' : 'text-primary/60 hover:text-primary'}`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              aria-label="Search links"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, phone, code..."
              className={`${field} h-9 pl-9 text-xs`}
            />
          </div>
          <button
            type="button"
            onClick={onNewLink}
            className={`${btn} h-9 px-3 text-xs`}
          >
            <Plus className="w-3.5 h-3.5" /> Share Link
          </button>
        </div>
      </div>

      {err && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">{err}</p>}

      {links === null ? (
        <p className="text-sm text-gray-500 flex items-center gap-2 py-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading registration links...</p>
      ) : !links.length ? (
        <div className="py-10 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-6">
          <Link2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="font-semibold text-primary">No registration links found</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            {search ? 'Try clearing your search query.' : 'Click "Share Registration Link" above to generate a unique link for your patient to fill out on their phone.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {links.map((link) => (
            <div key={link.id} className="py-3.5 px-2 hover:bg-gray-50/80 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-primary text-sm">
                    {link.patientName || link.patient?.name || 'Walk-in Patient'}
                  </span>
                  {(link.appointmentNumber || link.visit?.appointmentNumber) && (
                    <span className="text-xs font-mono font-bold text-secondary bg-tint px-2 py-0.5 rounded border border-secondary/20">
                      {link.appointmentNumber || link.visit?.appointmentNumber}
                    </span>
                  )}
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {link.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    link.status === 'Submitted' ? 'bg-emerald-100 text-emerald-800' :
                    link.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {link.status === 'Submitted' ? '✓ Submitted' : link.status === 'Pending' ? '⏳ Pending' : link.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  {link.patientPhone && <span>+91 {link.patientPhone}</span>}
                  <span>Generated {fmtDateTime(link.createdAt)}</span>
                  {link.recordedBy && <span>by {link.recordedBy}</span>}
                  {link.submittedAt && <span className="text-emerald-700 font-medium">Submitted {fmtDateTime(link.submittedAt)}</span>}
                  {link.notes && <span className="text-gray-400">· {link.notes}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => copyUrl(link.token, link.id)}
                  className="h-8 px-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-primary inline-flex items-center gap-1 transition"
                  title="Copy registration link"
                >
                  {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                  {copiedId === link.id ? 'Copied' : 'Copy'}
                </button>

                <button
                  type="button"
                  onClick={() => shareWa(link)}
                  className="h-8 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 inline-flex items-center gap-1 transition"
                  title="Share via WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </button>

                {link.status === 'Submitted' && link.patientId && (
                  <button
                    type="button"
                    onClick={() => onOpenPatient?.(link.patientId)}
                    className="h-8 px-2.5 rounded-lg bg-secondary text-white hover:brightness-95 text-xs font-semibold inline-flex items-center gap-1 transition"
                  >
                    View Record →
                  </button>
                )}

                {link.status === 'Pending' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(link.id)}
                    className="h-8 px-2 rounded-lg text-xs text-red-600 hover:bg-red-50 transition"
                    title="Cancel link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- patient record + history
export function PatientRecord({ patientId, canEdit = true, canDelete = false, onChanged, onAddVisit, onEditVisit }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [editP, setEditP] = useState(null);
  const [msg, setMsg] = useState(null);
  const load = useCallback(() => { api.clinicPatient(patientId).then(setData).catch((e) => setErr(e.message)); }, [patientId]);
  useEffect(() => { load(); }, [load]);
  if (err) return <p className="text-red-600 text-sm">{err}</p>;
  if (!data) return <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>;
  const { patient, visits } = data;

  const savePatient = async (e) => {
    e.preventDefault(); setMsg(null);
    try { await api.updateClinicPatient(patient.id, editP); setEditP(null); setMsg({ ok: true, text: 'Patient details updated.' }); load(); onChanged?.(); } catch (e2) { setMsg({ ok: false, text: e2.message }); }
  };
  const remove = async (v) => {
    try { await api.deleteClinicVisit(v.id); setMsg({ ok: true, text: 'Visit deleted.' }); load(); onChanged?.(); } catch (e2) { setMsg({ ok: false, text: e2.message }); }
  };

  return (
    <div className="space-y-5" data-testid="patient-record">
      <div className="rounded-2xl bg-tint p-4 sm:p-5">
        {editP ? (
          <form onSubmit={savePatient} className="grid sm:grid-cols-2 gap-3">
            <label className="block"><span className={label}>Name</span><input id="ep-name" className={field} value={editP.name} onChange={(e) => setEditP({ ...editP, name: e.target.value })} /></label>
            <label className="block"><span className={label}>Mobile</span><input id="ep-phone" inputMode="numeric" className={field} value={editP.phone} onChange={(e) => setEditP({ ...editP, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></label>
            <label className="block"><span className={label}>Age</span><input id="ep-age" type="number" className={field} value={editP.age ?? ''} onChange={(e) => setEditP({ ...editP, age: e.target.value })} /></label>
            <label className="block"><span className={label}>Gender</span><select id="ep-gender" className={field} value={editP.gender || ''} onChange={(e) => setEditP({ ...editP, gender: e.target.value })}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select></label>
            <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" onClick={() => setEditP(null)} className={btnGhost}>Cancel</button><button className={btn}>Save details</button></div>
          </form>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xl font-bold text-primary">{patient.name}</p>
              <p className="text-sm text-gray-600 mt-0.5">{patient.code} · {[patient.age != null ? `${patient.age} yrs` : null, patient.gender].filter(Boolean).join(' · ') || 'Age / gender not recorded'}</p>
              <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +91 {patient.phone}</p>
              <p className="text-xs text-gray-500 mt-1.5">{patient.visitCount} visit{patient.visitCount === 1 ? '' : 's'} · first {fmtDate(patient.firstVisitAt)} · last {fmtDate(patient.lastVisitAt)}{patient.doctor ? ` · ${patient.doctor}` : ''}</p>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditP({ name: patient.name, phone: patient.phone, age: patient.age ?? '', gender: patient.gender || '' })} className={`${btnGhost} h-10`}><Pencil className="w-4 h-4" /> Edit details</button>
                {onAddVisit && <button type="button" onClick={() => onAddVisit(patient)} className={`${btn} h-10`}><Plus className="w-4 h-4" /> New visit</button>}
              </div>
            )}
          </div>
        )}
      </div>
      <Msg m={msg} />
      <div>
        <h4 className="font-bold text-primary flex items-center gap-2 mb-3"><History className="w-4 h-4" /> Visit history</h4>
        {!visits.length && <p className="text-sm text-gray-500">No visits yet.</p>}
        <ol className="space-y-3">
          {visits.map((v) => (
            <li key={v.id} className="rounded-2xl border border-gray-100 p-4" data-testid="visit-item">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {(v.appointmentNumber || v.code) && (
                    <span className="font-mono font-bold text-xs bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-lg border border-brand-200">
                      {v.appointmentNumber || v.code}
                    </span>
                  )}
                  <p className="font-semibold text-primary">{fmtDateTime(v.visitDate)}</p>
                  {v.source === 'shared_link' && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Online Registration
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {canEdit && onEditVisit && <button type="button" onClick={() => onEditVisit(v, patient)} className="h-8 px-2.5 rounded-lg text-[13px] font-semibold text-secondary hover:bg-tint inline-flex items-center gap-1"><Pencil className="w-3.5 h-3.5" /> Edit</button>}
                  {canDelete && <button type="button" onClick={() => remove(v)} aria-label="Delete visit" className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 inline-flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[13.5px]">
                {VISIT_FIELDS.map(([k, l]) => v[k] ? (
                  <div key={k} className={k === 'prescription' || k === 'nurseNotes' ? 'sm:col-span-2' : ''}><dt className="text-[11.5px] font-semibold uppercase tracking-wider text-gray-400">{l}</dt><dd className="text-gray-800 whitespace-pre-line">{v[k]}</dd></div>
                ) : null)}
                {v.medicalHistory && (
                  <div><dt className="text-[11.5px] font-semibold uppercase tracking-wider text-gray-400">Past Medical History</dt><dd className="text-gray-800">{v.medicalHistory}</dd></div>
                )}
                {v.allergies && (
                  <div><dt className="text-[11.5px] font-semibold uppercase tracking-wider text-gray-400">Allergies</dt><dd className="text-gray-800">{v.allergies}</dd></div>
                )}
                {v.currentMedications && (
                  <div className="sm:col-span-2"><dt className="text-[11.5px] font-semibold uppercase tracking-wider text-gray-400">Current Medications</dt><dd className="text-gray-800">{v.currentMedications}</dd></div>
                )}
              </dl>
              <p className="text-[11.5px] text-gray-400 mt-2">Entered by {v.enteredBy || '—'}{v.updatedBy ? ` · edited by ${v.updatedBy} ${fmtDateTime(v.updatedAt)}` : ''}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- report
function ReportPanel({ onSelectDate }) {
  const today = localDay();
  const [range, setRange] = useState({ from: `${today.slice(0, 7)}-01`, to: today });
  const [rep, setRep] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { setRep(null); api.clinicReport(range).then(setRep).catch((e) => setErr(e.message)); }, [range]);
  const exportCsv = async () => {
    const d = await api.clinicVisits({ ...range, limit: 5000 });
    downloadCsv(`patient-visits-${range.from}-to-${range.to}.csv`, visitCsvRows(d.visits || []));
  };
  const max = Math.max(1, ...(rep?.daily || []).map((d) => d.visits));
  return (
    <div className="space-y-6" data-testid="visit-report">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block"><span className={label}>From</span><input id="rp-from" type="date" className={field} value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
        <label className="block"><span className={label}>To</span><input id="rp-to" type="date" className={field} value={range.to} min={range.from} max={today} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
        <button type="button" onClick={exportCsv} className={btnGhost}><FileDown className="w-4 h-4" /> Export CSV</button>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {!rep ? <p className="text-sm text-gray-500">Loading…</p> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[['Visits in period', rep.totals.visits], ['Patients seen', rep.totals.patients], ["Today's visits", rep.totals.todayVisits], ['This month', rep.totals.monthVisits]].map(([l, n]) => (
              <div key={l} className="rounded-2xl bg-tint p-4"><p className="text-2xl font-bold text-primary">{n}</p><p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">{l}</p></div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-primary">Daily Appointments Graph</p>
              <span className="text-xs text-gray-400">Appointments reset to 1 daily at 12:00 AM</span>
            </div>
            <div className="overflow-x-auto"><div className="flex items-end gap-1 h-40 min-w-full" style={{ width: Math.max(rep.daily.length * 22, 300) }}>
              {rep.daily.map((d) => (
                <div key={d.date} className="flex-1 min-w-[16px] flex flex-col items-center justify-end gap-1 h-full cursor-pointer hover:opacity-80 transition" onClick={() => onSelectDate?.(d.date)} title={`${d.date}: ${d.visits} appointments`}>
                  {d.visits > 0 && <span className="text-[10px] text-gray-500 font-bold">{d.visits}</span>}
                  <span className="w-full rounded-t bg-secondary/80 hover:bg-secondary transition" style={{ height: `${(d.visits / max) * 100}%`, minHeight: d.visits ? 4 : 1 }} />
                  <span className="text-[9px] text-gray-400">{d.date.slice(8)}</span>
                </div>
              ))}
            </div></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-primary">Date-Wise Appointment Counts</h4>
                <p className="text-xs text-gray-500 mt-0.5">Separate daily appointment sequences for each calendar date</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total Appointments</th>
                    <th className="py-3 px-4">Unique Patients</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rep.daily.slice().reverse().map((d) => (
                    <tr key={d.date} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-4 font-semibold text-primary">
                        {fmtDate(d.date)} {d.date === today && <span className="ml-1.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">Today</span>}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-secondary text-base">
                        {d.visits}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {d.patients ?? d.visits}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {onSelectDate && (
                          <button
                            type="button"
                            onClick={() => onSelectDate(d.date)}
                            className="h-8 px-3 rounded-lg text-xs font-semibold text-secondary hover:bg-tint transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            View Visits →
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {rep.monthly.length > 1 && (
            <div><p className="font-bold text-primary mb-2">Monthly visits</p>
              <div className="flex flex-wrap gap-2">{rep.monthly.map((m) => <span key={m.month} className="px-3 py-1.5 rounded-lg bg-tint text-sm"><strong>{m.visits}</strong> in {new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>)}</div></div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- main section
export default function PatientVisits() {
  const [summary, setSummary] = useState(null);
  const [patients, setPatients] = useState(null);
  const [selectedDate, setSelectedDate] = useState(localDay());
  const [dateVisits, setDateVisits] = useState([]);
  const [loadingDateVisits, setLoadingDateVisits] = useState(false);
  const [pendingLinksCount, setPendingLinksCount] = useState(0);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('patients'); // patients | today | links | report
  const [modal, setModal] = useState(null); // {kind:'new'|'share-link'|'edit'|'patient', ...}
  const [notice, setNotice] = useState('');

  const loadDateVisits = useCallback(() => {
    setLoadingDateVisits(true);
    api.clinicVisits({ from: selectedDate, to: selectedDate })
      .then((d) => setDateVisits(d.visits || []))
      .catch(() => setDateVisits([]))
      .finally(() => setLoadingDateVisits(false));
  }, [selectedDate]);

  const refresh = useCallback(() => {
    api.clinicSummary().then((d) => setSummary(d.summary)).catch(() => {});
    loadDateVisits();
    api.getRegistrationLinks({ status: 'Pending', limit: 100 })
      .then((d) => setPendingLinksCount((d.links || []).length))
      .catch(() => {});
  }, [loadDateVisits]);

  const loadPatients = useCallback(() => {
    api.clinicPatients({ search }).then((d) => setPatients(d.patients || [])).catch(() => setPatients([]));
  }, [search]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { loadDateVisits(); }, [loadDateVisits]);
  useEffect(() => { const t = setTimeout(loadPatients, 250); return () => clearTimeout(t); }, [loadPatients]);

  const shiftDate = (delta) => {
    const cur = new Date(selectedDate + 'T00:00:00');
    cur.setDate(cur.getDate() + delta);
    setSelectedDate(localDay(cur));
  };

  const afterSave = (r, text) => {
    setModal(r.patient ? { kind: 'patient', id: r.patient.id || r.visit?.patientId, key: Date.now() } : null);
    setNotice(text);
    refresh();
    loadPatients();
  };

  const cards = [
    ['Total patients', summary?.totalPatients, Users],
    [selectedDate === localDay() ? "Today's visits" : `Visits (${fmtDate(selectedDate)})`, dateVisits.length, CalendarCheck],
    ['Pending Links', pendingLinksCount, Clock],
    ['This month', summary?.monthVisits, CalendarDays],
  ];

  // Filter date visits locally by search term (patient name, mobile, appointment number, code, diagnosis)
  const filteredDateVisits = dateVisits.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase().trim();
    const apptNum = String(v.appointmentNumber || v.dailySequence || '').toLowerCase();
    const code = String(v.code || '').toLowerCase();
    const name = String(v.patient?.name || v.patientName || '').toLowerCase();
    const phone = String(v.patient?.phone || '').toLowerCase();
    const diag = String(v.diagnosis || '').toLowerCase();
    const symp = String(v.symptoms || '').toLowerCase();
    const num = parseInt(q.replace(/\D/g, ''), 10);
    const padded = !isNaN(num) ? String(num).padStart(3, '0') : '';
    return (
      name.includes(q) ||
      phone.includes(q) ||
      apptNum.includes(q) ||
      code.includes(q) ||
      diag.includes(q) ||
      symp.includes(q) ||
      (Boolean(padded) && (apptNum.includes(padded) || code.includes(padded)))
    );
  });

  return (
    <div className="space-y-6" data-testid="patient-visits">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Patient Visits</h2>
          <p className="text-gray-500 font-medium mt-1">
            Clinic patients and visit records. Daily appointment counts start at 1 every day at 12:00 AM (Asia/Kolkata).
          </p>
        </div>

        {/* Dual Registration Options: Share Link & Manual */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setModal({ kind: 'share-link' })}
            className={`${btnGhost} border-secondary/40 text-secondary hover:bg-secondary/5 font-bold shadow-sm`}
            title="Generate a unique link for the patient to fill out"
          >
            <Share2 className="w-4 h-4 text-secondary" /> Share Registration Link
          </button>
          <button
            type="button"
            onClick={() => setModal({ kind: 'new' })}
            className={btn}
            title="Nurse fills out the patient details directly"
          >
            <UserPlus className="w-4 h-4" /> Add Patient Manually
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="visit-summary">
        {cards.map(([l, n, Icon]) => (
          <div key={l} className={`${card} p-5 flex items-center gap-4`}>
            <span className="w-12 h-12 rounded-2xl bg-tint text-secondary flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </span>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-primary leading-none">
                {n ?? <span className="inline-block w-8 h-7 rounded bg-gray-100 animate-pulse align-middle" />}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1.5">{l}</p>
            </div>
          </div>
        ))}
      </div>

      {notice && (
        <p role="status" className="text-[13.5px] rounded-xl px-3.5 py-2.5 bg-emerald-50 text-emerald-700 flex justify-between gap-3">
          {notice}
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss"><X className="w-4 h-4" /></button>
        </p>
      )}

      <div className={`${card} p-4 sm:p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-tint w-fit" role="tablist">
            {[
              ['patients', 'Patients', ClipboardList],
              ['today', selectedDate === localDay() ? `Today (${dateVisits.length})` : `${fmtDate(selectedDate)} (${dateVisits.length})`, CalendarCheck],
              ['links', `Shared Links (${pendingLinksCount ? `${pendingLinksCount} pending` : 'All'})`, Link2],
              ['report', 'Date-Wise Reports', BarChart3],
            ].map(([k, l, Icon]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={view === k}
                onClick={() => setView(k)}
                className={`h-9 px-3.5 rounded-lg text-[13.5px] font-semibold inline-flex items-center gap-1.5 transition ${view === k ? 'bg-white shadow-sm text-primary' : 'text-primary/60 hover:text-primary'}`}
              >
                <Icon className="w-4 h-4" /> {l}
              </button>
            ))}
          </div>

          {(view === 'patients' || view === 'today') && (
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                aria-label="Search patients"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient name, mobile or appointment no."
                className={`${field} pl-10`}
              />
            </div>
          )}
        </div>

        {/* View 1: Patients list */}
        {view === 'patients' && (
          patients === null ? <p className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>
            : !patients.length ? (
              <div className="py-12 text-center text-gray-500 space-y-3">
                <p>{search ? 'No patients match your search.' : 'No patients registered yet.'}</p>
                <div className="flex justify-center gap-3">
                  <button type="button" onClick={() => setModal({ kind: 'share-link' })} className={`${btnGhost} text-xs`}>
                    <Share2 className="w-3.5 h-3.5 text-secondary" /> Share Registration Link
                  </button>
                  <button type="button" onClick={() => setModal({ kind: 'new' })} className={`${btn} text-xs`}>
                    <UserPlus className="w-3.5 h-3.5" /> Add Patient Manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100" data-testid="patient-list">
                {patients.map((pt) => (
                  <button key={pt.id} type="button" onClick={() => setModal({ kind: 'patient', id: pt.id })} className="w-full text-left flex items-center gap-4 py-3.5 hover:bg-gray-50 rounded-xl px-2 transition">
                    <span className="w-10 h-10 rounded-full bg-tint text-primary font-bold flex items-center justify-center shrink-0">{pt.name[0]?.toUpperCase()}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-primary truncate">{pt.name} <span className="text-xs font-medium text-gray-400">{pt.code}</span></span>
                      <span className="block text-xs text-gray-500">{[pt.age != null ? `${pt.age} yrs` : null, pt.gender, `+91 ${pt.phone}`].filter(Boolean).join(' · ')}</span>
                    </span>
                    <span className="hidden sm:block text-right text-xs text-gray-500"><span className="block font-semibold text-primary">{pt.visitCount} visit{pt.visitCount === 1 ? '' : 's'}</span>last {fmtDate(pt.lastVisitAt)}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>
            )
        )}

        {/* View 2: Date visits with Date Filter Navigation */}
        {view === 'today' && (
          <div className="space-y-4">
            {/* Date-Wise Filter Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-tint/60 border border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => shiftDate(-1)}
                  className="h-9 px-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-primary hover:bg-gray-50 transition inline-flex items-center gap-1 cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev Day
                </button>
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 h-9">
                  <CalendarIcon className="w-3.5 h-3.5 text-secondary" />
                  <input
                    type="date"
                    aria-label="Select appointment date"
                    value={selectedDate}
                    max={localDay()}
                    onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                    className="text-xs font-semibold text-primary bg-transparent outline-none cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDate(localDay())}
                  className={`h-9 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${selectedDate === localDay() ? 'bg-secondary text-white shadow-sm' : 'border border-gray-200 bg-white text-primary hover:bg-gray-50'}`}
                >
                  Today
                </button>
                <button
                  type="button"
                  disabled={selectedDate >= localDay()}
                  onClick={() => shiftDate(1)}
                  className="h-9 px-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-primary hover:bg-gray-50 transition inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Next Day"
                >
                  Next Day <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-gray-700">
                  Appointments on {fmtDate(selectedDate)}: <strong className="text-secondary font-mono font-bold text-sm">{dateVisits.length}</strong>
                </span>
                {dateVisits.length > 0 && (
                  <span className="text-gray-400">· Unique Patients: <strong className="text-primary font-bold">{new Set(dateVisits.map((v) => v.patient?.code || v.patientName)).size}</strong></span>
                )}
              </div>
            </div>

            {loadingDateVisits ? (
              <p className="text-sm text-gray-500 py-8 text-center flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-secondary" /> Loading appointments…
              </p>
            ) : !filteredDateVisits.length ? (
              <div className="py-10 text-center text-gray-500 space-y-2">
                <p>{search ? `No appointments matching "${search}" on ${fmtDate(selectedDate)}.` : `No visits recorded for ${selectedDate === localDay() ? 'today' : fmtDate(selectedDate)}.`}</p>
                {selectedDate === localDay() && (
                  <div className="flex justify-center gap-3 pt-2">
                    <button type="button" onClick={() => setModal({ kind: 'share-link' })} className={`${btnGhost} text-xs`}>
                      <Share2 className="w-3.5 h-3.5 text-secondary" /> Share Registration Link
                    </button>
                    <button type="button" onClick={() => setModal({ kind: 'new' })} className={`${btn} text-xs`}>
                      <UserPlus className="w-3.5 h-3.5" /> Add Patient Manually
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredDateVisits.map((v) => (
                  <button key={v.id} type="button" onClick={() => setModal({ kind: 'patient', id: v.patientId })} className="w-full text-left flex items-center gap-3 sm:gap-4 py-3.5 hover:bg-gray-50 rounded-xl px-2 transition">
                    {/* Daily Appointment Number Badge */}
                    <div className="flex flex-col items-center justify-center min-w-[62px] px-2 py-1 rounded-xl bg-tint border border-secondary/25 shrink-0">
                      <span className="text-[9.5px] uppercase font-bold text-secondary tracking-wider leading-none">Appt</span>
                      <span className="font-mono text-base font-extrabold text-secondary leading-tight mt-0.5">
                        {v.appointmentNumber || (v.dailySequence ? String(v.dailySequence).padStart(3, '0') : '') || v.code}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-primary w-20 shrink-0">{new Date(v.visitDate).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-primary truncate">
                        {v.patient?.name || v.patientName}
                        {v.source === 'shared_link' && <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Online Link</span>}
                        {v.patient?.phone && <span className="ml-2 text-xs text-gray-400 font-normal">+91 {v.patient.phone}</span>}
                      </span>
                      <span className="block text-xs text-gray-500 truncate">{v.diagnosis || v.symptoms || '—'}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View 3: Registration Links list */}
        {view === 'links' && (
          <RegistrationLinksPanel
            onOpenPatient={(id) => setModal({ kind: 'patient', id })}
            onNewLink={() => setModal({ kind: 'share-link' })}
          />
        )}

        {/* View 4: Reports */}
        {view === 'report' && (
          <ReportPanel onSelectDate={(d) => { setSelectedDate(d); setView('today'); }} />
        )}
      </div>

      {/* Modals */}
      {modal?.kind === 'share-link' && (
        <Modal title="Share Patient Registration Link" onClose={() => setModal(null)} wide>
          <ShareLinkModal
            onLinkCreated={() => { refresh(); loadPatients(); }}
            onClose={() => setModal(null)}
            onOpenPatient={(id) => setModal({ kind: 'patient', id })}
          />
        </Modal>
      )}

      {modal?.kind === 'new' && (
        <Modal title={modal.patient ? `New visit – ${modal.patient.name}` : 'New patient visit (Manual)'} onClose={() => setModal(null)} wide>
          <VisitForm initialPatient={modal.patient} onSaved={afterSave} onClose={() => setModal(null)} onOpenVisit={(v, p) => setModal({ kind: 'edit', visit: v, patient: p })} />
        </Modal>
      )}

      {modal?.kind === 'edit' && (
        <Modal title={`Edit visit – ${modal.patient?.name || ''}`} onClose={() => setModal(null)} wide>
          <VisitForm visit={modal.visit} onSaved={(r, t) => afterSave({ patient: { id: modal.patient?.id || modal.visit.patientId } }, t)} onClose={() => setModal(null)} onOpenVisit={() => {}} />
        </Modal>
      )}

      {modal?.kind === 'patient' && (
        <Modal title="Patient Record & Visit History" onClose={() => setModal(null)} wide>
          <PatientRecord key={modal.key || modal.id} patientId={modal.id} canDelete onChanged={() => { refresh(); loadPatients(); }}
            onAddVisit={(p) => setModal({ kind: 'new', patient: p })} onEditVisit={(v, p) => setModal({ kind: 'edit', visit: v, patient: p })} />
        </Modal>
      )}
    </div>
  );
}

// small strip for the doctor's main Dashboard tab
export function ClinicSummaryStrip({ onOpen }) {
  const [s, setS] = useState(null);
  useEffect(() => { api.clinicSummary().then((d) => setS(d.summary)).catch(() => {}); }, []);
  const items = [['Clinic patients', s?.totalPatients, Users], ["Today's visits", s?.todayVisits, CalendarCheck], ['Visits this month', s?.monthVisits, CalendarDays]];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="clinic-strip">
      {items.map(([l, n, Icon]) => (
        <button key={l} type="button" onClick={onOpen} className={`${card} p-4 flex items-center gap-3 text-left hover:shadow-md transition`}>
          <span className="w-10 h-10 rounded-xl bg-tint text-secondary flex items-center justify-center"><Icon className="w-5 h-5" /></span>
          <span><span className="block text-2xl font-bold text-primary leading-none">{n ?? '–'}</span><span className="block text-[11.5px] font-semibold uppercase tracking-wider text-gray-500 mt-1">{l}</span></span>
        </button>
      ))}
    </div>
  );
}

export { fmtDate, fmtDateTime, localDay };
