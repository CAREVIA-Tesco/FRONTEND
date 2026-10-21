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
import BookingModal from '../components/BookingModal';
import EnquiryModal from '../components/EnquiryModal';
import { useContact } from '../services/useSiteContent';
import AnimatedCTA from '../components/AnimatedCTA';

export default function CareTaker() {
  const liveStats = serviceStats(usePublicStats(), 'care-taker', false);
  const pricingRules = usePricingRules();
  const prices = packagePrices(liveStats?.minFee, pricingRules);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [enquiry, setEnquiry] = useState(null);
  const contact = useContact();
  const chatOnWhatsApp = () => (contact.whatsappHref ? window.open(contact.whatsappHref, '_blank', 'noopener') : setEnquiry({}));
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const conditions = [
    { icon: "👴", name: "Elderly Companionship", desc: "Friendly support for seniors" },
    { icon: "🛏️", name: "Bedridden Assistance", desc: "Turning, feeding, and hygiene" },
    { icon: "🚶", name: "Mobility Support", desc: "Help with walking & movement" },
    { icon: "💊", name: "Medication Reminders", desc: "Timely medicine management" },
    { icon: "🛁", name: "Personal Hygiene", desc: "Bathing and grooming help" },
    { icon: "🍎", name: "Feeding Assistance", desc: "Meal preparation and feeding" },
    { icon: "🏥", name: "Hospital Escort", desc: "Accompanying to appointments" },
    { icon: "🛒", name: "Basic Errands", desc: "Light errands & organization" }
  ];

  const exercises = [
    { title: "Pelvic Tilts", desc: "Lie on back, tighten abdominals, tilt pelvis. Hold 5s × 10 reps." },
    { title: "Knee-to-Chest Stretch", desc: "Pull one knee to chest, hold 30s, switch legs." },
    { title: "Cat-Cow Stretch", desc: "On all fours, arch and round back slowly × 10 reps." },
    { title: "Bird Dog", desc: "Extend opposite arm and leg from hands-and-knees × 10 each." }
  ];

  const faqs = [
    { q: "How quickly can a care taker visit my home?", a: "We can arrange a caregiver within 12-24 hours depending on your requirements. Same-day slots may be available." },
    { q: "What equipment does the care taker bring?", a: "Our care takers bring necessary basic medical kits. For specialized ICU setups, we help arrange equipment separately, and basic assessment tools." },
    { q: "Do I need a doctor's prescription to book?", a: "No, you don't need a prescription for an initial assessment, though it's helpful if you have one." },
    { q: "Can I book a session for my elderly parents remotely?", a: "Absolutely! You can manage bookings and track progress on behalf of your family members." }
  ];

  return (
    <div className="theme-portea font-sans text-primary bg-[#FAFBFC] min-h-screen relative overflow-x-clip selection:bg-primary selection:text-white">
      <SiteHeader />
      {/* 2. Hero Section */}
      <section className="pt-32 pb-20 lg:pt-44 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-white to-tint overflow-hidden">
        <div className="lg:w-[55%] flex flex-col items-start z-10">
          <div className="bg-secondary/5 text-secondary px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 mb-6 border border-secondary/20">
            🏠 Certified Care Takers at Your Doorstep
          </div>
          <div className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-2">
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight className="w-3 h-3" /> 
            <span className="hover:text-primary cursor-pointer">Services</span> <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Care Taker</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] mb-6 font-poppins text-primary">
            Reliable Care Taker Services,<br/>Right Where You Belong.
          </h1>
          <p className="text-lg text-[#5A6478] mb-8 max-w-[500px] leading-relaxed">
            Get comprehensive daily living support and companionship from verified care takers. Giving you peace of mind while your loved ones are well cared for.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-10 items-center text-sm font-medium text-primary">
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm"><span className="text-green-500">✅</span> {liveStats ? plural(liveStats.providers, 'Certified Care Taker', 'Certified Care Takers') : '...'}</span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm"><span className="text-yellow-400">⭐</span> {liveStats?.rating ? `${liveStats.rating} Rated` : 'New'}</span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm">🏥 {liveStats ? `${liveStats.visits.toLocaleString('en-IN')} ${liveStats.visits === 1 ? 'Visit' : 'Visits'} Completed` : '...'}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full sm:w-auto">
            <AnimatedCTA onClick={() => setIsBookingModalOpen(true)}>Book a Session</AnimatedCTA>
            <button type="button" onClick={() => setEnquiry({})} className="bg-transparent border-2 border-primary text-primary hover:bg-tint px-6 py-3 rounded-xl font-medium text-base transition flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> Talk to a Care Taker Now
            </button>
          </div>
          
          <p className="text-sm text-[#5A6478]">
            🕐 Same-day slots • 💳 Pay after service • 🛡️ 100% verified
          </p>
        </div>
        
        <div className="lg:w-[45%] relative mt-10 lg:mt-0 w-full">
          <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(30,58,138,0.15)] animate-[float_4s_ease-in-out_infinite]">
            <img 
              src="/caretaker-hero.png" 
              alt="Care Taker treating patient at home" 
              className="w-full h-[550px] object-cover"
            />
          </div>


        </div>
      </section>

      {/* 3. Quick Info Strip */}
      <section className="bg-secondary/5 py-10 border-y border-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">💰</span>
              <h4 className="font-bold text-primary mb-1">Starting Price</h4>
              <p className="text-sm text-[#5A6478]">{prices ? `${inr(prices.single)} per session` : 'Price on request'}</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">⚡</span>
              <h4 className="font-bold text-primary mb-1">Slot Availability</h4>
              <p className="text-sm text-[#5A6478]">Same-day booking</p>
            </div>
          
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">✅</span>
              <h4 className="font-bold text-primary mb-1">100% Verified Profile</h4>
              <p className="text-sm text-[#5A6478]">Background checked</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">💯</span>
              <h4 className="font-bold text-primary mb-1">100% Refund Provided</h4>
              <p className="text-sm text-[#5A6478]">Money-back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. About Care Taker */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-[60%]">
            <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary mb-6 leading-tight">
              Care Takers You Can Trust
            </h2>
            <p className="text-lg text-[#5A6478] mb-6 leading-relaxed">
              We bring clinical excellence straight to your living room. Whether you're managing chronic pain, recovering from joint replacement surgery, or dealing with age-related mobility issues, our <span className="text-secondary font-medium">real recovery without leaving your home</span> approach ensures you heal faster and safer.
            </p>
            <p className="text-lg text-[#5A6478] mb-8 leading-relaxed">
              Carevia connects you with compassionate, background-checked care takers who provide dedicated round-the-clock or part-time support for your family.
            </p>
            
            <ul className="space-y-4">
              {["No travel or waiting rooms", "Personalized 1-on-1 sessions", "Family-friendly scheduling"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg text-primary font-medium">
                  <span className="text-secondary">✔</span> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:w-[40%] relative">
            <div className="absolute inset-0 bg-tint rounded-[40px] transform rotate-3 scale-105 -z-10"></div>
            <img 
              src="/caretaker-section.png" 
              alt="Care Taker session" 
              className="rounded-[32px] shadow-2xl object-cover w-full h-[450px]"
            />
          </div>
        </div>
      </section>

      {/* 5. Conditions We Treat */}
      <section className="py-24 bg-tint">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary mb-4">How Our Care Takers Can Help</h2>
            <p className="text-lg text-[#5A6478]">Certified expertise across musculoskeletal, neurological, and post-surgical care</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {conditions.map((cond, i) => (
              <div key={i} className="bg-white p-6 rounded-[20px] shadow-sm hover:shadow-[0_8px_30px_rgba(30,58,138,0.12)] transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer border border-transparent hover:border-tint">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${i % 2 === 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                  {cond.icon}
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{cond.name}</h3>
                <p className="text-sm text-[#5A6478] mb-4">{cond.desc}</p>
                <button type="button" onClick={() => setEnquiry({ message: `I need help with ${cond.name}.` })} className="text-secondary font-medium flex items-center gap-1 text-sm hover:gap-2 transition-all">
                  Ask an Expert <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Pricing Section */}
      <section className="py-24 bg-tint relative border-t border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-[40px] font-semibold font-poppins text-primary mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-[#5A6478]">No hidden fees. Save more with packages.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            {/* Single Session */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-2">Single Session</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-primary">{inr(prices?.single)}</span>
                <span className="text-[#5A6478]">/ session</span>
              </div>
              <p className="text-sm text-[#5A6478] mb-8 pb-8 border-b border-gray-100">Perfect for one-time care</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" /> 45-min home session</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" /> Free initial assessment</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" /> Personalized exercise plan</li>
              </ul>
              <button type="button" onClick={() => setIsBookingModalOpen(true)} className="w-full bg-transparent border-2 border-primary text-primary hover:bg-tint py-3 rounded-xl font-semibold transition">
                Book Single Session
              </button>
            </div>
            
            {/* 10 Session Pack */}
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-secondary relative transform lg:-translate-y-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-md">
                ⭐ Most Popular
              </div>
              <h3 className="text-xl font-bold text-primary mb-2 mt-2">{prices?.packSessions || 10} Session Pack</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-primary">{inr(prices?.pack)}</span>
                <span className="text-[#5A6478]">/ {prices?.packSessions || 10} sessions</span>
              </div>
              <p className="text-sm font-medium text-secondary mb-8 pb-8 border-b border-gray-100">{prices ? `Save ${inr(prices.packSaving)} (${inr(prices.perSession)}/session)` : ''}</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-2 text-sm text-primary font-medium"><CheckCircle className="w-5 h-5 text-secondary shrink-0" /> Everything in Single</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" /> Progress tracking dashboard</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" /> Priority scheduling</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" /> Free follow-up call</li>
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
                <span className="text-[#5A6478]">/ month</span>
              </div>
              <p className="text-sm text-[#5A6478] mb-8 pb-8 border-b border-gray-100">Unlimited sessions</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" /> Everything in 10-Session</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" /> Dedicated care taker</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" /> Free weekly progress review</li>
                <li className="flex items-start gap-2 text-sm text-primary"><CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" /> WhatsApp support</li>
              </ul>
              <button type="button" onClick={() => setEnquiry({ type: 'plan', plan: `Monthly Care Plan${prices ? ` (${inr(prices.monthly)}/month)` : ''}` })} className="w-full bg-transparent border-2 border-primary text-primary hover:bg-tint py-3 rounded-xl font-semibold transition">
                Start Monthly Plan
              </button>
            </div>
          </div>
          
          <div className="text-center mt-10 text-sm text-[#5A6478] flex items-center justify-center gap-4 flex-wrap">
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
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">Book a certified care taker to visit your home today. Same-day slots available.</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button type="button" onClick={() => setIsBookingModalOpen(true)} className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-lg">
                📱 Book Care Taker Now
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
      
      <EnquiryModal open={!!enquiry} onClose={() => setEnquiry(null)} type={enquiry?.type} service="Care Taker" plan={enquiry?.plan} message={enquiry?.message} />
      
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} serviceType="care-taker" />
    </div>
  );
}
