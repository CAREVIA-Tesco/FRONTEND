import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import BookingModal from '../components/BookingModal';
import EnquiryModal from '../components/EnquiryModal';
import { useContact } from '../services/useSiteContent';
import api from '../services/api';
import { usePublicStats, usePricingRules, inr } from '../services/usePublicStats';
import { 
  CheckCircle, Star, Users, MapPin, Search, Phone, 
  ChevronRight, Shield, Clock, Heart, Award, 
  Activity, Briefcase, ChevronDown, Check, ThumbsUp, Plus
} from 'lucide-react';

export default function HireProfessional() {
  const platform = usePublicStats();
  const pricingRules = usePricingRules();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    service: 'Physiotherapist',
    patient: 'Elderly Care',
    location: '',
    duration: 'Few hours'
  });
  const [isSearching, setIsSearching] = useState(false);

  // Filter States
  const [filterRole, setFilterRole] = useState("Any Role");
  const [filterCity, setFilterCity] = useState("Any City");
  const [filterGender, setFilterGender] = useState("Any Gender");
  const [filterLang, setFilterLang] = useState("Any Language");
  const [availableToday, setAvailableToday] = useState(false);

  // Professionals come from the backend (verified providers)
  const [providers, setProviders] = useState([]);
  const [loadingPros, setLoadingPros] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [bookingService, setBookingService] = useState(null);
  const [enquiry, setEnquiry] = useState(null);
  const contact = useContact();
  const ROLE_SERVICE = { Physiotherapist: 'Physiotherapy', 'Home Nurse': 'Nurse Care', 'Care Taker': 'Care Taker', Doctor: 'Home Doctor' };
  const postRequirement = () => setEnquiry({
    type: 'requirement',
    service: ROLE_SERVICE[formData.service] || '',
    message: `Need a ${formData.service} for ${formData.patient.toLowerCase()}${formData.location ? ` in ${formData.location}` : ''}, duration: ${formData.duration}.`,
  });
  const chatOnWhatsApp = () => (contact.whatsappHref ? window.open(contact.whatsappHref, '_blank', 'noopener') : setEnquiry({ type: 'callback' }));
  useEffect(() => {
    api.getProviders()
      .then((d) => setProviders(d.providers || []))
      .catch(() => setProviders([]))
      .finally(() => setLoadingPros(false));
  }, []);

  const roleOf = (p) => (p.isDoctor ? 'Doctor' : p.profession === 'Nurse' ? 'Home Nurse' : p.profession === 'Caretaker' ? 'Care Taker' : p.profession === 'Physiotherapist' ? 'Physiotherapist' : null);
  const SERVICE_FOR_ROLE = { 'Doctor': 'home-doctor', 'Home Nurse': 'nurse-care', 'Care Taker': 'care-taker', 'Physiotherapist': 'physiotherapy' };
  const todayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const priceOf = (p) => (p.isDoctor ? p.clinicFee || p.onlineFee || p.fee : p.fee || p.clinicFee);
  const initialPros = providers
    .filter((p) => roleOf(p))
    .map((p) => ({
      id: p.id,
      name: p.name,
      role: roleOf(p),
      gender: p.gender,
      city: p.loc,
      languages: p.languages || [],
      fee: priceOf(p),
      price: `₹${Number(priceOf(p) || 0).toLocaleString('en-IN')}/${p.isDoctor ? 'visit' : 'session'}`,
      rating: p.rating,
      reviews: p.reviews || 0,
      tags: [p.specialization, p.spec !== p.specialization ? p.spec : null].filter(Boolean),
      img: p.img,
      exp: p.exp,
      available: (p.schedule?.[todayKey] || []).length > 0,
    }))
    .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
  const roleStats = (role) => {
    const list = initialPros.filter((p) => p.role === role);
    const fees = list.map((p) => p.fee).filter(Boolean);
    return { count: list.length, minFee: fees.length ? Math.min(...fees) : null };
  };
  const physioMin = roleStats('Physiotherapist').minFee;
  const nurseMin = roleStats('Home Nurse').minFee;
  const caretakerMin = roleStats('Care Taker').minFee;
  const doctorMin = roleStats('Doctor').minFee;
  const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();

  const filteredPros = initialPros.filter(pro => {
    if (filterRole !== "Any Role" && pro.role !== filterRole) return false;
    if (filterCity !== "Any City" && pro.city !== filterCity) return false;
    if (filterGender !== "Any Gender" && pro.gender !== filterGender) return false;
    if (filterLang !== "Any Language" && !pro.languages.includes(filterLang)) return false;
    if (availableToday && !pro.available) return false;
    return true;
  });

  const handleSearch = () => {
    if (!formData.location.trim()) {
      alert("Please enter your city or pincode.");
      return;
    }
    // narrow the professionals list to the searched city / service when we have matches
    const city = uniq(initialPros.map((p) => p.city)).find((c) => c.toLowerCase() === formData.location.trim().toLowerCase());
    setFilterCity(city || 'Any City');
    const role = { Physiotherapist: 'Physiotherapist', 'Home Nurse': 'Home Nurse', Nurse: 'Home Nurse', 'Care Taker': 'Care Taker', Caretaker: 'Care Taker', Doctor: 'Doctor' }[formData.service];
    if (role) setFilterRole(role);
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      document.getElementById('browse-professionals')?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="theme-portea font-sans text-primary bg-[#FAFBFC] min-h-screen relative overflow-x-clip selection:bg-secondary/30 selection:text-primary">
      <SiteHeader />

      {/* 2. Hero Section */}
      <section className="pt-32 pb-48 lg:pt-40 lg:pb-56 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-tint relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          
          {/* Left Hero */}
          <div className="lg:w-[55%] flex flex-col items-start">
            <div className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 mb-6 border border-secondary/20">
              <HomeIcon className="w-4 h-4" /> Hire in Under 4 Hours
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[60px] font-bold font-poppins text-primary leading-[1.1] mb-6">
              Hire Trusted Healthcare Professionals, Direct to Your Home.
            </h1>
            
            <p className="text-[#5A6478] text-lg mb-8 max-w-xl leading-relaxed">
              Post your requirement and get matched with verified physiotherapists, nurses, care takers, and doctors — all background-checked and rated by real families.
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-primary mb-10 bg-white/50 px-6 py-3 rounded-full border border-white/50 backdrop-blur-sm">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-[#10B981]"/> {initialPros.length} Verified Pros</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500"/> {platform?.rating ? `${platform.rating} Rated` : 'New'}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary"/> {platform ? `${platform.patientsServed.toLocaleString('en-IN')} Families` : '...'}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button type="button" onClick={postRequirement} className="bg-secondary hover:bg-secondary-hover text-white px-8 py-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 text-lg">
                📋 Post Your Requirement
              </button>
              <button type="button" onClick={() => setEnquiry({ type: 'callback' })} className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 text-lg">
                <Phone className="w-5 h-5"/> Talk to a Care Advisor
              </button>
            </div>
            
            <div className="flex gap-4 mt-6 text-sm text-[#5A6478] font-medium">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary"/> Pro at your home in 4 hrs</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-[#10B981]"/> Fully insured</span>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="lg:w-[45%] relative w-full max-w-lg mx-auto">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=1000&fit=crop" alt="Nurse and Family" className="w-full h-[500px] object-cover" />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow border border-gray-100">
              <div className="bg-yellow-100 p-2 rounded-full"><Star className="w-6 h-6 text-yellow-500 fill-current" /></div>
              <div>
                <div className="font-bold text-primary">{platform?.rating ? `${platform.rating} / 5 Rating` : 'New on Carevia'}</div>
                <div className="text-xs text-gray-500">{platform ? `${platform.patientsServed.toLocaleString('en-IN')} ${platform.patientsServed === 1 ? 'family trusts' : 'families trust'} us` : '...'}</div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-pulse-slow border border-gray-100">
              <div className="bg-[#10B981]/10 p-2 rounded-full"><CheckCircle className="w-6 h-6 text-[#10B981]" /></div>
              <div>
                <div className="font-bold text-primary">Verified Professional</div>
                <div className="text-xs text-[#10B981] font-medium">Within 4 hours</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Hire Form (STAR of the page) */}
      <section className="relative z-20 -mt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-[24px] shadow-[0_20px_50px_rgba(30,58,138,0.1)] p-8 md:p-10 border border-gray-50">
          <h2 className="text-2xl font-bold font-poppins text-primary text-center mb-8">
            Tell us what you need — we'll match a professional in minutes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">I need a...</label>
              <select 
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none text-primary font-medium"
              >
                <option>Physiotherapist</option>
                <option>Home Nurse</option>
                <option>Care Taker</option>
                <option>Doctor</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">For...</label>
              <select 
                value={formData.patient}
                onChange={(e) => setFormData({...formData, patient: e.target.value})}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none text-primary font-medium"
              >
                <option>Elderly Care</option>
                <option>Post-Surgery</option>
                <option>Chronic Illness</option>
                <option>Newborn Care</option>
                <option>Other</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-semibold text-gray-600">Location</label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Your City / Pincode" 
                  className="w-full pl-10 p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none text-primary font-medium" 
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">Duration</label>
              <select 
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none text-primary font-medium"
              >
                <option>Few hours</option>
                <option>Days</option>
                <option>Weeks</option>
                <option>Months</option>
              </select>
            </div>
            
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-secondary hover:bg-secondary-hover disabled:opacity-70 text-white p-3.5 rounded-xl font-bold transition shadow-md w-full flex items-center justify-center gap-2 h-[52px]"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><Search className="w-5 h-5"/> Find Pros</>
              )}
            </button>
          </div>
          <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6 text-sm font-medium text-gray-500">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-500" /> Free to post • No obligation</span>
            <span className="hidden md:block text-gray-300">•</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> Get 3+ matches in 30 minutes</span>
          </div>
        </div>
      </section>

      {/* 4. Live Stats Strip */}
      <section className="bg-primary py-16 mt-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          <div className="flex flex-col items-center">
            <div className="text-4xl lg:text-5xl font-bold font-poppins mb-2">{initialPros.length}</div>
            <div className="text-blue-200 font-medium text-sm md:text-base uppercase tracking-wider">Verified Pros</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl lg:text-5xl font-bold font-poppins mb-2">{platform ? platform.patientsServed.toLocaleString('en-IN') : '...'}</div>
            <div className="text-blue-200 font-medium text-sm md:text-base uppercase tracking-wider">Families Served</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl lg:text-5xl font-bold font-poppins mb-2">{platform ? platform.cities : '...'}</div>
            <div className="text-blue-200 font-medium text-sm md:text-base uppercase tracking-wider">Cities Served</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl lg:text-5xl font-bold font-poppins mb-2">{platform ? (platform.rating ? `${platform.rating}/5` : 'New') : '...'}</div>
            <div className="text-blue-200 font-medium text-sm md:text-base uppercase tracking-wider">Satisfaction</div>
          </div>
        </div>
      </section>

      {/* 5. Who You Can Hire */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary mb-4">Hire the Right Professional for Your Family</h2>
            <p className="text-[#5A6478] text-lg max-w-2xl mx-auto">Every professional is licensed, background-verified, and rated by families like yours.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { t: "Physiotherapist", role: "Physiotherapist", unit: "session", d: "For pain, injury & post-op recovery", ic: <Activity className="w-8 h-8 text-blue-600"/>, bg: "bg-blue-50" },
              { t: "Home Nurse", role: "Home Nurse", unit: "session", d: "For medical care — injections, wound care, ICU", ic: <Heart className="w-8 h-8 text-red-500"/>, bg: "bg-red-50" },
              { t: "Care Taker", role: "Care Taker", unit: "session", d: "For elderly support, daily care & companionship", ic: <Users className="w-8 h-8 text-yellow-600"/>, bg: "bg-yellow-50" },
              { t: "Doctor Visit", role: "Doctor", unit: "visit", d: "For consultations, prescriptions & checkups", ic: <Briefcase className="w-8 h-8 text-green-600"/>, bg: "bg-green-50" }
            ].map((s) => ({ ...s, ...roleStats(s.role) })).map((s, i) => (
              <div key={i} className="border border-gray-100 rounded-3xl p-8 hover:shadow-xl transition-shadow duration-300 bg-white group flex flex-col h-full">
                <div className={`${s.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>{s.ic}</div>
                <h3 className="text-xl font-bold text-primary mb-3">{s.t}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{s.d}</p>
                <div className="space-y-2 mb-8">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800"><Check className="w-4 h-4 text-green-500"/> {s.minFee ? `Starting ₹${s.minFee.toLocaleString('en-IN')}/${s.unit}` : 'Coming soon'}</div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500"><Users className="w-4 h-4 text-gray-400"/> {s.count} verified {s.count === 1 ? 'professional' : 'professionals'} available</div>
                </div>
                <button onClick={() => { setFilterRole(s.role); document.getElementById('browse-professionals')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary font-bold flex items-center gap-2 group-hover:gap-3 transition-all mt-auto">
                  Hire a {s.t.split(' ')[0]} <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Browse Available Professionals */}
      <section id="browse-professionals" className="py-24 bg-tint px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary mb-4">👥 Browse Available Professionals Near You</h2>
            <p className="text-[#5A6478] text-lg max-w-2xl mx-auto">Real profiles, real ratings — pick exactly who visits your home.</p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between mb-10 border border-blue-100">
            <div className="flex flex-wrap gap-3">
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-4 py-2 font-medium outline-none"><option>Any Role</option>{uniq(initialPros.map((p) => p.role)).map((r) => <option key={r}>{r}</option>)}</select>
              <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-4 py-2 font-medium outline-none"><option>Any City</option>{uniq(initialPros.map((p) => p.city)).map((c) => <option key={c}>{c}</option>)}</select>
              <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-4 py-2 font-medium outline-none"><option>Any Gender</option>{uniq(initialPros.map((p) => p.gender)).map((g) => <option key={g}>{g}</option>)}</select>
              <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-4 py-2 font-medium outline-none"><option value="Any Language">Language</option>{uniq(initialPros.flatMap((p) => p.languages)).map((l) => <option key={l}>{l}</option>)}</select>
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-green-50 px-4 py-2 rounded-lg cursor-pointer">
              <input type="checkbox" className="sr-only" checked={availableToday} onChange={(e) => setAvailableToday(e.target.checked)} />
              <div className={`w-3 h-3 rounded-full ${availableToday ? 'bg-green-600 ring-2 ring-green-300' : 'bg-green-500 animate-pulse'}`}></div> Available Today
            </label>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingPros && <p className="col-span-full text-center text-gray-500">Loading professionals...</p>}
            {!loadingPros && filteredPros.length === 0 && <p className="col-span-full text-center text-gray-500">No professionals match these filters.</p>}
            {(showAll ? filteredPros : filteredPros.slice(0, 6)).map((pro) => (
              <div key={pro.id} className="bg-white rounded-[20px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-blue-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img src={pro.img} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt={pro.name} />
                    <div className="absolute -bottom-1 -right-1 bg-[#10B981] p-1 rounded-full border-2 border-white text-white"><Check className="w-2 h-2" /></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">{pro.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{pro.role} — {pro.exp}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {pro.tags.map((tag) => <span key={tag} className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">{tag}</span>)}
                  {pro.available && <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md">Available Today</span>}
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm font-medium"><Star className="w-4 h-4 text-yellow-500 fill-current"/> <span className="font-bold">{pro.rating}</span> <span className="text-gray-400">({pro.reviews} reviews)</span></div>
                  <div className="text-sm text-gray-600 font-medium">🗣️ {pro.languages.join(', ') || '-'}</div>
                  <div className="text-sm text-gray-600 font-medium">📍 {pro.city || '-'} · 💰 {pro.price}</div>
                </div>
                
                <div className="flex gap-3">
                  <Link to="/doctors" className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm text-center">View Profile</Link>
                  <button onClick={() => setBookingService(SERVICE_FOR_ROLE[pro.role])} className="flex-1 bg-secondary text-white font-bold py-2.5 rounded-xl hover:bg-secondary-hover transition shadow-md text-sm">Hire Now</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(!showAll)} className="text-secondary font-bold text-lg hover:underline inline-flex items-center gap-2">
              {showAll ? 'Show Fewer' : `See All ${filteredPros.length} Professionals`} <ChevronRight className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </section>

      {/* 7. How Hiring Works */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary text-center mb-16">Hire in 4 Simple Steps</h2>
          
          <div className="relative">
            {/* Dashed connector line */}
            <div className="hidden md:block absolute top-10 left-10 right-10 h-0.5 border-t-2 border-dashed border-secondary/30 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
              {[
                { s: "1", i: "📋", t: "Post Requirement", d: "Tell us the care you need" },
                { s: "2", i: "👥", t: "Get Matched", d: "We send 3+ verified profiles in 30 mins" },
                { s: "3", i: "✅", t: "Choose Your Pro", d: "Review profiles, ratings, and prices" },
                { s: "4", i: "🏠", t: "Care Arrives", d: "Verified pro at your home in 4 hours" }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center relative bg-white p-4 rounded-xl">
                  <div className="w-20 h-20 rounded-full bg-tint border-4 border-white shadow-md flex items-center justify-center text-3xl mb-6 z-10 relative">
                    {step.i}
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">{step.s}</div>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">{step.t}</h3>
                  <p className="text-gray-600 font-medium">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Why Families Trust Carevia */}
      <section className="py-24 bg-tint px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary text-center mb-16">Why Families Trust Carevia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { i: "🎓", t: "All Verified", d: "Certificates, ID, and rigorous background checks." },
              { i: "🔁", t: "Backup Guarantee", d: "Replacement professional provided within 6 hours." },
              { i: "💰", t: "Transparent Pricing", d: "Zero hidden charges, pay only after service begins." },
              { i: "📱", t: "Family Dashboard", d: "Track daily vitals, care logs, and live updates." },
              { i: "🛡️", t: "Fully Insured", d: "Every professional is covered under comprehensive insurance." },
              { i: "💬", t: "24/7 Support", d: "A dedicated Care Coordinator is always available for you." }
            ].map((b, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{b.i}</div>
                <h3 className="text-xl font-bold text-primary mb-2">{b.t}</h3>
                <p className="text-gray-600 font-medium">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Pricing Overview */}
      <section className="py-24 bg-tint px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary text-center mb-12">Transparent Hiring Costs</h2>
          
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-blue-50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="p-6 font-bold text-lg">Professional</th>
                    <th className="p-6 font-bold text-lg">Hourly</th>
                    <th className="p-6 font-bold text-lg">Daily</th>
                    <th className="p-6 font-bold text-lg">Monthly</th>
                  </tr>
                </thead>
                <tbody className="text-primary font-medium">
                  <tr className="border-b border-gray-100 hover:bg-blue-50 transition">
                    <td className="p-6 font-bold flex items-center gap-3"><Activity className="text-blue-500 w-5 h-5"/> Physiotherapist</td>
                    <td className="p-6">{physioMin ? `${inr(physioMin)}/hr` : '—'}</td>
                    <td className="p-6 text-gray-400">—</td>
                    <td className="p-6 text-[#10B981] font-bold">{physioMin && pricingRules ? <>{inr(Math.round(physioMin * (1 - pricingRules.packDiscountPct / 100)) * pricingRules.packSessions)} <span className="text-sm font-normal text-gray-500">({pricingRules.packSessions} sessions)</span></> : '—'}</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-blue-50 transition">
                    <td className="p-6 font-bold flex items-center gap-3"><Heart className="text-red-500 w-5 h-5"/> Home Nurse (GNM)</td>
                    <td className="p-6 text-gray-400">—</td>
                    <td className="p-6">{nurseMin ? `${inr(nurseMin)}/day` : '—'}</td>
                    <td className="p-6 text-[#10B981] font-bold">{nurseMin && pricingRules?.monthly24hrDays ? <>{inr(nurseMin * pricingRules.monthly24hrDays)} <span className="text-sm font-normal text-gray-500">(24-hr)</span></> : '—'}</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-blue-50 transition">
                    <td className="p-6 font-bold flex items-center gap-3"><Users className="text-yellow-500 w-5 h-5"/> Care Taker</td>
                    <td className="p-6 text-gray-400">—</td>
                    <td className="p-6">{caretakerMin ? `${inr(caretakerMin)}/day` : '—'}</td>
                    <td className="p-6 text-[#10B981] font-bold">{caretakerMin && pricingRules?.monthly24hrDays ? <>{inr(caretakerMin * pricingRules.monthly24hrDays)} <span className="text-sm font-normal text-gray-500">(24-hr)</span></> : '—'}</td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition">
                    <td className="p-6 font-bold flex items-center gap-3"><Briefcase className="text-green-500 w-5 h-5"/> Doctor Visit</td>
                    <td className="p-6">{doctorMin ? `${inr(doctorMin)}/visit` : '—'}</td>
                    <td className="p-6 text-gray-400">—</td>
                    <td className="p-6 text-gray-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-600 bg-white/50 backdrop-blur-md px-6 py-4 rounded-full border border-blue-100 w-max mx-auto shadow-sm">
            <span className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">💳</div> EMI available on monthly plans</span>
            <span className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">🛡️</div> Insurance claims supported</span>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            {[
              "How fast can I hire a professional?",
              "Are all professionals verified?",
              "Can I request a female caregiver?",
              "What if I'm unhappy with the professional?",
              "How does payment work?",
              "Do you provide medical equipment (bed, oxygen)?",
              "Can I hire for short-term (2–3 days) needs?",
              "What if the professional falls sick?"
            ].map((q, i) => (
              <div key={i} className="border-b border-gray-100 pb-4">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left py-4 font-bold text-primary flex items-center justify-between hover:text-secondary transition"
                >
                  {q} <ChevronDown className={`w-5 h-5 transition-transform ${activeFaq === i ? 'rotate-180 text-secondary' : 'text-gray-400'}`} />
                </button>
                {activeFaq === i && (
                  <p className="text-gray-600 font-medium pb-4 text-sm">Yes, absolutely. We ensure the highest quality of service and have clear policies to address this scenario quickly and safely.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Big CTA Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-secondary to-primary rounded-[2.5rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-6 relative z-10">Ready to Hire Compassionate Care?</h2>
          <p className="text-xl text-blue-50 mb-10 max-w-2xl mx-auto relative z-10 font-medium">
            Post your requirement and get verified matches in 30 minutes
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 w-full sm:w-auto">
            <button type="button" onClick={postRequirement} className="bg-white text-secondary px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-1 transition flex items-center justify-center gap-2">
              📋 Post Requirement
            </button>
            <button type="button" onClick={chatOnWhatsApp} className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition flex items-center justify-center gap-2">
              💬 WhatsApp Us
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50">
        <button type="button" onClick={postRequirement} className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2">
          📋 Post Requirement
        </button>
      </div>

      <SiteFooter />

      <EnquiryModal open={!!enquiry} onClose={() => setEnquiry(null)} type={enquiry?.type} service={enquiry?.service} message={enquiry?.message} />
      <BookingModal isOpen={!!bookingService} onClose={() => setBookingService(null)} serviceType={bookingService} />
    </div>
  );
}

function HomeIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
