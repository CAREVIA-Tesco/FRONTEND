import React from 'react';
import { 
  LayoutDashboard, User, Calendar, BarChart3, Star,
  Settings, Search, TrendingUp, Users,
  Activity, CheckCircle, ChevronDown, X, MapPin, Phone, CalendarCheck
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { getSessionUser, logout } from '../services/api';
import DoctorRequests from '../components/DoctorRequests';
import DashboardShell from '../components/DashboardShell';
import { AnalyticsTab, ReviewsTab, SettingsTab } from '../components/DoctorTabs';
import { Inbox, MessageCircle, Stethoscope, ClipboardList } from 'lucide-react';
import PatientVisits, { ClinicSummaryStrip } from '../components/PatientVisits';
import ConsultationSettings from '../components/ConsultationSettings';
import { generateSlots } from '../services/consultation';
import { CalendarClock } from 'lucide-react';

const STATUS_STYLE = { Waiting: 'bg-amber-100 text-amber-800', Confirmed: 'bg-blue-100 text-blue-700', Completed: 'bg-green-100 text-green-700', Cancelled: 'bg-gray-200 text-gray-700' };
const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const waLink = (phone) => `https://wa.me/91${String(phone || '').replace(/\D/g, '').slice(-10)}`;

export default function DoctorDashboard() {
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState('Today');
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [openRequestCount, setOpenRequestCount] = React.useState(0);
  const [requestTotal, setRequestTotal] = React.useState(null);
  const [appointmentTab, setAppointmentTab] = React.useState('Upcoming');
  
  const navigate = useNavigate();
  // notifications open a tab with ?tab=…  (the parameter is removed once used, so the same link works again)
  const [tabParams, setTabParams] = useSearchParams();
  React.useEffect(() => {
    const t = tabParams.get('tab');
    if (!t) return;
    setActiveTab(t);
    const next = new URLSearchParams(tabParams);
    next.delete('tab');
    setTabParams(next, { replace: true });
  }, [tabParams]);
  const [profile, setProfile] = React.useState(null);
  const [allAppointments, setAllAppointments] = React.useState([]);
  const [loadError, setLoadError] = React.useState('');
  const [actionError, setActionError] = React.useState('');
  const [visitNotes, setVisitNotes] = React.useState({ symptoms: '', prescription: '' });
  const [expandedPastId, setExpandedPastId] = React.useState(null);
  const [dashboardSearch, setDashboardSearch] = React.useState('');
  const [visitVitals, setVisitVitals] = React.useState({ bloodPressure: '', weight: '' });
  const [myReviews, setMyReviews] = React.useState([]);
  const [calMonth, setCalMonth] = React.useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [customDate, setCustomDate] = React.useState(null);
  const [pastRange, setPastRange] = React.useState('Last 30 Days');

  const loadAppointments = React.useCallback(() => {
    api.getAppointments()
      .then((data) => setAllAppointments(data.appointments || []))
      .catch((err) => setLoadError(err.message));
  }, []);

  // Only doctors can open this dashboard
  React.useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== 'doctor') { navigate('/login'); return; }
    api.getMyProvider()
      .then(({ provider }) => {
        if (!provider) { navigate('/professional/onboarding'); return; }
        setProfile(provider);
        api.openRequests().then((d) => setOpenRequestCount((d.requests || []).length)).catch(() => {});
        api.getReviews({ providerId: provider.id, limit: 3 }).then((d) => setMyReviews(d.reviews || [])).catch(() => {});
      })
      .catch((err) => { setLoadError(err.message); if (err.status === 401) navigate('/login'); });
    loadAppointments();
  }, []);

  const matchesSearch = (app) => !dashboardSearch || `${app.patient} ${app.title} ${app.phone} ${app.code}`.toLowerCase().includes(dashboardSearch.toLowerCase());
  const upcomingAppointments = allAppointments
    .filter((a) => a.status === 'Waiting' || a.status === 'Confirmed')
    .filter(matchesSearch)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  const pastAppointments = allAppointments
    .filter((a) => a.status === 'Completed' || a.status === 'Cancelled')
    .filter((a) => {
      const days = pastRange === 'Last 7 Days' ? 7 : pastRange === 'Last 30 Days' ? 30 : null;
      if (!days) return true;
      const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - (days - 1));
      return new Date(a.scheduledAt) >= from;
    })
    .filter(matchesSearch)
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
  const completedList = allAppointments.filter((a) => a.status === 'Completed');
  const doctorStats = {
    thisMonth: allAppointments.filter((a) => new Date(a.scheduledAt) >= monthStart).length,
    planned: allAppointments.filter((a) => a.status === 'Waiting' || a.status === 'Confirmed').length,
    completed: completedList.length,
    completedToday: completedList.filter((a) => a.visitNotes?.completedAt && isSameDay(new Date(a.visitNotes.completedAt), now)).length,
    completedWeek: completedList.filter((a) => new Date(a.visitNotes?.completedAt || a.scheduledAt) >= weekStart).length,
  };
  const todaysAppointments = upcomingAppointments.filter((a) => isSameDay(new Date(a.scheduledAt), now));
  const dashboardAppointments = (todaysAppointments.length ? todaysAppointments : upcomingAppointments).slice(0, 4);
  const firstName = (profile?.name || getSessionUser()?.name || 'Doctor').replace(/^Dr\.?\s*/i, '').split(' ')[0];
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  // ----- date range used by the dashboard stats -----
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const fmtShort = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const getRange = (preset) => {
    const today = startOfDay(now);
    switch (preset) {
      case 'Yesterday': return [addDays(today, -1), today];
      case 'Last 7 Days': return [addDays(today, -6), addDays(today, 1)];
      case 'Last 30 Days': return [addDays(today, -29), addDays(today, 1)];
      case 'This Month': return [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 1)];
      case 'Custom': { const d = customDate || today; return [d, addDays(d, 1)]; }
      default: return [today, addDays(today, 1)];
    }
  };
  const [rangeStart, rangeEnd] = getRange(selectedRange);
  const rangeLabel = `${selectedRange} (${fmtShort(rangeStart)} - ${fmtShort(addDays(rangeEnd, -1))})`;
  const span = rangeEnd - rangeStart;
  const inWindow = (a, from, to) => { const t = new Date(a.scheduledAt); return t >= from && t < to; };
  const periodStats = (from, to) => {
    const list = allAppointments.filter((a) => inWindow(a, from, to));
    return {
      appointments: list.length,
      patients: new Set(list.map((a) => a.patient)).size,
      completed: list.filter((a) => a.status === 'Completed').length,
      earnings: list.filter((a) => a.paymentStatus === 'Paid').reduce((t, a) => t + (a.fee || 0), 0),
    };
  };
  const cur = periodStats(rangeStart, rangeEnd);
  const prev = periodStats(new Date(rangeStart - span), rangeStart);
  const trend = (c, p) => (p ? `${c >= p ? '+' : ''}${Math.round(((c - p) / p) * 100)}%` : c ? '+100%' : '0%');
  const dashboardStats = [
    { label: 'Appointments', value: cur.appointments, trend: trend(cur.appointments, prev.appointments), icon: Calendar, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Patients', value: cur.patients, trend: trend(cur.patients, prev.patients), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Completed Visits', value: cur.completed, trend: trend(cur.completed, prev.completed), icon: CheckCircle, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Earnings', value: `₹${cur.earnings.toLocaleString('en-IN')}`, trend: trend(cur.earnings, prev.earnings), icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Rating', value: profile?.rating || '-', trend: `${profile?.reviews || 0} reviews`, icon: Star, color: 'text-pink-500', bg: 'bg-pink-50' },
  ];
  const calOffset = calMonth.getDay();
  const calDays = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  const selectedDay = selectedRange === 'Custom' && customDate ? customDate : selectedRange === 'Today' ? startOfDay(now) : null;

  // past-appointments window (Appointments tab)

  // Next 7 days for the reschedule picker, e.g. "Thu, May 22"
  const rescheduleDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return { label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), iso: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).toISOString(), date: d };
  });
  // open slots on a day: the doctor's weekly schedule minus slots already booked
  const slotsFor = (day, apt) => {
    if (!day) return [];
    const taken = allAppointments.filter((a) => a.id !== apt?.id && (a.status === 'Waiting' || a.status === 'Confirmed') && isSameDay(new Date(a.scheduledAt), day.date)).map((a) => a.timeSlot);
    // the timings of this appointment's type (clinic / online / home) when set, else the weekly schedule
    const dayKey = DAY_KEYS[day.date.getDay()];
    const typeHours = profile?.hours?.[apt?.consultationType];
    const mine = typeHours?.days?.length ? (typeHours.days.includes(dayKey) ? generateSlots(typeHours) : []) : profile?.schedule?.[dayKey] || [];
    return mine.filter((t) => !taken.includes(t));
  };
  const startVisit = (apt) => { setActiveCallAppointment(apt); setActionError(''); setVisitNotes({ symptoms: '', prescription: '' }); setVisitVitals({ bloodPressure: '', weight: '' }); setIsVideoCallOpen(true); };

  const handleLogout = () => { logout(); navigate('/login'); };
  // Accept or decline a booking that is waiting for this doctor (direct booking or care-team assignment)
  const respondToBooking = async (apt, answer) => {
    setActionError('');
    try {
      if (answer === 'Confirmed') await api.setAppointmentStatus(apt.id, 'Confirmed');
      else await api.cancelAppointment(apt.id);
      loadAppointments();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = React.useState(false);
  const [activeCallAppointment, setActiveCallAppointment] = React.useState(null);
  const [isVisitSuccessOpen, setIsVisitSuccessOpen] = React.useState(false);
  
  const handleCompleteVisit = async () => {
    if (!activeCallAppointment) return;
    setActionError('');
    try {
      await api.completeAppointment(activeCallAppointment.id, { ...visitNotes, ...visitVitals });
      setVisitNotes({ symptoms: '', prescription: '' });
      setVisitVitals({ bloodPressure: '', weight: '' });
      loadAppointments();
      // Close video call
      setIsVideoCallOpen(false);
      // Show success modal
      setIsVisitSuccessOpen(true);
    } catch (err) {
      setActionError(err.message);
    }
  };
  const [activeRescheduleId, setActiveRescheduleId] = React.useState(null);
  const [rescheduleStep, setRescheduleStep] = React.useState('select');
  const [selectedRescheduleDate, setSelectedRescheduleDate] = React.useState('Thu, May 22');
  const [selectedRescheduleTime, setSelectedRescheduleTime] = React.useState('');

  const activeAppointment = upcomingAppointments.find(a => a.id === activeRescheduleId);

  const handleConfirmReschedule = async () => {
    setActionError('');
    const picked = rescheduleDates.find((d) => d.label === selectedRescheduleDate);
    try {
      await api.rescheduleAppointment(activeRescheduleId, picked ? picked.iso : selectedRescheduleDate, selectedRescheduleTime);
      loadAppointments();
      setRescheduleStep('success');
    } catch (err) {
      setActionError(err.message);
    }
  };


  const requestBadge = requestTotal ?? (openRequestCount + allAppointments.filter((a) => a.status === 'Waiting').length);
  const DOCTOR_NAV = [
    { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'My Profile', label: 'My Profile', icon: User },
    { key: 'Appointments', label: 'Appointments', icon: Calendar },
    { key: 'Availability', label: 'Availability', icon: CalendarClock },
    { key: 'Care Requests', label: 'Care Requests', icon: Inbox, badge: requestBadge },
    { key: 'Patient Visits', label: 'Patient Visits', icon: ClipboardList },
    { key: 'Analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'Reviews', label: 'Reviews', icon: Star },
    { key: 'Settings', label: 'Settings', icon: Settings },
  ];
  return (
    <DashboardShell
      roleLabel="Professional dashboard"
      nav={DOCTOR_NAV}
      active={activeTab}
      onSelect={setActiveTab}
      onLogout={handleLogout}
      user={{ name: profile?.name || getSessionUser()?.name || 'Doctor', sub: profile?.spec || 'Healthcare professional', img: profile?.img }}
      title={activeTab}
      headerCenter={
        <div className="hidden md:flex items-center relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 text-primary/40" />
          <input
            type="text"
            value={dashboardSearch}
            onChange={(e) => { setDashboardSearch(e.target.value); if (e.target.value) setActiveTab('Appointments'); }}
            placeholder="Search patients, appointments..."
            className="w-full h-10 pl-10 pr-4 bg-tint border border-line-soft rounded-xl outline-none focus:ring-4 focus:ring-secondary/15 focus:border-secondary focus:bg-white transition text-sm"
          />
        </div>
      }
    >
          <div className="max-w-7xl space-y-8">
            {profile && profile.status !== 'ACTIVE' && (
              <div data-testid="approval-banner" className={`rounded-2xl px-5 py-4 text-[14px] border ${profile.status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <p className="font-semibold">{profile.status === 'PENDING' ? 'Your profile is waiting for approval' : profile.status === 'REJECTED' ? 'Your registration was not approved' : 'Your profile is paused'}</p>
                <p className="mt-0.5 opacity-90">{profile.status === 'PENDING'
                  ? 'The Carevaa team is reviewing your details. Your profile will appear on the website, and you can receive bookings, as soon as it is approved.'
                  : profile.status === 'REJECTED'
                    ? 'Please check and update your details in My Profile, then save to send it for review again, or contact the Carevaa team.'
                    : 'Your profile is hidden from the website. Please contact the Carevaa team.'}</p>
              </div>
            )}
            {activeTab === 'Dashboard' && (
              <>
                {requestBadge > 0 && (
                  <button type="button" onClick={() => setActiveTab('Care Requests')} className="w-full mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left text-amber-800 hover:bg-amber-100 transition">
                    <Inbox className="w-5 h-5 shrink-0" />
                    <span className="flex-1 font-semibold">{requestBadge} care {requestBadge === 1 ? 'request needs' : 'requests need'} your response</span>
                    <span className="text-sm font-bold">View →</span>
                  </button>
                )}
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">{greeting}, Dr. {firstName}</h1>
                <p className="text-gray-500 font-medium">Here's what's happening with your practice today.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100 shadow-sm">
                  <CheckCircle className="w-4 h-4" /> {profile?.status === 'ACTIVE' ? 'Verified Profile' : 'Verification Pending'}
                </span>
                
                {/* Custom Date Range Picker */}
                <div className="relative">
                  <button 
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className={`flex items-center gap-2 bg-white border ${isDatePickerOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'} text-primary text-xs sm:text-sm font-bold py-2.5 px-3 sm:px-4 rounded-xl shadow-sm hover:border-primary/50 transition text-left`}
                  >
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {rangeLabel}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDatePickerOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-[24px] shadow-2xl border border-gray-100 flex flex-col sm:flex-row overflow-hidden z-50 w-[calc(100vw-2rem)] max-w-[550px] animate-[fade-in_0.2s_ease-out]">
                      
                      {/* Left Sidebar Presets */}
                      <div className="sm:w-1/3 bg-gray-50/50 border-b sm:border-b-0 sm:border-r border-gray-100 p-3 grid grid-cols-3 sm:flex sm:flex-col gap-1">
                        {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Custom'].map(preset => (
                          <button 
                            key={preset}
                            onClick={() => { if (preset === 'Custom' && !customDate) setCustomDate(startOfDay(now)); setSelectedRange(preset); setIsDatePickerOpen(false); }}
                            className={`text-left px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${selectedRange === preset ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'}`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      {/* Right Calendar Area */}
                      <div className="sm:w-2/3 p-4 sm:p-6 bg-white">
                        <div className="flex items-center justify-between mb-6">
                          <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <h3 className="font-bold text-gray-900">{calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                          <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="text-center text-xs font-bold text-gray-400">{d}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
 {/* Empty offset for the first weekday of the month */}
                          {[...Array(calOffset)].map((_, i) => <div key={`o${i}`}></div>)}
                          
                          {[...Array(calDays)].map((_, i) => {
                            const day = i + 1;
                            const dayDate = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
                            const isSelected = !!selectedDay && dayDate.getTime() === selectedDay.getTime();
                            return (
                              <button 
                                key={day} 
                                onClick={() => { setCustomDate(dayDate); setSelectedRange('Custom'); setIsDatePickerOpen(false); }}
                                className={`h-10 rounded-xl flex items-center justify-center text-sm font-bold transition ${isSelected ? 'bg-primary text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {dashboardStats.map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${String(stat.trend).startsWith('-') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                      <TrendingUp className={`w-3 h-3 ${String(stat.trend).startsWith('-') ? 'rotate-180' : ''}`} /> {stat.trend}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-primary mb-1">{stat.value}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Clinic walk-in patients (Patient Visits) */}
            <ClinicSummaryStrip onOpen={() => setActiveTab('Patient Visits')} />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {loadError && <p className="lg:col-span-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{loadError}</p>}
              {/* Upcoming Appointments */}
              <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-primary">{todaysAppointments.length ? "Today's Appointments" : 'Upcoming Appointments'}</h2>
                  <button onClick={() => setActiveTab('Appointments')} className="text-sm font-bold text-secondary hover:underline">View All</button>
                </div>
                <div className="p-6 flex-1">
                  <div className="space-y-4">
                    {dashboardAppointments.length === 0 && <p className="text-sm text-gray-500 font-medium">No upcoming appointments.</p>}
                    {dashboardAppointments.map(apt => (
                      <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-secondary/30 transition gap-4 bg-gray-50/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/5 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                            {apt.patient.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{apt.patient}</h4>
                            <p className="text-xs font-medium text-gray-500">{apt.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                          <div className="text-right">
                            <p className="font-bold text-primary">{apt.time}</p>
                            <p className="text-xs font-medium text-gray-500">{apt.date}</p>
                          </div>
                          {apt.status === 'Waiting' ? (
                            <button type="button" onClick={() => respondToBooking(apt, 'Confirmed')} className="px-4 py-2 bg-secondary text-white text-sm font-bold rounded-xl hover:brightness-95 shadow-sm transition">Confirm</button>
                          ) : (
                            <button type="button" onClick={() => startVisit(apt)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-sm transition">Start visit</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Performance / Reviews */}
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col">
                <h2 className="text-lg font-bold text-primary mb-6">Patient Satisfaction</h2>
                
                <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-[20px] mb-6">
                  <h3 className="text-5xl font-bold text-primary mb-2">{profile?.reviews ? profile.rating : '-'}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`w-5 h-5 ${star <= Math.round(Number(profile?.rating || 0)) && profile?.reviews ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-500">Based on {profile?.reviews || 0} Reviews</p>
                </div>

                <h3 className="text-sm font-bold text-primary mb-4">Recent Feedback</h3>
                <div className="space-y-4 flex-1">
                  {myReviews.length === 0 && <p className="text-xs text-gray-500">No feedback yet. Reviews from patients will appear here after completed visits.</p>}
                  {myReviews.slice(0, 2).map((rv) => (
                  <div key={rv.id} className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-gray-800">{rv.patient}</span>
                      <span className="flex items-center text-xs font-bold text-yellow-500"><Star className="w-3 h-3 fill-current mr-0.5" /> {Number(rv.rating).toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{rv.comment ? `"${rv.comment}"` : 'Rated without a comment.'}</p>
                  </div>
                  ))}
                </div>
                
              </div>
            </div>
              </>
            )}

            {activeTab === 'Care Requests' && (
              <DoctorRequests appointments={allAppointments} isDoctor={profile?.isDoctor !== false} onChanged={loadAppointments} onCount={setRequestTotal} />
            )}

            {activeTab === 'My Profile' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">My Profile</h1>
                  <p className="text-gray-500 font-medium">Manage your personal and professional information.</p>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-6">
                      <img src={profile?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Doctor')}&background=5A2F8F&color=fff`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-primary/10" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
                        <p className="text-primary font-bold mb-1">{profile?.profession || profile?.spec}{profile?.specialization ? ` • ${profile.specialization}` : ''}</p>
                        <p className="text-sm text-gray-500 font-medium">{profile?.exp} Experience{profile?.languages?.length ? ` • ${profile.languages.join(', ')}` : ''}</p>
                      </div>
                    </div>
                    <button onClick={() => navigate('/professional/onboarding')} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-sm transition">
                      Edit Profile
                    </button>
                  </div>

                  <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Consultation Fees */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-primary flex items-center gap-2"><Activity className="w-5 h-5" /> Consultations &amp; Fees</h3>
                        <button onClick={() => setActiveTab('Availability')} className="text-sm font-bold text-secondary hover:underline">Edit timings</button>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100" data-testid="profile-modes">
                        {(profile?.modes || []).map((m, i, arr) => (
                          <div key={m.type} className={`flex justify-between items-start gap-4 ${i < arr.length - 1 ? 'pb-3 border-b border-gray-200' : ''}`}>
                            <span>
                              <span className="block text-sm font-bold text-gray-500">{m.label}</span>
                              <span className="block text-xs text-gray-400 mt-0.5">{m.hours || 'No timings set yet'}</span>
                            </span>
                            <span className="font-bold text-gray-900">{m.fee != null ? `₹${m.fee}` : '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div>
                      <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2"><LayoutDashboard className="w-5 h-5" /> Bank Details</h3>
                      <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                          <span className="text-sm font-bold text-gray-500">Bank Name</span>
                          <span className="font-bold text-gray-900">{profile?.bank?.bankName || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                          <span className="text-sm font-bold text-gray-500">Account No.</span>
                          <span className="font-bold text-gray-900">{profile?.bank?.accountLast4 ? `••••••••${profile.bank.accountLast4}` : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-500">IFSC Code</span>
                          <span className="font-bold text-gray-900 uppercase">{profile?.bank?.ifsc || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2"><User className="w-5 h-5" /> Clinic Information</h3>
                    <button onClick={() => navigate('/professional/onboarding')} className="text-sm font-bold text-secondary hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Clinic Name</p>
                      <p className="font-bold text-gray-800">{profile?.clinic?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                      <p className="font-bold text-gray-800">{profile?.clinic?.phone || profile?.phone || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                      <p className="font-bold text-gray-800">{[profile?.clinic?.address, profile?.city, profile?.state].filter(Boolean).join(', ') || '-'}</p>
                    </div>
                  </div>
                </div>
                
              </div>
            )}

            {activeTab === 'Patient Visits' && <PatientVisits />}
            {activeTab === 'Availability' && <ConsultationSettings profile={profile} onSaved={setProfile} />}
            {activeTab === 'Analytics' && <AnalyticsTab appointments={allAppointments} profile={profile} />}
            {activeTab === 'Reviews' && <ReviewsTab providerId={profile?.id} profile={profile} />}
            {activeTab === 'Settings' && <SettingsTab profile={profile} onLogout={handleLogout} />}
            {activeTab === 'Appointments' && (
              <div className="space-y-8 animate-[fade-in_0.4s_ease-out]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">Appointments & Consultations</h1>
                    <p className="text-gray-500 font-medium">Manage your schedule and upcoming client meetings</p>
                  </div>
                  
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <div className="bg-white p-4 sm:p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between gap-3 min-h-[8rem] sm:h-36 relative overflow-hidden group hover:border-blue-200 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-400">Total Appointments</span>
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{doctorStats.thisMonth}</h3>
                      <p className="text-xs font-medium text-gray-400">Scheduled this month</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 sm:p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between gap-3 min-h-[8rem] sm:h-36 relative overflow-hidden group hover:border-purple-200 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-400">Total Visit Planned</span>
                      <MapPin className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{doctorStats.planned}</h3>
                      <p className="text-xs font-medium text-gray-400">Planned site visits</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between gap-3 min-h-[8rem] sm:h-36 relative overflow-hidden group hover:border-green-200 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-400">Completed Appointments</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{doctorStats.completed}</h3>
                      <p className="text-xs font-medium text-gray-400">+{doctorStats.completedToday} Completed Today</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between gap-3 min-h-[8rem] sm:h-36 relative overflow-hidden group hover:border-orange-200 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-400">Total Visit Completed</span>
                      <CalendarCheck className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{doctorStats.completedWeek}</h3>
                      <p className="text-xs font-medium text-gray-400">Done this week</p>
                    </div>
                  </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 pb-4">
                  <div className="flex gap-8 w-full sm:w-auto mb-4 sm:mb-0">
                    <button 
                      onClick={() => setAppointmentTab('Upcoming')}
                      className={`text-sm font-bold pb-4 -mb-[18px] transition ${appointmentTab === 'Upcoming' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'}`}
                    >
                      Upcoming Appointments
                    </button>
                    <button 
                      onClick={() => setAppointmentTab('Past')}
                      className={`text-sm font-bold pb-4 -mb-[18px] transition ${appointmentTab === 'Past' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'}`}
                    >
                      Past Appointments
                    </button>
                  </div>
                  
                  {appointmentTab === 'Past' && (
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <select aria-label="Past appointments period" value={pastRange} onChange={(e) => setPastRange(e.target.value)} className="bg-white border border-gray-200 text-gray-700 text-sm font-bold py-2.5 px-3 rounded-xl shadow-sm">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>All Time</option>
                      </select>
                    </label>
                  )}
                </div>

                {/* Appointment List */}
                <div className="space-y-4">
                  {appointmentTab === 'Upcoming' ? (
                    <>
                      {upcomingAppointments.length === 0 && <p className="text-sm text-gray-500 font-medium bg-white p-6 rounded-[20px] border border-gray-100">No upcoming appointments.</p>}
                      {upcomingAppointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-5 sm:p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 hover:shadow-md transition">
                          <div className="w-full md:w-auto md:min-w-[150px] md:border-r border-gray-100 md:pr-6 flex md:block items-center justify-between">
                            <h4 className="font-bold text-primary mb-1">{apt.date}</h4>
                            <p className="text-xs font-bold text-gray-500 uppercase">{apt.time}</p>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-primary">{apt.title}</h3>
                              <span className={`${STATUS_STYLE[apt.status] || 'bg-gray-100 text-gray-700'} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider`}>{apt.status === 'Waiting' ? 'Needs your confirmation' : apt.status}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-gray-500 font-medium">
                              <div className="flex items-center gap-2"><User className="w-4 h-4" /> {apt.patient}</div>
                              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {apt.phoneHidden ? 'Shown after you confirm' : apt.phone ? <a href={`tel:${apt.phone}`} className="hover:text-primary">{apt.phone}</a> : '-'}</div>
                              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {apt.location}</div>
                              <div className="flex items-center gap-2">₹{apt.fee || 0} · {apt.paymentStatus === 'Paid' ? 'Paid' : 'Collect at visit'}</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[160px]">
                            {apt.status === 'Waiting' && (
                              <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => respondToBooking(apt, 'Confirmed')} className="py-2.5 bg-secondary hover:brightness-95 text-white text-sm font-bold rounded-xl shadow-sm transition">Confirm</button>
                                <button type="button" onClick={() => respondToBooking(apt, 'Declined')} className="py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition">Decline</button>
                              </div>
                            )}
                            <button 
                              onClick={() => {
                                setActiveRescheduleId(apt.id);
                                setRescheduleStep('select');
                                setSelectedRescheduleDate((rescheduleDates.find((d) => slotsFor(d, apt).length) || rescheduleDates[0]).label);
                                setActionError('');
                                setSelectedRescheduleTime('');
                                setIsRescheduleOpen(true);
                              }} 
                              className="w-full py-2.5 bg-white border border-gray-200 text-primary text-sm font-bold rounded-xl hover:bg-gray-50 transition shadow-sm"
                            >
                              Reschedule
                            </button>
                            {apt.status === 'Confirmed' && <button type="button" onClick={() => startVisit(apt)} className="w-full py-2.5 bg-strong hover:bg-deep-3 text-white text-sm font-bold rounded-xl shadow-sm transition">Start visit</button>}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {pastAppointments.length === 0 && <p className="text-sm text-gray-500 font-medium bg-white p-6 rounded-[20px] border border-gray-100">No past appointments yet.</p>}
                      {pastAppointments.map((apt) => (
                      <div key={apt.id} className="bg-gray-50 p-5 sm:p-6 rounded-[20px] border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 flex-wrap">
                        <div className="w-full md:w-auto md:min-w-[150px] md:border-r border-gray-200 md:pr-6 opacity-70 flex md:block items-center justify-between">
                          <h4 className="font-bold text-primary mb-1">{apt.date}</h4>
                          <p className="text-xs font-bold text-gray-500 uppercase">{apt.time}</p>
                        </div>
                        
                        <div className="flex-1 opacity-80">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-primary">{apt.title}</h3>
                            {apt.status === 'Completed' ? (
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Completed</span>
                            ) : (
                              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Cancelled</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-2"><User className="w-4 h-4" /> {apt.patient}</div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {apt.phone}</div>
                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {apt.location}</div>
                          </div>
                        </div>
                        
                        {apt.status === 'Completed' && (
                        <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[160px]">
                          <button onClick={() => setExpandedPastId(expandedPastId === apt.id ? null : apt.id)} className="w-full py-2.5 bg-white border border-gray-300 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 transition">{expandedPastId === apt.id ? 'Hide Summary' : 'View Summary'}</button>
                        </div>
                        )}
                        {expandedPastId === apt.id && (
                          <div className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700 space-y-2">
                            <p><strong>Symptoms & Observations:</strong> {apt.visitNotes?.symptoms || '-'}</p>
                            <p><strong>Prescription / Action Plan:</strong> {apt.visitNotes?.prescription || '-'}</p>
                            <a href={`/visit-summary/${apt.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-secondary font-semibold hover:underline">Download PDF</a>
                          </div>
                        )}
                      </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

          </div>

      {/* Reschedule Overlay Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-deep/60 backdrop-blur-sm" onClick={() => setIsRescheduleOpen(false)}></div>
          <div className="relative bg-white rounded-[24px] w-full max-w-lg shadow-2xl overflow-hidden animate-[fade-in_0.3s_ease-out]">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-primary">
                {rescheduleStep === 'select' ? 'Reschedule Appointment' : 'Reschedule Confirmed'}
              </h2>
              <button onClick={() => setIsRescheduleOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {rescheduleStep === 'select' ? (
              <>
                <div className="p-6 space-y-6">
                  {actionError && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{actionError}</p>}
                  {/* Current Info */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-4 items-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex justify-center items-center font-bold shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-0.5">Current Appointment</p>
                      <h4 className="font-bold text-primary">{activeAppointment?.patient} • {activeAppointment?.title}</h4>
                      <p className="text-sm font-medium text-gray-500">{activeAppointment?.date} at {activeAppointment?.time.split('-')[0].trim()}</p>
                    </div>
                  </div>

                  {/* Select New Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select New Date</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {rescheduleDates.map(d => d.label).map(date => (
                        <button 
                          key={date}
                          onClick={() => { setSelectedRescheduleDate(date); setSelectedRescheduleTime(''); }}
                          className={`shrink-0 px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedRescheduleDate === date ? 'border-strong bg-strong/5 text-strong' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select New Time */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Available Time Slots</label>
                    <div className="grid grid-cols-3 gap-3">
                      {slotsFor(rescheduleDates.find((d) => d.label === selectedRescheduleDate), activeAppointment).length === 0 && <p className="col-span-3 text-sm text-gray-500">No open slots on this day – pick another date, or change your timings under Availability.</p>}
                      {slotsFor(rescheduleDates.find((d) => d.label === selectedRescheduleDate), activeAppointment).map(time => (
                        <button 
                          key={time}
                          onClick={() => setSelectedRescheduleTime(time)}
                          className={`py-2.5 rounded-lg border-2 font-bold text-sm transition-all ${selectedRescheduleTime === time ? 'border-strong bg-strong text-white shadow-md' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 justify-end">
                  <button onClick={() => setIsRescheduleOpen(false)} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm">
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmReschedule}
                    disabled={!selectedRescheduleTime}
                    className={`px-6 py-3 font-bold rounded-xl shadow-md transition ${selectedRescheduleTime ? 'bg-strong hover:bg-deep-3 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  >
                    Confirm Reschedule
                  </button>
                </div>
              </>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">Success!</h3>
                <p className="text-gray-500 font-medium mb-8">
                  {activeAppointment?.patient}'s appointment has been successfully rescheduled to<br/>
                  <strong className="text-gray-800">{selectedRescheduleDate}</strong> at <strong className="text-gray-800">{selectedRescheduleTime}</strong>.
                </p>
                <button 
                  onClick={() => setIsRescheduleOpen(false)} 
                  className="w-full max-w-xs py-3.5 bg-strong hover:bg-deep-3 text-white font-bold rounded-xl shadow-md transition"
                >
                  Done
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* Visit panel: contact the patient, record vitals, notes and the prescription */}
      {isVideoCallOpen && activeCallAppointment && (
        <div className="fixed inset-0 z-[200] flex items-stretch sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Visit">
          <div className="absolute inset-0 bg-deep/60 backdrop-blur-sm" onClick={() => setIsVideoCallOpen(false)}></div>
          <div className="relative bg-white sm:rounded-[24px] w-full max-w-3xl max-h-full sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-[fade-in_0.3s_ease-out]">
            <div className="bg-deep text-white p-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60 flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" /> {activeCallAppointment.title} · {activeCallAppointment.code}</p>
                <h2 className="text-2xl font-semibold mt-1">{activeCallAppointment.patient}</h2>
                <p className="text-sm text-white/70 mt-1">{activeCallAppointment.date} at {activeCallAppointment.time} · {activeCallAppointment.location}</p>
              </div>
              <button type="button" aria-label="Close visit" onClick={() => setIsVideoCallOpen(false)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-auto p-6 grid md:grid-cols-[1fr_1.4fr] gap-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 space-y-1.5">
                  <p><strong>Phone:</strong> {activeCallAppointment.phone || '-'}</p>
                  <p><strong>Previous visits with you:</strong> {allAppointments.filter((a) => a.status === 'Completed' && a.patient === activeCallAppointment.patient).length}</p>
                  <p><strong>Reason:</strong> {activeCallAppointment.reason || 'Not provided by the patient.'}</p>
                  <p><strong>Fee:</strong> ₹{activeCallAppointment.fee || 0} · {activeCallAppointment.paymentStatus === 'Paid' ? 'Paid online' : 'Collect at the visit'}</p>
                </div>
                {activeCallAppointment.phone && (
                  <div className="grid grid-cols-2 gap-2">
                    <a href={`tel:${activeCallAppointment.phone}`} className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover"><Phone className="w-4 h-4" /> Call</a>
                    <a href={waLink(activeCallAppointment.phone)} target="_blank" rel="noreferrer" className="h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 text-primary text-sm font-bold hover:bg-gray-50"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
                  </div>
                )}
                {activeCallAppointment.consultationType === 'online' && (
                  <p className="text-xs text-gray-500 leading-relaxed">For an online consultation, call the patient or start a WhatsApp video call at the booked time, then record the visit here.</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Blood Pressure</span>
                    <input id="visit-bp" value={visitVitals.bloodPressure} onChange={(e) => setVisitVitals((v) => ({ ...v, bloodPressure: e.target.value }))} placeholder="120/80" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-strong/50 outline-none" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Weight (kg)</span>
                    <input id="visit-weight" type="number" min="0" value={visitVitals.weight} onChange={(e) => setVisitVitals((v) => ({ ...v, weight: e.target.value }))} placeholder="70" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-strong/50 outline-none" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Symptoms & Observations</span>
                  <textarea value={visitNotes.symptoms} onChange={(e) => setVisitNotes((n) => ({ ...n, symptoms: e.target.value }))} className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-strong/50 outline-none resize-none" placeholder="Clinical observations from the visit..."></textarea>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Prescription / Action Plan</span>
                  <textarea value={visitNotes.prescription} onChange={(e) => setVisitNotes((n) => ({ ...n, prescription: e.target.value }))} className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-strong/50 outline-none resize-none" placeholder="List medications or next steps..."></textarea>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
              {actionError && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2 sm:mr-auto">{actionError}</p>}
              <button type="button" onClick={() => setIsVideoCallOpen(false)} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50">Close</button>
              <button type="button" onClick={handleCompleteVisit} className="px-6 py-3 bg-strong hover:bg-deep-3 text-white font-bold rounded-xl shadow-md transition">Save & Complete Visit</button>
            </div>
          </div>
        </div>
      )}

      {/* Visit Success Modal */}
      {isVisitSuccessOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-deep/60 backdrop-blur-sm" onClick={() => setIsVisitSuccessOpen(false)}></div>
          <div className="relative bg-white rounded-[24px] w-full max-w-sm shadow-2xl overflow-hidden animate-[fade-in_0.3s_ease-out] p-8 flex flex-col items-center text-center">
            
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            <h3 className="text-2xl font-bold text-primary mb-2">Visit Completed!</h3>
            
            <p className="text-gray-500 font-medium mb-6">
              Clinical notes and prescriptions have been securely saved and sent to <strong className="text-gray-800">{activeCallAppointment?.patient}</strong>.
            </p>
            
            <div className="w-full space-y-3">
              <button onClick={() => setIsVisitSuccessOpen(false)} className="w-full py-3 bg-strong hover:bg-deep-3 text-white font-bold rounded-xl shadow-md transition">
                Return to Dashboard
              </button>
              <a href={activeCallAppointment ? `/visit-summary/${activeCallAppointment.id}` : '#'} target="_blank" rel="noreferrer" onClick={() => setIsVisitSuccessOpen(false)} className="block w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl transition border border-gray-200">
                Download Summary PDF
              </a>
            </div>
            
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
