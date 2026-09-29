import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Building2, ShieldCheck, CheckCircle, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Login() {
  const [view, setView] = useState('login');
  const [role, setRole] = useState('patient'); // 'login' or 'register'

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 flex flex-col lg:flex-row pt-20 lg:pt-0">
        {/* Left Side: Visuals & Value Prop */}
        <div className="hidden lg:flex lg:w-5/12 bg-[#F0F4FF] relative flex-col justify-center p-12 lg:p-20 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 max-w-lg mt-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-primary leading-tight mb-6 font-poppins">
              Join Carevia and Grow Your Healthcare Practice
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              Connect with patients, manage appointments, and build your professional presence seamlessly.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                  <span className="text-2xl">👩‍⚕️</span>
                </div>
                <div>
                  <h3 className="font-bold text-primary">Expand Your Reach</h3>
                  <p className="text-sm text-gray-500 mt-1">Connect with thousands of patients seeking quality healthcare.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h3 className="font-bold text-primary">Smart Scheduling</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your availability, appointments, and clinics in one place.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <h3 className="font-bold text-primary">Build Trust</h3>
                  <p className="text-sm text-gray-500 mt-1">Gather verified reviews and showcase your expertise.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-6 lg:p-20 bg-white min-h-[calc(100vh-80px)] lg:min-h-screen">
          <div className="w-full max-w-md mt-8 lg:mt-12">
            
            {/* Role Toggle */}
            <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center mb-10 shadow-inner">
              <button 
                onClick={() => setRole('patient')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'patient' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'}`}
              >
                Patient
              </button>
              <button 
                onClick={() => setRole('doctor')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'doctor' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'}`}
              >
                Doctor
              </button>
              <button 
                onClick={() => setRole('admin')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'}`}
              >
                Admin
              </button>
            </div>
            
            {view === 'login' ? (
              <div className="animate-[fade-in_0.4s_ease-out]">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-primary mb-3 font-poppins">Welcome Back</h2>
                  <p className="text-gray-500">Sign in to your {role === 'doctor' ? 'professional dashboard' : 'account'}.</p>
                </div>
                
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email or Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="Enter your email or phone" 
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-gray-700">Password</label>
                      <a href="#" className="text-sm font-bold text-secondary hover:text-secondary-hover transition-colors">Forgot Password?</a>
                    </div>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>

                  <Link 
                    to={role === 'admin' ? '/admin' : (role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')} 
                    className="block text-center w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
                  >
                    Login
                  </Link>
                </form>

                <div className="mt-10 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setView('register')} 
                      className="font-bold text-secondary hover:text-secondary-hover transition-colors"
                    >
                      Register
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="animate-[fade-in_0.4s_ease-out]">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-primary mb-3 font-poppins">Create Account</h2>
                  <p className="text-gray-500">Sign up as a {role === 'doctor' ? 'healthcare professional' : 'patient'}.</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your full name" 
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email or Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="Enter your email or phone" 
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>

                  {role === 'doctor' ? (
                    <Link to="/professional/onboarding" className="block text-center w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5">
                      Create Account
                    </Link>
                  ) : (
                    <Link to="/patient/dashboard" className="block text-center w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5">
                      Create Account
                    </Link>
                  )}
                </form>

                <div className="flex items-center justify-center gap-6 mt-10 text-xs font-bold text-gray-400">
                  <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-500" /> Secure</div>
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-blue-500" /> Verified</div>
                  <div className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-gray-500" /> Trusted</div>
                </div>

                <div className="mt-8 text-center pt-8 border-t border-gray-100">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <button 
                      onClick={() => setView('login')} 
                      className="font-bold text-secondary hover:text-secondary-hover transition-colors"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Add simple Check icon since we didn't import it directly from lucide for the radio button
function Check(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
