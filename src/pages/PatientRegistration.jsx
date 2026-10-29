import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User, Phone, Calendar, HeartPulse, Stethoscope, CheckCircle2,
  AlertCircle, Clock, ShieldCheck, MapPin, Building2, ChevronRight,
  FileCheck2, Pill, AlertTriangle, Sparkles, Loader2
} from 'lucide-react';
import api from '../services/api';

const pad = (n) => String(n).padStart(2, '0');
const localDay = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
}) : '—');

export default function PatientRegistration() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [linkData, setLinkData] = useState(null);

  // Form fields
  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    email: '',
    city: '',
    address: '',
    symptoms: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    visitDate: localDay(),
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoadError('No registration link token was provided.');
      setLoading(false);
      return;
    }

    let active = true;
    api.getPublicRegistration(token)
      .then((res) => {
        if (!active) return;
        setLinkData(res);
        if (res.prefill) {
          setForm((prev) => ({
            ...prev,
            name: res.prefill.name || prev.name,
            phone: res.prefill.phone || prev.phone,
            notes: res.prefill.notes || prev.notes,
          }));
        }
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err.message || 'Unable to open registration link');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  const validate = () => {
    const errs = {};
    const name = form.name.trim();
    const phone = form.phone.replace(/\D/g, '');

    if (!name || name.length < 2) {
      errs.name = 'Please enter your full name (at least 2 characters)';
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number';
    }
    if (form.age === '' || form.age === null || isNaN(Number(form.age)) || Number(form.age) < 0 || Number(form.age) > 120) {
      errs.age = 'Please enter a valid age (0–120)';
    }
    if (!form.gender) {
      errs.gender = 'Please select your gender';
    }
    if (!form.symptoms.trim() || form.symptoms.trim().length < 3) {
      errs.symptoms = 'Please describe your main reason for visit or symptoms';
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.submitPublicRegistration(token, {
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, ''),
        age: Number(form.age),
        gender: form.gender,
        email: form.email.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        symptoms: form.symptoms.trim(),
        medicalHistory: form.medicalHistory.trim(),
        currentMedications: form.currentMedications.trim(),
        allergies: form.allergies.trim(),
        visitDate: form.visitDate,
        notes: form.notes.trim(),
      });
      setResult(res);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-lg border border-slate-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 animate-bounce">
            <HeartPulse className="w-7 h-7 text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-primary">Opening Patient Registration</h2>
          <p className="text-sm text-slate-500 mt-1">Connecting to clinic desk...</p>
          <Loader2 className="w-6 h-6 animate-spin text-secondary mt-5" />
        </div>
      </div>
    );
  }

  // Error loading link or link expired / invalid
  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-100 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Registration Link Unavailable</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {loadError}
          </p>
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-left space-y-1.5">
            <p className="font-semibold text-slate-700">Need assistance?</p>
            <p>Please contact your doctor's clinic desk or ask the nurse to share a fresh patient registration link.</p>
          </div>
          <div className="mt-6">
            <Link to="/" className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition">
              Go to Carevaa Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const clinic = linkData?.clinic || {};

  // Already submitted state
  if (linkData?.status === 'Submitted') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-100 text-center animate-[fade-in_0.3s_ease-out]">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Registration Already Submitted</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Your patient registration for <strong className="text-slate-900">Dr. {clinic.doctorName}</strong> was already received
            {linkData.submittedAt ? ` on ${fmtDateTime(linkData.submittedAt)}` : ''}.
          </p>
          <div className="mt-6 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-left text-xs text-emerald-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-emerald-800">
              <ShieldCheck className="w-4 h-4" /> Received at Clinic Desk
            </p>
            <p>Your details are safely on file. When you arrive at the clinic, simply mention your name to the nurse or receptionist.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link to="/" className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cancelled or Expired state
  if (linkData?.status === 'Cancelled' || linkData?.status === 'Expired') {
    const isCancelled = linkData.status === 'Cancelled';
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-100 text-center animate-[fade-in_0.3s_ease-out]">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {isCancelled ? 'Link Cancelled' : 'Registration Link Expired'}
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {isCancelled
              ? `This patient registration link for Dr. ${clinic.doctorName || 'your doctor'} has been cancelled by the clinic desk.`
              : `This patient registration link for Dr. ${clinic.doctorName || 'your doctor'} has expired.`}
          </p>
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
            <p className="font-semibold text-slate-800">Need to register?</p>
            <p>Please ask the clinic nurse or receptionist to send or generate a fresh registration link.</p>
          </div>
          <div className="mt-6 pt-2">
            <Link to="/" className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition">
              Carevaa Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Submission success view
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl border border-slate-100 text-center animate-[fade-in_0.4s_ease-out]">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Registration Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-primary">You're All Set!</h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Your details have been successfully transmitted to the doctor's desk.
          </p>

          {/* Patient Card */}
          <div className="mt-6 p-5 rounded-2xl bg-tint border border-line-soft text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Patient Name</p>
                <p className="text-lg font-bold text-primary mt-0.5">{result.patient?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase font-bold text-slate-400">Patient ID</p>
                <p className="text-base font-extrabold text-secondary mt-0.5">{result.patient?.code}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block font-semibold">Doctor</span>
                <span className="font-bold text-slate-800">Dr. {clinic.doctorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Specialization</span>
                <span className="font-bold text-slate-800">{clinic.specialization}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Clinic</span>
                <span className="font-bold text-slate-800">{clinic.clinicName || 'Clinic Desk'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Registered Phone</span>
                <span className="font-bold text-slate-800">+91 {result.patient?.phone}</span>
              </div>
            </div>
          </div>

          {/* What to do next */}
          <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-left text-xs text-blue-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-blue-800">
              <FileCheck2 className="w-4 h-4" /> Next Steps at the Clinic
            </p>
            <p className="leading-relaxed">
              When you arrive for your visit, inform the nurse or receptionist that you pre-filled the online registration. Quote your <strong className="font-bold">Patient ID: {result.patient?.code}</strong> or mobile number.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
            >
              Print / Save Receipt
            </button>
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition"
            >
              Done
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active registration form
  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Brand & Doctor Header */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center font-black text-lg">
                C
              </span>
              <div>
                <span className="text-base font-bold text-primary tracking-tight">Carevaa</span>
                <span className="text-[10px] block font-semibold text-slate-400 tracking-wider uppercase">Patient Portal</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Form
            </span>
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-tint text-primary font-bold flex items-center justify-center shrink-0 border border-line-soft">
              <Stethoscope className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Doctor's Clinic Intake</p>
              <h2 className="text-lg sm:text-xl font-bold text-primary truncate">Dr. {clinic.doctorName}</h2>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                {[clinic.specialization, clinic.clinicName].filter(Boolean).join(' · ')}
              </p>
              {clinic.clinicAddress && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                  <MapPin className="w-3 h-3 shrink-0" /> {clinic.clinicAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Patient Registration</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Please enter your details and symptoms. They will be immediately available in the doctor's patient visit records.
            </p>
          </div>

          {submitError && (
            <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-medium text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Section 1: Patient Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-secondary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Patient Personal Details</h3>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="e.g. Ramesh Sharma"
                className={`w-full h-12 px-4 rounded-xl border ${errors.name ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-secondary focus:ring-secondary/15'} bg-white text-base text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 transition`}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1 font-medium">{errors.name}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="reg-phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="h-12 px-3.5 flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                  +91
                </span>
                <input
                  id="reg-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="10-digit mobile"
                  className={`w-full h-12 px-4 rounded-r-xl border ${errors.phone ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-secondary focus:ring-secondary/15'} bg-white text-base text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 transition`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-600 mt-1 font-medium">{errors.phone}</p>}
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-age" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Age (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-age"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={120}
                  value={form.age}
                  onChange={(e) => {
                    setForm({ ...form, age: e.target.value });
                    if (errors.age) setErrors({ ...errors, age: '' });
                  }}
                  placeholder="e.g. 32"
                  className={`w-full h-12 px-4 rounded-xl border ${errors.age ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-secondary focus:ring-secondary/15'} bg-white text-base text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 transition`}
                />
                {errors.age && <p className="text-xs text-red-600 mt-1 font-medium">{errors.age}</p>}
              </div>

              <div>
                <label htmlFor="reg-gender" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-gender"
                  value={form.gender}
                  onChange={(e) => {
                    setForm({ ...form, gender: e.target.value });
                    if (errors.gender) setErrors({ ...errors, gender: '' });
                  }}
                  className={`w-full h-12 px-3 rounded-xl border ${errors.gender ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-secondary focus:ring-secondary/15'} bg-white text-base text-slate-900 outline-none focus:ring-4 transition`}
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-xs text-red-600 mt-1 font-medium">{errors.gender}</p>}
              </div>
            </div>

            {/* Email & City (Optional) */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="name@example.com"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15 bg-white text-base text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="reg-city" className="block text-xs font-bold text-slate-700 mb-1.5">
                  City / Locality <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="reg-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Chennai"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15 bg-white text-base text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Visit & Health Information */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <HeartPulse className="w-4 h-4 text-secondary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Visit & Health Information</h3>
            </div>

            {/* Symptoms / Chief Complaints */}
            <div>
              <label htmlFor="reg-symptoms" className="block text-xs font-bold text-slate-700 mb-1.5">
                Reason for Visit / Symptoms <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reg-symptoms"
                rows={3}
                value={form.symptoms}
                onChange={(e) => {
                  setForm({ ...form, symptoms: e.target.value });
                  if (errors.symptoms) setErrors({ ...errors, symptoms: '' });
                }}
                placeholder="Describe your current issues (e.g. fever for 3 days, cough, throat pain, headache, blood sugar checkup...)"
                className={`w-full p-4 rounded-xl border ${errors.symptoms ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-secondary focus:ring-secondary/15'} bg-white text-base text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 transition resize-y`}
              />
              {errors.symptoms && <p className="text-xs text-red-600 mt-1 font-medium">{errors.symptoms}</p>}
            </div>

            {/* Medical History */}
            <div>
              <label htmlFor="reg-history" className="block text-xs font-bold text-slate-700 mb-1.5">
                Past Medical Conditions <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="reg-history"
                type="text"
                value={form.medicalHistory}
                onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
                placeholder="e.g. Diabetes, High Blood Pressure, Asthma, Thyroid (or None)"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15 bg-white text-base text-slate-900 placeholder:text-slate-400 outline-none transition"
              />
            </div>

            {/* Current Medications & Allergies */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-meds" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-slate-400" /> Current Medications <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <input
                  id="reg-meds"
                  type="text"
                  value={form.currentMedications}
                  onChange={(e) => setForm({ ...form, currentMedications: e.target.value })}
                  placeholder="Daily medicines taken..."
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15 bg-white text-base text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="reg-allergies" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> Drug Allergies <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <input
                  id="reg-allergies"
                  type="text"
                  value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa, None"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15 bg-white text-base text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>
            </div>

            {/* Visit Date */}
            <div>
              <label htmlFor="reg-date" className="block text-xs font-bold text-slate-700 mb-1.5">
                Visit Date
              </label>
              <input
                id="reg-date"
                type="date"
                value={form.visitDate}
                onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15 bg-white text-base text-slate-900 outline-none transition"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="reg-notes" className="block text-xs font-bold text-slate-700 mb-1.5">
                Additional Notes for Doctor / Nurse <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="reg-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any specific questions, concerns, or previous clinic reference..."
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15 bg-white text-base text-slate-900 placeholder:text-slate-400 outline-none transition resize-y"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Your information is securely encrypted and submitted exclusively to <strong className="font-semibold text-slate-700">Dr. {clinic.doctorName}</strong> and authorized clinic staff.
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-13 sm:h-14 rounded-2xl bg-secondary hover:brightness-95 text-white font-bold text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Registration...</span>
                </>
              ) : (
                <>
                  <span>Submit Patient Registration</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer branding */}
        <p className="text-center text-xs text-slate-400">
          Powered by Carevaa Clinic Management · Secure Patient Desk
        </p>
      </div>
    </div>
  );
}
