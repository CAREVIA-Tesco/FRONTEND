import React, { useCallback, useEffect, useState } from 'react';
import { Users, CalendarCheck, CalendarDays, Plus, Search, X, Loader2, Pencil, Trash2, UserPlus, FileDown, ClipboardList, BarChart3, ChevronRight, Phone, History } from 'lucide-react';
import api from '../services/api';

// Patient Visit Management – walk-in clinic patients.
// Used in the Doctor Dashboard ("Patient Visits" tab) and on the nurse's dashboard.
//   role = 'doctor' | 'nurse'
// The server decides whose records are visible (a doctor sees only their own patients,
// a nurse only the patients of the doctor they work for).

const field = 'w-full h-11 px-3.5 rounded-xl border border-line bg-white text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition';
const area = 'w-full px-3.5 py-2.5 rounded-xl border border-line bg-white text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition resize-y';
const label = 'block text-[12.5px] font-semibold text-primary/80 mb-1.5';
const card = 'bg-white rounded-[20px] border border-gray-100 shadow-sm';
const btn = 'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-secondary hover:brightness-95 text-white font-semibold text-[14px] transition disabled:opacity-60';
const btnGhost = 'inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-gray-200 bg-white text-primary font-semibold text-[14px] hover:bg-gray-50 transition';

const pad = (n) => String(n).padStart(2, '0');
const localDay = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '—');
const VISIT_FIELDS = [
  ['symptoms', 'Symptoms', 'e.g. Fever for 3 days, body ache'],
  ['diagnosis', 'Diagnosis', 'e.g. Viral fever'],
  ['treatment', 'Treatment', 'e.g. Rest, fluids, injection given'],
  ['prescription', 'Prescription', 'e.g. Paracetamol 650 mg – 1-0-1 × 3 days'],
  ['nurseNotes', "Nurse's notes", 'e.g. BP 130/85, temp 101°F, weight 68 kg'],
];

