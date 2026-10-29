import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Stethoscope, Lock, Eye, EyeOff, Phone, ArrowLeft, ShieldCheck,
  CalendarCheck, ClipboardList, FileText, AlertCircle, LogOut, LayoutDashboard,
  CheckCircle2, ArrowRight
} from 'lucide-react';
import api, { saveSession, getSessionUser, logout } from '../services/api';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(() => getSessionUser());

  const [view, setView] = useState(searchParams.get('forgot') ? 'forgot' : 'login');
  const [forgotPhone, setForgotPhone] = useState(String(searchParams.get('phone') || ''));
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If already logged in as doctor, redirect directly to dashboard
  useEffect(() => {
    if (currentUser?.role === 'doctor') {
      navigate(currentUser.providerId ? '/doctor/dashboard' : '/professional/onboarding', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter your doctor email or registered phone number, and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(identifier.trim(), password, 'doctor');
      saveSession(data);
      setCurrentUser(data.user);

      const redirectPath = searchParams.get('redirect');
      if (redirectPath) {
        navigate(redirectPath);
      } else if (data.user?.providerId) {
        navigate('/doctor/dashboard');
      } else {
        navigate('/professional/onboarding');
      }
    } catch (err) {
      if (err.data?.message?.includes('registered as a patient') || err.message?.includes('registered as a patient')) {
        setError('This account is registered as a patient. The Doctor Portal is reserved for healthcare professionals. Please use the Patient Login.');
      } else if (err.data?.message?.includes('registered as an admin') || err.message?.includes('registered as an admin')) {
        setError('This account is registered as an administrator. Please use the Admin Portal at /admin.');
      } else {
        setError(err.message || 'Unable to log in. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = () => {
    logout();
    setCurrentUser(null);
    setError('');
  };

  const inputCls = 'w-full h-12 px-4 rounded-xl border border-line bg-white text-primary placeholder:text-placeholder focus:ring-4 focus:ring-secondary/15 focus:border-secondary transition-all outline-none';
  const labelCls = 'block text-[13px] font-semibold text-primary mb-1.5';

  return (
    <div className="theme-portea min-h-screen lg:h-screen flex flex-col font-sans text-primary bg-tint">
      {/* Top Header */}
      <header className="h-16 shrink-0 bg-white/90 backdrop-blur border-b border-line-soft sticky top-0 z-30">
        <div className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Carevaa home">
            <img src="/logo.png" alt="Carevaa Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              <Stethoscope className="w-3.5 h-3.5" /> Doctor Portal
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6 text-sm">
            <a href="tel:18001234567" className="hidden sm:flex items-center gap-2 text-primary/80 hover:text-secondary transition-colors">
              <Phone className="w-4 h-4 text-secondary" /> Need doctor support? <span className="font-semibold text-primary">1800-123-4567</span>
            </a>
            <Link to="/" className="flex items-center gap-1.5 font-semibold text-primary/80 hover:text-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to website</span><span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid lg:grid-cols-2">
        {/* Brand Side Panel */}
        <aside className="relative hidden lg:flex flex-col justify-end gap-6 overflow-hidden bg-deep text-white px-12 xl:px-16 py-10">
          <img
            src="/doctor-section.jpg"
            alt="Doctor practicing with patient"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/85 to-deep/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep/80 via-deep/40 to-transparent pointer-events-none" />

          <span className="absolute top-8 left-12 xl:left-16 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/25 px-3.5 py-1.5 text-[12px] font-medium text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Healthcare Professional Network
          </span>

          <div className="relative max-w-lg">
            <p className="eyebrow text-on-deep mb-3">Carevaa For Doctors & Clinics</p>
            <h1 className="font-serif text-[32px] xl:text-[38px] leading-[1.12] font-semibold mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
              Manage Your Practice & Patient Care Seamlessly
            </h1>
            <p className="text-[14px] leading-relaxed text-white/80 mb-6">
              Sign in to manage patient registrations, daily sequential appointment queues, digital prescriptions, and online consultations in one unified workspace.
            </p>

            <ul className="space-y-4">
              {[
                {
                  icon: ClipboardList,
                  title: 'Daily Sequential Appointments',
                  text: 'Automated 12:00 AM daily sequence restart for walk-in and online patients.'
                },
                {
                  icon: CalendarCheck,
                  title: 'Instant Patient Registration',
                  text: 'Register walk-ins manually or share QR/registration links directly with patients.'
                },
                {
                  icon: FileText,
                  title: 'Digital Prescriptions & Records',
                  text: 'Access complete visit history, vitals, allergy alerts, and PDF prescriptions.'
                }
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3.5">
                  <span className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-[18px] h-[18px] text-emerald-300" />
                  </span>
                  <div>
                    <p className="font-semibold text-white text-[14px]">{title}</p>
                    <p className="text-[13px] text-white/70 leading-snug">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative grid grid-cols-3 gap-3 max-w-md pt-2">
            {[
              ['Daily Queue', 'Auto-resets at midnight'],
              ['Sync', 'Doctor & Admin live sync'],
              ['100%', 'Secure health records']
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 px-3.5 py-2.5">
                <p className="font-serif text-lg font-semibold text-white leading-tight">{v}</p>
                <p className="text-[11.5px] text-white/65 leading-snug mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Login Form Side */}
        <main className="relative flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 lg:py-6 lg:overflow-y-auto">
          <div className="relative w-full max-w-[460px]">
            {/* Mobile Header Banner */}
            <div className="lg:hidden text-center mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/25 mb-2">
                <Stethoscope className="w-3.5 h-3.5" /> Doctor Portal
              </span>
              <h2 className="font-serif text-2xl font-semibold text-primary">Doctor & Clinic Login</h2>
              <p className="text-sm text-primary/70 mt-1">Sign in to access your doctor dashboard and patient visits.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_24px_60px_-20px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] ring-1 ring-line-soft p-6 sm:p-8">
              {/* If user is currently logged in as patient or admin */}
              {currentUser && currentUser.role !== 'doctor' && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-amber-900">
                        Signed in as {currentUser.name || 'User'} ({currentUser.role === 'admin' ? 'Administrator' : 'Patient'})
                      </p>
                      <p className="text-amber-800/90 text-xs mt-1">
                        To access the Doctor Dashboard, please sign in with your doctor credentials below.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          to={currentUser.role === 'admin' ? '/admin' : '/patient/dashboard'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100/60 transition"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" /> Go to {currentUser.role === 'admin' ? 'Admin' : 'Patient'} Dashboard
                        </Link>
                        <button
                          type="button"
                          onClick={handleSwitchAccount}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {view === 'forgot' ? (
                <div className="animate-[fade-in_0.35s_ease-out]">
                  <ForgotPasswordForm
                    initialPhone={forgotPhone}
                    onBack={() => { setView('login'); setError(''); }}
                  />
                </div>
              ) : (
                <div className="animate-[fade-in_0.35s_ease-out]">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-600" /> Healthcare Professionals Only
                    </div>
                    <h2 className="font-serif text-[28px] font-semibold text-primary leading-tight">
                      Doctor Login
                    </h2>
                    <p className="text-sm text-primary/65 mt-1">
                      Sign in with your verified doctor email or phone number.
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleLogin} noValidate>
                    <div>
                      <label htmlFor="doc-identifier" className={labelCls}>
                        Doctor Email or Registered Phone
                      </label>
                      <input
                        id="doc-identifier"
                        type="text"
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. dr.priya@carevaa.com or 9876543210"
                        className={inputCls}
                        autoFocus
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="doc-password" className={labelCls}>
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotPhone(/^\D*\d[\d\s+-]{8,}$/.test(identifier) ? identifier.replace(/\D/g, '').slice(-10) : '');
                            setView('forgot');
                            setError('');
                          }}
                          className="text-[13px] font-semibold text-secondary hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="doc-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`${inputCls} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-primary/50 hover:text-primary hover:bg-tint"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-xl bg-secondary hover:brightness-95 text-white font-semibold text-[15px] shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--color-secondary)_70%,transparent)] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        'Signing in...'
                      ) : (
                        <>
                          <Stethoscope className="w-4 h-4" />
                          <span>Sign In to Doctor Dashboard</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-line-soft space-y-3">
                    <p className="text-center text-sm text-primary/70">
                      New healthcare professional?{' '}
                      <Link to="/professional/onboarding" className="font-semibold text-secondary hover:underline">
                        Register your practice
                      </Link>
                    </p>

                    <div className="text-center">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary/60 hover:text-primary transition"
                      >
                        Are you a patient? Go to Patient Login <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-5 mt-5 text-xs font-medium text-primary/55">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Doctor Access</span>
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-600" /> End-to-End Encrypted</span>
            </div>
            <p className="text-center text-xs text-primary/45 mt-2">
              By accessing the Doctor Dashboard, you agree to maintain patient confidentiality in accordance with medical ethics and Carevaa's <Link to="/privacy-policy" className="underline hover:text-secondary">Privacy Policy</Link>.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
