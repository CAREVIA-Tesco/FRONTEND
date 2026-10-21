import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePublicStats, serviceStats, plural, usePricingRules, packagePrices, inr } from '../services/usePublicStats';
import { 
  HeartPulse, Menu, X, CheckCircle, Clock, Shield, Phone, MapPin, 
  ChevronRight, MessageCircle, ChevronDown, Activity, Users, Stethoscope, Home as HomeIcon,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import ServiceProfessionals from '../components/ServiceProfessionals';
import AnimatedCTA from '../components/AnimatedCTA';
import BookingModal from '../components/BookingModal';
import EnquiryModal from '../components/EnquiryModal';
import { useBookNow } from '../components/BookNow';
import { useContact } from '../services/useSiteContent';

export default function DoctorVisit() {
  const liveStats = serviceStats(usePublicStats(), 'home-doctor', true);
  const pricingRules = usePricingRules();
  const prices = packagePrices(liveStats?.minFee, pricingRules);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const bookNow = useBookNow();
  const [enquiry, setEnquiry] = useState(null);
  const contact = useContact();
  const chatOnWhatsApp = () => (contact.whatsappHref ? window.open(contact.whatsappHref, '_blank', 'noopener') : setEnquiry({}));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const conditions = [
    { icon: "🤒", name: "Fever & Infections", desc: "Diagnosis & treatment for seasonal illnesses" },
    { icon: "🩺", name: "General Checkup", desc: "Routine health assessment & vitals" },
    { icon: "🍬", name: "Diabetes Management", desc: "Blood sugar tracking & prescriptions" },
    { icon: "❤️", name: "Hypertension", desc: "BP monitoring & cardiovascular care" },
    { icon: "👴", name: "Geriatric Care", desc: "Specialized care for elderly patients" },
    { icon: "🩹", name: "Minor Injuries", desc: "First aid, wound care, & dressing" },
    { icon: "🤧", name: "Respiratory Issues", desc: "Asthma & allergy management" },
    { icon: "📋", name: "Lab Test Referrals", desc: "Prescribing necessary diagnostics" }
  ];

  const exercises = [
    { title: "Pelvic Tilts", desc: "Lie on back, tighten abdominals, tilt pelvis. Hold 5s × 10 reps." },
    { title: "Knee-to-Chest Stretch", desc: "Pull one knee to chest, hold 30s, switch legs." },
    { title: "Cat-Cow Stretch", desc: "On all fours, arch and round back slowly × 10 reps." },
    { title: "Bird Dog", desc: "Extend opposite arm and leg from hands-and-knees × 10 each." }
  ];

  const faqs = [
    { q: "How quickly can a doctor visit my home?", a: "We can arrange a caregiver within 12-24 hours depending on your requirements. Same-day slots may be available." },
    { q: "What equipment does the doctor bring?", a: "Our doctors bring necessary basic medical kits. For specialized ICU setups, we help arrange equipment separately, and basic assessment tools." },
    { q: "Do I need a doctor's prescription to book?", a: "No, you don't need a prescription for an initial assessment, though it's helpful if you have one." },
    { q: "Can I book a session for my elderly parents remotely?", a: "Absolutely! You can manage bookings and track progress on behalf of your family members." }
  ];

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen relative overflow-x-clip selection:bg-primary selection:text-white">
      <SiteHeader />
      {/* 2. Hero Section */}
      <section className="pt-32 pb-20 lg:pt-44 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-white to-tint overflow-hidden">
        <div className="lg:w-[55%] flex flex-col items-start z-10">
          <div className="bg-accent/5 text-accent px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 mb-6 border border-accent/20">
            🏠 Certified Doctors at Your Doorstep
          </div>
          <div className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-2">
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight className="w-3 h-3" /> 
            <span className="hover:text-primary cursor-pointer">Services</span> <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Doctor Visit</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] mb-6 font-poppins text-primary">
            Expert Doctor Visits,<br/>Right Where You Belong.
          </h1>
          <p className="text-lg text-ink-soft mb-8 max-w-[500px] leading-relaxed">
            Skip the hospital waiting rooms. Get comprehensive medical consultations and treatments from certified doctors in the comfort of your own home.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-10 items-center text-sm font-medium text-primary">
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm"><span className="text-green-500">✅</span> {liveStats ? plural(liveStats.providers, 'Certified Doctor', 'Certified Doctors') : '...'}</span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm"><span className="text-yellow-400">⭐</span> {liveStats?.rating ? `${liveStats.rating} Rated` : 'New'}</span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm">🏥 {liveStats ? `${liveStats.visits.toLocaleString('en-IN')} ${liveStats.visits === 1 ? 'Visit' : 'Visits'} Completed` : '...'}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full sm:w-auto">
            <AnimatedCTA onClick={() => bookNow({ service: 'Doctor Visit' })}>Book a Session</AnimatedCTA>
            <button type="button" onClick={() => setEnquiry({})} className="bg-transparent border-2 border-primary text-primary hover:bg-tint px-6 py-3 rounded-xl font-medium text-base transition flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> Talk to a Doctor Now
            </button>
          </div>
          
          <p className="text-sm text-ink-soft">
            🕐 Same-day slots • 💳 Pay after service • 🛡️ 100% verified
          </p>
        </div>
        
        <div className="lg:w-[45%] relative mt-10 lg:mt-0 w-full">
          <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_color-mix(in_srgb,var(--color-primary)_15%,transparent)] animate-[float_4s_ease-in-out_infinite]">
            <img 
              src="/doctor-hero.png" 
              alt="Doctor treating patient at home" 
              className="w-full h-[550px] object-cover"
            />
          </div>


        </div>
      </section>

      {/* 3. Quick Info Strip */}
      <section className="bg-accent/5 py-10 border-y border-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">💰</span>
              <h4 className="font-bold text-primary mb-1">Starting Price</h4>
              <p className="text-sm text-ink-soft">{prices ? `${inr(prices.single)} per session` : 'Price on request'}</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">⚡</span>
              <h4 className="font-bold text-primary mb-1">Slot Availability</h4>
              <p className="text-sm text-ink-soft">Same-day booking</p>
            </div>
          
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">✅</span>
              <h4 className="font-bold text-primary mb-1">100% Verified Profile</h4>
              <p className="text-sm text-ink-soft">Background checked</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">💯</span>
              <h4 className="font-bold text-primary mb-1">100% Refund Provided</h4>
              <p className="text-sm text-ink-soft">Money-back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. About Doctor Visit */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-[60%]">
            <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary mb-6 leading-tight">
              Expert Doctors At Your Doorstep
            </h2>
            <p className="text-lg text-ink-soft mb-6 leading-relaxed">
              We bring clinical excellence straight to your living room. Whether you're managing chronic pain, recovering from joint replacement surgery, or dealing with age-related mobility issues, our <span className="text-accent font-medium">real recovery without leaving your home</span> approach ensures you heal faster and safer.
            </p>
            <p className="text-lg text-ink-soft mb-8 leading-relaxed">
              Carevaa connects you with experienced, background-checked doctors who bring professional medical care directly to you, saving you time and travel.
            </p>
            
            <ul className="space-y-4">
              {["No travel or waiting rooms", "Personalized 1-on-1 sessions", "Family-friendly scheduling"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg text-primary font-medium">
                  <span className="text-accent">✔</span> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:w-[40%] relative">
            <div className="absolute inset-0 bg-tint rounded-[40px] transform rotate-3 scale-105 -z-10"></div>
            <img 
              src="/homecare-section.jpg" 
              alt="Doctor Visit session" 
              className="rounded-[32px] shadow-2xl object-cover w-full h-[450px]"
            />
          </div>
        </div>
      </section>

      {/* 5. Conditions We Treat */}
      <section className="py-24 bg-tint">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary mb-4">Conditions Our Doctors Treat</h2>
            <p className="text-lg text-ink-soft">Certified expertise across musculoskeletal, neurological, and post-surgical care</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {conditions.map((cond, i) => (
              <div key={i} className="bg-white p-6 rounded-[20px] shadow-sm hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-primary)_12%,transparent)] transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer border border-transparent hover:border-tint">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${i % 2 === 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                  {cond.icon}
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{cond.name}</h3>
                <p className="text-sm text-ink-soft mb-4">{cond.desc}</p>
                <button type="button" onClick={() => setEnquiry({ message: `I need help with ${cond.name}.` })} className="text-accent font-medium flex items-center gap-1 text-sm hover:gap-2 transition-all">
                  Ask an Expert <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceProfessionals serviceKey="doctor-visit" />


      {/* 8. Pricing Section */}
      <section className="py-24 bg-tint relative border-t border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-ink-soft">No hidden fees. Save more with packages.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            {/* Single Session */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-2">Single Session</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-primary">{inr(prices?.single)}</span>
                <span className="text-ink-soft">/ session</span>
              </div>
              <p className="text-sm text-ink-soft mb-8 pb-8 border-b border-gray-100">Perfect for one-time care</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> 45-min home session</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> Free initial assessment</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> Personalized exercise plan</li>
              </ul>
              <button type="button" onClick={() => bookNow({ service: 'Doctor Visit' })} className="w-full bg-transparent border-2 border-primary text-primary hover:bg-tint py-3 rounded-xl font-semibold transition">
                Book Single Session
              </button>
            </div>
            
            {/* Session Pack */}
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-accent relative transform lg:-translate-y-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-md">
                ⭐ Most Popular
              </div>
              <h3 className="text-xl font-bold text-primary mb-2 mt-2">{prices?.packSessions || 10} Session Pack</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-primary">{inr(prices?.pack)}</span>
                <span className="text-ink-soft">/ {prices?.packSessions || 10} sessions</span>
              </div>
              <p className="text-sm font-medium text-accent mb-8 pb-8 border-b border-gray-100">{prices ? `Save ${inr(prices.packSaving)} (${inr(prices.perSession)}/session)` : ''}</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-2 text-sm text-primary font-medium"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> Everything in Single</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> Progress tracking dashboard</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> Priority scheduling</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> Free follow-up call</li>
              </ul>
              <button type="button" onClick={() => setEnquiry({ type: 'plan', plan: `${prices?.packSessions || 10}-Session Pack${prices ? ` (${inr(prices.pack)})` : ''}` })} className="w-full bg-secondary hover:bg-secondary-hover text-white py-3.5 rounded-xl font-bold text-lg transition shadow-md">
                Get This Pack
              </button>
            </div>
            
            {/* Monthly Care Plan */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-2">Monthly Care Plan</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-primary">{inr(prices?.monthly)}</span>
                <span className="text-ink-soft">/ month</span>
              </div>
              <p className="text-sm text-ink-soft mb-8 pb-8 border-b border-gray-100">Unlimited sessions</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> Everything in 10-Session</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> Dedicated doctor</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> Free weekly progress review</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-accent shrink-0" /> WhatsApp support</li>
              </ul>
              <button type="button" onClick={() => setEnquiry({ type: 'plan', plan: `Monthly Care Plan${prices ? ` (${inr(prices.monthly)}/month)` : ''}` })} className="w-full bg-transparent border-2 border-primary text-primary hover:bg-tint py-3 rounded-xl font-semibold transition">
                Start Monthly Plan
              </button>
            </div>
          </div>
          
          <div className="text-center mt-10 text-sm text-ink-soft flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">💳 EMI available on packages above {inr(prices?.emiMinimum ?? pricingRules?.emiMinimum)}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">🛡️ Insurance claims supported</span>
          </div>
        </div>
      </section>

      {/* 15. Big CTA Banner */}

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-secondary to-primary rounded-[32px] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-[40px] font-bold font-poppins mb-6 leading-tight">Ready to Start Your Recovery Journey?</h2>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">Book a certified doctor to visit your home today. Same-day slots available.</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button type="button" onClick={() => bookNow({ service: 'Doctor Visit' })} className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-lg">
                📱 Book Doctor Now
              </button>
              <button type="button" onClick={chatOnWhatsApp} className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition flex items-center justify-center gap-2">
                💬 Chat on WhatsApp
              </button>
            </div>
            <p className="text-sm mt-6 opacity-80">⚡ Average booking time: under 60 seconds</p>
          </div>
        </div>
      </section>

      <SiteFooter />
      
      {/* Floating WhatsApp Button */}
      <a href={contact.whatsappHref || contact.phoneHref || '#'} target={contact.whatsappHref ? '_blank' : undefined} rel="noreferrer" aria-label="Contact us" className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group">
        <span className="absolute w-full h-full rounded-full bg-[#25D366] opacity-50 animate-ping group-hover:animate-none"></span>
        <MessageCircle className="w-6 h-6 relative z-10" />
      </a>
      
      <EnquiryModal open={!!enquiry} onClose={() => setEnquiry(null)} type={enquiry?.type} service="Doctor Visit" plan={enquiry?.plan} message={enquiry?.message} />
      
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </div>
  );
}
