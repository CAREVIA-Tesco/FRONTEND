import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getSessionUser } from '../services/api';
import { 
  CheckCircle, Lock, UploadCloud, User, Briefcase, FileText, 
  ShieldCheck, HelpCircle, Bell, ChevronDown, CheckSquare, Square,
  MessageCircle, PhoneCall, Check, FileBadge, Video, Clock
} from 'lucide-react';

export default function Verification() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  const [status, setStatus] = useState('filling'); // filling, pending, success, rejected
  const [ref1Saved, setRef1Saved] = useState(false);
  const [ref2Saved, setRef2Saved] = useState(false);
  const [declarations, setDeclarations] = useState([false, false, false, false]);
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();
  const sessionUser = getSessionUser();
  const [provider, setProvider] = useState(null);
  const [openings, setOpenings] = useState([]);

  // Verification is for logged-in professionals; show their real profile
  useEffect(() => {
    if (!sessionUser || sessionUser.role !== 'doctor') { navigate('/login?redirect=/verification'); return; }
    api.getMyProvider().then(({ provider: p }) => {
      setProvider(p);
      if (p?.status === 'ACTIVE') setStatus('success');
    }).catch(() => {});
    api.getContent('jobs').then((d) => setOpenings(d.items || [])).catch(() => {});
  }, []);
  const fullName = provider?.name || sessionUser?.name || '';
  const firstName = fullName.replace(/^(Dr|Nurse)\.?\s+/i, '').split(' ')[0];
  const progress = 60 + (ref1Saved ? 10 : 0) + (ref2Saved ? 10 : 0) + (declarations.every(Boolean) ? 20 : 0);

  const handleSubmit = () => {
    // only an admin-approved profile is "verified"; otherwise it is waiting for review
    setStatus(provider?.status === 'ACTIVE' ? 'success' : 'pending');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDecl = (i) => {
    const newD = [...declarations];
    newD[i] = !newD[i];
    setDeclarations(newD);
  };

  return (
    <div className="font-sans text-deep bg-[#FAFBFC] min-h-screen">
      
      {/* 1. Logged-in Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">+</div>
            <span className="font-bold text-xl text-primary tracking-tight">Carevaa</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="#" className="font-medium text-gray-500 hover:text-primary">Dashboard</Link>
            <Link to="/verification" className="font-bold text-secondary border-b-2 border-secondary py-7">Verification</Link>
            <Link to="/jobs" className="font-medium text-gray-500 hover:text-primary">Jobs</Link>
            <Link to="#" className="font-medium text-gray-500 hover:text-primary">Earnings</Link>
            <Link to="#" className="font-medium text-gray-500 hover:text-primary">Academy</Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-500" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex items-center gap-3 border-l pl-6">
              <img src={provider?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Carevaa')}&background=5A2F8F&color=fff`} alt={fullName} className="w-10 h-10 rounded-full object-cover" />
              <div className="hidden sm:block">
                <div className="font-bold text-sm">Hi, {firstName}</div>
                <div className="text-xs text-gray-500">{provider?.profession || 'Professional'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </nav>
      
      <div className="bg-secondary text-white text-center py-2 text-sm font-medium shadow-sm">
        ⚡ Complete verification to start applying for jobs. 3 of 5 steps done.
      </div>

      {status === 'success' || status === 'pending' ? (
        /* SUCCESS STATE */
        <div className="max-w-3xl mx-auto py-24 px-4 text-center animate-fade-in-up">
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-4xl md:text-[48px] font-bold font-poppins text-primary mb-4">{status === 'success' ? `🎉 You're Verified, ${firstName}!` : `📨 Submitted for Review, ${firstName}!`}</h1>
          <p className="text-xl text-gray-600 mb-12">{status === 'success' ? 'Welcome to the Carevaa family. You can now start accepting job offers.' : 'Our admin team is reviewing your profile. You will be able to accept bookings once it is approved.'}</p>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex-1 p-4 flex flex-col items-center">
              <ShieldCheck className="w-8 h-8 text-green-500 mb-2"/>
              <div className="font-bold text-lg text-primary">{provider?.verifiedAt ? `Verified ${new Date(provider.verifiedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'Verification Pending'}</div>
              <div className="text-sm text-gray-500">Fully Background Checked</div>
            </div>
            <div className="flex-1 p-4 flex flex-col items-center">
              <FileBadge className="w-8 h-8 text-blue-500 mb-2"/>
              <div className="font-bold text-lg text-primary">Pro Badge Earned</div>
              <div className="text-sm text-gray-500">Displayed on your profile</div>
            </div>
            <div className="flex-1 p-4 flex flex-col items-center">
              <Briefcase className="w-8 h-8 text-secondary mb-2"/>
              <div className="font-bold text-lg text-primary">{(() => { const n = openings.filter((j) => !provider?.city || j.loc === provider.city).length; return `${n} ${n === 1 ? 'Job' : 'Jobs'} Waiting`; })()}</div>
              <div className="text-sm text-gray-500">{provider?.city ? `In ${provider.city} area` : 'Across all cities'}</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link to="/jobs" className="bg-secondary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-secondary-hover transition">🔍 Browse Open Jobs</Link>
            <button className="bg-white border-2 border-primary text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary hover:text-white transition">👤 View My Profile</button>
          </div>
          <p className="text-sm font-medium text-gray-500">📦 Welcome kit shipping to your address in 3 days</p>
        </div>
      ) : (
        /* FILLING STATE */
        <>
          {/* 2. Header Section */}
          <section className="bg-[#FEF7F0] py-16 px-4 sm:px-6 lg:px-8 border-b border-orange-50">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-secondary/20">
                🔐 Account Verification
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold font-poppins text-primary mb-4">
                Almost There, {firstName}! Let's Get You Verified.
              </h1>
              <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
                Complete these 5 quick steps to activate your Carevaa profile and start receiving job offers.
              </p>
              
              <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-primary">{progress}% Complete</span>
                  <span className="text-sm font-bold text-secondary">Step 4 of 5</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden relative">
                  <div className="bg-secondary h-3 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1">
                    <div className="w-1 h-3 border-r-2 border-white/50"></div>
                    <div className="w-1 h-3 border-r-2 border-white/50"></div>
                    <div className="w-1 h-3 border-r-2 border-white/50"></div>
                    <div className="w-1 h-3 border-r-2 border-white/50"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium">3 of 5 steps completed • Estimated time: 8 minutes remaining</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm font-medium text-gray-600">
                <span className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">🎯 Average verification time: 24 hours</span>
                <span className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">🚀 Get your first job within 3 days of verification</span>
              </div>
            </div>
          </section>

          {/* 3. Main Verification Layout */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
            
            {/* LEFT SIDEBAR (30%) */}
            <div className="lg:w-[30%] lg:sticky lg:top-28 h-max">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative">
                
                <div className="absolute left-11 top-10 bottom-32 w-0.5 bg-gray-100 z-0 hidden lg:block"></div>
                
                <div className="space-y-8 relative z-10">
                  {/* Step 1 */}
                  <div className="flex gap-4 opacity-70">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm"><Check className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">Personal Details</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Completed</span>
                      </div>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="flex gap-4 opacity-70">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm"><Check className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">Qualifications</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Completed</span>
                      </div>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="flex gap-4 opacity-70">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm"><Check className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">Identity Verification</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Completed</span>
                      </div>
                    </div>
                  </div>
                  {/* Step 4 ACTIVE */}
                  <div className="flex gap-4 bg-orange-50/50 -mx-4 p-4 rounded-2xl border border-orange-100/50">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 border-4 border-white shadow-md shadow-red-200 animate-pulse-slow">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <div>
                      <div className="font-bold text-primary">Background Check</div>
                      <div className="flex items-center gap-2 mt-1 mb-1.5">
                        <span className="bg-orange-100 text-orange-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">In Progress</span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">You're here — complete this step</div>
                    </div>
                  </div>
                  {/* Step 5 */}
                  <div className="flex gap-4 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border-4 border-white"><Lock className="w-4 h-4 text-gray-400" /></div>
                    <div>
                      <div className="font-bold text-gray-600">Video Interview</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-gray-200 text-gray-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Locked</span>
                      </div>
                      <div className="text-xs text-gray-400 font-medium mt-1">Unlocks after Step 4</div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 bg-mint rounded-2xl p-5 border border-blue-100 text-center">
                  <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-bold text-primary mb-1">Need help?</div>
                  <div className="text-sm text-gray-600 mb-4">Chat with our onboarding team</div>
                  <button className="w-full bg-white border border-blue-200 text-primary font-bold py-2 rounded-xl text-sm hover:bg-blue-50 transition">Chat Now →</button>
                </div>
              </div>
            </div>

            {/* RIGHT MAIN CONTENT (70%) */}
            <div className="lg:w-[70%]">
              <div className="mb-8">
                <div className="text-secondary font-bold text-sm mb-2 uppercase tracking-wide">Step 4 of 5</div>
                <h2 className="text-3xl font-bold font-poppins text-primary mb-3">Background & Reference Verification</h2>
                <p className="text-gray-600 text-lg">For patient safety, we conduct a quick background check and verify 2 professional references. This usually takes 24–48 hours.</p>
              </div>

              <div className="space-y-6">
                {/* 4A Police Verification */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-300"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-blue-500"/></div>
                      <h3 className="text-xl font-bold text-primary">Police Verification</h3>
                    </div>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"><Clock className="w-3 h-3"/> Pending Upload</span>
                  </div>
                  <p className="text-gray-600 mb-6">Upload a valid Police Clearance Certificate (PCC) from your local station.</p>
                  
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mb-6">
                    <div className="text-xl">🛡️</div>
                    <div>
                      <div className="font-bold text-primary text-sm mb-0.5">Don't have a PCC?</div>
                      <div className="text-sm text-gray-600">We can help you apply — takes 3–5 days. <a href="#" className="text-blue-600 font-semibold hover:underline">Learn how →</a></div>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-secondary/50 rounded-2xl h-48 flex flex-col items-center justify-center bg-orange-50/20 hover:bg-orange-50/40 transition cursor-pointer group-hover:border-secondary">
                    <UploadCloud className="w-12 h-12 text-secondary mb-3" />
                    <div className="font-bold text-primary mb-1">Drag & drop your PCC document here</div>
                    <div className="text-gray-500 text-sm mb-4">or click to browse files</div>
                    <div className="text-xs text-gray-400 font-medium">PDF, JPG or PNG • Max 5 MB</div>
                  </div>
                </div>

                {/* 4B Reference 1 */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-300"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-green-500"/></div>
                      <h3 className="text-xl font-bold text-primary">Professional Reference 1</h3>
                    </div>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"><Clock className="w-3 h-3"/> {ref1Saved ? 'Saved' : 'Awaiting Details'}</span>
                  </div>
                  <p className="text-gray-600 mb-6">Share details of a doctor, senior nurse, or hospital administrator who can vouch for your work.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                      <input type="text" className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none font-medium" placeholder="Dr. Suresh Kumar" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Designation</label>
                      <input type="text" className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-secondary outline-none font-medium" placeholder="e.g. Senior Doctor at Apollo" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Relationship</label>
                      <select className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-secondary outline-none font-medium">
                        <option>Former Supervisor</option>
                        <option>Colleague</option>
                        <option>Faculty</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Mobile Number</label>
                      <input type="tel" className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-secondary outline-none font-medium" placeholder="+91 " />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-6">
                    <p className="text-xs text-gray-500 font-medium max-w-sm flex items-start gap-2">
                      <Lock className="w-4 h-4 text-gray-400 shrink-0"/> We'll only contact them for a 2-minute verification call.
                    </p>
                    <button onClick={()=>setRef1Saved(true)} className="border-2 border-primary text-primary px-6 py-2.5 rounded-xl font-bold hover:bg-primary hover:text-white transition">Save Reference 1</button>
                  </div>
                </div>

                {/* 4D Self Declaration */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-purple-500"/></div>
                    <h3 className="text-xl font-bold text-primary">Self-Declaration Form</h3>
                  </div>
                  <p className="text-gray-600 mb-6">Confirm your professional and legal background.</p>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      "I have never been convicted of any criminal offense.",
                      "I have never been suspended or removed from any medical/nursing council.",
                      "All documents submitted are authentic and belong to me.",
                      "I understand that false information may lead to permanent removal from Carevaa."
                    ].map((text, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                        <div onClick={()=>toggleDecl(i)} className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 transition ${declarations[i] ? 'bg-secondary border-secondary' : 'border-2 border-gray-300 group-hover:border-secondary'}`}>
                          {declarations[i] && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`font-medium ${declarations[i] ? 'text-gray-900' : 'text-gray-600'}`}>{text}</span>
                      </label>
                    ))}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50">
                    <label className="block text-sm font-bold text-gray-700 mb-3">E-Signature</label>
                    <div className="h-32 border-2 border-dashed border-gray-300 rounded-xl bg-white mb-4 cursor-crosshair flex items-center justify-center">
                      <span className="text-gray-400 font-medium">Draw your signature here</span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono bg-white inline-block px-3 py-1.5 rounded border border-gray-200">
                      Signed by: {fullName} • Date: {new Date().toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>

              </div>

              {/* 5. Bottom Action Bar */}
              <div className="mt-8 bg-white p-6 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 sticky bottom-4 z-40">
                <button className="text-blue-600 font-bold hover:underline flex items-center gap-1">← Back to Step 3</button>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button className="border-2 border-primary text-primary px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition w-full sm:w-auto text-center">💾 Save & Exit</button>
                  <button onClick={handleSubmit} className="bg-secondary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-secondary-hover shadow-lg transition flex items-center justify-center gap-2 w-full sm:w-auto">
                    Submit for Review →
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* 6. What Happens Next */}
          <section className="bg-mint py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold font-poppins text-primary text-center mb-12">What Happens After You Submit?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-2xl">🔍</div>
                  <h3 className="text-xl font-bold text-primary mb-3">1. We Verify (24–48 hrs)</h3>
                  <p className="text-gray-600 font-medium">Our team checks your documents, calls references, and confirms your details securely.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-2xl">📧</div>
                  <h3 className="text-xl font-bold text-primary mb-3">2. You Get Approved</h3>
                  <p className="text-gray-600 font-medium">Approval email + welcome kit sent to your address containing your free uniform and ID badge.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 text-2xl">💼</div>
                  <h3 className="text-xl font-bold text-primary mb-3">3. Start Earning</h3>
                  <p className="text-gray-600 font-medium">Log in to your dashboard, browse open high-paying jobs, and start accepting assignments.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-deep py-8 text-center text-sm font-medium">
        <div className="flex flex-wrap justify-center gap-6 text-gray-400 mb-4">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Data Security</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>
        <p className="text-gray-500">© {new Date().getFullYear()} Carevaa. Made with ❤️ in India.</p>
      </footer>

    </div>
  );
}