export function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
  a.download = filename;
  a.click();
}
export const visitCsvRows = (visits, withDoctor = false) => [
  [...(withDoctor ? ['Doctor'] : []), 'Visit date', 'Patient ID', 'Patient', 'Age', 'Gender', 'Mobile', 'Symptoms', 'Diagnosis', 'Treatment', 'Prescription', "Nurse's notes", 'Entered by'],
  ...visits.map((v) => [...(withDoctor ? [v.doctor] : []), fmtDateTime(v.visitDate), v.patient?.code, v.patient?.name || v.patientName, v.patient?.age, v.patient?.gender, v.patient?.phone, v.symptoms, v.diagnosis, v.treatment, v.prescription, v.nurseNotes, v.enteredBy]),
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

// ---------------------------------------------------------------- new / edit visit
function VisitForm({ initialPatient, visit, onSaved, onClose, onOpenVisit }) {
  const editing = !!visit;
  const [phone, setPhone] = useState(initialPatient?.phone || '');
  const [matches, setMatches] = useState([]);
  const [patientId, setPatientId] = useState(initialPatient?.id || '');
  const [p, setP] = useState({ name: initialPatient?.name || '', age: initialPatient?.age ?? '', gender: initialPatient?.gender || '' });
  const [v, setV] = useState(() => ({
    visitDate: visit ? localDay(new Date(visit.visitDate)) : localDay(),
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
    try {
      if (editing) {
        const r = await api.updateClinicVisit(visit.id, v);
        onSaved(r, 'Visit updated');
      } else {
        const body = { ...v, allowSameDay, patient: { name: p.name.trim(), age: p.age, gender: p.gender, phone } };
        if (patientId) body.patientId = patientId;
        const r = await api.addClinicVisit(body);
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
      {!editing && (
        <fieldset className="space-y-3">
          <legend className="text-[13px] font-bold uppercase tracking-wider text-primary/50 mb-1">Patient</legend>
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
        <legend className="text-[13px] font-bold uppercase tracking-wider text-primary/50 mb-1">Visit</legend>
        <label className="block sm:w-1/2"><span className={label}>Visit date *</span>
          <input id="cv-date" type="date" max={localDay()} className={field} value={v.visitDate} onChange={setVal('visitDate')} /></label>
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
                <p className="font-semibold text-primary">{fmtDateTime(v.visitDate)}</p>
                <div className="flex items-center gap-1">
                  {canEdit && onEditVisit && <button type="button" onClick={() => onEditVisit(v, patient)} className="h-8 px-2.5 rounded-lg text-[13px] font-semibold text-secondary hover:bg-tint inline-flex items-center gap-1"><Pencil className="w-3.5 h-3.5" /> Edit</button>}
                  {canDelete && <button type="button" onClick={() => remove(v)} aria-label="Delete visit" className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 inline-flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[13.5px]">
                {VISIT_FIELDS.map(([k, l]) => v[k] ? (
                  <div key={k} className={k === 'prescription' || k === 'nurseNotes' ? 'sm:col-span-2' : ''}><dt className="text-[11.5px] font-semibold uppercase tracking-wider text-gray-400">{l}</dt><dd className="text-gray-800 whitespace-pre-line">{v[k]}</dd></div>
                ) : null)}
              </dl>
              <p className="text-[11.5px] text-gray-400 mt-2">Entered by {v.enteredBy || '—'}{v.updatedBy ? ` · edited by ${v.updatedBy} ${fmtDateTime(v.updatedAt)}` : ''}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- nurses (doctor only)
function StaffPanel() {
  const [list, setList] = useState(null);
  const [f, setF] = useState({ name: '', phone: '', email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => api.clinicStaff().then((d) => setList(d.staff || [])).catch((e) => setMsg({ ok: false, text: e.message }));
  useEffect(() => { load(); }, []);
  const add = async (e) => {
    e.preventDefault(); setMsg(null); setBusy(true);
    try { const r = await api.addClinicStaff(f); setMsg({ ok: true, text: r.message }); setF({ name: '', phone: '', email: '', password: '' }); load(); } catch (e2) { setMsg({ ok: false, text: e2.message }); } finally { setBusy(false); }
  };
  const toggle = async (s) => {
    try { const r = await api.updateClinicStaff(s.id, { status: s.status === 'Active' ? 'Inactive' : 'Active' }); setMsg({ ok: true, text: r.message }); load(); } catch (e2) { setMsg({ ok: false, text: e2.message }); }
  };
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">Nurses sign in on the <strong>Doctor</strong> tab of the login page with their mobile number. They can add and update patient visits for you, but cannot see your appointments, earnings or settings, and cannot delete visits.</p>
      <div className="space-y-2">
        {list === null ? <p className="text-sm text-gray-500">Loading…</p> : !list.length ? <p className="text-sm text-gray-500">No nurses added yet.</p> : list.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3">
            <div><p className="font-semibold text-primary">{s.name}</p><p className="text-xs text-gray-500">+91 {s.phone}{s.email ? ` · ${s.email}` : ''} · {s.status === 'Active' ? 'Can sign in' : 'Access removed'}</p></div>
            <button type="button" onClick={() => toggle(s)} className={`h-9 px-3 rounded-lg text-[13px] font-semibold ${s.status === 'Active' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-700 hover:bg-emerald-50'}`}>{s.status === 'Active' ? 'Remove access' : 'Give access'}</button>
          </div>
        ))}
      </div>
      <form onSubmit={add} className="rounded-2xl bg-tint p-4 grid sm:grid-cols-2 gap-3" noValidate>
        <p className="sm:col-span-2 font-bold text-primary">Add a nurse</p>
        <label className="block"><span className={label}>Name *</span><input id="st-name" className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="block"><span className={label}>Mobile (login) *</span><input id="st-phone" inputMode="numeric" className={field} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></label>
        <label className="block"><span className={label}>Email (optional)</span><input id="st-email" type="email" className={field} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className="block"><span className={label}>Password *</span><input id="st-pass" type="text" autoComplete="off" className={field} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="At least 6 characters" /></label>
        <div className="sm:col-span-2 flex justify-end"><button disabled={busy} className={btn}><UserPlus className="w-4 h-4" /> Add nurse</button></div>
      </form>
      <Msg m={msg} />
    </div>
  );
}

// ---------------------------------------------------------------- report (doctor / nurse)
function ReportPanel() {
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
    <div className="space-y-5" data-testid="visit-report">
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
            <p className="font-bold text-primary mb-2">Daily visits</p>
            <div className="overflow-x-auto"><div className="flex items-end gap-1 h-40 min-w-full" style={{ width: Math.max(rep.daily.length * 22, 300) }}>
              {rep.daily.map((d) => (
                <div key={d.date} className="flex-1 min-w-[16px] flex flex-col items-center justify-end gap-1 h-full" title={`${d.date}: ${d.visits}`}>
                  {d.visits > 0 && <span className="text-[10px] text-gray-500">{d.visits}</span>}
                  <span className="w-full rounded-t bg-secondary/80" style={{ height: `${(d.visits / max) * 100}%`, minHeight: d.visits ? 4 : 1 }} />
                  <span className="text-[9px] text-gray-400">{d.date.slice(8)}</span>
                </div>
              ))}
            </div></div>
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
export default function PatientVisits({ role = 'doctor' }) {
  const [summary, setSummary] = useState(null);
  const [patients, setPatients] = useState(null);
  const [todayVisits, setTodayVisits] = useState([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('patients'); // patients | today | report
  const [modal, setModal] = useState(null); // {kind:'new'|'edit'|'patient'|'staff', ...}
  const [notice, setNotice] = useState('');

  const refresh = useCallback(() => {
    api.clinicSummary().then((d) => setSummary(d.summary)).catch(() => {});
    const t = localDay();
    api.clinicVisits({ from: t, to: t }).then((d) => setTodayVisits(d.visits || [])).catch(() => {});
  }, []);
  const loadPatients = useCallback(() => { api.clinicPatients({ search }).then((d) => setPatients(d.patients || [])).catch(() => setPatients([])); }, [search]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { const t = setTimeout(loadPatients, 250); return () => clearTimeout(t); }, [loadPatients]);

  const afterSave = (r, text) => {
    setModal(r.patient ? { kind: 'patient', id: r.patient.id || r.visit?.patientId, key: Date.now() } : null);
    setNotice(text);
    refresh(); loadPatients();
  };

  const cards = [
    ['Total patients', summary?.totalPatients, Users],
    ["Today's visits", summary?.todayVisits, CalendarCheck],
    ['This month', summary?.monthVisits, CalendarDays],
  ];

  return (
    <div className="space-y-6" data-testid="patient-visits">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Patient Visits</h2>
          <p className="text-gray-500 font-medium mt-1">Clinic patients and their visit records{role === 'nurse' ? ' for your doctor' : ''}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {role === 'doctor' && <button type="button" onClick={() => setModal({ kind: 'staff' })} className={btnGhost}><UserPlus className="w-4 h-4" /> Nurses</button>}
          <button type="button" onClick={() => setModal({ kind: 'new' })} className={btn}><Plus className="w-4 h-4" /> New patient visit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="visit-summary">
        {cards.map(([l, n, Icon]) => (
          <div key={l} className={`${card} p-5 flex items-center gap-4`}>
            <span className="w-12 h-12 rounded-2xl bg-tint text-secondary flex items-center justify-center"><Icon className="w-5 h-5" /></span>
            <div><p className="text-3xl font-bold text-primary leading-none">{n ?? <span className="inline-block w-8 h-7 rounded bg-gray-100 animate-pulse align-middle" />}</p><p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1.5">{l}</p></div>
          </div>
        ))}
      </div>

      {notice && <p role="status" className="text-[13.5px] rounded-xl px-3.5 py-2.5 bg-emerald-50 text-emerald-700 flex justify-between gap-3">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss"><X className="w-4 h-4" /></button></p>}

      <div className={`${card} p-4 sm:p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
          <div className="flex gap-1 p-1 rounded-xl bg-tint w-fit" role="tablist">
            {[['patients', 'Patients', ClipboardList], ['today', `Today (${todayVisits.length})`, CalendarCheck], ['report', 'Reports', BarChart3]].map(([k, l, Icon]) => (
              <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)} className={`h-9 px-3.5 rounded-lg text-[13.5px] font-semibold inline-flex items-center gap-1.5 ${view === k ? 'bg-white shadow-sm text-primary' : 'text-primary/60 hover:text-primary'}`}><Icon className="w-4 h-4" /> {l}</button>
            ))}
          </div>
          {view === 'patients' && (
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input aria-label="Search patients" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, mobile or patient ID" className={`${field} pl-10`} />
            </div>
          )}
        </div>

        {view === 'patients' && (
          patients === null ? <p className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>
            : !patients.length ? <p className="text-sm text-gray-500 py-8 text-center">{search ? 'No patients match your search.' : 'No patients yet. Click “New patient visit” to add the first one.'}</p>
              : (
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

        {view === 'today' && (
          !todayVisits.length ? <p className="text-sm text-gray-500 py-8 text-center">No visits recorded today.</p> : (
            <div className="divide-y divide-gray-100">
              {todayVisits.map((v) => (
                <button key={v.id} type="button" onClick={() => setModal({ kind: 'patient', id: v.patientId })} className="w-full text-left flex items-center gap-4 py-3.5 hover:bg-gray-50 rounded-xl px-2">
                  <span className="text-sm font-semibold text-primary w-20 shrink-0">{new Date(v.visitDate).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  <span className="flex-1 min-w-0"><span className="block font-semibold text-primary truncate">{v.patient?.name || v.patientName}</span><span className="block text-xs text-gray-500 truncate">{v.diagnosis || v.symptoms || '—'}</span></span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          )
        )}

        {view === 'report' && <ReportPanel />}
      </div>

      {modal?.kind === 'new' && (
        <Modal title={modal.patient ? `New visit – ${modal.patient.name}` : 'New patient visit'} onClose={() => setModal(null)} wide>
          <VisitForm initialPatient={modal.patient} onSaved={afterSave} onClose={() => setModal(null)} onOpenVisit={(v, p) => setModal({ kind: 'edit', visit: v, patient: p })} />
        </Modal>
      )}
      {modal?.kind === 'edit' && (
        <Modal title={`Edit visit – ${modal.patient?.name || ''}`} onClose={() => setModal(null)} wide>
          <VisitForm visit={modal.visit} onSaved={(r, t) => afterSave({ patient: { id: modal.patient?.id || modal.visit.patientId } }, t)} onClose={() => setModal(null)} onOpenVisit={() => {}} />
        </Modal>
      )}
      {modal?.kind === 'patient' && (
        <Modal title="Patient record" onClose={() => setModal(null)} wide>
          <PatientRecord key={modal.key || modal.id} patientId={modal.id} canDelete={role === 'doctor'} onChanged={() => { refresh(); loadPatients(); }}
            onAddVisit={(p) => setModal({ kind: 'new', patient: p })} onEditVisit={(v, p) => setModal({ kind: 'edit', visit: v, patient: p })} />
        </Modal>
      )}
      {modal?.kind === 'staff' && <Modal title="Nurses" onClose={() => setModal(null)}><StaffPanel /></Modal>}
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
