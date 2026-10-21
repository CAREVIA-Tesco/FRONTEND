import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle, MapPin, Clock, Briefcase, Star, Play, Shield, ChevronDown, ChevronUp, ArrowRight, UserPlus, FileText, Video, Award, Heart, ShieldCheck, PhoneCall, Check } from 'lucide-react';

export default function Careers() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [calcRole, setCalcRole] = useState('physio');
  const [calcHours, setCalcHours] = useState(6);
  const [calcDays, setCalcDays] = useState(5);
  const [activeFaq, setActiveFaq] = useState(null);

  const calculateEarnings = () => {
    const rates = { physio: 400, nurse: 250, caretaker: 150, doctor: 1000 };
    return (rates[calcRole] * calcHours * calcDays * 4).toLocaleString('en-IN');
  };

  const roles = [
    { title: "Physiotherapist", icon: "🦵", req: "BPT / MPT / Diploma", earn: "₹30k - ₹70k/mo", open: "400+", perk: "Flexible slots • Choose area" },
    { title: "Home Nurse", icon: "👩‍⚕️", req: "GNM / BSc Nursing / ANM", earn: "₹25k - ₹55k/mo", open: "600+", perk: "12h or 24h shifts • Live-in" },
    { title: "Care Taker", icon: "🤝", req: "Basic training + willingness", earn: "₹18k - ₹35k/mo", open: "350+", perk: "Free training • Bonus" },
    { title: "Doctor", icon: "🩺", req: "MBBS / MD / BAMS / BHMS", earn: "₹600 - ₹1,500/visit", open: "150+", perk: "Part-time • Own hours" }
  ];

  const jobs = [
    { role: "Physio", title: "Home Physiotherapist Needed", loc: "Anna Nagar, Chennai", req: "BPT/MPT • 2+ yrs exp", shift: "Daily 2 hrs • 6 days/wk", pay: "₹25k-₹35k/mo", patient: "👵 65yo female • Post-knee" },
    { role: "Nurse", title: "24-Hour Nurse for Elderly Care", loc: "Koramangala, Bangalore", req: "GNM/BSc • 3+ yrs exp", shift: "24 hrs • 6 days/wk", pay: "₹40k-₹50k/mo", patient: "👴 78yo male • Dementia care" },
    { role: "Attendant", title: "Post-Surgery Care Attendant", loc: "Hitech City, Hyderabad", req: "Basic cert • 1+ yrs exp", shift: "12 hrs (Day) • 6 days/wk", pay: "₹22k-₹28k/mo", patient: "👨 45yo male • Ortho recovery" },
    { role: "Nurse", title: "Female Nurse (Newborn Care)", loc: "Andheri, Mumbai", req: "NICU exp preferred", shift: "12 hrs (Night) • 5 days/wk", pay: "₹35k-₹45k/mo", patient: "👶 Newborn • Premature care" },
    { role: "Doctor", title: "Doctor Home Visit (Weekend)", loc: "Gurugram, Delhi", req: "MBBS • Gen Med", shift: "Weekends • Flexible", pay: "₹800/visit", patient: "Various • Routine checks" },
    { role: "Physio", title: "Physio for Stroke Recovery", loc: "Jayanagar, Bangalore", req: "Neuro exp required", shift: "Daily 1 hr • 5 days/wk", pay: "₹30k-₹40k/mo", patient: "👨 60yo male • Post-stroke" }
  ];

  const faqs = [
    { q: "Who can apply to become a Carevaa professional?", a: "Any qualified Physiotherapist, Nurse (GNM/BSc/ANM), Doctor (MBBS/AYUSH), or trained Caretaker can apply." },
    { q: "Is there any registration fee?", a: "No, joining Carevaa is completely free. We do not charge any registration or hidden fees." },
    { q: "How soon can I start getting job assignments?", a: "Once your profile is verified and you complete the onboarding training, you can start receiving assignments within 3 days." },
    { q: "How does payment work? When do I get paid?", a: "Payments are processed weekly. You will receive your earnings directly in your bank account every Friday." },
    { q: "Can I choose which assignments to accept?", a: "Yes! You have full flexibility to accept or decline assignments based on your location preference, schedule, and expertise." }
  ];

  return (
    <div className="font-sans text-deep bg-[#FAFBFC] min-h-screen">
      <Navbar />
      
      {/* 2. Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-white to-[#FEF7F0] rounded-b-[3rem]">
        <div className="lg:w-[55%] flex flex-col items-start z-10">
          <div className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 mb-6">
            🚀 1,500+ Jobs Open Right Now
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-[60px] font-bold leading-[1.1] mb-6 font-poppins text-primary">
            Your Skills. Their Home.<br/>Better Careers Start Here.
          </h1>
          <p className="text-lg text-ink-soft mb-8 max-w-[520px]">
            Join India's fastest-growing home healthcare network. Get flexible shifts, higher earnings, and rewarding work — helping families care for the people they love.
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm font-medium text-ink-soft mb-8 bg-white py-3 px-5 rounded-2xl shadow-sm border border-gray-100">
            <span className="flex items-center gap-1">💼 1,500+ Professionals</span>
            <span className="flex items-center gap-1">💰 Earn up to ₹60,000/mo</span>
            <span className="flex items-center gap-1">🏥 200+ Hospitals</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-4">
            <button className="bg-secondary hover:bg-secondary-hover text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg flex items-center justify-center gap-2">
              🎯 Apply as a Professional
            </button>
            <button className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
              🔍 Browse Open Jobs
            </button>
          </div>
          <p className="text-sm text-ink-soft font-medium">
            ✅ Free registration • 💳 Weekly payouts • 🕐 Choose your own shifts
          </p>
        </div>
        
        <div className="lg:w-[45%] relative mt-10 lg:mt-0 w-full">
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=1000&fit=crop" alt="Smiling Nurse" className="w-full h-[600px] object-cover" />
          </div>
          <div className="absolute top-10 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-float">
            <div className="bg-green-100 p-3 rounded-full"><span className="text-xl">💰</span></div>
            <div>
              <div className="text-xs text-gray-500 font-bold uppercase">Avg. Earning</div>
              <div className="text-lg font-bold text-primary">₹45,000/month</div>
            </div>
          </div>
          <div className="absolute bottom-10 -left-6 bg-accent text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-float-delayed">
            <div className="bg-white/20 p-2 rounded-full"><Check className="w-5 h-5" /></div>
            <div className="font-bold">92% job satisfaction</div>
          </div>
        </div>
      </section>

      {/* 3. Live Stats Strip */}
      <section className="bg-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          <div><div className="text-4xl lg:text-5xl font-bold font-poppins mb-2">1,500+</div><div className="text-blue-200 font-medium">Active Professionals</div></div>
          <div><div className="text-4xl lg:text-5xl font-bold font-poppins mb-2">15,000+</div><div className="text-blue-200 font-medium">Patients Served</div></div>
          <div><div className="text-4xl lg:text-5xl font-bold font-poppins mb-2">₹45k</div><div className="text-blue-200 font-medium">Avg. Monthly Earnings</div></div>
          <div><div className="text-4xl lg:text-5xl font-bold font-poppins mb-2">20+</div><div className="text-blue-200 font-medium">Cities Hiring Now</div></div>
        </div>
      </section>

      {/* 4. Who Can Join */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins text-primary mb-4">Who Can Join Carevaa?</h2>
            <p className="text-ink-soft text-lg max-w-2xl mx-auto">We're hiring across four healthcare specializations. Find where you fit.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {roles.map((r, i) => (
              <div key={i} className="bg-[#FAFBFC] border border-gray-100 rounded-[20px] p-6 hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl relative overflow-hidden group">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl mb-6 group-hover:bg-secondary/10 transition-colors">{r.icon}</div>
                <h3 className="text-xl font-bold text-primary mb-4">{r.title}</h3>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm text-ink-soft"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> <span className="font-medium text-gray-700">Req:</span> {r.req}</li>
                  <li className="flex items-start gap-2 text-sm text-ink-soft"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> <span className="font-medium text-gray-700">Earn:</span> {r.earn}</li>
                  <li className="flex items-start gap-2 text-sm text-ink-soft"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> <span className="font-medium text-gray-700">Jobs:</span> {r.open}</li>
                  <li className="flex items-start gap-2 text-sm text-ink-soft"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> <span className="font-medium text-gray-700">Perks:</span> {r.perk}</li>
                </ul>
                <button className="text-secondary font-bold flex items-center gap-2 group-hover:gap-3 transition-all">Apply as {r.title.split(' ')[0]} <ArrowRight className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Work With Carevaa */}
      <section className="py-24 bg-[#FEF7F0] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins text-primary mb-4">Why Healthcare Professionals Choose Carevaa</h2>
            <p className="text-ink-soft text-lg max-w-2xl mx-auto">Better pay, respect, and flexibility — for the work you love.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: "Higher Earnings", d: "Earn up to 40% more than standard hospital pay rates.", i: "💰" },
              { t: "Flexible Shifts", d: "Choose 4-hour, 12-hour, or 24-hour slots that fit your life.", i: "🕐" },
              { t: "Work Near Home", d: "Pick assignments in your preferred area and reduce travel time.", i: "📍" },
              { t: "Instant Job Alerts", d: "Get new verified assignments notified directly on your phone.", i: "📱" },
              { t: "Weekly Payouts", d: "Get paid every Friday, directly to your bank account.", i: "💳" },
              { t: "Free Training", d: "Upskill with free certification courses on Carevaa Academy.", i: "🎓" },
            ].map((b, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm flex gap-4 items-start">
                <div className="text-3xl bg-orange-50 p-3 rounded-xl">{b.i}</div>
                <div>
                  <h3 className="font-bold text-primary mb-2">{b.t}</h3>
                  <p className="text-sm text-ink-soft">{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-poppins text-primary mb-4">From Registration to First Job in 5 Steps</h2>
          <p className="text-ink-soft text-lg mb-16">Get started on Carevaa in under 15 minutes</p>
          
          <div className="flex flex-col md:flex-row justify-between items-start relative">
            <div className="hidden md:block absolute top-10 left-10 right-10 h-0.5 border-t-2 border-dashed border-secondary/30 z-0"></div>
            {[
              { i: UserPlus, t: "Fill Application", d: "Basic details & experience (5 mins)" },
              { i: FileText, t: "Upload Docs", d: "Certificates, ID, address proof" },
              { i: Video, t: "Video Verification", d: "Quick 10-min call with our team" },
              { i: Award, t: "Get Certified", d: "Free onboarding training" },
              { i: Briefcase, t: "Start Earning", d: "Accept assignments and get paid" }
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center w-full md:w-1/5 mb-8 md:mb-0">
                <div className="w-20 h-20 bg-white border-4 border-secondary/20 rounded-full flex items-center justify-center text-secondary mb-4 shadow-xl">
                  <s.i className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-primary mb-2 text-center">{i+1}. {s.t}</h3>
                <p className="text-xs text-ink-soft text-center px-4">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 inline-block bg-[#ECFDF5] text-accent px-6 py-2 rounded-full font-bold text-sm">
            ⚡ Average time from apply to first job: 3 days
          </div>
        </div>
      </section>

      {/* 7. Live Job Board Preview */}
      <section className="py-24 bg-mint px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins text-primary mb-4">🔥 Open Jobs Right Now</h2>
            <p className="text-ink-soft text-lg">Fresh assignments posted every hour. Apply in one click.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {jobs.map((j, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow border-l-4 border-secondary relative group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full">{j.role} • 2h ago</span>
                  <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified Family</div>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{j.title}</h3>
                <div className="flex items-center gap-2 text-sm text-ink-soft mb-4">
                  <MapPin className="w-4 h-4 text-gray-400" /> {j.loc}
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-6 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-700"><Award className="w-4 h-4 text-blue-400"/> {j.req}</div>
                  <div className="flex items-center gap-2 text-gray-700"><Clock className="w-4 h-4 text-blue-400"/> {j.shift}</div>
                  <div className="flex items-center gap-2 text-gray-700 font-bold text-primary">💰 {j.pay}</div>
                  <div className="flex items-center gap-2 text-gray-700">{j.patient}</div>
                </div>
                
                <button className="w-full bg-white border-2 border-secondary text-secondary group-hover:bg-secondary group-hover:text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button className="bg-secondary hover:bg-secondary-hover text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg">
              See All 1,500+ Open Jobs →
            </button>
          </div>
        </div>
      </section>

      {/* 8. Earnings Calculator */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins text-primary mb-4">See How Much You Can Earn</h2>
            <p className="text-ink-soft text-lg mb-8">Adjust the sliders to estimate your monthly income on Carevaa.</p>
            
            <div className="bg-[#FAFBFC] border border-gray-200 p-8 rounded-[2rem] shadow-sm">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select your role</label>
                <select 
                  className="w-full p-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-primary outline-none"
                  value={calcRole} onChange={(e) => setCalcRole(e.target.value)}
                >
                  <option value="physio">Physiotherapist</option>
                  <option value="nurse">Home Nurse</option>
                  <option value="caretaker">Care Taker</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">Hours per day</label>
                  <span className="text-primary font-bold">{calcHours} hrs</span>
                </div>
                <input type="range" min="2" max="12" value={calcHours} onChange={(e)=>setCalcHours(e.target.value)} className="w-full accent-secondary" />
              </div>
              
              <div className="mb-10">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">Days per week</label>
                  <span className="text-primary font-bold">{calcDays} days</span>
                </div>
                <input type="range" min="1" max="7" value={calcDays} onChange={(e)=>setCalcDays(e.target.value)} className="w-full accent-secondary" />
              </div>
              
              <div className="bg-primary text-white p-6 rounded-2xl text-center relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-sm text-blue-200 font-bold uppercase tracking-wider mb-2">Estimated Monthly Earning</div>
                  <div className="text-5xl font-bold font-poppins text-secondary mb-2">₹{calculateEarnings()}</div>
                  <div className="text-xs text-blue-300">Based on average assignment rates in your city</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <img src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&h=800&fit=crop" alt="Happy Professional" className="rounded-[2rem] shadow-2xl object-cover w-full h-[600px]" />
            <div className="absolute top-10 -left-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-float">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex justify-center items-center">👩‍⚕️</div>
              <div className="text-sm font-bold text-gray-800">Nurse Kavitha earns ₹52k/mo</div>
            </div>
            <div className="absolute bottom-20 -right-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-float-delayed">
              <div className="w-10 h-10 rounded-full bg-green-100 flex justify-center items-center">💪</div>
              <div className="text-sm font-bold text-gray-800">Physio Ramesh earns ₹65k/mo</div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Application Form Preview */}
      <section className="py-24 bg-[#FEF2F2] px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold font-poppins text-primary mb-4">Apply in 3 Minutes</h2>
          <p className="text-ink-soft text-lg">Fill this quick form to start your Carevaa journey</p>
        </div>
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-xl">
          <div className="flex items-center justify-between mb-8 text-xs font-bold text-gray-400">
            <span className="text-secondary">Step 1</span><span>Step 2</span><span>Step 3</span><span>Step 4</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden"><div className="w-1/4 bg-secondary h-full"></div></div>
          
          <form className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label><input type="text" className="w-full p-4 rounded-xl border bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-secondary" placeholder="Enter name" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label><input type="tel" className="w-full p-4 rounded-xl border bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-secondary" placeholder="+91 00000 00000" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">I am a...</label><select className="w-full p-4 rounded-xl border bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-secondary"><option>Physiotherapist</option><option>Nurse</option></select></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">City</label><select className="w-full p-4 rounded-xl border bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-secondary"><option>Chennai</option><option>Bangalore</option></select></div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Upload Resume / Certificate</label>
              <div className="border-2 border-dashed border-secondary/40 rounded-xl p-8 text-center bg-[#FEF2F2]/30 cursor-pointer hover:bg-[#FEF2F2] transition">
                <div className="text-secondary font-bold">Click to upload or drag & drop</div>
                <div className="text-xs text-gray-500 mt-1">PDF, DOCX up to 5MB</div>
              </div>
            </div>
            <button type="button" className="w-full bg-secondary hover:bg-secondary-hover text-white py-4 rounded-xl font-bold text-lg transition shadow-md">
              Continue to Verification →
            </button>
            <p className="text-center text-xs text-gray-500 font-medium">🔒 Your data is 100% secure and never shared</p>
          </form>
        </div>
      </section>

      {/* 11. Academy */}
      <section className="py-24 bg-mint px-4 sm:px-6 lg:px-8 border-t border-blue-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-bold inline-flex items-center gap-2 mb-6">🎓 Learn. Grow. Earn More.</div>
            <h2 className="text-3xl md:text-5xl font-bold font-poppins text-primary mb-6">Free Training with Carevaa Academy</h2>
            <p className="text-ink-soft text-lg mb-8">Upskill with certified online courses and earn premium badges that unlock higher-paying assignments.</p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-gray-700 font-medium"><div className="bg-white p-1 rounded-full text-secondary"><Check className="w-4 h-4"/></div> 40+ free courses (basic care to ICU nursing)</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><div className="bg-white p-1 rounded-full text-secondary"><Check className="w-4 h-4"/></div> Skill certification badges</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><div className="bg-white p-1 rounded-full text-secondary"><Check className="w-4 h-4"/></div> Live workshops with senior doctors</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><div className="bg-white p-1 rounded-full text-secondary"><Check className="w-4 h-4"/></div> Certified professionals earn 30% more</li>
            </ul>
            <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition">Explore Free Courses →</button>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer aspect-video bg-gray-900">
              <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=450&fit=crop" className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition"><Play className="w-8 h-8 ml-1" /></div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-white font-bold text-lg">Watch: How Nurse Priya doubled her income with Carevaa Academy</div>
            </div>
          </div>
        </div>
      </section>

      {/* 14. FAQ */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins text-primary mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button 
                  className="w-full p-6 text-left font-bold text-primary flex justify-between items-center bg-[#FAFBFC] hover:bg-gray-50 transition"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  {faq.q}
                  {activeFaq === i ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {activeFaq === i && (
                  <div className="p-6 bg-white text-ink-soft border-t border-gray-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 17. Big CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-secondary to-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-[44px] font-bold font-poppins mb-6 leading-tight">Your Best Career in Healthcare Starts Here.</h2>
          <p className="text-xl text-white/90 mb-10">Join 1,500+ trusted professionals already earning more with Carevaa.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <button className="bg-white text-primary hover:bg-gray-100 px-10 py-4 rounded-xl font-bold text-lg shadow-lg">🎯 Apply Now — It's Free</button>
            <button className="border-2 border-white text-white hover:bg-white/10 px-10 py-4 rounded-xl font-bold text-lg transition">💬 WhatsApp Us Your CV</button>
          </div>
          <p className="text-sm font-medium text-white/80">⚡ Get your first job within 3 days of joining</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-white/10 pb-12">
          <div>
            <div className="text-2xl font-bold font-poppins mb-4 flex items-center gap-2 text-white"><Heart className="w-6 h-6 text-secondary" /> carevaa</div>
            <p className="text-gray-400 text-sm mb-6">Quality healthcare, delivered.</p>
          </div>
          <div><h4 className="font-bold mb-4 text-white">For Patients</h4><ul className="space-y-3 text-sm text-gray-400"><li>Physiotherapy</li><li>Baby Care</li><li>Care Taker</li><li>Doctor Visit</li></ul></div>
          <div><h4 className="font-bold mb-4 text-white">For Professionals</h4><ul className="space-y-3 text-sm text-gray-400"><li>Apply Now</li><li>Browse Jobs</li><li>Carevaa Academy</li><li>Login</li></ul></div>
          <div><h4 className="font-bold mb-4 text-white">Company</h4><ul className="space-y-3 text-sm text-gray-400"><li>About Us</li><li>Careers</li><li>Blog</li><li>Contact</li></ul></div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2026 Carevaa. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0"><span>Privacy Policy</span><span>Terms</span><span>Refund Policy</span></div>
        </div>
      </footer>
    </div>
  );
}
