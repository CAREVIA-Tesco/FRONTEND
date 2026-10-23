import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDoctors, saveDoctors, saveCurrentUser } from '../utils/storage';
import api, { getSessionUser } from '../services/api';
import { CheckCircle, Upload, Camera, Building, FileText, Calendar, Clock, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import PincodeFields from '../components/PincodeFields';
import { usePincode, pincodeErrors } from '../services/usePincode';


const specializationOptions = {
  "MBBS Doctor": [
    "General Physician", "General Medicine", "Dermatology", "Pediatrics", "Gynecology", 
    "Cardiology", "Orthopedics", "ENT", "Ophthalmology", "Psychiatry", "Pulmonology", 
    "Gastroenterology", "Neurology", "Urology", "Emergency Medicine", "Family Medicine"
  ],
  "Homeopathy Doctor": [
    "General Homeopathy", "Pediatrics", "Dermatology", "Women’s Health", "Chronic Disease Care",
    "Allergy & Asthma", "Digestive Health", "Mental Wellness", "Joint & Pain Management", "Respiratory Care"
  ],
  "Physiotherapist": [
    "General Physiotherapy", "Orthopedic Physiotherapy", "Sports Physiotherapy", "Neurological Physiotherapy",
    "Pediatric Physiotherapy", "Geriatric Physiotherapy", "Cardiorespiratory Physiotherapy", 
    "Post-Surgery Rehabilitation", "Sports Injury Rehabilitation", "Pain Management"
  ],
  "Nurse": [
    "General Nursing", "Staff Nurse", "ICU Nurse", "Emergency Nurse", "Pediatric Nurse", 
    "Maternity Nurse", "Geriatric Nurse", "Baby Care Nurse", "Surgical Nurse", "Community Health Nurse"
  ],
  "Caretaker": [
    "Elderly Care", "Patient Care", "Post-Surgery Care", "Bedridden Patient Care", "Disability Care", 
    "Child Care", "Baby Care", "Companion Care", "Dementia Care", "Palliative Care"
  ],
  "Lab Centre": [
    "General Diagnostic Tests", "Blood Tests", "Urine Tests", "Diabetes Tests", "Thyroid Tests", 
    "Lipid Profile", "Liver Function Tests", "Kidney Function Tests", "Hormone Tests", "Allergy Tests", 
    "Vitamin Tests", "Microbiology", "Pathology", "Hematology", "Imaging & Diagnostics"
  ]

  , "BHS": [
    "General Health Science", "Community Health", "Public Health", "Health & Wellness", 
    "Nutrition & Wellness", "Healthcare Management", "Medical Laboratory Science", 
    "Health Education", "Preventive Healthcare", "Rehabilitation & Health Support"
  ],
  "Ayurveda Doctor": [
    "General Ayurveda", "Panchakarma", "Kayachikitsa (General Medicine)", "Shalya Tantra (Surgery)", 
    "Shalakya Tantra (ENT & Ophthalmology)", "Kaumarabhritya (Pediatrics)", 
    "Prasuti & Stri Roga (Women’s Health)", "Swasthavritta (Preventive & Lifestyle Care)", 
    "Rasayana (Rejuvenation)", "Visha Chikitsa (Toxicology)", "Skin & Hair Care", "Pain & Joint Care"
  ]
};



const NEEDS_REGISTRATION = ['MBBS Doctor', 'Homeopathy Doctor', 'Ayurveda Doctor', 'Physiotherapist', 'Nurse'];

// Shrink a chosen photo to a 320px square JPEG (keeps uploads small)
function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { reject(new Error('Please choose a JPG, PNG or WebP image.')); return; }
    if (file.size > 8 * 1024 * 1024) { reject(new Error('Please choose an image under 8 MB.')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 320, side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image could not be read.')); };
    img.src = url;
  });
}

