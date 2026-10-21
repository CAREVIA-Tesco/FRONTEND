import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, Leaf, Menu, X, Search, MapPin, 
  CheckCircle, Shield, Phone, Activity, FileText,
  Home as HomeIcon, Users, Stethoscope, ChevronRight, MessageCircle, ChevronDown,
  Sun, Laptop, Building2, Film, Landmark, GraduationCap, BookOpen, Factory, Play, ArrowUpRight
} from 'lucide-react';

import { Link } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { usePublicStats } from '../services/usePublicStats';

const services = [
  {
    title: "Physiotherapy",
    desc: "Recover from pain, injury, or surgery with certified physios at home",
    icon: <Activity className="w-8 h-8 text-primary" />,
    action: "Book Physio",
    bgColor: "bg-green-50",
    link: "/physiotherapy",
    img: "/service-physio.png"
  },
  {
    title: "Baby Care",
    desc: "Full-time medical care and daily support for patients recovering at home",
    icon: <HomeIcon className="w-8 h-8 text-primary" />,
    action: "Explore Baby Care",
    bgColor: "bg-blue-50",
    link: "/baby-care",
    img: "/service-homecare.png"
  },
  {
    title: "Care Taker",
    desc: "Trained attendants for elderly, post-op, and bedridden patients",
    icon: <Users className="w-8 h-8 text-primary" />,
    action: "Hire Care Taker",
    bgColor: "bg-yellow-50",
    link: "/care-taker",
    img: "/service-caretaker.png"
  },
  {
    title: "Doctor Visit",
    desc: "Get expert medical consultation and treatment without visiting a clinic",
    icon: <Stethoscope className="w-8 h-8 text-primary" />,
    action: "Book Doctor",
    bgColor: "bg-red-50",
    link: "/doctor-visit",
    img: "/service-doctor.jpg"
  },
  {
    title: "Ayurveda",
    desc: "Experience traditional healing and natural therapies at your doorstep",
    icon: <Leaf className="w-8 h-8 text-primary" />,
    action: "Book Ayurveda",
    bgColor: "bg-emerald-50",
    link: "/ayurveda",
    img: "/service-physio.png"
  },
  {
    title: "BHS",
    desc: "Basic Health Services including vitals monitoring and essential care",
    icon: <HeartPulse className="w-8 h-8 text-primary" />,
    action: "Book BHS",
    bgColor: "bg-teal-50",
    link: "/bhs",
    img: "/service-homecare.png"
  }
];

const steps = [
  { title: "Choose Service", desc: "Select from Physio, Baby Care, Care Taker or Doctor", num: 1 },
  { title: "Book Appointment", desc: "Pick a time, share your location, and confirm", num: 2 },
  { title: "Get Care at Home", desc: "Verified professional arrives at your doorstep", num: 3 }
];

const features = [
  { title: "Verified Professionals", desc: "Background-checked and licensed", icon: "✅" },
  { title: "24/7 Available", desc: "Book anytime, care arrives on time", icon: "⏰" },
  { title: "Transparent Pricing", desc: "No hidden charges, pay after service", icon: "💰" },
  { title: "100% Refund", desc: "Money-back guarantee if not satisfied", icon: "💯" }
];

// Styles for the service-city cards (city list itself comes from the database: GET /api/content/cities)
const CITY_ICONS = { Sun, Laptop, Building2, Film, Landmark, GraduationCap, BookOpen, Factory, MapPin };
const CITY_ACCENTS = {
  amber: { color: "text-amber-500", bg: "bg-amber-50" },
  green: { color: "text-green-500", bg: "bg-green-50" },
  blue: { color: "text-blue-500", bg: "bg-blue-50" },
  purple: { color: "text-purple-500", bg: "bg-purple-50" },
  red: { color: "text-red-500", bg: "bg-red-50" },
  indigo: { color: "text-indigo-500", bg: "bg-indigo-50" },
  orange: { color: "text-orange-500", bg: "bg-orange-50" },
  primary: { color: "text-primary-500", bg: "bg-primary-50" },
};

