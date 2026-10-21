import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, FileText, Search, Activity, User, MapPin, CheckCircle, Clock,
  ClipboardList, Star, Filter, UserCog, KeyRound, Phone, CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getSessionUser, logout } from '../services/api';
import { saveCurrentUser } from '../utils/storage';
import BookingModal from '../components/BookingModal';
import MyRequests from '../components/MyRequests';
import DashboardShell from '../components/DashboardShell';

// colours for appointment statuses (written out so Tailwind keeps the classes)
const STATUS_STYLE = {
  Waiting: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-200 text-gray-600',
};
const STATUS_TEXT = { Waiting: 'Waiting for confirmation', Confirmed: 'Confirmed', Completed: 'Completed', Cancelled: 'Cancelled' };
const PAY_TEXT = { Paid: 'Paid', Pending: 'Pay at visit', Refunded: 'Refunded' };
const fee = (n) => (n || n === 0 ? `₹${Number(n).toLocaleString('en-IN')}` : null);

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [myAppointments, setMyAppointments] = useState([]);
  const [booking, setBooking] = useState({ open: false, providerId: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSpec, setFilterSpec] = useState('All');
  const [filterLoc, setFilterLoc] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const navigate = useNavigate();
  const sessionUser = getSessionUser();
  const [allAppointments, setAllAppointments] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  const loadMyAppointments = () => {
    api.getAppointments()
      .then((data) => {
        const list = (data.appointments || []).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
        setAllAppointments(list);
        // upcoming = waiting / confirmed, soonest first
        setMyAppointments(list.filter((a) => a.status === 'Waiting' || a.status === 'Confirmed').sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
      })
      .catch((err) => setLoadError(err.message));
  };

  useEffect(() => {
    if (!sessionUser || sessionUser.role !== 'patient') { navigate('/login?redirect=/patient/dashboard'); return undefined; }
    loadMyAppointments();
    api.getProviders().then((data) => setDoctorList(data.providers || [])).catch((err) => setLoadError(err.message));
    const refresh = () => loadMyAppointments();
    window.addEventListener('carevia_appointment_booked', refresh);
    return () => window.removeEventListener('carevia_appointment_booked', refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (app) => {
    if (cancelConfirmId !== app.id) { setCancelConfirmId(app.id); return; }
    setLoadError('');
    try {
      await api.cancelAppointment(app.id);
      setCancelConfirmId(null);
      setNotice(app.paymentStatus === 'Paid' ? 'Appointment cancelled. Your payment will be refunded.' : 'Appointment cancelled.');
      loadMyAppointments();
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const firstName = (sessionUser?.name || 'there').split(' ')[0];
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const medicalRecords = allAppointments.filter((a) => a.status === 'Completed');
  // latest vitals recorded by a doctor at a completed visit
  const latestVitals = medicalRecords
    .filter((a) => a.visitNotes?.bloodPressure || a.visitNotes?.weight)
    .sort((a, b) => new Date(b.visitNotes?.completedAt || b.scheduledAt) - new Date(a.visitNotes?.completedAt || a.scheduledAt))[0];
  const timeAgo = (d) => {
    if (!d) return '';
    const days = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (days <= 0) return 'today';
    if (days < 7) return `${days}d ago`;
    if (days < 60) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };
  const bpStatus = (bp) => {
    const [sys, dia] = String(bp || '').split('/').map(Number);
    if (!sys || !dia) return null;
    if (sys < 90 || dia < 60) return 'Low';
    if (sys <= 129 && dia <= 84) return 'Normal';
    return 'High';
  };

  // ----- rate a completed visit -----
  const [ratingFor, setRatingFor] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const submitRating = async (id) => {
    try {
      await api.createReview(id, ratingValue, ratingComment);
      setRatingFor(null); setRatingComment(''); setRatingValue(5);
      setNotice('Thank you – your rating is now on the professional’s profile.');
      loadMyAppointments();
    } catch (err) {
      setLoadError(err.message);
    }
  };

  // ----- my profile -----
  const toForm = (u = {}) => ({
    name: u.name || '', phone: u.phone || '', email: u.email || '', age: u.age ?? '', gender: u.gender || '', careFor: u.careFor || '',
    city: u.city || '', pincode: u.pincode || '', bloodGroup: u.bloodGroup || '', allergies: (u.allergies || []).join(', '), conditions: (u.conditions || []).join(', '),
    ecName: u.emergencyContact?.name || '', ecRelation: u.emergencyContact?.relation || '', ecPhone: u.emergencyContact?.phone || '',
  });
  const [profile, setProfile] = useState(() => toForm(sessionUser || {}));
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [busy, setBusy] = useState('');
  useEffect(() => {
    if (activeTab !== 'Profile') return;
    setProfileMsg(null); setPwMsg(null);
    api.me().then(({ user }) => { setProfile(toForm(user)); saveCurrentUser({ ...getSessionUser(), ...user }); }).catch(() => {});
  }, [activeTab]);
  const setP = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }));
  const saveProfile = async (e) => {
    e.preventDefault(); setProfileMsg(null);
    if (!profile.name.trim()) { setProfileMsg({ ok: false, text: 'Please enter your name.' }); return; }
    if (profile.phone && !/^[6-9]\d{9}$/.test(profile.phone)) { setProfileMsg({ ok: false, text: 'Please enter a valid 10-digit mobile number.' }); return; }
    if (profile.pincode && !/^[1-9]\d{5}$/.test(profile.pincode)) { setProfileMsg({ ok: false, text: 'Please enter a valid 6-digit PIN code.' }); return; }
    if (profile.ecPhone && !/^[6-9]\d{9}$/.test(profile.ecPhone)) { setProfileMsg({ ok: false, text: 'Please enter a valid 10-digit number for the emergency contact.' }); return; }
    setBusy('profile');
    const { ecName, ecRelation, ecPhone, ...rest } = profile;
    try {
      const { user } = await api.updateMe({ ...rest, name: rest.name.trim(), emergencyContact: { name: ecName.trim(), relation: ecRelation.trim(), phone: ecPhone } });
      saveCurrentUser({ ...getSessionUser(), ...user });
      setProfile(toForm(user));
      setProfileMsg({ ok: true, text: 'Your details are saved. They are filled in for you when you book.' });
    } catch (err) { setProfileMsg({ ok: false, text: err.message }); } finally { setBusy(''); }
  };
  const savePassword = async (e) => {
    e.preventDefault(); setPwMsg(null);
    if (!pw.current) { setPwMsg({ ok: false, text: 'Enter your current password.' }); return; }
    if (pw.next.length < 6) { setPwMsg({ ok: false, text: 'Use at least 6 characters for the new password.' }); return; }
    if (pw.next !== pw.confirm) { setPwMsg({ ok: false, text: 'The two new passwords do not match.' }); return; }
    setBusy('pw');
    try { await api.updateMe({ currentPassword: pw.current, password: pw.next }); setPw({ current: '', next: '', confirm: '' }); setPwMsg({ ok: true, text: 'Password changed.' }); } catch (err) { setPwMsg({ ok: false, text: err.message }); } finally { setBusy(''); }
  };

  const filteredDoctors = doctorList.filter((d) => {
    if (filterSpec !== 'All' && d.spec !== filterSpec) return false;
    if (filterLoc !== 'All' && d.loc !== filterLoc) return false;
    if (searchQuery && !`${d.name} ${d.spec} ${d.loc || ''}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const price = (d) => (d.isDoctor ? d.onlineFee || d.clinicFee || d.fee : d.fee || d.clinicFee) || 0;
    if (sortBy === 'feeAsc') return price(a) - price(b);
    if (sortBy === 'feeDesc') return price(b) - price(a);
    return (Number(b.rating) || 0) - (Number(a.rating) || 0); // default highest rating
  });

  const openBooking = (providerId = null) => setBooking({ open: true, providerId });
  const PATIENT_NAV = [
    { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'Appointments', label: 'My Appointments', icon: Calendar, badge: myAppointments.length },
    { key: 'Records', label: 'Medical Records', icon: FileText },
    { key: 'Requests', label: 'My Requests', icon: ClipboardList },
    { key: 'Find Doctors', label: 'Find Doctors', icon: Search },
    { key: 'Profile', label: 'My Profile', icon: UserCog },
  ];
  const TAB_TITLES = { Dashboard: 'Dashboard', Appointments: 'My Appointments', Records: 'Medical Records', Requests: 'My Requests', 'Find Doctors': 'Find Doctors', Profile: 'My Profile' };
  const field = 'w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/40';
  const label = 'block text-[13px] font-semibold text-primary mb-1.5';
  const Msg = ({ m }) => (m ? <p role="status" className={`text-[13px] rounded-xl px-3 py-2 ${m.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{m.text}</p> : null);
  const next = myAppointments[0];

  return (
    <DashboardShell
      roleLabel="Patient portal"
      nav={PATIENT_NAV}
      active={activeTab}
      onSelect={(k) => { setActiveTab(k); setNotice(''); setLoadError(''); }}
      onLogout={handleLogout}
      user={{ name: sessionUser?.name || 'Patient', sub: sessionUser?.email || sessionUser?.phone || 'Patient' }}
      title={TAB_TITLES[activeTab] || 'Dashboard'}
      notifications={myAppointments.length}
      onNotifications={() => setActiveTab('Appointments')}
      headerActions={
        <button type="button" onClick={() => openBooking()} className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-secondary text-white text-sm font-semibold shadow-[0_10px_24px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)] hover:brightness-95 transition">
          <Calendar className="w-4 h-4" /> Book a visit
        </button>
      }
    >
      <div className="min-w-0 space-y-6">
        {notice && <p role="status" className="text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">{notice}</p>}
        {loadError && <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{loadError}</p>}

        {activeTab === 'Dashboard' && (
          <div className="space-y-8 animate-[fade-in_0.4s_ease-out]">
            <div className="bg-deep rounded-3xl p-7 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
              <div className="absolute -top-20 -right-16 w-64 h-64 bg-secondary/30 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 left-1/3 w-64 h-64 bg-accent/40 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10">
                <h1 className="text-[28px] md:text-[36px] font-serif font-semibold leading-tight mb-3">{greeting}, {firstName}!</h1>
                <p className="text-white/75 max-w-lg leading-relaxed">
                  You have {myAppointments.length} upcoming {myAppointments.length === 1 ? 'appointment' : 'appointments'}. Book a new consultation or review your medical records below.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => openBooking()} className="bg-secondary hover:bg-secondary-hover text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition transform hover:-translate-y-1">Book New Appointment</button>
                  <button type="button" onClick={() => setActiveTab('Records')} className="bg-white/10 hover:bg-white/15 ring-1 ring-white/25 text-white font-bold py-3.5 px-6 rounded-xl transition">My records</button>
                </div>
              </div>
              <div className="hidden md:flex relative z-10 shrink-0 bg-white/10 p-6 rounded-[24px] backdrop-blur-md border border-white/20 items-center justify-center">
                <Activity className="w-16 h-16 text-secondary-soft" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-secondary" /> Next Appointment</h3>
                {next ? (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div>
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider mb-1 block">{next.title}</span>
                        <h4 className="font-bold text-lg text-gray-900">{next.provider}</h4>
                        <p className="text-sm text-gray-500">{next.specialization}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${STATUS_STYLE[next.status]}`}>{STATUS_TEXT[next.status]}</span>
                    </div>
                    <div className="space-y-3 mb-6 text-sm font-medium text-gray-500">
                      <div className="flex items-center gap-3"><Clock className="w-4 h-4" /> {next.date} at {next.time}</div>
                      <div className="flex items-center gap-3"><MapPin className="w-4 h-4" /> {next.location}</div>
                      <div className="flex items-center gap-3"><CreditCard className="w-4 h-4" /> {fee(next.fee) || '-'} · {PAY_TEXT[next.paymentStatus] || next.paymentStatus}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setActiveTab('Appointments')} className="py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition">View details</button>
                      <button type="button" onClick={() => handleCancel(next)} className="py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition">{cancelConfirmId === next.id ? 'Tap again to cancel' : 'Cancel visit'}</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Need a different time? Cancel and book again, or ask your professional to reschedule.</p>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium mb-4">No upcoming appointments.</p>
                    <button type="button" onClick={() => setActiveTab('Find Doctors')} className="text-secondary font-bold hover:underline">Find a Doctor</button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-green-500" /> Recent Vitals</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Blood Pressure</p>
                    <h4 className="text-2xl font-bold text-blue-700">{latestVitals?.visitNotes?.bloodPressure || '--'}</h4>
                    <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1">{latestVitals?.visitNotes?.bloodPressure ? <><CheckCircle className="w-3 h-3" /> {bpStatus(latestVitals.visitNotes.bloodPressure) || 'Recorded'}</> : 'Not recorded yet'}</p>
                  </div>
                  <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Weight</p>
                    <h4 className="text-2xl font-bold text-orange-700">{latestVitals?.visitNotes?.weight ? `${latestVitals.visitNotes.weight} kg` : '--'}</h4>
                    <p className="text-xs font-medium text-orange-600 mt-2">{latestVitals ? `Last checked: ${timeAgo(latestVitals.visitNotes?.completedAt || latestVitals.scheduledAt)}` : 'Recorded at your next visit'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  {[['Upcoming', myAppointments.length], ['Completed', medicalRecords.length], ['Total visits', allAppointments.length]].map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-gray-50 border border-gray-100 py-3"><p className="text-xl font-bold text-primary">{v}</p><p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{l}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Appointments' && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100 animate-[fade-in_0.4s_ease-out]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h3 className="text-2xl font-bold text-primary">My Appointments</h3>
              <button type="button" onClick={() => openBooking()} className="h-10 px-4 rounded-xl bg-secondary text-white text-sm font-semibold hover:brightness-95">Book a visit</button>
            </div>
            <div className="space-y-4">
              {allAppointments.length > 0 ? allAppointments.map((app) => (
                <div key={app.id} className="border border-gray-100 p-5 sm:p-6 rounded-2xl hover:shadow-md transition flex flex-col md:flex-row md:flex-wrap justify-between md:items-center gap-4" data-testid="patient-appointment">
                  <div className="min-w-0">
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{app.title} <span className="text-sm font-medium text-gray-400">· {app.code}</span></h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {app.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {app.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {app.location}</span>
                      <span className="flex items-center gap-1"><User className="w-4 h-4" /> {app.provider}</span>
                      <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> {fee(app.fee) || '-'} · {PAY_TEXT[app.paymentStatus] || app.paymentStatus}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[app.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_TEXT[app.status] || app.status}</span>
                    {(app.status === 'Waiting' || app.status === 'Confirmed') && (
                      <button type="button" onClick={() => handleCancel(app)} className="px-3 py-1 rounded-full text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition">
                        {cancelConfirmId === app.id ? 'Confirm?' : 'Cancel'}
                      </button>
                    )}
                    {app.status === 'Completed' && (
                      <a href={`/visit-summary/${app.id}`} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-full text-xs font-bold border border-gray-200 text-primary hover:bg-gray-100">Summary PDF</a>
                    )}
                    {app.status === 'Completed' && !app.reviewed && (
                      <button type="button" onClick={() => setRatingFor(ratingFor === app.id ? null : app.id)} className="px-3 py-1 rounded-full text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition">
                        Rate Visit
                      </button>
                    )}
                    {app.status === 'Completed' && app.reviewed && (
                      <span className="text-xs font-bold text-yellow-500 flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Rated</span>
                    )}
                    {app.status === 'Cancelled' && (
                      <button type="button" onClick={() => openBooking(app.providerId)} className="px-3 py-1 rounded-full text-xs font-bold border border-gray-200 text-primary hover:bg-gray-100">Book again</button>
                    )}
                  </div>
                  {ratingFor === app.id && (
                    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" onClick={() => setRatingValue(n)} aria-label={`${n} star`}>
                            <Star className={`w-6 h-6 ${n <= ratingValue ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                      <input value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} placeholder="Share your experience (optional)" className="flex-1 w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-secondary/50" />
                      <button type="button" onClick={() => submitRating(app.id)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition">Submit</button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-20 text-gray-500 font-medium">You have no appointments yet. <button type="button" onClick={() => openBooking()} className="text-secondary font-bold hover:underline">Book your first visit</button></div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Find Doctors' && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100 animate-[fade-in_0.4s_ease-out]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-2">Find a Doctor</h3>
                <p className="text-gray-500">Search and book appointments with verified healthcare professionals.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search doctors, specialties..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/50 outline-none w-full md:w-64 transition" />
                </div>
                <button type="button" aria-label="Filters" aria-expanded={isFilterOpen} onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-3 border rounded-xl transition flex items-center gap-2 ${isFilterOpen ? 'bg-strong border-strong text-white' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'}`}>
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isFilterOpen && (
              <div className="mb-6 p-5 bg-gray-50 border border-gray-100 rounded-[20px]" data-testid="doctor-filters">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block"><span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Specialty</span>
                    <select value={filterSpec} onChange={(e) => setFilterSpec(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-strong">
                      <option value="All">All Specialties</option>
                      {[...new Set(doctorList.map((d) => d.spec).filter(Boolean))].sort().map((spec) => <option key={spec} value={spec}>{spec}</option>)}
                    </select>
                  </label>
                  <label className="block"><span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</span>
                    <select value={filterLoc} onChange={(e) => setFilterLoc(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-strong">
                      <option value="All">All Locations</option>
                      {[...new Set(doctorList.map((d) => d.loc).filter(Boolean))].sort().map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </label>
                  <label className="block"><span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sort By</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-strong">
                      <option value="rating">Highest Rated</option>
                      <option value="feeAsc">Fee: Low to High</option>
                      <option value="feeDesc">Fee: High to Low</option>
                    </select>
                  </label>
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => { setFilterSpec('All'); setFilterLoc('All'); setSortBy('rating'); setSearchQuery(''); }} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition">Reset Filters</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.length > 0 ? filteredDoctors.map((doc) => (
                <div key={doc.id} className="border border-gray-100 rounded-[20px] p-5 hover:shadow-lg transition-all bg-white group flex flex-col" data-testid="doctor-card">
                  <div className="flex items-start gap-4 mb-4">
                    <img src={doc.img} alt={doc.name} className="w-16 h-16 rounded-full object-cover shadow-sm bg-gray-100" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{doc.name}</h4>
                      <p className="text-sm font-medium text-secondary mb-1">{doc.spec}</p>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-500"><Star className="w-3 h-3 text-yellow-400 fill-current" /> {doc.rating}{doc.reviews ? ` (${doc.reviews})` : ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-5 bg-gray-50 p-3 rounded-xl">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {doc.exp}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {doc.loc || 'Online'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto gap-3">
                    <div className="flex flex-col text-sm font-bold">
                      {[['Online', doc.onlineFee], ['Clinic', doc.clinicFee], ['Home', doc.fee]].filter(([, v]) => v).slice(0, 2).map(([l, v]) => (
                        <span key={l} className="text-primary">{fee(v)} <span className="text-[10px] text-gray-400 font-normal">{l}</span></span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <a href={`/doctors/${doc.id}`} target="_blank" rel="noreferrer" className="text-sm font-bold px-3 py-2 rounded-lg border border-gray-200 text-primary hover:bg-gray-50">Profile</a>
                      <button type="button" onClick={() => openBooking(doc.id)} className="bg-secondary hover:bg-secondary-hover text-white text-sm font-bold px-4 py-2 rounded-lg transition">Book Now</button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-800 mb-1">No doctors found</h4>
                  <p className="text-gray-500 text-sm">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Records' && medicalRecords.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100 animate-[fade-in_0.4s_ease-out]">
            <h3 className="text-2xl font-bold text-primary mb-6">Medical Records</h3>
            <div className="space-y-4">
              {medicalRecords.map((rec) => (
                <div key={rec.id} className="border border-gray-100 p-6 rounded-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                    <h4 className="font-bold text-lg text-gray-900">{rec.title} • {rec.provider}</h4>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> {rec.date}</span>
                  </div>
                  {(rec.visitNotes?.bloodPressure || rec.visitNotes?.weight) && (
                    <p className="text-sm text-gray-700 mb-1"><strong>Vitals:</strong> {[rec.visitNotes.bloodPressure && `BP ${rec.visitNotes.bloodPressure} mmHg`, rec.visitNotes.weight && `${rec.visitNotes.weight} kg`].filter(Boolean).join(' · ')}</p>
                  )}
                  <p className="text-sm text-gray-700 mb-1"><strong>Observations:</strong> {rec.visitNotes?.symptoms || '-'}</p>
                  <p className="text-sm text-gray-700"><strong>Prescription:</strong> {rec.visitNotes?.prescription || '-'}</p>
                  <a href={`/visit-summary/${rec.id}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-line text-[13px] font-semibold text-primary hover:bg-tint">Download prescription (PDF)</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Records' && medicalRecords.length === 0 && (
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 animate-[fade-in_0.4s_ease-out] text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Records Found</h3>
            <p className="text-gray-500">Your prescriptions and visit summaries will appear here after your first visit.</p>
          </div>
        )}

        {activeTab === 'Requests' && <MyRequests />}

        {activeTab === 'Profile' && (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start" data-testid="patient-profile">
            <form onSubmit={saveProfile} className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2"><UserCog className="w-5 h-5 text-secondary" /> Personal and health details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block sm:col-span-2"><span className={label}>Full name</span><input id="pp-name" className={field} value={profile.name} onChange={setP('name')} /></label>
                <label className="block"><span className={label}>Mobile number</span><input id="pp-phone" inputMode="numeric" maxLength={10} className={field} value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} /></label>
                <label className="block"><span className={label}>Email</span><input id="pp-email" type="email" className={field} value={profile.email} onChange={setP('email')} /></label>
                <label className="block"><span className={label}>Care is for</span>
                  <select id="pp-carefor" className={field} value={profile.careFor} onChange={setP('careFor')}><option value="">—</option><option>Myself</option><option>Parent</option><option>Spouse</option><option>Child</option><option value="Other">Someone else</option></select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><span className={label}>Age</span><input id="pp-age" type="number" min="0" max="120" className={field} value={profile.age} onChange={setP('age')} /></label>
                  <label className="block"><span className={label}>Gender</span><select id="pp-gender" className={field} value={profile.gender} onChange={setP('gender')}><option value="">—</option><option>Female</option><option>Male</option><option>Other</option></select></label>
                </div>
                <label className="block"><span className={label}>City</span><input id="pp-city" className={field} value={profile.city} onChange={setP('city')} /></label>
                <label className="block"><span className={label}>PIN code</span><input id="pp-pin" inputMode="numeric" maxLength={6} className={field} value={profile.pincode} onChange={(e) => setProfile((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} /></label>
                <label className="block"><span className={label}>Blood group</span><select id="pp-blood" className={field} value={profile.bloodGroup} onChange={setP('bloodGroup')}><option value="">—</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => <option key={g}>{g}</option>)}</select></label>
                <label className="block"><span className={label}>Allergies</span><input id="pp-allergies" className={field} placeholder="e.g. Penicillin" value={profile.allergies} onChange={setP('allergies')} /></label>
                <label className="block sm:col-span-2"><span className={label}>Medical conditions</span><input id="pp-conditions" className={field} placeholder="e.g. Diabetes, high BP (comma separated)" value={profile.conditions} onChange={setP('conditions')} /></label>
              </div>
              <div>
                <p className="text-sm font-bold text-primary mb-3 flex items-center gap-2"><Phone className="w-4 h-4 text-secondary" /> Emergency contact</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input aria-label="Emergency contact name" className={field} placeholder="Name" value={profile.ecName} onChange={setP('ecName')} />
                  <input aria-label="Emergency contact relation" className={field} placeholder="Relation" value={profile.ecRelation} onChange={setP('ecRelation')} />
                  <input aria-label="Emergency contact phone" inputMode="numeric" maxLength={10} className={field} placeholder="Mobile" value={profile.ecPhone} onChange={(e) => setProfile((p) => ({ ...p, ecPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
                </div>
              </div>
              <Msg m={profileMsg} />
              <button disabled={busy === 'profile'} className="h-11 px-6 rounded-xl bg-secondary text-white font-semibold text-[14px] hover:brightness-95 disabled:opacity-60">{busy === 'profile' ? 'Saving…' : 'Save details'}</button>
            </form>

            <div className="space-y-6">
              <form onSubmit={savePassword} className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2"><KeyRound className="w-5 h-5 text-secondary" /> Change password</h3>
                <label className="block"><span className={label}>Current password</span><input id="pp-pw-current" type="password" autoComplete="current-password" className={field} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></label>
                <label className="block"><span className={label}>New password</span><input id="pp-pw-new" type="password" autoComplete="new-password" className={field} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></label>
                <label className="block"><span className={label}>Confirm new password</span><input id="pp-pw-confirm" type="password" autoComplete="new-password" className={field} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></label>
                <Msg m={pwMsg} />
                <button disabled={busy === 'pw'} className="h-11 px-6 rounded-xl border border-gray-200 text-primary font-semibold text-[14px] hover:bg-gray-50 disabled:opacity-60">{busy === 'pw' ? 'Saving…' : 'Change password'}</button>
              </form>
              <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-primary mb-2">Signed in on this device</h3>
                <p className="text-sm text-gray-500 mb-4">Sign out when you use a shared phone or computer.</p>
                <button type="button" onClick={handleLogout} className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Sign out</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BookingModal isOpen={booking.open} providerId={booking.providerId} onClose={() => setBooking({ open: false, providerId: null })} />
    </DashboardShell>
  );
}