export default function ProfessionalOnboarding() {
  const [step, setStep] = useState(2);
  const [profession, setProfession] = useState("");
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [schedule, setSchedule] = useState({
    Mon: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '05:00 PM'],
    Tue: ['10:00 AM', '02:00 PM'],
    Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  });
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', specialization: '', experience: '', languages: '', homeFee: '', onlineFee: '', clinicFee: '',
    gender: '', qualification: '', registrationNumber: '', registrationCouncil: '', pincode: '', city: '', district: '', state: '', locality: '', homeVisitRadiusKm: '10', bio: '', img: '',
    clinicName: '', clinicAddress: '', clinicPhone: '', clinicWebsite: '',
    holderName: '', bankName: '', accountNumber: '', ifsc: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [providerStatus, setProviderStatus] = useState(null);
  const updateForm = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const patchForm = (patch) => setForm((f) => ({ ...f, ...patch }));
  const pinLookup = usePincode(form, patchForm);

  // Only logged-in doctors can onboard; prefill the form if a profile already exists
  // specialities added in Admin → Specializations
  const [catalogSpecs, setCatalogSpecs] = useState([]);
  useEffect(() => { api.getSpecializations().then((d) => setCatalogSpecs((d.specializations || []).filter((x) => x.status === 'Active').map((x) => x.name))).catch(() => {}); }, []);
  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== 'doctor') {
      navigate('/login?redirect=/professional/onboarding');
      return;
    }
    setForm((f) => ({ ...f, name: f.name || user.name || '', holderName: f.holderName || user.name || '' }));
    api.getMyProvider().then(({ provider }) => {
      if (!provider) return;
      setProviderStatus(provider.status);
      setProfession(provider.profession || '');
      if (provider.schedule) setSchedule((prev) => ({ ...prev, ...provider.schedule }));
      setForm((f) => ({
        ...f,
        name: provider.name || f.name,
        specialization: provider.specialization || '',
        experience: provider.experience ?? '',
        languages: (provider.languages || []).join(', '),
        homeFee: provider.fee ?? '',
        onlineFee: provider.onlineFee ?? '',
        clinicFee: provider.clinicFee ?? '',
        gender: provider.gender || '',
        qualification: provider.qualification || '',
        registrationNumber: provider.registrationNumber || '',
        registrationCouncil: provider.registrationCouncil || '',
        pincode: provider.pincode || '',
        city: provider.city || '',
        district: provider.district || '',
        state: provider.state || '',
        locality: provider.locality || '',
        homeVisitRadiusKm: provider.homeVisitRadiusKm ? String(provider.homeVisitRadiusKm) : '10',
        bio: provider.bio || '',
        img: provider.img && provider.img.startsWith('data:') ? provider.img : '',
        clinicName: provider.clinic?.name || '',
        clinicAddress: provider.clinic?.address || '',
        clinicPhone: provider.clinic?.phone || '',
        clinicWebsite: provider.clinic?.website || '',
        holderName: provider.bank?.holderName || f.holderName,
        bankName: provider.bank?.bankName || '',
        ifsc: provider.bank?.ifsc || '',
      }));
    }).catch(() => {});
  }, []);

  const validateProfile = () => {
    if (!form.name.trim()) return 'Please enter your full name.';
    if (!profession || profession === 'Select Profession') return 'Please select your profession.';
    if (!form.qualification.trim()) return 'Please enter your highest qualification.';
    if (NEEDS_REGISTRATION.includes(profession) && !form.registrationNumber.trim()) return 'Please enter your council registration number.';
    if (form.experience === '' || Number(form.experience) < 0) return 'Please enter your years of experience.';
    const addrErr = pincodeErrors(form, pinLookup);
    if (addrErr.pincode) return addrErr.pincode;
    if (addrErr.city) return 'Please enter the city where you work.';
    if (!form.homeFee && !form.onlineFee && !form.clinicFee) return 'Please enter at least one consultation fee.';
    return '';
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    profession,
    specialization: form.specialization && !form.specialization.startsWith('Select') ? form.specialization : '',
    experience: form.experience,
    languages: form.languages,
    homeFee: form.homeFee,
    onlineFee: form.onlineFee,
    clinicFee: form.clinicFee,
    state: form.state.trim(),
    city: form.city.trim(),
    district: form.district.trim(),
    locality: form.locality.trim(),
    gender: form.gender,
    qualification: form.qualification,
    registrationNumber: form.registrationNumber,
    registrationCouncil: form.registrationCouncil,
    pincode: form.pincode,
    homeVisitRadiusKm: form.homeVisitRadiusKm,
    bio: form.bio,
    ...(form.img ? { img: form.img } : {}),
    phone: form.clinicPhone,
    clinic: skipClinic ? undefined : { name: form.clinicName, address: form.clinicAddress, phone: form.clinicPhone, website: form.clinicWebsite },
    bank: { holderName: form.holderName, bankName: form.bankName, accountNumber: form.accountNumber, ifsc: form.ifsc },
    schedule,
  });

  const goFromProfile = () => {
    const msg = validateProfile();
    setFormError(msg);
    if (!msg) setStep(skipClinic ? 4 : 3);
  };

  const handleSubmitVerification = async () => {
    const msg = validateProfile();
    if (msg) { setFormError(msg); setStep(2); return; }
    if (!form.holderName.trim() || !form.bankName.trim() || !form.ifsc.trim() || (!form.accountNumber.trim() && !providerStatus)) {
      setFormError('Please fill in all bank details.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const { provider } = await api.submitOnboarding(buildPayload());
      setProviderStatus(provider.status);
      const user = getSessionUser();
      if (user) saveCurrentUser({ ...user, name: provider.name, providerId: provider.id, providerStatus: provider.status });
      setStep(5);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    setFormError('');
    try {
      await api.submitOnboarding(buildPayload());
      navigate('/doctor/dashboard');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const [newSlot, setNewSlot] = useState('');
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  
  const handleAddSlot = () => {
    if (!newSlot) { setIsAddingSlot(false); return; }
    // Convert 24h to 12h AM/PM
    const [h, m] = newSlot.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const formatted = `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
    
    if (!schedule[selectedDay].includes(formatted)) {
      setSchedule({...schedule, [selectedDay]: [...schedule[selectedDay], formatted].sort()});
    }
    setNewSlot('');
    setIsAddingSlot(false);
  };
  
  const removeSlot = (slot) => {
    setSchedule({
      ...schedule,
      [selectedDay]: schedule[selectedDay].filter(s => s !== slot)
    });
  };
  const skipClinic = profession === "Nurse" || profession === "Caretaker"; // 1 is Account (done in login)
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const baseSteps = [
    { id: 1, title: 'Account', sub: 'Sign-in details' },
    { id: 2, title: 'Profile', sub: 'Qualifications, location, fees' },
    { id: 3, title: 'Clinic', sub: 'Where patients visit you' },
    { id: 4, title: 'Verification', sub: 'Documents and payouts' },
    { id: 5, title: 'Availability', sub: 'Your weekly time slots' },
  ];

  const visibleSteps = baseSteps.filter(s => !(skipClinic && s.id === 3));
  
  const steps = visibleSteps.map((s, index) => {
    const seqNum = index + 1;
    const isPast = step > s.id;
    const isCurrent = step === s.id;
    
    let icon;
    if (s.id === 1 || isPast) {
      icon = <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      icon = <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>{seqNum}</div>;
    }
    
    return { id: s.id, num: s.id, title: s.title, sub: s.sub, icon };
  });

  const stepIndex = Math.max(0, visibleSteps.findIndex((v) => v.id === step));
  const progress = Math.round(((stepIndex + (step === 5 ? 1 : 0)) / (visibleSteps.length - 1 || 1)) * 100);
  const handleSaveExit = () => navigate(providerStatus ? '/doctor/dashboard' : '/');

  return (
    <div className="theme-portea min-h-screen bg-tint font-sans text-primary">
      {/* Slim header */}
      <header className="h-16 bg-white/90 backdrop-blur border-b border-line-soft sticky top-0 z-30">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link to="/" aria-label="Carevaa home"><img src="/logo.png" alt="Carevaa Logo" className="h-10 w-auto object-contain mix-blend-multiply" /></Link>
          <div className="flex items-center gap-3 sm:gap-5 text-sm">
            <span className="hidden md:inline text-primary/60">Questions? <a href="/contact" className="font-semibold text-primary hover:text-secondary">Contact our team</a></span>
            <button type="button" onClick={handleSaveExit} className="h-9 px-4 rounded-xl border border-line font-semibold text-primary/80 hover:text-primary hover:bg-tint transition">Save & exit</button>
          </div>
        </div>
      </header>

      {/* Intro + progress */}
      <section className="relative overflow-hidden bg-deep text-white">
        <img src="/doctor-section.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-25" style={{ objectPosition: '60% 30%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/90 to-deep/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <p className="eyebrow text-on-deep mb-2">Join Carevaa as a professional</p>
          <h1 className="font-serif text-[28px] sm:text-[36px] font-semibold leading-tight">Complete your professional profile</h1>
          <p className="mt-2 text-white/75 max-w-2xl text-[15px]">It takes about 5 minutes. After you submit, the Carevaa team reviews your profile. Patients can find and book you once it is approved.</p>
          <div className="mt-6 max-w-xl">
            <div className="flex items-center justify-between text-[12px] text-white/70 mb-2">
              <span>Step {stepIndex + 1} of {visibleSteps.length}: <span className="font-semibold text-white">{visibleSteps[stepIndex]?.title}</span></span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-white/15 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Profile progress">
              <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${Math.max(progress, 6)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Steps */}
          <aside className="w-full lg:w-[290px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <nav aria-label="Profile steps" className="bg-white rounded-3xl ring-1 ring-line-soft shadow-[0_24px_60px_-34px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] p-5 sm:p-6">
                <ol className="flex lg:flex-col gap-3 lg:gap-0 overflow-x-auto no-scrollbar">
                  {steps.map((s, i) => {
                    const done = s.id === 1 || step > s.num; const current = step === s.num;
                    return (
                      <li key={s.id} className="relative flex items-start gap-3 lg:pb-6 last:pb-0 shrink-0">
                        {i < steps.length - 1 && <span className={`hidden lg:block absolute left-[15px] top-9 bottom-1 w-px ${done ? 'bg-secondary' : 'bg-line'}`} aria-hidden="true" />}
                        <span className={`relative z-10 w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[13px] font-semibold transition ${done ? 'bg-secondary text-white' : current ? 'bg-primary text-white ring-4 ring-primary/10' : 'bg-white ring-1 ring-line text-primary/45'}`}>
                          {done ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
                        </span>
                        <span className="leading-tight pt-1">
                          <span className={`block text-[14px] font-semibold ${current ? 'text-primary' : done ? 'text-primary/80' : 'text-primary/45'}`}>{s.title}</span>
                          <span className="hidden lg:block text-[12px] text-primary/50 mt-0.5">{s.sub}</span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </nav>
              <div className="hidden lg:block rounded-3xl bg-deep text-white p-6 relative overflow-hidden">
                <span className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-secondary/30 blur-3xl" />
                <p className="relative font-semibold">Why a complete profile matters</p>
                <ul className="relative mt-3 space-y-2.5 text-[13px] text-white/75">
                  <li className="flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0 text-on-deep mt-0.5" /> Your registration number earns a verified badge.</li>
                  <li className="flex gap-2"><Camera className="w-4 h-4 shrink-0 text-on-deep mt-0.5" /> A clear photo helps patients choose you.</li>
                  <li className="flex gap-2"><Calendar className="w-4 h-4 shrink-0 text-on-deep mt-0.5" /> Your city and PIN code decide which requests reach you.</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* STEP 2: PROFILE */}
            {step === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-9 ring-1 ring-line-soft shadow-[0_24px_60px_-34px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] cv-rise">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="font-serif text-[26px] font-semibold text-primary mb-1">Your professional profile</h2>
                  <p className="text-sm text-gray-500">Patients see this on your public profile. Fields marked * are required.</p>
                </div>

                {/* Photo */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
                  <label className="relative w-24 h-24 shrink-0 rounded-full cursor-pointer group" aria-label="Upload profile photo">
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" data-testid="photo-input" onChange={async (e) => {
                      const file = e.target.files?.[0]; e.target.value = '';
                      if (!file) return;
                      try { const img = await resizePhoto(file); setForm((f) => ({ ...f, img })); setFormError(''); } catch (err) { setFormError(err.message); }
                    }} />
                    {form.img
                      ? <img src={form.img} alt="Profile preview" className="w-24 h-24 rounded-full object-cover ring-4 ring-secondary/20" data-testid="photo-preview" />
                      : <span className="w-24 h-24 rounded-full bg-tint border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition"><Camera className="w-7 h-7 mb-1" /><span className="text-[10px] font-bold">Upload</span></span>}
                    {form.img && <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center ring-2 ring-white"><Camera className="w-4 h-4" /></span>}
                  </label>
                  <div>
                    <h3 className="font-bold text-gray-700 mb-1">Profile photo</h3>
                    <p className="text-xs text-gray-500 max-w-sm">A clear, front-facing headshot builds trust with patients. JPG, PNG or WebP; we crop it to a square.</p>
                    {form.img && <button type="button" onClick={() => setForm((f) => ({ ...f, img: '' }))} className="mt-2 text-xs font-semibold text-secondary hover:underline">Remove photo</button>}
                  </div>
                </div>

                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-4 pt-6 border-t border-line-soft first-of-type:border-0 first-of-type:pt-0">About you</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div>
                    <label htmlFor="ob-name" className="block text-[13px] font-semibold text-primary mb-1.5">Full Name *</label>
                    <input id="ob-name" type="text" value={form.name} onChange={updateForm('name')} placeholder="Dr. Priya Sharma" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div>
                    <label htmlFor="ob-gender" className="block text-[13px] font-semibold text-primary mb-1.5">Gender</label>
                    <select id="ob-gender" value={form.gender} onChange={updateForm('gender')} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition text-gray-600">
                      <option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ob-profession" className="block text-[13px] font-semibold text-primary mb-1.5">Profession *</label>
                    <select id="ob-profession" value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition text-gray-600">
                      <option>Select Profession</option>
                      <option>MBBS Doctor</option>
                      <option>Homeopathy Doctor</option>
                      <option>Ayurveda Doctor</option>
                      <option>Physiotherapist</option>
                      <option>Nurse</option>
                      <option>Caretaker</option>
                      <option>Lab Centre</option>
                      <option>BHS</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ob-spec" className="block text-[13px] font-semibold text-primary mb-1.5">
                      {profession === 'Lab Centre' ? 'Laboratory Services / Test Categories' : 'Specialization'}
                    </label>
                    {profession && profession !== 'Select Profession' ? (
                      <select id="ob-spec" value={form.specialization} onChange={updateForm('specialization')} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition text-gray-600">
                        <option value="">Select {profession === 'Lab Centre' ? 'Service' : 'Specialization'}</option>
                        {[...new Set([...(specializationOptions[profession] || []), ...(profession === 'MBBS Doctor' ? catalogSpecs : [])])].map(opt => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input id="ob-spec" type="text" placeholder="Select a profession first" disabled className="w-full bg-tint border border-line rounded-xl px-4 py-3 text-[14px] text-primary/40 cursor-not-allowed" />
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="ob-bio" className="block text-[13px] font-semibold text-primary mb-1.5">Short introduction <span className="normal-case font-medium text-gray-400">({600 - form.bio.length} characters left)</span></label>
                    <textarea id="ob-bio" rows="3" maxLength={600} value={form.bio} onChange={updateForm('bio')} placeholder="E.g. I help patients recover mobility after surgery and sports injuries, with home-based exercise plans." className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition resize-none" />
                  </div>
                </div>

                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-4 pt-6 border-t border-line-soft first-of-type:border-0 first-of-type:pt-0">Qualifications and registration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div>
                    <label htmlFor="ob-qual" className="block text-[13px] font-semibold text-primary mb-1.5">Highest qualification *</label>
                    <input id="ob-qual" type="text" value={form.qualification} onChange={updateForm('qualification')} placeholder="MBBS, MD (General Medicine)" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div>
                    <label htmlFor="ob-exp" className="block text-[13px] font-semibold text-primary mb-1.5">Experience (Years) *</label>
                    <input id="ob-exp" type="number" min="0" value={form.experience} onChange={updateForm('experience')} placeholder="8" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div>
                    <label htmlFor="ob-reg" className="block text-[13px] font-semibold text-primary mb-1.5">{profession === 'Nurse' ? 'Nursing council' : 'Council'} registration no. {NEEDS_REGISTRATION.includes(profession) ? '*' : ''}</label>
                    <input id="ob-reg" type="text" value={form.registrationNumber} onChange={updateForm('registrationNumber')} placeholder="TNMC 123456" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition uppercase placeholder:normal-case" />
                  </div>
                  <div>
                    <label htmlFor="ob-council" className="block text-[13px] font-semibold text-primary mb-1.5">Registered with</label>
                    <input id="ob-council" type="text" value={form.registrationCouncil} onChange={updateForm('registrationCouncil')} placeholder="Tamil Nadu Medical Council" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="ob-lang" className="block text-[13px] font-semibold text-primary mb-1.5">Languages Spoken</label>
                    <input id="ob-lang" type="text" value={form.languages} onChange={updateForm('languages')} placeholder="English, Hindi, Tamil" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                </div>

                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-4 pt-6 border-t border-line-soft first-of-type:border-0 first-of-type:pt-0">Where you work</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <PincodeFields idPrefix="ob" value={form} onChange={patchForm} lookup={pinLookup} fieldCls="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" labelCls="block text-[13px] font-semibold text-primary mb-1.5" className="md:col-span-2 space-y-4" />
                  <div>
                    <label htmlFor="ob-radius" className="block text-[13px] font-semibold text-primary mb-1.5">Home visits within</label>
                    <select id="ob-radius" value={form.homeVisitRadiusKm} onChange={updateForm('homeVisitRadiusKm')} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition">
                      <option value="0">I don't do home visits</option><option value="5">5 km</option><option value="10">10 km</option><option value="15">15 km</option><option value="25">25 km</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-4 pt-6 border-t border-line-soft first-of-type:border-0 first-of-type:pt-0">Fees (at least one)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                  <div>
                    <label htmlFor="ob-fee-home" className="block text-[13px] font-semibold text-primary mb-1.5">Home visit (₹)</label>
                    <input id="ob-fee-home" type="number" min="0" value={form.homeFee} onChange={updateForm('homeFee')} placeholder="800" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div>
                    <label htmlFor="ob-fee-online" className="block text-[13px] font-semibold text-primary mb-1.5">Online (₹)</label>
                    <input id="ob-fee-online" type="number" min="0" value={form.onlineFee} onChange={updateForm('onlineFee')} placeholder="500" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div>
                    <label htmlFor="ob-fee-clinic" className="block text-[13px] font-semibold text-primary mb-1.5">Clinic (₹)</label>
                    <input id="ob-fee-clinic" type="number" min="0" value={form.clinicFee} onChange={updateForm('clinicFee')} placeholder="600" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                </div>

                {formError && <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{formError}</p>}
                <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-6">
                  <button onClick={goFromProfile} className="bg-secondary hover:brightness-95 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)]">
                    Save & Continue
                  </button>
                  <button onClick={goFromProfile} className="bg-white border border-line text-primary/70 hover:text-primary hover:bg-tint px-8 py-3.5 rounded-xl font-semibold transition-all">
                    Save as Draft
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CLINIC */}
            {step === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-9 ring-1 ring-line-soft shadow-[0_24px_60px_-34px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] cv-rise">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="font-serif text-[26px] font-semibold text-primary mb-1">Add Clinic Details</h2>
                  <p className="text-sm text-gray-500">Link your clinic and manage its information.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">Clinic Name *</label>
                    <input type="text" value={form.clinicName} onChange={updateForm('clinicName')} placeholder="Carevaa Health Clinic" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">Clinic Address *</label>
                    <textarea rows="2" value={form.clinicAddress} onChange={updateForm('clinicAddress')} placeholder="123 Health Avenue, Block B..." className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition resize-none"></textarea>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">Phone Number</label>
                    <input type="tel" value={form.clinicPhone} onChange={updateForm('clinicPhone')} placeholder="+91 98765 43210" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">Website / Google Maps</label>
                    <input type="url" value={form.clinicWebsite} onChange={updateForm('clinicWebsite')} placeholder="https://..." className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-[13px] font-semibold text-primary mb-2">Clinic Photos</label>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    <div className="w-32 h-24 shrink-0 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs font-bold">+ Add Photo</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-gray-100 pt-6">
                  <button onClick={() => setStep(4)} className="bg-secondary hover:brightness-95 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)]">
                    Save & Continue
                  </button>
                  <button onClick={() => setStep(2)} className="bg-white border border-line text-primary/70 hover:text-primary hover:bg-tint px-8 py-3.5 rounded-xl font-semibold transition-all">
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: VERIFICATION */}
            {step === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-9 ring-1 ring-line-soft shadow-[0_24px_60px_-34px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] cv-rise">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="font-serif text-[26px] font-semibold text-primary mb-1">Verification and payouts</h2>
                  <p className="text-sm text-gray-500">Documents we will verify, and where we send your earnings.</p>
                </div>
                
                <div className="rounded-2xl bg-tint ring-1 ring-line-soft p-5 mb-8">
                  <p className="text-[14px] text-primary/75">Keep these ready. After you submit, our verification team will contact you to collect them securely.</p>
                  <ul className="mt-4 grid sm:grid-cols-3 gap-3">
                    {[['Registration certificate', 'From your council'], ['Qualification certificate', 'Highest degree'], ['ID proof', 'Aadhaar or PAN']].map(([t, sub]) => (
                      <li key={t} className="bg-white rounded-xl ring-1 ring-line-soft p-4 flex items-start gap-3">
                        <span className="w-9 h-9 rounded-lg bg-mint text-accent flex items-center justify-center shrink-0"><FileText className="w-[18px] h-[18px]" /></span>
                        <span className="leading-tight"><span className="block text-[14px] font-semibold">{t}</span><span className="block text-[12px] text-primary/55 mt-0.5">{sub}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6 pb-4 border-b border-gray-100 mt-10">
                  <h2 className="font-serif text-[22px] font-semibold text-primary mb-1">Bank Details</h2>
                  <p className="text-sm text-gray-500">Provide your bank information for receiving consultation payouts.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">Account Holder Name *</label>
                    <input type="text" value={form.holderName} onChange={updateForm('holderName')} placeholder="Dr. Priya Sharma" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">Bank Name *</label>
                    <input type="text" value={form.bankName} onChange={updateForm('bankName')} placeholder="e.g. HDFC Bank" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">Account Number *</label>
                    <input type="password" value={form.accountNumber} onChange={updateForm('accountNumber')} placeholder={providerStatus ? 'Leave blank to keep existing' : '••••••••••••'} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">IFSC Code *</label>
                    <input type="text" value={form.ifsc} onChange={updateForm('ifsc')} placeholder="e.g. HDFC0001234" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition uppercase placeholder:normal-case" />
                  </div>
                </div>

                

                <div className="bg-mint ring-1 ring-line p-4 rounded-xl flex items-start gap-3 mb-8">
                  <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-primary/80 leading-relaxed">Your profile will be reviewed by our admin team to ensure quality and trust. You’ll be notified once approved.</p>
                </div>

                {formError && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{formError}</p>}
                <div className="flex gap-4 border-t border-gray-100 pt-6">
                  <button onClick={handleSubmitVerification} disabled={saving} className="bg-secondary hover:brightness-95 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)] disabled:opacity-70">
                    {saving ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                  <button onClick={() => setStep(skipClinic ? 2 : 3)} className="bg-white border border-line text-primary/70 hover:text-primary hover:bg-tint px-8 py-3.5 rounded-xl font-semibold transition-all">
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: AVAILABILITY (LIVE) */}
            {step === 5 && (
              <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
                
                <div className="bg-green-50 border border-green-200 rounded-[24px] p-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full shrink-0 mt-1"><CheckCircle className="w-8 h-8 text-green-600" /></div>
                    <div>
                      <h2 className="text-xl font-bold text-green-800 mb-1">{providerStatus === 'ACTIVE' ? 'Profile Verified!' : 'Profile Submitted!'}</h2>
                      <p className="text-sm text-green-700">{providerStatus === 'ACTIVE' ? 'Your profile is now live on Carevaa. Set your availability below so patients can book appointments.' : 'Your profile is under admin review and will go live once approved. Set your availability below so patients can book you right after approval.'}</p>
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} className="bg-white text-green-700 border-2 border-green-200 hover:bg-green-100 px-5 py-2.5 rounded-xl font-bold text-sm transition shrink-0 whitespace-nowrap">
                    Manage Profile
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-9 ring-1 ring-line-soft shadow-[0_24px_60px_-34px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]">
                  <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-[22px] font-semibold text-primary mb-1">Available Slots</h2>
                      <p className="text-sm text-gray-500">Configure your weekly working hours.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                      const count = schedule[day].length;
                      return (
                        <button 
                          key={day} 
                          onClick={() => setSelectedDay(day)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition flex items-center gap-1.5 ${selectedDay === day ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}
                        >
                          {day}
                          {count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedDay === day ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                    <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary" /> 
                      {selectedDay === 'Thu' ? 'Thursday' : selectedDay === 'Tue' ? 'Tuesday' : selectedDay === 'Wed' ? 'Wednesday' : selectedDay === 'Fri' ? 'Friday' : selectedDay === 'Sat' ? 'Saturday' : selectedDay === 'Sun' ? 'Sunday' : 'Monday'} Time Slots
                    </h4>
                    
                    <div className="flex flex-wrap gap-3 items-center">
                      {schedule[selectedDay].length === 0 && !isAddingSlot && (
                        <p className="text-sm text-gray-400 font-medium italic w-full mb-2">No slots added for this day.</p>
                      )}
                      
                      {schedule[selectedDay].map(time => (
                        <div key={time} className="bg-white border border-gray-200 pl-4 pr-1 py-1.5 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2 group transition">
                          {time}
                          <button onClick={() => removeSlot(time)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                      
                      {!isAddingSlot ? (
                        <button 
                          onClick={() => setIsAddingSlot(true)}
                          className="border-2 border-dashed border-gray-300 px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-white hover:border-gray-400 hover:text-primary transition"
                        >
                          + Add Slot
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={newSlot}
                            onChange={(e) => setNewSlot(e.target.value)}
                            className="bg-white border-2 border-primary text-primary px-3 py-1.5 rounded-lg text-sm font-bold outline-none"
                            autoFocus
                          />
                          <button onClick={handleAddSlot} className="bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm transition">
                            Save
                          </button>
                          <button onClick={() => setIsAddingSlot(false)} className="text-gray-400 hover:text-gray-600 font-medium text-sm px-2">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {formError && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{formError}</p>}
                  <div className="flex gap-4 border-t border-gray-100 pt-6">
                    <button onClick={handleComplete} disabled={saving} className="bg-secondary hover:brightness-95 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)] text-center inline-block disabled:opacity-70">
                      {saving ? 'Saving...' : 'Save Availability & Go to Dashboard'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
