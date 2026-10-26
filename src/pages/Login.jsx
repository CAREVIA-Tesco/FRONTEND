import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, EyeOff, Phone, ArrowLeft, HeartPulse, CalendarCheck, FileText, Inbox, Star, LayoutDashboard, BarChart3, UserCheck, AlertCircle } from 'lucide-react';
import api, { saveSession } from '../services/api';
import PincodeFields from '../components/PincodeFields';
import { usePincode, pincodeErrors } from '../services/usePincode';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

const CARE_FOR = ['Myself', 'Parent', 'Spouse', 'Child', 'Other'];

export default function Login() {
  const [role, setRole] = useState('patient'); // 'login' or 'register'
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // 'login' | 'register' | 'forgot' (forgot password opens inside this card)
  const [view, setView] = useState(searchParams.get('forgot') ? 'forgot' : 'login');
  const [forgotPhone, setForgotPhone] = useState(String(searchParams.get('phone') || ''));
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [regStep, setRegStep] = useState(1); // patient sign-up: 1 = account, 2 = about the patient
  const [details, setDetails] = useState({ careFor: 'Myself', age: '', gender: '', phone: '', city: '', pincode: '', district: '', state: '', locality: '', conditions: '' });
  const setDetail = (k, v) => setDetails((d) => ({ ...d, [k]: v }));
  const patchDetails = (patch) => { setDetails((d) => ({ ...d, ...patch })); setError(''); };
  const pin = usePincode(details, patchDetails);

  const dashboardFor = (user) => {
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return user.providerId ? '/doctor/dashboard' : '/professional/onboarding';
    if (user.role === 'nurse') return '/nurse/dashboard';
    return '/patient/dashboard';
  };

  const switchView = (next) => { setView(next); setError(''); setRegStep(1); };
  useEffect(() => { setRegStep(1); setError(''); }, [role]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) { setError('Please enter your email/phone and password.'); return; }
    setLoading(true);
    try {
      const data = await api.login(identifier.trim(), password, role);
      saveSession(data);
      navigate(searchParams.get('redirect') || dashboardFor(data.user));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (role === 'admin') { setError('Admin accounts cannot be self-registered. Please login instead.'); return; }
    if (!fullName.trim() || !identifier.trim() || !password) { setError('Please fill in all the fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (role === 'patient' && regStep === 1) {
      const digits = identifier.replace(/\D/g, '');
      if (!identifier.includes('@') && digits.length >= 10) setDetails((d) => ({ ...d, phone: d.phone || digits.slice(-10) }));
      setRegStep(2);
      return;
    }
    if (role === 'patient') {
      const age = Number(details.age);
      if (!details.careFor) { setError('Please choose who needs care.'); return; }
      if (details.age === '' || !Number.isInteger(age) || age < 0 || age > 120) { setError("Please enter the patient's age in years."); return; }
      if (!details.gender) { setError("Please select the patient's gender."); return; }
      if (details.phone.replace(/\D/g, '').length !== 10) { setError('Please enter a valid 10-digit mobile number.'); return; }
      const addrErr = pincodeErrors(details, pin);
      if (addrErr.pincode) { setError(addrErr.pincode); return; }
      if (addrErr.city) { setError('Please enter your city.'); return; }
    }
    setLoading(true);
    try {
      const data = await api.register(fullName.trim(), identifier.trim(), password, role, role === 'patient' ? details : {});
      saveSession(data);
      navigate(role === 'doctor' ? '/professional/onboarding' : (searchParams.get('redirect') || '/patient/dashboard'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const panel = PANELS[role];
  const isRegister = view === 'register';
  const patientStep2 = isRegister && role === 'patient' && regStep === 2;
  const inputCls = 'w-full h-12 lg:h-11 px-4 rounded-xl border border-line bg-white text-primary placeholder:text-placeholder focus:ring-4 focus:ring-secondary/15 focus:border-secondary transition-all outline-none';
  const labelCls = 'block text-[13px] font-semibold text-primary mb-1.5';
  const smallCls = inputCls.replace('lg:h-11', 'lg:h-10');

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
          {/* Role photo (cross-fades when the role changes) under a brand-colour overlay */}
          {Object.entries(PANELS).map(([key, p]) => (
            <img key={key} src={p.photo} alt="" aria-hidden="true" data-testid={`login-photo-${key}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${role === key ? 'opacity-100' : 'opacity-0'}`}
              style={{ objectPosition: p.focus }} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/85 to-deep/10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep/70 via-deep/20 to-transparent pointer-events-none" />

          <span className="absolute top-8 left-12 xl:left-16 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/25 px-3.5 py-1.5 text-[12px] font-medium text-white">
            <ShieldCheck className="w-4 h-4" /> Verified home healthcare
          </span>

          <div className="relative max-w-lg">
            <p className="eyebrow text-on-deep mb-3">{panel.eyebrow}</p>
            <h1 className="font-serif text-[32px] xl:text-[38px] leading-[1.12] font-semibold mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">{panel.title}</h1>
            <p className="text-[14px] leading-relaxed text-white/80 mb-5">{panel.desc}</p>
            <ul className="space-y-3.5">
              {panel.points.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center shrink-0"><Icon className="w-[18px] h-[18px] text-on-deep" /></span>
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
        <main className="relative flex items-start lg:items-center justify-center px-4 sm:px-6 py-8 sm:py-10 lg:py-2 lg:overflow-y-auto">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-mint/70 to-transparent lg:hidden pointer-events-none" />
          <div className="relative w-full max-w-[460px]">
            {/* Mobile intro */}
            <div className="lg:hidden text-center mb-6">
              <p className="eyebrow text-accent mb-2">{panel.eyebrow}</p>
              <p className="text-sm text-primary/70">{panel.mobile}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_24px_60px_-20px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] ring-1 ring-line-soft p-6 sm:p-8 lg:px-8 lg:py-6">
              {/* Role toggle */}
              {!patientStep2 && view !== 'forgot' && (
              <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-tint ring-1 ring-line-soft mb-6 lg:mb-5" role="group" aria-label="Account type">
                {[['patient', 'Patient'], ['doctor', 'Doctor'], ['admin', 'Admin']].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={role === key}
                    onClick={() => { setRole(key); if (key === 'admin' && view === 'register') switchView('login'); }}
                    className={`h-10 text-sm font-semibold rounded-xl transition-all ${role === key ? 'bg-primary text-white shadow-md' : 'text-primary/60 hover:text-primary hover:bg-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              )}

              {view === 'forgot' ? (
              <div key="forgot" className="animate-[fade-in_0.35s_ease-out]">
                <ForgotPasswordForm initialPhone={forgotPhone} onBack={() => switchView('login')} />
              </div>
              ) : (
              <div key={view} className="animate-[fade-in_0.35s_ease-out]">
                <div className="mb-6 lg:mb-5">
                  {isRegister && role === 'patient' && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-1">Step {regStep} of 2</p>}
                  <h2 className="font-serif text-[28px] lg:text-[28px] font-semibold leading-tight mb-1">{patientStep2 ? 'About the patient' : isRegister ? 'Create your account' : 'Welcome back'}</h2>
                  <p className={`text-sm text-primary/60 ${patientStep2 ? 'lg:hidden' : ''}`}>
                    {patientStep2
                      ? 'Helps our care team and doctors prepare for the visit.'
                      : isRegister
                      ? `Sign up as a ${role === 'doctor' ? 'healthcare professional' : 'patient'}.`
                      : `Sign in to your ${role === 'doctor' ? 'professional dashboard' : role === 'admin' ? 'admin console' : 'account'}.`}
                  </p>
                </div>

                <form className="space-y-5 lg:space-y-4" onSubmit={isRegister ? handleRegister : handleLogin} noValidate>
                  {patientStep2 ? (
                    <div className="space-y-4 lg:space-y-2.5">
                      <div>
                        <p className={labelCls}>Who needs care?</p>
                        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Who needs care" data-testid="care-for">
                          {CARE_FOR.map((c) => (
                            <button key={c} type="button" onClick={() => setDetail('careFor', c)} aria-pressed={details.careFor === c}
                              className={`h-8 px-3 rounded-full border text-[12.5px] font-medium transition-colors ${details.careFor === c ? 'bg-primary border-primary text-white' : 'border-line text-primary/70 hover:border-secondary/60'}`}>{c === 'Other' ? 'Someone else' : c}</button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="pt-age" className={labelCls}>{details.careFor === 'Myself' ? 'Your age' : "Patient's age"}</label>
                          <input id="pt-age" type="number" min="0" max="120" inputMode="numeric" value={details.age} onChange={(e) => setDetail('age', e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="Years" className={smallCls} />
                        </div>
                        <div>
                          <label htmlFor="pt-gender" className={labelCls}>Gender</label>
                          <select id="pt-gender" value={details.gender} onChange={(e) => setDetail('gender', e.target.value)} className={smallCls}>
                            <option value="">Select</option><option>Female</option><option>Male</option><option>Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="pt-phone" className={labelCls}>Mobile number</label>
                        <div className="flex">
                          <span className="h-12 lg:h-10 px-3.5 flex items-center rounded-l-xl border border-r-0 border-line bg-tint text-[14px] text-primary/70">+91</span>
                          <input id="pt-phone" inputMode="numeric" autoComplete="tel-national" value={details.phone} onChange={(e) => setDetail('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="For visit updates" className={`${smallCls} rounded-l-none`} />
                        </div>
                      </div>
                      <PincodeFields idPrefix="pt" value={details} onChange={patchDetails} lookup={pin} required={false} fieldCls={smallCls} labelCls={labelCls} className="space-y-4" />
                      <div>
                        <label htmlFor="pt-conditions" className={labelCls}>Ongoing conditions or allergies <span className="font-normal text-primary/45">(optional)</span></label>
                        <input id="pt-conditions" value={details.conditions} onChange={(e) => setDetail('conditions', e.target.value)} placeholder="e.g. Diabetes, penicillin allergy" className={smallCls} />
                      </div>
                    </div>
                  ) : (
                    <>
                  {isRegister && (
                    <div>
                      <label htmlFor="fullName" className={labelCls}>Full Name</label>
                      <input id="fullName" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className={inputCls} />
                    </div>
                  )}

                  <div>
                    <label htmlFor="identifier" className={labelCls}>Email or Phone Number</label>
                    <input id="identifier" type="text" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter your email or phone" className={inputCls} />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="password" className="block text-[13px] font-semibold text-primary">Password</label>
                      {!isRegister && role !== 'admin' && <button type="button" onClick={() => { setForgotPhone(/^\D*\d[\d\s+-]{8,}$/.test(identifier) ? identifier.replace(/\D/g, '').slice(-10) : ''); switchView('forgot'); }} className="text-[13px] font-semibold text-secondary hover:underline">Forgot Password?</button>}
                    </div>
                    <div className="relative">
                      <input id="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputCls} pr-12`} />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-primary/50 hover:text-primary hover:bg-tint">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {isRegister && <p className="text-xs text-primary/50 mt-1.5">At least 6 characters.</p>}
                  </div>
                    </>
                  )}

                  {error && (
                    <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                    </p>
                  )}

                  <div className="flex gap-2.5">
                    {patientStep2 && <button type="button" onClick={() => { setRegStep(1); setError(''); }} aria-label="Back to account details" className="h-12 lg:h-11 px-4 rounded-xl border border-line text-primary/70 hover:text-primary hover:bg-tint flex items-center gap-1.5 text-[14px] font-medium"><ArrowLeft className="w-4 h-4" /> Back</button>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 lg:h-11 rounded-xl bg-secondary hover:brightness-95 text-white font-semibold text-[15px] shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--color-secondary)_70%,transparent)] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {loading ? 'Please wait...' : isRegister && role === 'patient' && regStep === 1 ? 'Continue' : isRegister ? 'Create Account' : 'Login'}
                  </button>
                  </div>
                </form>

                {role !== 'admin' && (
                <p className="mt-6 lg:mt-5 text-center text-sm text-primary/70">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button type="button" onClick={() => switchView(isRegister ? 'login' : 'register')} className="font-semibold text-secondary hover:underline">
                    {isRegister ? 'Login here' : 'Register'}
                  </button>
                </p>
                )}
              </div>
              )}
            </div>

            <div className={`${patientStep2 ? 'hidden' : 'flex'} items-center justify-center gap-5 mt-4 text-xs font-medium text-primary/55`}>
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

const PANELS = {
  patient: {
    photo: '/nurse-hero.jpg', focus: '50% 20%',
    eyebrow: 'For patients & families',
    title: 'Care for your loved ones, right at home',
    desc: 'Book doctors, nurses, physiotherapists and caretakers, track every visit and keep health records in one place.',
    mobile: 'Book home visits, track requests and see your records.',
    points: [
      { icon: CalendarCheck, title: 'Book in minutes', text: 'Choose a service, a time and a verified professional.' },
      { icon: HeartPulse, title: 'Track every visit', text: 'Live status from request to completed visit.' },
      { icon: FileText, title: 'Records in one place', text: 'Prescriptions and visit notes, always available.' },
    ],
  },
  doctor: {
    photo: '/doctor-section.jpg', focus: '60% 25%',
    eyebrow: 'For healthcare professionals',
    title: 'Grow your practice with Carevaa',
    desc: 'Receive care requests near you, manage your schedule and build trust with verified patient reviews.',
    mobile: 'Accept care requests and manage your schedule.',
    points: [
      { icon: Inbox, title: 'Care requests near you', text: 'Matched to your speciality and city – accept in one tap.' },
      { icon: CalendarCheck, title: 'Smart scheduling', text: 'Home, clinic and online visits in one calendar.' },
      { icon: Star, title: 'Build your reputation', text: 'Verified reviews from the patients you treat.' },
    ],
  },
  admin: {
    photo: '/career-hero.jpg', focus: '50% 45%',
    eyebrow: 'Carevaa care team',
    title: 'Run operations from one console',
    desc: 'Dispatch requests to professionals, manage patients and providers, and keep the website up to date.',
    mobile: 'Sign in to the Carevaa admin console.',
    points: [
      { icon: LayoutDashboard, title: 'Dispatch & enquiries', text: 'Route every request to the right professional.' },
      { icon: UserCheck, title: 'Providers & patients', text: 'Approve, verify and manage accounts.' },
      { icon: BarChart3, title: 'Live insights', text: 'Bookings, payments and performance at a glance.' },
    ],
  },
};