export default function Home() {
  const platform = usePublicStats();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(2);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [providers, setProviders] = useState([]);

  // Testimonials, cities and live prices come from the backend
  useEffect(() => {
    api.getContent('testimonials').then((d) => setTestimonials(d.items || [])).catch(() => {});
    api.getContent('cities').then((d) => setCityList(d.items || [])).catch(() => {});
    api.getProviders().then((d) => setProviders(d.providers || [])).catch(() => {});
  }, []);

  const cities = cityList.map((c) => {
    const Icon = CITY_ICONS[c.icon] || MapPin;
    const accent = CITY_ACCENTS[c.accent] || CITY_ACCENTS.blue;
    return { ...c, icon: <Icon className="w-6 h-6" />, color: accent.color, bg: accent.bg };
  });
  const providerCities = new Set(providers.map((p) => p.loc).filter((loc) => loc && loc !== 'Virtual'));
  const extraCities = [...providerCities].filter((loc) => !cityList.some((c) => c.name === loc)).length;
  const onlineFees = providers.filter((p) => p.isDoctor && p.onlineFee).map((p) => p.onlineFee);
  const minOnlineFee = onlineFees.length ? Math.min(...onlineFees) : null;
  const todayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const doctorsToday = providers.filter((p) => p.isDoctor && (p.schedule?.[todayKey] || []).length).length;
  const topDoctors = providers.filter((p) => p.isDoctor && p.img).sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, 3);

  // Auto-scroll testimonials
  useEffect(() => {
    if (!testimonials.length) return undefined;
    setActiveTestimonial((prev) => Math.min(prev, testimonials.length - 1));
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="font-sans text-primary bg-[#F7FAFC] min-h-screen relative">
      <Navbar />

      {/* 2. Hero Section */}
      <section id="home" className="relative w-full overflow-hidden bg-[#F0F4FF] pt-24 lg:pt-32 pb-16 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Text */}
          <div className="lg:w-1/2 flex flex-col items-start z-10 pt-4 lg:pt-10 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-primary leading-[1.2] mb-6 font-poppins">
              Skip the travel!<br/>Take Online Doctor Consultation
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 lg:mb-10 font-medium">
              Private consultation + Audio call{minOnlineFee ? ` • Starts at just ₹${minOnlineFee}` : ''}
            </p>
            
            <div className="flex items-center gap-4 mb-8 lg:mb-10">
              <div className="flex -space-x-3">
                <img src={topDoctors[0]?.img} alt={topDoctors[0]?.name || ""} style={{ display: topDoctors[0] ? undefined : "none" }} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white shadow-sm" alt="Doctor" />
                <img src={topDoctors[1]?.img} alt={topDoctors[1]?.name || ""} style={{ display: topDoctors[1] ? undefined : "none" }} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white shadow-sm" alt="Doctor" />
                <img src={topDoctors[2]?.img} alt={topDoctors[2]?.name || ""} style={{ display: topDoctors[2] ? undefined : "none" }} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white shadow-sm" alt="Doctor" />
              </div>
              <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                {doctorsToday} {doctorsToday === 1 ? 'Doctor is' : 'Doctors are'} available today
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm"></span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-secondary hover:bg-secondary-hover text-white px-8 lg:px-10 py-3 lg:py-3.5 rounded-full font-bold text-lg transition shadow-md hover:shadow-lg w-full sm:w-auto mb-10 lg:mb-12"
            >
              Consult Now
            </button>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 lg:gap-6 text-sm font-bold text-primary/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" /> Verified Doctors
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary" /> Digital Prescription
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-secondary" /> Free Followup
              </div>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="lg:w-1/2 w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[600px]">
              <div className="absolute inset-0 bg-primary rounded-[40px] transform rotate-3 scale-105 -z-10 opacity-10"></div>
              <img 
                src="/home-hero.jpg" 
                alt="Patient consulting online" 
                className="w-full object-cover rounded-[32px] shadow-2xl border-4 border-white h-[400px] lg:h-[550px]" 
              />
            </div>
          </div>
          
        </div>
      </section>

      {/* 3. Services Section */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-10">
          <div className="md:w-1/2">
            <div className="flex items-center gap-2 text-secondary font-medium mb-4">
              <span className="w-4 h-0.5 bg-secondary"></span> Services We Offer
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins text-primary leading-[1.1]">
              Care that<br/>comes to you
            </h2>
          </div>
          
          <div className="md:w-1/3 flex flex-col justify-end md:pt-12">
            <p className="text-gray-600 mb-6 font-medium">
              From medical checkups and physiotherapy to full-time caregiving, we've got you covered. Choose reliability, choose Carevia.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <a href="#services" className="text-secondary font-semibold flex items-center gap-2 hover:opacity-80 transition">
                View All Services <ChevronRight className="w-4 h-4" />
              </a>
              <button onClick={() => setIsBookingModalOpen(true)} className="text-secondary font-semibold flex items-center gap-2 hover:opacity-80 transition">
                Call For Booking <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, idx) => (
            <Link to={svc.link} key={idx} className="group block relative h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-100">
              <img src={svc.img} alt={svc.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"></div>
              
              <div className="absolute bottom-6 left-6 right-20 z-10">
                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">{svc.title}</h3>
              </div>
              
              <div className="absolute -bottom-1 -right-1 bg-[#F7FAFC] p-2.5 rounded-tl-[32px] z-20">
                <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md bg-[#2A1617] text-white group-hover:bg-yellow-400 group-hover:text-black">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary text-center mb-16">Care in 3 simple steps</h2>
          
          <div className="flex flex-col md:flex-row justify-between relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-gray-200 z-0"></div>
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center max-w-xs mx-auto mb-10 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center shadow-lg mb-6 ring-8 ring-white">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Carevia */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="text-4xl mb-4">{feat.icon}</span>
                <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials - Video Coverflow */}
      <section className="py-24 bg-gradient-to-b from-[#eaf4f4] to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-primary mb-4">{platform ? `${platform.patientsServed.toLocaleString('en-IN')} ${platform.patientsServed === 1 ? 'family trusts' : 'families trust'} us` : 'Families trust us'}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-16">
            Hear directly from our patients about their recovery journey with Carevia's expert professionals at home.
          </p>
          
          <div className="w-full max-w-5xl mx-auto flex justify-center items-center gap-2 sm:gap-3 md:gap-4 h-[300px] sm:h-[350px] md:h-[400px] mb-12 overflow-hidden px-2">
            {testimonials.map((testimonial, idx) => {
              const isActive = idx === activeTestimonial;
              
              return (
                <div 
                  key={idx} 
                  onClick={() => setActiveTestimonial(idx)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex-shrink-0 ${isActive ? 'w-[200px] sm:w-[350px] md:w-[450px] lg:w-[500px] h-full shadow-2xl' : 'w-[35px] sm:w-[50px] md:w-[60px] h-[85%] opacity-70 hover:opacity-100 shadow-md'}`}
                >
                  <img src={testimonial.img} alt={testimonial.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${isActive ? 'opacity-30' : 'opacity-80'}`}></div>
                  
                  {isActive ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center pl-1 hover:scale-110 transition-transform shadow-lg">
                          <Play className="w-5 h-5 md:w-6 md:h-6 text-black" fill="currentColor" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-left">
                        <h4 className="font-bold text-lg md:text-2xl text-white tracking-wide">{testimonial.name}</h4>
                        <p className="text-xs md:text-sm text-gray-300 font-medium tracking-widest uppercase mt-0.5 md:mt-1">{testimonial.role}</p>
                        <p className="text-xs md:text-sm text-gray-200 mt-1 md:mt-2 line-clamp-2 leading-relaxed">"{testimonial.quote}"</p>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p 
                        className="text-white font-bold tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm" 
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        {testimonial.name.split('').join(' ')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <button className="bg-white border border-gray-200 text-primary font-semibold px-6 py-3 rounded-full hover:bg-gray-50 transition shadow-sm inline-flex items-center gap-2">
            See all reviews by our customers <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 7. City Coverage */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary mb-4">Available in your city</h2>
            <p className="text-gray-600">{extraCities > 0 ? `+ ${extraCities} more ${extraCities === 1 ? 'city' : 'cities'}. ` : ''}Expanding every week.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.map((city, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
                <div className={`w-14 h-14 rounded-full ${city.bg} ${city.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {city.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-primary mb-1">{city.name}</h4>
                  <p className="text-sm text-gray-500 font-medium">{city.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-secondary to-secondary-hover rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins mb-6">Need care today?</h2>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">Book a verified professional in under 60 seconds</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-white text-secondary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-lg w-full sm:w-auto"
              >
                Book Your Visit Now
              </button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" /> Talk to us on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-primary text-gray-300 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo.png" alt="Carevia Logo" className="h-10 w-auto object-contain brightness-0 invert" />
              </div>
              <p className="text-gray-400">Quality healthcare, delivered.</p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Services</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-primary transition">Physiotherapy</a></li>
                <li><a href="#" className="hover:text-primary transition">Baby Care</a></li>
                <li><a href="#" className="hover:text-primary transition">Care Taker</a></li>
                <li><a href="#" className="hover:text-primary transition">Doctor Visit</a></li>
                <li><a href="#" className="hover:text-primary transition">Ayurveda</a></li>
                <li><a href="#" className="hover:text-primary transition">BHS</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-primary transition">About</a></li>
                <li><a href="#" className="hover:text-primary transition">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition">Partner with us</a></li>
                <li><a href="#" className="hover:text-primary transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> 1800-123-4567</li>
                <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /> hello@carevia.com</li>
                <li className="mt-6 flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition">
                    <span className="sr-only">Facebook</span>
                    FB
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition">
                    <span className="sr-only">Twitter</span>
                    TW
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition">
                    <span className="sr-only">Instagram</span>
                    IG
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Carevia. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a href="#" className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group">
        <span className="absolute w-full h-full rounded-full bg-[#25D366] opacity-50 animate-ping group-hover:animate-none"></span>
        <MessageCircle className="w-6 h-6 relative z-10" />
      </a>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </div>
  );
}
