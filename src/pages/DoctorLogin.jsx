import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck, Lock, Eye, EyeOff, Phone, ArrowLeft,
  CalendarCheck, Inbox, Star, AlertCircle
} from 'lucide-react';
import { setPendingSignup } from '../services/pendingSignup';
import { useFormDraft } from '../services/formDraft';
import api, { saveSession, getSessionUser } from '../services/api';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

const PANEL = {
  photo: '/doctor-section.jpg',
  focus: '60% 25%',
  eyebrow: 'For healthcare professionals',
  title: 'Grow your practice with Carevaa',
  desc: 'Receive care requests near you, manage your schedule and build trust with verified patient reviews.',
  mobile: 'Accept care requests and manage your schedule.',
  points: [
    { icon: Inbox, title: 'Care requests near you', text: 'Matched to your speciality and city – accept in one tap.' },
    { icon: CalendarCheck, title: 'Smart scheduling', text: 'Home, clinic and online visits in one calendar.' },
    { icon: Star, title: 'Build your reputation', text: 'Verified reviews from the patients you treat.' },
  ],
};

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get('forgot') ? 'forgot' : 'login');
  const [forgotPhone, setForgotPhone] = useState(String(searchParams.get('phone') || ''));
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const user = getSessionUser();
    if (user?.role === 'doctor') {
      navigate(user.providerId ? '/doctor/dashboard' : '/professional/onboarding', { replace: true });
    }
  }, [navigate]);

  const switchView = (next) => { setView(next); setError(''); };

  // sign-up draft: name and email/phone are kept on this device (never the password), so a doctor who
  // left half-way can sign up again and continue the professional form where they stopped
  const signupDraft = useFormDraft('doctor-signup', view === 'register' ? { fullName, identifier } : null, {
    onRestore: (d) => {
      if (!d || (!d.fullName && !d.identifier)) return;
      setFullName(d.fullName || ''); setIdentifier(d.identifier || '');
      if (!searchParams.get('forgot')) setView('register');
    },
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) { setError('Please enter your email/phone and password.'); return; }
    setLoading(true);
    try {
      const data = await api.login(identifier.trim(), password, 'doctor');
      saveSession(data);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else {
        navigate(data.user?.providerId ? '/doctor/dashboard' : '/professional/onboarding');
      }
    } catch (err) {
      if (err.data?.message?.includes('registered as a patient') || err.message?.includes('registered as a patient')) {
        setError('This account is registered as a patient. Please use the Patient Login at /login.');
      } else if (err.data?.message?.includes('registered as an admin') || err.message?.includes('registered as an admin')) {
        setError('This account is registered as an administrator. Please use the Admin Portal at /admin.');
      } else {
        setError(err.message || 'Unable to log in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !identifier.trim() || !password) { setError('Please fill in all the fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await api.registerCheck(fullName.trim(), identifier.trim(), password, 'doctor');
      setPendingSignup({ name: fullName.trim(), identifier: identifier.trim(), password });
      navigate('/professional/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isRegister = view === 'register';
  const inputCls = 'w-full h-12 lg:h-11 px-4 rounded-xl border border-line bg-white text-primary placeholder:text-placeholder focus:ring-4 focus:ring-secondary/15 focus:border-secondary transition-all outline-none';
  const labelCls = 'block text-[13px] font-semibold text-primary mb-1.5';

  return (
    <div className="theme-portea min-h-screen lg:h-screen flex flex-col font-sans text-primary bg-tint">
      {/* Slim header */}
      <header className="h-16 shrink-0 bg-white/90 backdrop-blur border-b border-line-soft sticky top-0 z-30">
        <div className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="Carevaa home">
            <img src="/logo.png" alt="Carevaa Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-6 text-sm">
            <a href="tel:18001234567" className="hidden sm:flex items-center gap-2 text-primary/80 hover:text-secondary transition-colors">
              <Phone className="w-4 h-4 text-secondary" /> Need help? <span className="font-semibold text-primary">1800-123-4567</span>
            </a>
            <Link to="/" className="flex items-center gap-1.5 font-semibold text-primary/80 hover:text-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to website</span><span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative hidden lg:flex flex-col justify-end gap-6 overflow-hidden bg-deep text-white px-12 xl:px-16 py-10">
          <img
            src={PANEL.photo}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: PANEL.focus }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/85 to-deep/10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep/70 via-deep/20 to-transparent pointer-events-none" />

          <span className="absolute top-8 left-12 xl:left-16 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/25 px-3.5 py-1.5 text-[12px] font-medium text-white">
            <ShieldCheck className="w-4 h-4" /> Verified home healthcare
          </span>

          <div className="relative max-w-lg">
            <p className="eyebrow text-on-deep mb-3">{PANEL.eyebrow}</p>
            <h1 className="font-serif text-[32px] xl:text-[38px] leading-[1.12] font-semibold mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">{PANEL.title}</h1>
            <p className="text-[14px] leading-relaxed text-white/80 mb-5">{PANEL.desc}</p>
            <ul className="space-y-3.5">
              {PANEL.points.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-[18px] h-[18px] text-on-deep" />
                  </span>
                  <div>
                    <p className="font-semibold text-white text-[14px]">{title}</p>
                    <p className="text-[13px] text-white/65 leading-snug">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative grid grid-cols-3 gap-3 max-w-md">
            {[['7+', 'home care services'], ['24×7', 'care team support'], ['100%', 'verified professionals']].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 px-3.5 py-2.5">
                <p className="font-serif text-lg font-semibold text-white leading-tight">{v}</p>
                <p className="text-[11.5px] text-white/60 leading-snug mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Form side */}
        <main className="relative flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 lg:py-6 lg:overflow-y-auto">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-mint/70 to-transparent lg:hidden pointer-events-none" />
          <div className="relative w-full max-w-[460px]">
            {/* Mobile intro */}
            <div className="lg:hidden text-center mb-6">
              <p className="eyebrow text-accent mb-2">{PANEL.eyebrow}</p>
              <p className="text-sm text-primary/70">{PANEL.mobile}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_24px_60px_-20px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] ring-1 ring-line-soft p-6 sm:p-8 lg:px-8 lg:py-6">
              {view === 'forgot' ? (
                <div key="forgot" className="animate-[fade-in_0.35s_ease-out]">
                  <ForgotPasswordForm initialPhone={forgotPhone} onBack={() => switchView('login')} />
                </div>
              ) : (
                <div key={view} className="animate-[fade-in_0.35s_ease-out]">
                  <div className="mb-6 lg:mb-5">
                    <h2 className="font-serif text-[28px] lg:text-[28px] font-semibold leading-tight mb-1">
                      {isRegister ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p className="text-sm text-primary/60">
                      {isRegister
                        ? 'Sign up as a healthcare professional. Your account is created once you complete and submit your professional details.'
                        : 'Sign in to your professional dashboard.'}
                    </p>
                  </div>

                  <form className="space-y-5 lg:space-y-4" onSubmit={isRegister ? handleRegister : handleLogin} noValidate>
                    {isRegister && (
                      <div>
                        <label htmlFor="fullName" className={labelCls}>Full Name</label>
                        <input
                          id="fullName"
                          type="text"
                          autoComplete="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className={inputCls}
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="identifier" className={labelCls}>Email or Phone Number</label>
                      <input
                        id="identifier"
                        type="text"
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter your email or phone"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="password" className="block text-[13px] font-semibold text-primary">Password</label>
                        {!isRegister && (
                          <button
                            type="button"
                            onClick={() => {
                              setForgotPhone(/^\D*\d[\d\s+-]{8,}$/.test(identifier) ? identifier.replace(/\D/g, '').slice(-10) : '');
                              switchView('forgot');
                            }}
                            className="text-[13px] font-semibold text-secondary hover:underline"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete={isRegister ? 'new-password' : 'current-password'}
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
                      {isRegister && <p className="text-xs text-primary/50 mt-1.5">{signupDraft.restoredAt ? 'Welcome back – enter a password again to continue your registration where you stopped.' : 'At least 6 characters.'}</p>}
                    </div>

                    {error && (
                      <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 lg:h-11 rounded-xl bg-secondary hover:brightness-95 text-white font-semibold text-[15px] shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--color-secondary)_70%,transparent)] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
                    >
                      {loading ? 'Please wait...' : isRegister ? 'Continue to professional details' : 'Login'}
                    </button>
                  </form>

                  <p className="mt-6 lg:mt-5 text-center text-sm text-primary/70">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button type="button" onClick={() => switchView(isRegister ? 'login' : 'register')} className="font-semibold text-secondary hover:underline">
                      {isRegister ? 'Login here' : 'Register'}
                    </button>
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-5 mt-4 text-xs font-medium text-primary/55">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent" /> Secure sign-in</span>
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-accent" /> Your data stays private</span>
            </div>
            <p className="text-center text-xs text-primary/45 mt-2">
              By continuing you agree to our <Link to="/terms" className="underline hover:text-secondary">Terms</Link> and <Link to="/privacy-policy" className="underline hover:text-secondary">Privacy Policy</Link>.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
