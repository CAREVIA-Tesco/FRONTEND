import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Settings } from 'lucide-react';
import api, { getSessionUser, logout } from '../services/api';
import DashboardShell from '../components/DashboardShell';
import PatientVisits from '../components/PatientVisits';

// Nurse / clinic staff: enters and updates patient visits for the doctor they work for.
// No access to the doctor's appointments, earnings or profile (enforced by the API).
export default function NurseDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Patient Visits');
  const [me, setMe] = useState(getSessionUser());
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const u = getSessionUser();
    if (!u || u.role !== 'nurse') { navigate('/login'); return; }
    api.me().then((d) => setMe(d.user)).catch(() => {});
  }, [navigate]);

  const doctor = me?.clinicDoctor;
  const savePassword = async (e) => {
    e.preventDefault(); setMsg(null);
    if (pw.next.length < 6) { setMsg({ ok: false, text: 'Use at least 6 characters.' }); return; }
    if (pw.next !== pw.confirm) { setMsg({ ok: false, text: 'The two passwords do not match.' }); return; }
    try { await api.updateMe({ currentPassword: pw.current, password: pw.next }); setPw({ current: '', next: '', confirm: '' }); setMsg({ ok: true, text: 'Password changed.' }); } catch (err) { setMsg({ ok: false, text: err.message }); }
  };
  const field = 'w-full h-11 px-4 rounded-xl border border-line bg-white text-[14px] text-primary focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none';

  return (
    <DashboardShell
      roleLabel="Clinic staff"
      nav={[{ key: 'Patient Visits', label: 'Patient Visits', icon: ClipboardList }, { key: 'Settings', label: 'Settings', icon: Settings }]}
      active={tab}
      onSelect={setTab}
      onLogout={() => { logout(); navigate('/login'); }}
      user={{ name: me?.name || 'Nurse', sub: doctor ? `Nurse · ${doctor.name}` : 'Nurse' }}
      title={tab}
    >
      <div className="max-w-7xl space-y-6">
        {doctor && <p className="text-sm text-gray-500" data-testid="nurse-doctor">Entering records for <strong className="text-primary">{doctor.name}</strong>{doctor.spec ? ` (${doctor.spec})` : ''}</p>}
        {tab === 'Patient Visits' && <PatientVisits role="nurse" />}
        {tab === 'Settings' && (
          <form onSubmit={savePassword} className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6 max-w-lg space-y-4">
            <h2 className="text-xl font-bold text-primary">Change password</h2>
            <p className="text-sm text-gray-500">You sign in with +91 {me?.phone} on the Doctor tab of the login page.</p>
            <input type="password" aria-label="Current password" placeholder="Current password" className={field} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            <input type="password" aria-label="New password" placeholder="New password" className={field} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            <input type="password" aria-label="Confirm new password" placeholder="Confirm new password" className={field} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            {msg && <p className={`text-sm rounded-xl px-3 py-2 ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}
            <button className="h-11 px-6 rounded-xl bg-secondary text-white font-semibold">Save password</button>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}
