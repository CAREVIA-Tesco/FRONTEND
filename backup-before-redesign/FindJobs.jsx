import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  MapPin, Clock, Briefcase, Heart, Stethoscope, Leaf, HeartPulse, 
  Activity, ArrowRight, User, Mail, Phone, Map
} from 'lucide-react';

export default function FindJobs() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const emptyApplication = { name: '', phone: '', email: '', role: 'Select Role', city: '', experience: '', about: '' };
  const [application, setApplication] = useState(emptyApplication);
  const [submitState, setSubmitState] = useState({ loading: false, error: '', success: '' });
  const setField = (key) => (e) => setApplication((a) => ({ ...a, [key]: e.target.value }));

  const handleApply = async (e) => {
    e.preventDefault();
    if (!application.name.trim() || !application.phone.trim()) {
      setSubmitState({ loading: false, error: 'Please enter your full name and mobile number.', success: '' });
      return;
    }
    if (application.role === 'Select Role') {
      setSubmitState({ loading: false, error: 'Please select the role you are applying for.', success: '' });
      return;
    }
    setSubmitState({ loading: true, error: '', success: '' });
    try {
      await api.applyForJob({ ...application, source: 'jobs' });
      setApplication(emptyApplication);
      setSubmitState({ loading: false, error: '', success: 'Thank you! Your application has been submitted. Our team will contact you soon.' });
    } catch (err) {
      setSubmitState({ loading: false, error: err.message, success: '' });
    }
  };

  // Job openings are stored in the database (GET /api/content/jobs)
  const ICONS = { Activity, Heart, User, Stethoscope, Leaf, HeartPulse };
  const ACCENTS = {
    blue: { icon: 'text-blue-500', bg: 'bg-blue-50', badge: 'text-blue-600' },
    rose: { icon: 'text-rose-500', bg: 'bg-rose-50', badge: 'text-rose-600' },
    amber: { icon: 'text-amber-500', bg: 'bg-amber-50', badge: 'text-amber-600' },
    indigo: { icon: 'text-indigo-500', bg: 'bg-indigo-50', badge: 'text-indigo-600' },
    emerald: { icon: 'text-emerald-500', bg: 'bg-emerald-50', badge: 'text-emerald-600' },
    teal: { icon: 'text-teal-500', bg: 'bg-teal-50', badge: 'text-teal-600' },
  };
  const [jobOpenings, setJobOpenings] = useState([]);
  useEffect(() => {
    api.getContent('jobs').then((d) => setJobOpenings(d.items || [])).catch(() => setJobOpenings([]));
  }, []);
  const jobs = jobOpenings.map((job) => {
    const accent = ACCENTS[job.accent] || ACCENTS.blue;
    const Icon = ICONS[job.icon] || Activity;
    return { ...job, icon: <Icon className={`w-5 h-5 ${accent.icon}`} />, iconBg: accent.bg, badgeBg: accent.bg, badgeText: accent.badge };
  });

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="min-h-[calc(100vh-80px)] flex items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="lg:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold font-poppins text-[#1E3A8A] leading-[1.1] mb-6">
              Build Your Career With Carevia
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed">
              Join a team of expert healthcare professionals—shaping the future of home care with medical integrity, compassion, and innovation.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#hiring" className="bg-[#E87070] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#d66161] transition shadow-md">
                Apply Now
              </a>
              <a href="#hiring" className="bg-transparent border-2 border-[#1E3A8A] text-[#1E3A8A] px-8 py-3.5 rounded-full font-bold hover:bg-[#F0F4FF] transition">
                Explore Jobs
              </a>
            </div>
          </div>

          <div className="lg:w-1/2 w-full transform translate-y-8">
            <div className="h-[450px] rounded-[32px] overflow-hidden shadow-2xl relative border-4 border-white">
              <img src="/career-hero.jpg" alt="Carevia Team" className="w-full h-full object-cover object-center" />
              
            </div>
          </div>

        </div>
      </section>

      {/* 2. Now Hiring Section */}
      <section id="hiring" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#E87070] mb-16 font-poppins">Now Hiring</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.length === 0 && <p className="col-span-full text-center text-gray-500">No open positions right now. Please check back soon.</p>}
            {jobs.map((job, idx) => (
              <div key={idx} className="bg-white rounded-[24px] p-7 shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl ${job.iconBg} flex items-center justify-center shadow-sm`}>
                    {job.icon}
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${job.badgeBg} ${job.badgeText}`}>
                    {job.category}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.loc}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {job.time}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">{job.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-8 flex-grow">
                  {job.desc}
                </p>

                <a href="#apply" onClick={() => setApplication((a) => ({ ...a, role: job.title }))} className="w-full py-3.5 rounded-xl border-2 border-gray-100 text-gray-600 font-bold text-sm text-center hover:border-[#E87070] hover:text-[#E87070] transition block mt-auto">
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Apply Form Section */}
      <section id="apply" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#F8F9FA] rounded-[40px] p-8 md:p-16 flex flex-col lg:flex-row gap-16 items-start">
          
          <div className="lg:w-[45%]">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-[#1E3A8A] mb-4">Apply for Your Dream Role</h2>
            <p className="text-gray-600 mb-10 leading-relaxed">
              Join Carevia and build the future with us. We value compassion, safety, and medical excellence in every home we serve.
            </p>
            <div className="rounded-[32px] overflow-hidden shadow-2xl h-[350px]">
              <img src="/homecare-hero.png" alt="Apply Now" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="lg:w-[55%] w-full">
            <form onSubmit={handleApply} className="bg-white p-8 md:p-10 rounded-[32px] shadow-xl border border-gray-50 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" value={application.name} onChange={setField('name')} placeholder="John Doe" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#E87070] outline-none text-sm font-medium transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                  <input type="tel" value={application.phone} onChange={setField('phone')} placeholder="+91 98765 43210" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#E87070] outline-none text-sm font-medium transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" value={application.email} onChange={setField('email')} placeholder="john@example.com" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#E87070] outline-none text-sm font-medium transition" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Applying Role</label>
                  <select value={application.role} onChange={setField('role')} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#E87070] outline-none text-sm font-medium text-gray-700 transition appearance-none">
                    <option>Select Role</option>
                    {[...new Set(jobOpenings.map((jb) => jb.title))].map((title) => <option key={title}>{title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Location</label>
                  <input type="text" value={application.city} onChange={setField('city')} placeholder="Chennai" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#E87070] outline-none text-sm font-medium transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Years of Experience</label>
                <input type="text" value={application.experience} onChange={setField('experience')} placeholder="e.g. 5" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#E87070] outline-none text-sm font-medium transition" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cover Message / About Yourself</label>
                <textarea rows="4" value={application.about} onChange={setField('about')} placeholder="Tell us about your healthcare experience..." className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#E87070] outline-none text-sm font-medium transition resize-none"></textarea>
              </div>

              {submitState.error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{submitState.error}</p>}
              {submitState.success && <p className="text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">{submitState.success}</p>}

              <button type="submit" disabled={submitState.loading} className="w-full bg-[#E87070] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#d66161] transition mt-2 shadow-lg disabled:opacity-70">
                {submitState.loading ? 'Submitting...' : 'Submit Application'}
              </button>

            </form>
          </div>
          
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-gray-100 py-16 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#E87070] rounded-lg flex items-center justify-center text-white font-bold text-xl">+</div>
                <span className="font-bold text-xl text-[#1E3A8A]">Carevia</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Delivering world-class healthcare and medical support to your doorstep. Join our growing community of top nurses and doctors.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#1E3A8A] mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><Link to="/" className="hover:text-[#E87070] transition">Home</Link></li>
                <li><Link to="/about" className="hover:text-[#E87070] transition">About Us</Link></li>
                <li><Link to="/jobs" className="text-[#E87070]">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-[#E87070] transition">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#1E3A8A] mb-6">Our Services</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><Link to="/physiotherapy" className="hover:text-[#E87070] transition">Physiotherapy</Link></li>
                <li><Link to="/nurse-care" className="hover:text-[#E87070] transition">Nurse Care</Link></li>
                <li><Link to="/care-taker" className="hover:text-[#E87070] transition">Care Takers</Link></li>
                <li><Link to="/doctor-visit" className="hover:text-[#E87070] transition">Doctor Visits</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#1E3A8A] mb-6">Get in Touch</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#E87070] shrink-0 mt-0.5" />
                  <span>123 Health Street, Anna Nagar, Chennai, TN 600040</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#E87070] shrink-0" />
                  <span>+91 98000 28229</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#E87070] shrink-0" />
                  <span>careers@carevia.com</span>
                </li>
              </ul>
            </div>
            
          </div>
          
          <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
            <p>© {new Date().getFullYear()} Carevia Healthcare. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#E87070] transition">Privacy Policy</a>
              <a href="#" className="hover:text-[#E87070] transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
