import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, FileText, Search, Settings, Bell, 
  Activity, User, MapPin, Phone, CheckCircle, Clock, LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getSessionUser, logout } from '../services/api';
import BookingModal from '../components/BookingModal';
import { Star, Filter } from 'lucide-react';

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [myAppointments, setMyAppointments] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
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
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  const loadMyAppointments = () => {
    api.getAppointments()
      .then((data) => {
        const list = data.appointments || [];
        setAllAppointments(list);
        // upcoming = waiting / confirmed, soonest first
        setMyAppointments(list.filter((a) => a.status === 'Waiting' || a.status === 'Confirmed').sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
      })
      .catch((err) => setLoadError(err.message));
  };

  useEffect(() => {
    if (!sessionUser || sessionUser.role !== 'patient') { navigate('/login?redirect=/patient/dashboard'); return; }
    loadMyAppointments();
    api.getProviders().then((data) => setDoctorList(data.providers || [])).catch((err) => setLoadError(err.message));
    const refresh = () => loadMyAppointments();
    window.addEventListener('carevia_appointment_booked', refresh);
    return () => window.removeEventListener('carevia_appointment_booked', refresh);
  }, []);

  const handleCancel = async (id) => {
    if (cancelConfirmId !== id) { setCancelConfirmId(id); return; }
    try {
      await api.cancelAppointment(id);
      setCancelConfirmId(null);
      loadMyAppointments();
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const firstName = (sessionUser?.name || 'there').split(' ')[0];
  const initials = (sessionUser?.name || 'P').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
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
      loadMyAppointments();
    } catch (err) {
      setLoadError(err.message);
    }
  };

  
  const filteredDoctors = doctorList.filter(d => {
    if (filterSpec !== 'All' && d.spec !== filterSpec) return false;
    if (filterLoc !== 'All' && d.loc !== filterLoc) return false;
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase()) && !d.spec.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'feeAsc') return (a.isDoctor ? a.onlineFee : a.fee) - (b.isDoctor ? b.onlineFee : b.fee);
    if (sortBy === 'feeDesc') return (b.isDoctor ? b.onlineFee : b.fee) - (a.isDoctor ? a.onlineFee : a.fee);
    return (Number(b.rating) || 0) - (Number(a.rating) || 0); // default highest rating
  });


  // Appointments are now loaded from the backend (see loadMyAppointments above)

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-inter">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.png" alt="Carevia Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </Link>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-[#1e293b] group-hover:text-secondary transition">{sessionUser?.name || 'Patient'}</p>
                <p className="text-xs font-medium text-gray-400">Patient</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-transparent group-hover:border-secondary transition">
                {initials}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 sticky top-28 space-y-2">
              <button 
                onClick={() => setActiveTab('Dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'Dashboard' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('Appointments')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'Appointments' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Calendar className="w-5 h-5" /> My Appointments
              </button>
              <button 
                onClick={() => setActiveTab('Records')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'Records' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <FileText className="w-5 h-5" /> Medical Records
              </button>
              <button 
                onClick={() => setActiveTab('Find Doctors')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'Find Doctors' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Search className="w-5 h-5" /> Find Doctors
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all text-gray-500 hover:bg-gray-50"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            
            {activeTab === 'Dashboard' && (
              <div className="space-y-8 animate-[fade-in_0.4s_ease-out]">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#1e293b] to-[#334155] rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-3">{greeting}, {firstName}!</h1>
                    <p className="text-gray-300 font-medium max-w-lg leading-relaxed">
                      Your health is our priority. You have {myAppointments.length} upcoming appointments. Book a new consultation or review your medical records below.
                    </p>
                    <Link to="/doctor-visit" className="inline-flex mt-6 bg-secondary hover:bg-secondary-hover text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition transform hover:-translate-y-1">
                      Book New Appointment
                    </Link>
                  </div>
                  <div className="hidden md:flex relative z-10 shrink-0 bg-white/10 p-6 rounded-[24px] backdrop-blur-md border border-white/20 items-center justify-center">
                    <Activity className="w-16 h-16 text-secondary" />
                  </div>
                </div>

                {loadError && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{loadError}</p>}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Next Appointment */}
                  <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-secondary" /> Next Appointment</h3>
                    {myAppointments.length > 0 ? (
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-bold text-secondary uppercase tracking-wider mb-1 block">{myAppointments[0].title}</span>
                            <h4 className="font-bold text-lg text-gray-900">{myAppointments[0].provider}</h4>
                          </div>
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{myAppointments[0].status}</span>
                        </div>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                            <Clock className="w-4 h-4" /> {myAppointments[0].date} at {myAppointments[0].time}
                          </div>
                          <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                            <MapPin className="w-4 h-4" /> {myAppointments[0].location}
                          </div>
                        </div>
                        <button onClick={() => handleCancel(myAppointments[0].id)} className="w-full py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition">{cancelConfirmId === myAppointments[0].id ? 'Click again to confirm cancellation' : 'Reschedule / Cancel'}</button>
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium mb-4">No upcoming appointments.</p>
                        <button onClick={() => setActiveTab("Find Doctors")} className="text-secondary font-bold hover:underline">Find a Doctor</button>
                      </div>
                    )}
                  </div>

                  {/* Health Vitals / Summary */}
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
                  </div>
                  
                  {isFilterOpen && (
                    <div className="mb-8 p-6 bg-gray-50 border border-gray-100 rounded-[20px] animate-[fade-in_0.3s_ease-out]">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Specialty</label>
                          <select 
                            value={filterSpec}
                            onChange={(e) => setFilterSpec(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#4F46E5]"
                          >
                            <option value="All">All Specialties</option>
                            {[...new Set(doctorList.map(d => d.spec))].map(spec => (
                              <option key={spec} value={spec}>{spec}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                          <select 
                            value={filterLoc}
                            onChange={(e) => setFilterLoc(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#4F46E5]"
                          >
                            <option value="All">All Locations</option>
                            {[...new Set(doctorList.map(d => d.loc))].map(loc => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
                          <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#4F46E5]"
                          >
                            <option value="rating">Highest Rated</option>
                            <option value="feeAsc">Fee: Low to High</option>
                            <option value="feeDesc">Fee: High to Low</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                        <button 
                          onClick={() => { setFilterSpec('All'); setFilterLoc('All'); setSortBy('rating'); }}
                          className="text-sm font-bold text-gray-500 hover:text-gray-900 transition"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {activeTab === 'Appointments' && (
              <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 animate-[fade-in_0.4s_ease-out]">
                <h3 className="text-2xl font-bold text-primary mb-6">My Appointments</h3>
                <div className="space-y-4">
                  {allAppointments.length > 0 ? allAppointments.map(app => (
                    <div key={app.id} className="border border-gray-100 p-6 rounded-2xl hover:shadow-md transition flex flex-col md:flex-row md:flex-wrap justify-between items-center gap-6">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 mb-1">{app.title}</h4>
                        <div className="flex gap-4 text-sm font-medium text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {app.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {app.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {app.location}</span>
                          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {app.provider}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-${app.statusColor}-100 text-${app.statusColor}-700`}>
                        {app.status}
                      </span>
                      {(app.status === 'Waiting' || app.status === 'Confirmed') && (
                        <button onClick={() => handleCancel(app.id)} className="px-3 py-1 rounded-full text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-100 transition">
                          {cancelConfirmId === app.id ? 'Confirm?' : 'Cancel'}
                        </button>
                      )}
                      {app.status === 'Completed' && !app.reviewed && (
                        <button onClick={() => setRatingFor(ratingFor === app.id ? null : app.id)} className="px-3 py-1 rounded-full text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-100 transition">
                          Rate Visit
                        </button>
                      )}
                      {app.status === 'Completed' && app.reviewed && (
                        <span className="text-xs font-bold text-yellow-500 flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Rated</span>
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
                          <button onClick={() => submitRating(app.id)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition">Submit</button>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-20 text-gray-500 font-medium">You have no appointments yet.</div>
                  )}
                </div>
              </div>
            )}
            

            {activeTab === 'Find Doctors' && (
              <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
                <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-2">Find a Doctor</h3>
                      <p className="text-gray-500">Search and book appointments with top healthcare professionals.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search doctors, specialties..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/50 outline-none w-full md:w-64 transition"
                        />
                      </div>
                      <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`p-3 border rounded-xl transition flex items-center gap-2 ${isFilterOpen ? 'bg-[#4F46E5] border-[#4F46E5] text-white' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'}`}
                      >
                        <Filter className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.length > 0 ? filteredDoctors.map((doc, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-[20px] p-5 hover:shadow-lg transition-all bg-white group">
                        <div className="flex items-start gap-4 mb-4">
                          <img src={doc.img} alt={doc.name} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                          <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{doc.name}</h4>
                            <p className="text-sm font-medium text-secondary mb-1">{doc.spec}</p>
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" /> {doc.rating}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-5 bg-gray-50 p-3 rounded-xl">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {doc.exp}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {doc.loc}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          {doc.isDoctor ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-primary">₹{doc.clinicFee} <span className="text-[10px] text-gray-400 font-normal">Clinic</span></span>
                              <span className="font-bold text-sm text-secondary">₹{doc.onlineFee} <span className="text-[10px] text-gray-400 font-normal">Online</span></span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-bold text-lg text-primary">₹{doc.fee} <span className="text-[10px] text-gray-400 font-normal">/ Session</span></span>
                            </div>
                          )}
                          <button 
                            onClick={() => setIsBookingModalOpen(true)}
                            className="bg-secondary hover:bg-secondary-hover text-white text-sm font-bold px-4 py-2 rounded-lg transition"
                          >
                            Book Now
                          </button>
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
              </div>
            )}

            {activeTab === 'Records' && medicalRecords.length > 0 && (
              <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 animate-[fade-in_0.4s_ease-out]">
                <h3 className="text-2xl font-bold text-primary mb-6">Medical Records</h3>
                <div className="space-y-4">
                  {medicalRecords.map(rec => (
                    <div key={rec.id} className="border border-gray-100 p-6 rounded-2xl">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <h4 className="font-bold text-lg text-gray-900">{rec.title} • {rec.provider}</h4>
                        <span className="text-sm font-medium text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> {rec.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1"><strong>Observations:</strong> {rec.visitNotes?.symptoms || '-'}</p>
                      <p className="text-sm text-gray-700"><strong>Prescription:</strong> {rec.visitNotes?.prescription || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Records' && medicalRecords.length === 0 && (
              <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 animate-[fade-in_0.4s_ease-out] text-center py-20">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Records Found</h3>
                <p className="text-gray-500">Your prescriptions and lab reports will appear here after your first visit.</p>
              </div>
            )}

          </div>
        </div>
      </main>
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </div>
  );
}