import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle, Star, Users, MapPin, Search, Activity, Shield, Clock, Phone, ChevronDown, ChevronUp, UserCheck, Heart, Award, ArrowRight, Home } from 'lucide-react';

export default function Hire() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { icon: <UserCheck className="w-8 h-8" />, num: "1,500+", text: "Verified Professionals" },
    { icon: <Heart className="w-8 h-8" />, num: "15,000+", text: "Families Served" },
    { icon: <Clock className="w-8 h-8" />, num: "4 hrs", text: "Average Deployment" },
    { icon: <Star className="w-8 h-8 text-yellow-400 fill-current" />, num: "4.9 / 5", text: "Family Satisfaction" }
  ];

  const profiles = [
    { name: "Nurse Kavitha M.", role: "Home Nurse — GNM, 6 years", tags: "Post-op • Elderly Care", price: "₹1,800/day", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop", rating: "4.9", reviews: 240, langs: "English, Tamil" },
    { name: "Dr. Anish Sharma", role: "General Physician, 10 years", tags: "Consultations • Vitals", price: "₹600/visit", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop", rating: "4.8", reviews: 120, langs: "English, Hindi" },
    { name: "Sunitha R.", role: "Care Taker, 4 years", tags: "Elderly Care • Mobility", price: "₹800/day", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop", rating: "4.9", reviews: 180, langs: "Telugu, Hindi" },
    { name: "Rajesh Kumar", role: "Physiotherapist — MPT, 5 years", tags: "Sports Injury • Post-op", price: "₹500/hr", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop", rating: "5.0", reviews: 310, langs: "English, Hindi" },
    { name: "Nurse Priya T.", role: "Home Nurse — BSc, 8 years", tags: "ICU setup • Wound Care", price: "₹2,200/day", img: "https://images.unsplash.com/photo-1582750433449-648ed127c09e?w=150&h=150&fit=crop", rating: "4.9", reviews: 155, langs: "English, Kannada" },
    { name: "Lakshmi N.", role: "Care Taker, 7 years", tags: "Companionship • Dementia", price: "₹900/day", img: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=150&h=150&fit=crop", rating: "4.7", reviews: 90, langs: "Tamil, English" }
  ];

  const faqs = [
    { q: "How fast can I hire a professional?", a: "Once you post a requirement, you will get matched with profiles in 30 minutes, and the professional can reach your home within 4 hours." },
    { q: "Are all professionals verified?", a: "Yes. Every professional undergoes a strict 5-step background check, including police verification and clinical skill assessment." },
    { q: "Can I request a female caregiver?", a: "Absolutely. You can specify gender preferences while posting your requirement, and we will match you accordingly." },
    { q: "What if I'm unhappy with the professional?", a: "We offer a 100% backup guarantee. If you are unsatisfied, we will provide a replacement professional within 6 hours." },
    { q: "How does payment work?", a: "You pay securely through our platform only after the service is rendered. We support cards, UPI, and net banking." },
    { q: "Do you provide medical equipment (bed, oxygen)?", a: "Yes, we offer medical equipment rentals including ICU beds, oxygen concentrators, and wheelchairs at an additional cost." },
    { q: "Can I hire for short-term (2–3 days) needs?", a: "Yes, you can hire professionals for a few hours, a few days, or long-term monthly assignments based on your exact needs." },
    { q: "What if the professional falls sick?", a: "Our backup guarantee covers sick leaves. We will immediately arrange a temporary or permanent replacement without disrupting your care." }
  ];

  return (
    <div className="font-sans text-primary bg-[#FAFBFC] min-h-screen">
      <Navbar />

      {/* 2. Hero Section */}
      <section className="pt-32 pb-40 lg:pt-40 lg:pb-48 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-[#FEF7F0] relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="lg:w-[55%] flex flex-col items-start">
            <div className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 mb-6">
              <Home className="w-4 h-4" /> Hire in Under 4 Hours
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[60px] font-bold leading-[1.1] mb-6 font-poppins text-primary">
              Hire Trusted Healthcare Professionals, Direct to Your Home.
            </h1>
            <p className="text-lg text-ink-soft mb-8 max-w-xl">
              Post your requirement and get matched with verified physiotherapists, nurses, care takers, and doctors — all background-checked and rated by real families.
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-accent mb-8">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 1,500+ Verified Pros</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-current" /> 4.9 Rated</span>
              <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> 15,000+ Families</span>
            </div>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 mb-6">
              <button className="bg-secondary hover:bg-secondary-hover text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg w-full sm:w-auto">
                📋 Post Your Requirement
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition w-full sm:w-auto">
                📞 Talk to a Care Advisor
              </button>
            </div>
            <p className="text-sm text-ink-soft font-medium flex gap-3 flex-wrap">
              <span>🕐 Pro at your home in 4 hours</span> • 
              <span>💳 Pay after service</span> • 
              <span>🛡️ Fully insured</span>
            </p>
          </div>
          
          <div className="lg:w-[45%] relative w-full mt-10 lg:mt-0">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=800&fit=crop" alt="Nurse with family" className="w-full h-auto object-cover" />
            </div>
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-1 z-20 hidden md:flex">
              <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star className="w-4 h-4 fill-current" /> 4.9 / 5</span>
              <span className="text-xs text-gray-500 font-medium">15,000+ families trust us</span>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-accent text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold z-20 hidden md:flex">
              <CheckCircle className="w-5 h-5" /> Verified in 4 hours
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Hire Form (overlaps hero) */}
      <section className="relative z-20 -mt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 md:p-8">
          <h2 className="text-xl font-bold text-center mb-6 text-primary">Tell us what you need — we'll match a professional in minutes</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <select className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium text-gray-700 appearance-none">
              <option value="">I need a…</option>
              <option>Physiotherapist</option>
              <option>Home Nurse</option>
              <option>Care Taker</option>
              <option>Doctor</option>
            </select>
            <select className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium text-gray-700 appearance-none">
              <option value="">For…</option>
              <option>Elderly Care</option>
              <option>Post-Surgery</option>
              <option>Chronic Illness</option>
              <option>Newborn Care</option>
              <option>Other</option>
            </select>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Your City / Pincode" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium text-gray-700" />
            </div>
            <select className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium text-gray-700 appearance-none">
              <option value="">Duration</option>
              <option>Few hours</option>
              <option>Days</option>
              <option>Weeks</option>
              <option>Months</option>
            </select>
            <button className="bg-secondary hover:bg-secondary-hover text-white rounded-xl px-8 py-3.5 font-bold shadow-md md:w-auto w-full whitespace-nowrap">
              🔍 Find Professionals →
            </button>
          </div>
          <p className="text-center text-sm text-ink-soft font-medium">
            🔒 Free to post • No obligation • Get 3+ matches in 30 minutes
          </p>
        </div>
      </section>

      {/* 4. Live Stats Strip */}
      <section className="bg-primary text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-white/20">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center">
                <div className="text-secondary mb-3 bg-white/10 p-3 rounded-full">{stat.icon}</div>
                <div className="text-3xl font-bold font-poppins mb-1">{stat.num}</div>
                <div className="text-sm text-blue-200 font-medium">{stat.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Who You Can Hire */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary mb-4">Hire the Right Professional for Your Family</h2>
            <p className="text-lg text-ink-soft max-w-2xl mx-auto">Every professional is licensed, background-verified, and rated by families like yours.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Physiotherapist 🦵", desc: "For pain, injury & post-op recovery", price: "Starting ₹500/session", count: "400+ available in your city", cta: "Hire a Physio", bg: "bg-blue-50" },
              { title: "Home Nurse 👩‍⚕️", desc: "For medical care — injections, wound care, ICU-level", price: "Starting ₹1,800/day", count: "600+ available", cta: "Hire a Nurse", bg: "bg-red-50" },
              { title: "Care Taker 🤝", desc: "For elderly support, daily care & companionship", price: "Starting ₹800/day", count: "350+ available", cta: "Hire a Care Taker", bg: "bg-yellow-50" },
              { title: "Doctor Visit 🩺", desc: "For consultations, prescriptions & home checkups", price: "Starting ₹600/visit", count: "150+ available", cta: "Hire a Doctor", bg: "bg-green-50" }
            ].map((svc, i) => (
              <div key={i} className={`rounded-[24px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition flex flex-col h-full ${svc.bg}`}>
                <h3 className="text-2xl font-bold text-primary mb-3">{svc.title}</h3>
                <p className="text-ink-soft mb-6 flex-grow font-medium">{svc.desc}</p>
                <div className="bg-white p-4 rounded-xl mb-6 shadow-sm">
                  <div className="font-bold text-lg text-primary">{svc.price}</div>
                  <div className="text-sm text-accent font-semibold">{svc.count}</div>
                </div>
                <button className="w-full bg-white border-2 border-secondary text-secondary hover:bg-secondary hover:text-white py-3 rounded-xl font-bold transition flex justify-center items-center gap-2">
                  {svc.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Browse Available Professionals */}
      <section className="py-24 bg-mint px-4 sm:px-6 lg:px-8 border-y border-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary mb-4">👥 Browse Available Professionals Near You</h2>
            <p className="text-lg text-ink-soft">Real profiles, real ratings — pick who visits your home</p>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-10 flex flex-wrap gap-4 items-center justify-between border border-blue-50">
            <div className="flex flex-wrap gap-4 flex-1">
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-secondary/50 outline-none">
                <option>All Roles</option><option>Nurse</option><option>Physio</option>
              </select>
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-secondary/50 outline-none">
                <option>City</option><option>Mumbai</option><option>Delhi</option>
              </select>
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-secondary/50 outline-none">
                <option>Any Gender</option><option>Female</option><option>Male</option>
              </select>
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-secondary/50 outline-none">
                <option>Language</option><option>English</option><option>Hindi</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer bg-green-50 px-4 py-2 rounded-lg border border-green-100">
              <input type="checkbox" className="w-4 h-4 text-green-500 rounded border-gray-300 focus:ring-green-500" defaultChecked />
              Available Today
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((pro, i) => (
              <div key={i} className="bg-white rounded-[20px] p-6 shadow-sm hover:shadow-xl transition hover:-translate-y-1 border border-gray-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img src={pro.img} alt={pro.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                    <div className="absolute -bottom-1 -right-1 bg-accent text-white p-0.5 rounded-full border-2 border-white">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary leading-tight">{pro.name}</h3>
                    <p className="text-sm text-secondary font-semibold">{pro.role}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs font-bold text-gray-500">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" /> {pro.rating} <span className="font-medium">({pro.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expertise:</span>
                    <span className="font-semibold text-gray-800">{pro.tags}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Languages:</span>
                    <span className="font-semibold text-gray-800">{pro.langs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rates:</span>
                    <span className="font-bold text-primary">{pro.price}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-bold text-accent flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span> Available Today</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-xl font-bold text-sm transition">View Profile</button>
                  <button className="flex-1 bg-secondary hover:bg-secondary-hover text-white py-2.5 rounded-xl font-bold text-sm transition shadow-md">Hire Now</button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="text-secondary font-bold hover:underline flex items-center gap-2 mx-auto">
              See All 1,500+ Professionals <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. How Hiring Works */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-center text-primary mb-16">Hire in 4 Simple Steps</h2>
          
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-secondary/30 -translate-y-1/2 z-0"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: "1", title: "Post Requirement", desc: "Tell us the care you need" },
                { step: "2", title: "Get Matched", desc: "We send 3+ verified profiles in 30 mins" },
                { step: "3", title: "Choose Your Pro", desc: "Review profiles, ratings, and prices" },
                { step: "4", title: "Care Arrives", desc: "Verified pro at your home in 4 hours" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center bg-white">
                  <div className="w-16 h-16 rounded-full bg-secondary text-white font-bold text-2xl flex items-center justify-center mb-6 shadow-xl ring-8 ring-white">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-ink-soft font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Why Families Trust */}
      <section className="py-24 bg-[#FEF7F0] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary mb-4">Why Families Trust Carevaa</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "All Verified", desc: "Certificates, ID, and background checks fully completed.", icon: "🎓" },
              { title: "Backup Guarantee", desc: "Replacement pro arranged in 6 hours if yours is unavailable.", icon: "🔁" },
              { title: "Transparent Pricing", desc: "Zero hidden charges. You only pay after the service.", icon: "💰" },
              { title: "Family Dashboard", desc: "Track daily vitals, care logs, and updates easily via app.", icon: "📱" },
              { title: "Fully Insured", desc: "Every professional is covered under our insurance policy.", icon: "🛡️" },
              { title: "24/7 Support", desc: "Dedicated care coordinator always available for assistance.", icon: "💬" }
            ].map((b, i) => (
              <div key={i} className="bg-white p-6 rounded-[20px] shadow-sm flex items-start gap-4 hover:shadow-md transition">
                <div className="text-4xl bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">{b.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-primary mb-1">{b.title}</h3>
                  <p className="text-sm text-ink-soft font-medium leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Pricing Table */}
      <section className="py-24 bg-mint px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-center text-primary mb-12">Transparent Hiring Costs</h2>
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-blue-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-5 font-bold text-lg">Professional</th>
                  <th className="p-5 font-bold text-lg">Hourly</th>
                  <th className="p-5 font-bold text-lg">Daily</th>
                  <th className="p-5 font-bold text-lg">Monthly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                <tr className="hover:bg-blue-50/50 transition">
                  <td className="p-5 text-primary font-bold">Physiotherapist</td>
                  <td className="p-5 text-gray-700">₹500/hr</td>
                  <td className="p-5 text-gray-400">—</td>
                  <td className="p-5 text-gray-700">₹4,500 (10 sessions)</td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition">
                  <td className="p-5 text-primary font-bold">Home Nurse (GNM)</td>
                  <td className="p-5 text-gray-400">—</td>
                  <td className="p-5 text-gray-700">₹1,800/day</td>
                  <td className="p-5 text-gray-700">₹45,000 (24-hr)</td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition">
                  <td className="p-5 text-primary font-bold">Care Taker</td>
                  <td className="p-5 text-gray-400">—</td>
                  <td className="p-5 text-gray-700">₹800/day</td>
                  <td className="p-5 text-gray-700">₹22,000 (24-hr)</td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition">
                  <td className="p-5 text-primary font-bold">Doctor Visit</td>
                  <td className="p-5 text-gray-700">₹600/visit</td>
                  <td className="p-5 text-gray-400">—</td>
                  <td className="p-5 text-gray-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm font-bold text-ink-soft mt-6 flex justify-center gap-6">
            <span>💳 EMI available on monthly plans</span>
            <span>🛡️ Insurance claims supported</span>
          </p>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-center text-primary mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left font-bold text-primary flex justify-between items-center hover:bg-gray-100 transition"
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-1 text-gray-600 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Big CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-10">
        <div className="bg-gradient-to-r from-secondary to-primary rounded-[2rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <h2 className="text-3xl md:text-5xl font-bold font-poppins mb-4 relative z-10">Ready to Hire Compassionate Care?</h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto relative z-10 font-medium">
            Post your requirement and get verified matches in 30 minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button className="bg-white text-primary hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg">
              📋 Post Requirement
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg">
              💬 WhatsApp Us
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 font-medium">© 2024 Carevaa. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:hidden z-50">
        <button className="w-full bg-secondary text-white py-3.5 rounded-xl font-bold shadow-md">
          Post Requirement
        </button>
      </div>
    </div>
  );
}
