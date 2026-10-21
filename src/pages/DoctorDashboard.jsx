import React, { useState } from 'react';
import { 
  LayoutDashboard, User, Calendar, BarChart3, Star, MessageSquare, 
  Settings, Bell, Search, TrendingUp, Users, MousePointerClick, 
  Activity, CheckCircle, ChevronDown, Menu, X, MapPin, Mic, Video, PhoneOff, Clock, Phone, CalendarCheck, LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getSessionUser, logout } from '../services/api';
import DoctorRequests from '../components/DoctorRequests';
import DashboardShell from '../components/DashboardShell';
import { AnalyticsTab, ReviewsTab, SettingsTab } from '../components/DoctorTabs';
import { Inbox } from 'lucide-react';

export default function DoctorDashboard() {
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState('Today');
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [openRequestCount, setOpenRequestCount] = React.useState(0);
  const [requestTotal, setRequestTotal] = React.useState(null);
  const [appointmentTab, setAppointmentTab] = React.useState('Upcoming');
  
  const navigate = useNavigate();
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
  const pastDays = pastRange === 'Last 7 Days' ? 7 : pastRange === 'Last 30 Days' ? 30 : null;
  const pastFrom = pastDays ? addDays(startOfDay(now), -(pastDays - 1)) : null;
  const pastLabel = pastDays ? `${pastRange} (${fmtShort(pastFrom)} - ${fmtShort(now)})` : 'All Time';
  const cyclePastRange = () => setPastRange((r) => (r === 'Last 30 Days' ? 'Last 7 Days' : r === 'Last 7 Days' ? 'All Time' : 'Last 30 Days'));

  // Next 7 days for the reschedule picker, e.g. "Thu, May 22"
  const rescheduleDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return { label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), iso: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).toISOString() };
  });

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const requestBadge = requestTotal ?? (openRequestCount + allAppointments.filter((a) => a.status === 'Waiting').length);
  const DOCTOR_NAV = [
    { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'My Profile', label: 'My Profile', icon: User },
    { key: 'Appointments', label: 'Appointments', icon: Calendar },
    { key: 'Care Requests', label: 'Care Requests', icon: Inbox, badge: requestBadge },
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
      notifications={requestBadge}
      onNotifications={() => setActiveTab('Care Requests')}
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
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100 shadow-sm">
                  <CheckCircle className="w-4 h-4" /> {profile?.status === 'ACTIVE' ? 'Verified Profile' : 'Verification Pending'}
                </span>
                
                {/* Custom Date Range Picker */}
                <div className="relative">
                  <button 
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className={`flex items-center gap-2 bg-white border ${isDatePickerOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'} text-primary text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm hover:border-primary/50 transition`}
                  >
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {rangeLabel}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDatePickerOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-[24px] shadow-2xl border border-gray-100 flex overflow-hidden z-50 w-[550px] animate-[fade-in_0.2s_ease-out]">
                      
                      {/* Left Sidebar Presets */}
                      <div className="w-1/3 bg-gray-50/50 border-r border-gray-100 p-3 flex flex-col gap-1">
                        {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Custom'].map(preset => (
                          <button 
                            key={preset}
                            onClick={() => { if (preset === 'Custom' && !customDate) setCustomDate(startOfDay(now)); setSelectedRange(preset); setIsDatePickerOpen(false); }}
                            className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition ${selectedRange === preset ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'}`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      {/* Right Calendar Area */}
                      <div className="w-2/3 p-6 bg-white">
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
                    <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                      <TrendingUp className="w-3 h-3" /> {stat.trend}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-primary mb-1">{stat.value}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {loadError && <p className="lg:col-span-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{loadError}</p>}
              {/* Upcoming Appointments */}
              <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-primary">Today's Appointments</h2>
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
                          <button onClick={() => { setActiveCallAppointment(apt); setIsVideoCallOpen(true); }} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-sm transition">
                            Join
                          </button>
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
                      <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2"><Activity className="w-5 h-5" /> Consultation Fees</h3>
                      <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                          <span className="text-sm font-bold text-gray-500">Home Consultation</span>
                          <span className="font-bold text-gray-900">{profile?.fee != null ? `₹${profile.fee}` : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                          <span className="text-sm font-bold text-gray-500">Online Consultation</span>
                          <span className="font-bold text-gray-900">{profile?.onlineFee != null ? `₹${profile.onlineFee}` : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-500">Clinic Consultation</span>
                          <span className="font-bold text-gray-900">{profile?.clinicFee != null ? `₹${profile.clinicFee}` : '-'}</span>
                        </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group hover:border-blue-200 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-400">Total Appointments</span>
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-gray-900 mb-1">{doctorStats.thisMonth}</h3>
                      <p className="text-xs font-medium text-gray-400">Scheduled this month</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group hover:border-purple-200 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-400">Total Visit Planned</span>
                      <MapPin className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-gray-900 mb-1">{doctorStats.planned}</h3>
                      <p className="text-xs font-medium text-gray-400">Planned site visits</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group hover:border-green-200 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-400">Completed Appointments</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-gray-900 mb-1">{doctorStats.completed}</h3>
                      <p className="text-xs font-medium text-gray-400">+{doctorStats.completedToday} Completed Today</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group hover:border-orange-200 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-400">Total Visit Completed</span>
                      <CalendarCheck className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-gray-900 mb-1">{doctorStats.completedWeek}</h3>
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
                  
                  <div className="flex gap-4">
                    <button onClick={cyclePastRange} title="Filter past appointments" className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm hover:border-gray-300 transition">
                      <Calendar className="w-4 h-4" />
                      {pastLabel}
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                  </div>
                </div>

                {/* Appointment List */}
                <div className="space-y-4">
                  {appointmentTab === 'Upcoming' ? (
                    <>
                      {upcomingAppointments.length === 0 && <p className="text-sm text-gray-500 font-medium bg-white p-6 rounded-[20px] border border-gray-100">No upcoming appointments.</p>}
                      {upcomingAppointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition">
                          <div className="min-w-[150px] border-r border-gray-100 pr-6">
                            <h4 className="font-bold text-primary mb-1">{apt.date}</h4>
                            <p className="text-xs font-bold text-gray-500 uppercase">{apt.time}</p>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-primary">{apt.title}</h3>
                              <span className={`bg-${apt.statusColor}-100 text-${apt.statusColor}-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider`}>{apt.status}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-gray-500 font-medium">
                              <div className="flex items-center gap-2"><User className="w-4 h-4" /> {apt.patient}</div>
                              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {apt.phone}</div>
                              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {apt.location}</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 min-w-[160px]">
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
                                setSelectedRescheduleDate(rescheduleDates[0].label);
                                setActionError('');
                                setSelectedRescheduleTime('');
                                setIsRescheduleOpen(true);
                              }} 
                              className="w-full py-2.5 bg-white border border-gray-200 text-primary text-sm font-bold rounded-xl hover:bg-gray-50 transition shadow-sm"
                            >
                              Reschedule
                            </button>
                            <button onClick={() => { setActiveCallAppointment(apt); setActionError(''); setIsVideoCallOpen(true); }} className="w-full py-2.5 bg-strong hover:bg-deep-3 text-white text-sm font-bold rounded-xl shadow-sm transition">Appointment Start</button>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {pastAppointments.length === 0 && <p className="text-sm text-gray-500 font-medium bg-white p-6 rounded-[20px] border border-gray-100">No past appointments yet.</p>}
                      {pastAppointments.map((apt) => (
                      <div key={apt.id} className="bg-gray-50 p-6 rounded-[20px] border border-gray-200 flex flex-col md:flex-row items-center gap-6 flex-wrap">
                        <div className="min-w-[150px] border-r border-gray-200 pr-6 opacity-70">
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
                        <div className="flex flex-col gap-2 min-w-[160px]">
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
                          onClick={() => setSelectedRescheduleDate(date)}
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
                      {['09:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'].map(time => (
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

      {/* Video Consultation Overlay */}
      {isVideoCallOpen && (
        <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col md:flex-row overflow-hidden animate-[fade-in_0.3s_ease-out]">
          
          {/* Main Video Area */}
          <div className="flex-1 relative flex flex-col">
            
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-4">
                <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
                <span className="text-white font-bold tracking-widest text-sm">LIVE</span>
                <span className="text-white/80 font-medium ml-2 border-l border-white/20 pl-4">00:14:32</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-sm">
                {activeCallAppointment?.patient} - {activeCallAppointment?.title}
              </div>
            </div>

            {/* Main Patient Video (Placeholder) */}
            <div className="flex-1 bg-black w-full h-full relative">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeCallAppointment?.patient || 'Patient')}&background=334155&color=fff&size=512`} alt="Patient Video" className="w-full h-full object-cover opacity-80" />
              
              {/* Doctor PIP */}
              <div className="absolute bottom-28 right-6 w-48 h-64 bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <img src={profile?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Doctor')}&background=5A2F8F&color=fff`} alt="Doctor Video" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded">{profile?.name || 'You'} (You)</div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="h-24 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-6 px-6">
              <button className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition">
                <Mic className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition">
                <Video className="w-5 h-5" />
              </button>
              <button onClick={() => setIsVideoCallOpen(false)} className="w-16 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 transition">
                <PhoneOff className="w-6 h-6" />
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Clinical Notes Sidebar */}
          <div className="w-full md:w-[400px] bg-white border-l border-gray-200 flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-primary">Clinical Notes</h3>
              <button onClick={() => setIsVideoCallOpen(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Patient History</p>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Patient:</strong> {activeCallAppointment?.patient} ({activeCallAppointment?.phone})<br/>
                    <strong>Previous Visits:</strong> {allAppointments.filter((a) => a.status === 'Completed' && a.patient === activeCallAppointment?.patient).length}<br/>
                    <strong>Consultation:</strong> {activeCallAppointment?.title} • {activeCallAppointment?.location}<br/>
                    <strong>Chief Complaint:</strong> {activeCallAppointment?.reason || 'Not provided by patient.'}
                  </p>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Blood Pressure</label>
                  <input value={visitVitals.bloodPressure} onChange={(e) => setVisitVitals((v) => ({ ...v, bloodPressure: e.target.value }))} placeholder="120/80" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-strong/50 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Weight (kg)</label>
                  <input type="number" min="0" value={visitVitals.weight} onChange={(e) => setVisitVitals((v) => ({ ...v, weight: e.target.value }))} placeholder="70" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-strong/50 outline-none" />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Symptoms & Observations</label>
                <textarea value={visitNotes.symptoms} onChange={(e) => setVisitNotes((n) => ({ ...n, symptoms: e.target.value }))} className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-strong/50 outline-none resize-none" placeholder="Type clinical observations here during the call..."></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Prescription / Action Plan</label>
                <textarea value={visitNotes.prescription} onChange={(e) => setVisitNotes((n) => ({ ...n, prescription: e.target.value }))} className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-strong/50 outline-none resize-none" placeholder="List medications or next steps..."></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              {actionError && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-3">{actionError}</p>}
              <button onClick={handleCompleteVisit} className="w-full py-3 bg-strong hover:bg-deep-3 text-white font-bold rounded-xl shadow-md transition">
                Save & Complete Visit
              </button>
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
