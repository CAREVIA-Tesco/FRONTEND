import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, KeyRound, ShieldCheck, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api, { saveSession } from '../services/api';

// Forgot password, shown inside the login card: mobile number -> 6-digit SMS OTP -> new password
// (patients and professionals; admin accounts are excluded on the server).
const STEPS = ['Mobile number', 'Enter OTP', 'New password'];

export default function ForgotPasswordForm({ initialPhone = '', onBack }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState(String(initialPhone || '').replace(/\D/g, '').slice(-10));
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [wait, setWait] = useState(0);
  const codeRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);
  useEffect(() => { if (step === 1) codeRef.current?.focus(); }, [step]);

  const run = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const sendOtp = (e) => {
    e?.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Please enter a valid 10-digit mobile number.'); return; }
    run(async () => {
      const r = await api.forgotPassword(phone);
      setInfo(`${r.message} It is valid for 10 minutes.`);
      setWait(r.resendIn || 30);
      setCode('');
      setStep(1);
    });
  };

  const checkOtp = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError('Please enter the 6-digit OTP.'); return; }
    run(async () => {
      const r = await api.verifyOtp(phone, code);
      setResetToken(r.resetToken);
      setInfo('');
      setStep(2);
    });
  };

  const savePassword = (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('The two passwords do not match.'); return; }
    run(async () => {
      const r = await api.resetPassword(resetToken, password);
      saveSession(r);
      const u = r.user;
      setStep(3);
      setTimeout(() => navigate(u.role === 'doctor' ? (u.providerId ? '/doctor/dashboard' : '/professional/onboarding') : '/patient/dashboard'), 1500);
    }).catch(() => {});
  };

  const inputCls = 'w-full h-12 px-4 rounded-xl border border-line bg-white text-primary placeholder:text-placeholder focus:ring-4 focus:ring-secondary/15 focus:border-secondary transition-all outline-none';
  const labelCls = 'block text-[13px] font-semibold text-primary mb-1.5';
  const btnCls = 'w-full h-12 rounded-xl bg-secondary hover:brightness-95 disabled:opacity-60 text-white font-semibold text-[15px] shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--color-secondary)_70%,transparent)] transition flex items-center justify-center gap-2';
  const masked = phone ? `+91 ${phone.slice(0, 2)}******${phone.slice(-2)}` : '';

  return (
    <div data-testid="forgot-panel">
          <span className="w-12 h-12 rounded-2xl bg-tint text-secondary flex items-center justify-center mb-4">
            {step === 3 ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : step === 2 ? <Lock className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </span>
          <h2 className="font-serif text-[26px] font-semibold text-primary leading-tight">{step === 3 ? 'Password changed' : 'Reset your password'}</h2>
          <p className="text-[14px] text-primary/60 mt-1.5">
            {step === 0 && 'Enter the mobile number registered with your Carevaa account. We will send you a 6-digit OTP.'}
            {step === 1 && <>We sent a 6-digit OTP to <span className="font-semibold text-primary">{masked}</span>.</>}
            {step === 2 && 'Choose a new password for your account.'}
            {step === 3 && 'You are signed in. Taking you to your dashboard…'}
          </p>

          {step < 3 && (
            <ol className="flex items-center gap-2 mt-5 mb-6" aria-label="Progress">
              {STEPS.map((s, i) => (
                <li key={s} className="flex-1" aria-current={i === step ? 'step' : undefined}>
                  <span className={`block h-1.5 rounded-full ${i <= step ? 'bg-secondary' : 'bg-line'}`} />
                  <span className={`block text-[11.5px] mt-1.5 ${i === step ? 'font-semibold text-primary' : 'text-primary/50'}`}>{s}</span>
                </li>
              ))}
            </ol>
          )}

          {error && <p role="alert" className="flex items-start gap-2 text-[13.5px] text-red-700 bg-red-50 rounded-xl px-3.5 py-2.5 mb-4"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}</p>}
          {info && step === 1 && <p className="text-[13px] text-emerald-800 bg-emerald-50 rounded-xl px-3.5 py-2.5 mb-4">{info}</p>}

          {step === 0 && (
            <form onSubmit={sendOtp} noValidate className="space-y-5">
              <div>
                <label htmlFor="fp-phone" className={labelCls}>Mobile number</label>
                <div className="flex">
                  <span className="h-12 px-3.5 flex items-center rounded-l-xl border border-r-0 border-line bg-tint text-[15px] text-primary/70">+91</span>
                  <input id="fp-phone" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }} placeholder="10-digit mobile number" className={`${inputCls} rounded-l-none`} autoFocus />
                </div>
              </div>
              <button type="submit" disabled={busy} className={btnCls}>{busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-4 h-4" />} Send OTP</button>
              <p className="text-[12.5px] text-primary/55 text-center">Signed up with email only? <Link to="/contact" className="font-semibold text-secondary hover:underline">Contact support</Link> and we will help you.</p>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={checkOtp} noValidate className="space-y-5">
              <div>
                <label htmlFor="fp-otp" className={labelCls}>6-digit OTP</label>
                <input id="fp-otp" ref={codeRef} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} placeholder="• • • • • •" className={`${inputCls} text-center text-[22px] tracking-[0.5em] font-semibold`} />
              </div>
              <button type="submit" disabled={busy} className={btnCls}>{busy && <Loader2 className="w-5 h-5 animate-spin" />} Verify OTP</button>
              <div className="flex items-center justify-between text-[13px]">
                <button type="button" onClick={() => { setStep(0); setError(''); setInfo(''); }} className="font-semibold text-primary/70 hover:text-primary">Change number</button>
                {wait > 0
                  ? <span className="text-primary/50">Resend OTP in {wait}s</span>
                  : <button type="button" onClick={sendOtp} disabled={busy} className="font-semibold text-secondary hover:underline">Resend OTP</button>}
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={savePassword} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-new" className={labelCls}>New password</label>
                <div className="relative">
                  <input id="fp-new" type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="At least 6 characters" className={`${inputCls} pr-12`} autoFocus />
                  <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-primary/50 hover:text-primary hover:bg-tint">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div>
                <label htmlFor="fp-confirm" className={labelCls}>Confirm new password</label>
                <input id="fp-confirm" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} className={inputCls} />
              </div>
              <button type="submit" disabled={busy} className={`${btnCls} mt-2`}>{busy && <Loader2 className="w-5 h-5 animate-spin" />} Save new password</button>
            </form>
          )}

          {step < 3 && (
            <p className="flex items-center justify-center gap-1.5 text-[12px] text-primary/50 mt-6"><ShieldCheck className="w-3.5 h-3.5" /> Never share your OTP. Carevaa staff will never ask for it.</p>
          )}
          {onBack && step < 3 && (
            <button type="button" onClick={onBack} className="mt-4 w-full flex items-center justify-center gap-1.5 text-[13.5px] font-semibold text-primary/70 hover:text-primary"><ArrowLeft className="w-4 h-4" /> Back to login</button>
          )}
    </div>
  );
}
