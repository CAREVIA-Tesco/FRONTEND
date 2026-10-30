import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveCurrentUser } from '../utils/storage';
import api, { getSessionUser, saveSession } from '../services/api';
import { useFormDraft, clearDraft } from '../services/formDraft';
import DraftNotice from '../components/DraftNotice';
import { getPendingSignup, clearPendingSignup } from '../services/pendingSignup';
import { CheckCircle, Upload, Camera, FileText, Calendar, ShieldCheck, Check, Sparkles } from 'lucide-react';
import PincodeFields from '../components/PincodeFields';
import { usePincode, pincodeErrors } from '../services/usePincode';
import { ConsultTypePicker, HoursEditor } from '../components/ConsultationSettings';
import { CONSULT_TYPES, CONSULT_LABEL, offersOf, hoursForEdit, checkConsultation } from '../services/consultation';

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
  ],
  "BHS": [
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

const CARE_TYPES_LIST = [
  "Elderly Care", "Patient Care", "Post-Surgery Care", "Bedridden Patient Care",
  "Disability Care", "Child Care", "Baby Care", "Companion Care", "Dementia Care", "Palliative Care"
];

const LAB_SERVICES_LIST = [
  "Blood Tests", "Urine Tests", "Diabetes Tests", "Thyroid Tests", "Lipid Profile",
  "Liver Function Tests", "Kidney Function Tests", "Hormone Tests", "Allergy Tests",
  "Vitamin Tests", "Microbiology", "Pathology", "Hematology", "Imaging & Diagnostics",
  "General Diagnostic Tests"
];

const LAB_CENTRE_TYPES = [
  "Diagnostic Lab",
  "Pathology Lab",
  "Imaging & Radiology Centre",
  "Comprehensive Diagnostic Centre",
  "Blood & Urine Collection Centre",
  "Specialized Molecular & Genetic Lab",
  "Other"
];

const ACCREDITATION_OPTIONS = [
  "NABL Accredited (ISO 15189)",
  "ISO 9001:2015 Certified",
  "ICMR Approved",
  "CAP (College of American Pathologists) Accredited",
  "State Health Authority Registered",
  "In Process / Not Applicable",
  "Other"
];

const LISTED_PROFESSIONS = ['MBBS Doctor', 'Homeopathy Doctor', 'Ayurveda Doctor', 'Physiotherapist', 'Nurse', 'Caretaker', 'Lab Centre', 'BHS'];
const OTHER = '__other__';

// Aadhaar / ID photo: keep it readable but small (longest side 1400px, JPEG)
function resizeDocument(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { reject(new Error('Please choose a JPG, PNG or WebP photo of your Aadhaar / ID card.')); return; }
    if (file.size > 10 * 1024 * 1024) { reject(new Error('Please choose an image under 10 MB.')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image could not be read.')); };
    img.src = url;
  });
}

// Shrink a chosen photo or logo to a 320px square JPEG (keeps uploads small)
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
  const [otherProfession, setOtherProfession] = useState(''); // typed in when "Other" is chosen
  const [specIsOther, setSpecIsOther] = useState(false);
  const [customLabService, setCustomLabService] = useState('');
  const [aadhaar, setAadhaar] = useState({ number: '', photo: '' });
  const [aadhaarOnFile, setAadhaarOnFile] = useState(null); // { last4, photoUploaded } for a saved profile
  const professionValue = profession === 'Other' ? otherProfession.trim() : profession;
  const navigate = useNavigate();

  // Consultation types offered and the timings for each
  const [types, setTypes] = useState({ home: true, clinic: true, online: true });
  const [hours, setHours] = useState(() => Object.fromEntries(CONSULT_TYPES.map((t) => [t, hoursForEdit(null, t)])));
  const setHoursFor = (t) => (v) => setHours((h) => ({ ...h, [t]: v }));

  const [form, setForm] = useState({
    name: '', specialization: '', experience: '', languages: '', homeFee: '', onlineFee: '', clinicFee: '',
    gender: '', qualification: '', registrationNumber: '', registrationCouncil: '', pincode: '', city: '', district: '', state: '', locality: '', homeVisitRadiusKm: '10', bio: '', img: '',
    clinicName: '', clinicAddress: '', clinicPhone: '', clinicWebsite: '',
    holderName: '', bankName: '', accountNumber: '', ifsc: '',
    contactPerson: '', centreType: 'Diagnostic Lab', servicesOffered: ['Blood Tests', 'General Diagnostic Tests'], servicesDetails: {}, accreditation: 'NABL Accredited (ISO 15189)',
    careTypes: ['Elderly Care', 'Patient Care'], trainingCertificates: '', email: '', phone: '',
  });

  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [providerStatus, setProviderStatus] = useState(null);

  const updateForm = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const patchForm = (patch) => setForm((f) => ({ ...f, ...patch }));
  const pinLookup = usePincode(form, patchForm);

  // Categorization helpers
  const isLab = profession === 'Lab Centre';
  const isCaretaker = profession === 'Caretaker';
  const isNurse = profession === 'Nurse';
  const isPhysio = profession === 'Physiotherapist';
  const isDoctor = ['MBBS Doctor', 'Homeopathy Doctor', 'Ayurveda Doctor'].includes(profession);
  const skipClinic = isNurse || isCaretaker;
  const offered = isLab ? ['clinic', 'home'] : skipClinic ? ['home'] : CONSULT_TYPES;
  const activeTypes = isLab
    ? { home: Boolean(types.home), clinic: Boolean(types.clinic), online: false }
    : skipClinic
      ? { home: true, clinic: false, online: false }
      : types;
  const noClinicStep = skipClinic || !activeTypes.clinic;

  // Live services loaded dynamically from Carevaa Admin Panel
  const [catalogServices, setCatalogServices] = useState([]);
  useEffect(() => {
    api.getServices()
      .then((d) => setCatalogServices((d.services || []).filter((s) => s.status === 'Active')))
      .catch(() => {});
  }, []);

  const professionServices = useMemo(() => {
    if (!professionValue) return [];
    return catalogServices.filter((s) => {
      if (s.professions && Array.isArray(s.professions) && s.professions.length > 0) {
        return s.professions.includes(professionValue);
      }
      if (s.matches && Array.isArray(s.matches) && s.matches.includes(professionValue)) {
        return true;
      }
      if (professionValue === 'MBBS Doctor' && ['doctor-visit', 'home-doctor', 'baby-care'].includes(s.key)) return true;
      if (professionValue === 'Physiotherapist' && s.key === 'physiotherapy') return true;
      if (professionValue === 'Nurse' && ['nurse-care', 'baby-care'].includes(s.key)) return true;
      if (professionValue === 'Caretaker' && s.key === 'care-taker') return true;
      if (professionValue === 'Lab Centre' && s.key === 'lab-tests') return true;
      if (professionValue === 'Ayurveda Doctor' && s.key === 'ayurveda') return true;
      if (professionValue === 'Homeopathy Doctor' && (s.key === 'homeopathy' || s.name === 'Homeopathy')) return true;
      if (professionValue === 'BHS' && s.key === 'bhs') return true;
      return false;
    });
  }, [catalogServices, professionValue]);

  // Handle clean profession switching
  const handleProfessionChange = (newProfession) => {
    setProfession(newProfession);
    setSpecIsOther(false);
    setFormError('');

    const relevantForNew = catalogServices.filter((s) => {
      if (s.professions && Array.isArray(s.professions) && s.professions.length > 0) {
        return s.professions.includes(newProfession);
      }
      if (s.matches && Array.isArray(s.matches) && s.matches.includes(newProfession)) {
        return true;
      }
      if (newProfession === 'MBBS Doctor' && ['doctor-visit', 'home-doctor', 'baby-care'].includes(s.key)) return true;
      if (newProfession === 'Physiotherapist' && s.key === 'physiotherapy') return true;
      if (newProfession === 'Nurse' && ['nurse-care', 'baby-care'].includes(s.key)) return true;
      if (newProfession === 'Caretaker' && s.key === 'care-taker') return true;
      if (newProfession === 'Lab Centre' && s.key === 'lab-tests') return true;
      if (newProfession === 'Ayurveda Doctor' && s.key === 'ayurveda') return true;
      if (newProfession === 'Homeopathy Doctor' && (s.key === 'homeopathy' || s.name === 'Homeopathy')) return true;
      if (newProfession === 'BHS' && s.key === 'bhs') return true;
      return false;
    }).map((s) => s.name);

    setForm((f) => {
      const next = { ...f, specialization: '', servicesOffered: relevantForNew, servicesDetails: {} };

      if (newProfession === 'Lab Centre') {
        // Clear inappropriate individual doctor fields
        next.gender = '';
        next.qualification = '';
        next.registrationCouncil = '';
        next.careTypes = [];
        next.trainingCertificates = '';
        if (!next.centreType) next.centreType = 'Diagnostic Lab';
        if (!next.accreditation) next.accreditation = 'NABL Accredited (ISO 15189)';
        next.servicesOffered = [...new Set([...relevantForNew, 'Blood Tests', 'General Diagnostic Tests'])];
        next.specialization = next.servicesOffered[0] || 'General Diagnostic Tests';
      } else if (newProfession === 'Caretaker') {
        // Clear council registration numbers not suitable for caretaker
        next.registrationNumber = '';
        next.registrationCouncil = '';
        next.contactPerson = '';
        next.centreType = '';
        next.accreditation = '';
        if (!next.careTypes || next.careTypes.length === 0) {
          next.careTypes = ['Elderly Care', 'Patient Care'];
          next.specialization = 'Elderly Care';
        }
      } else {
        // Individual medical/nursing/health professionals
        next.contactPerson = '';
        next.centreType = '';
        next.accreditation = '';
        next.careTypes = [];
        next.trainingCertificates = '';
      }
      return next;
    });

    if (newProfession === 'Lab Centre') {
      setTypes({ home: true, clinic: true, online: false });
    } else if (newProfession === 'Nurse' || newProfession === 'Caretaker') {
      setTypes({ home: true, clinic: false, online: false });
    } else {
      setTypes({ home: true, clinic: true, online: true });
    }
  };

  // Toggle Services (All Professions)
  const toggleService = (svc) => {
    const svcName = typeof svc === 'string' ? svc : svc.name;
    const isObj = typeof svc === 'object';
    setForm((f) => {
      const cur = f.servicesOffered || [];
      const isSelected = cur.includes(svcName);
      const updated = isSelected ? cur.filter((x) => x !== svcName) : [...cur, svcName];
      const curDetails = { ...(f.servicesDetails || {}) };
      if (!isSelected && !curDetails[svcName]) {
        curDetails[svcName] = {
          serviceKey: isObj ? svc.key : undefined,
          price: isObj && svc.price ? String(svc.price).replace(/[^\d]/g, '') : (f.homeFee || f.clinicFee || f.onlineFee || ''),
          description: isObj ? (svc.short || svc.desc || '') : '',
          homeAvailable: Boolean(activeTypes.home),
          onlineAvailable: Boolean(activeTypes.online),
          clinicAvailable: Boolean(activeTypes.clinic),
        };
      }
      return {
        ...f,
        servicesOffered: updated,
        servicesDetails: curDetails,
      };
    });
  };

  const updateServiceDetail = (svcName, key, value) => {
    setForm((f) => ({
      ...f,
      servicesDetails: {
        ...(f.servicesDetails || {}),
        [svcName]: {
          ...((f.servicesDetails || {})[svcName] || {}),
          [key]: value,
        },
      },
    }));
  };

  // Toggle Care Types for Caretaker
  const toggleCareType = (type) => {
    setForm((f) => {
      const cur = f.careTypes || [];
      const updated = cur.includes(type) ? cur.filter((x) => x !== type) : [...cur, type];
      return {
        ...f,
        careTypes: updated,
        specialization: updated[0] || '',
      };
    });
  };

  // Toggle Services for Lab Centre
  const toggleLabService = (svc) => {
    setForm((f) => {
      const cur = f.servicesOffered || [];
      const updated = cur.includes(svc) ? cur.filter((x) => x !== svc) : [...cur, svc];
      return {
        ...f,
        servicesOffered: updated,
        specialization: updated[0] || '',
      };
    });
  };

  const handleAddCustomLabService = () => {
    const trimmed = customLabService.trim();
    if (!trimmed) return;
    setForm((f) => {
      const cur = f.servicesOffered || [];
      if (cur.includes(trimmed)) return f;
      return {
        ...f,
        servicesOffered: [...cur, trimmed],
        specialization: f.specialization || trimmed,
      };
    });
    setCustomLabService('');
  };

  // Specialities added in Admin → Specializations
  const [draftReady, setDraftReady] = useState(false); // saved profile loaded – a draft is applied on top of it
  const [catalogSpecs, setCatalogSpecs] = useState([]);
  useEffect(() => {
    api.getSpecializations()
      .then((d) => setCatalogSpecs((d.specializations || []).filter((x) => x.status === 'Active').map((x) => x.name)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const user = getSessionUser();
    const signup = getPendingSignup();
    if ((!user || user.role !== 'doctor') && signup) {
      setForm((f) => ({ ...f, name: f.name || signup.name, holderName: f.holderName || signup.name }));
      setDraftReady(true);
      return;
    }
    if (!user || user.role !== 'doctor') {
      navigate('/doctor?redirect=/professional/onboarding');
      return;
    }
    setForm((f) => ({ ...f, name: f.name || user.name || '', holderName: f.holderName || user.name || '' }));
    api.getMyProvider().then(({ provider }) => {
      if (!provider) return;
      setProviderStatus(provider.status);
      if (provider.profession && !LISTED_PROFESSIONS.includes(provider.profession)) {
        setProfession('Other');
        setOtherProfession(provider.profession);
      } else {
        setProfession(provider.profession || '');
      }
      if (provider.aadhaar) setAadhaarOnFile(provider.aadhaar);
      setTypes(offersOf(provider));
      setHours(Object.fromEntries(CONSULT_TYPES.map((t) => [t, hoursForEdit(provider, t)])));
      const details = {};
      if (provider.services && Array.isArray(provider.services)) {
        provider.services.forEach((s) => {
          details[s.name] = {
            serviceKey: s.serviceKey,
            price: s.price != null ? String(s.price) : '',
            description: s.description || '',
            homeAvailable: s.homeAvailable,
            onlineAvailable: s.onlineAvailable,
            clinicAvailable: s.clinicAvailable,
          };
        });
      }
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
        contactPerson: provider.contactPerson || '',
        centreType: provider.centreType || 'Diagnostic Lab',
        servicesOffered: provider.servicesOffered || (provider.services?.length ? provider.services.map((s) => s.name) : (provider.profession === 'Lab Centre' ? ['Blood Tests', 'General Diagnostic Tests'] : [])),
        servicesDetails: details,
        accreditation: provider.accreditation || 'NABL Accredited (ISO 15189)',
        careTypes: provider.careTypes || ['Elderly Care', 'Patient Care'],
        trainingCertificates: provider.trainingCertificates || '',
        email: provider.email || '',
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
        clinicPhone: provider.clinic?.phone || provider.phone || '',
        clinicWebsite: provider.clinic?.website || '',
        holderName: provider.bank?.holderName || f.holderName,
        bankName: provider.bank?.bankName || '',
        ifsc: provider.bank?.ifsc || '',
      }));
    }).catch(() => {}).finally(() => setDraftReady(true));
  }, [navigate]);

  // ---- auto-saved draft: unfinished details stay in the form (this device only) until it is submitted
  const draftUser = getSessionUser();
  const draftSignup = getPendingSignup();
  const draftKey = draftUser?.role === 'doctor' ? `pro-onboarding:${draftUser.id}`
    : draftSignup ? `pro-onboarding:new:${String(draftSignup.identifier).trim().toLowerCase()}` : null;
  const draft = useFormDraft(draftKey, {
    step: step <= 4 ? step : 2, profession, otherProfession, specIsOther, customLabService, aadhaar, types, hours, form,
  }, {
    ready: draftReady,
    onRestore: (d) => {
      if (d.profession !== undefined) setProfession(d.profession);
      if (d.otherProfession !== undefined) setOtherProfession(d.otherProfession);
      if (d.specIsOther !== undefined) setSpecIsOther(d.specIsOther);
      if (d.customLabService !== undefined) setCustomLabService(d.customLabService);
      if (d.aadhaar) setAadhaar((a) => ({ ...a, ...d.aadhaar }));
      if (d.types) setTypes(d.types);
      if (d.hours) setHours((h) => ({ ...h, ...d.hours }));
      if (d.form) setForm((f) => ({ ...f, ...d.form }));
      if (d.step >= 2 && d.step <= 4) setStep(d.step);
    },
  });
  const finishDraft = () => { draft.clear(); clearDraft('doctor-signup'); };

  const validateProfile = () => {
    if (!profession || profession === 'Select Profession') return 'Please select your profession.';
    if (profession === 'Other' && !otherProfession.trim()) return 'Please type your profession name.';

    if (!form.name.trim()) {
      return isLab ? 'Please enter your lab centre name.' : 'Please enter your full name.';
    }

    if (isLab) {
      if (!form.contactPerson?.trim()) return 'Please enter the owner or contact person name.';
      if (!form.centreType?.trim()) return 'Please select the centre type.';
      if ((!form.servicesOffered || form.servicesOffered.length === 0) && !form.specialization?.trim()) {
        return 'Please select at least one service or test category.';
      }
      if (form.experience === '' || Number(form.experience) < 0) return 'Please enter years of operation.';
      if (!form.registrationNumber.trim()) return 'Please enter your laboratory registration or licence number.';
      if (!form.accreditation?.trim()) return 'Please enter or select accreditation details.';
    } else if (isCaretaker) {
      if ((!form.careTypes || form.careTypes.length === 0) && !form.specialization?.trim()) {
        return 'Please select at least one type of care provided.';
      }
      if (form.experience === '' || Number(form.experience) < 0) return 'Please enter your years of experience.';
    } else if (isNurse) {
      if (!form.qualification.trim()) return 'Please enter your nursing qualification (e.g. ANM, GNM, B.Sc. Nursing).';
      if (form.experience === '' || Number(form.experience) < 0) return 'Please enter your years of experience.';
      if (!form.registrationNumber.trim()) return 'Please enter your nursing council registration number.';
      if (!form.registrationCouncil.trim()) return 'Please enter the nursing council you are registered with.';
    } else if (isDoctor) {
      if (!form.qualification.trim()) return profession === 'MBBS Doctor' ? 'Please enter your highest medical qualification (e.g. MBBS, MD).' : 'Please enter your highest qualification.';
      if (form.experience === '' || Number(form.experience) < 0) return 'Please enter your years of experience.';
      if (!form.registrationNumber.trim()) return profession === 'MBBS Doctor' ? 'Please enter your medical council registration number.' : 'Please enter your registration number.';
      if (!form.registrationCouncil.trim()) return 'Please enter the medical council you are registered with.';
    } else if (isPhysio) {
      if (!form.qualification.trim()) return 'Please enter your highest qualification (e.g. BPT, MPT).';
      if (form.experience === '' || Number(form.experience) < 0) return 'Please enter your years of experience.';
    } else {
      // Other / BHS
      if (!form.qualification.trim()) return 'Please enter your highest qualification.';
      if (form.experience === '' || Number(form.experience) < 0) return 'Please enter your years of experience.';
    }

    const addrErr = pincodeErrors(form, pinLookup);
    if (addrErr.pincode) return addrErr.pincode;
    if (addrErr.city) return isLab ? 'Please enter the city where your centre is located.' : 'Please enter the city where you work.';

    if (!offered.some((t) => activeTypes[t])) {
      return isLab ? 'Please select at least one service mode (walk-in or home sample collection).' : 'Please choose at least one consultation type you offer.';
    }

    const feeKey = { home: 'homeFee', clinic: 'clinicFee', online: 'onlineFee' };
    if (!offered.some((t) => activeTypes[t] && form[feeKey[t]] !== '' && form[feeKey[t]] != null)) {
      return isLab ? 'Please enter at least one fee (lab visit or home collection).' : 'Please enter at least one consultation fee.';
    }

    return '';
  };

  const validateClinic = () => {
    if (activeTypes.clinic && !noClinicStep) {
      const clinicName = isLab ? (form.clinicName.trim() || form.name.trim()) : form.clinicName.trim();
      const clinicAddress = form.clinicAddress.trim() || [form.locality, form.city, form.state].filter(Boolean).join(', ');
      if (!clinicName || !clinicAddress) {
        return isLab ? 'Please enter your lab centre address.' : 'Please enter your clinic name and address.';
      }
    }
    return '';
  };

  const validateTimings = () => checkConsultation({
    types: activeTypes,
    hours,
    clinicName: form.clinicName || (isLab ? form.name : ''),
    clinicAddress: form.clinicAddress || (isLab ? [form.locality, form.city, form.state].filter(Boolean).join(', ') : ''),
  });

  const buildPayload = () => {
    const clinicName = isLab ? (form.clinicName.trim() || form.name.trim()) : form.clinicName.trim();
    const clinicAddress = form.clinicAddress.trim() || [form.locality, form.city, form.state].filter(Boolean).join(', ');
    const phone = form.clinicPhone || form.phone;

    const selectedServiceNames = Array.isArray(form.servicesOffered)
      ? form.servicesOffered
      : (form.servicesOffered ? String(form.servicesOffered).split(',').map((s) => s.trim()).filter(Boolean) : []);

    const structuredServices = selectedServiceNames.map((name) => {
      const d = form.servicesDetails?.[name] || {};
      const cat = catalogServices.find((s) => s.name === name || s.key === name);
      return {
        name,
        serviceKey: d.serviceKey || cat?.key,
        price: d.price ? Number(d.price) : (Number(form.homeFee) || Number(form.clinicFee) || Number(form.onlineFee) || undefined),
        description: d.description || cat?.short || cat?.desc || undefined,
        homeAvailable: d.homeAvailable !== undefined ? Boolean(d.homeAvailable) : Boolean(activeTypes.home),
        onlineAvailable: d.onlineAvailable !== undefined ? Boolean(d.onlineAvailable) : Boolean(activeTypes.online),
        clinicAvailable: d.clinicAvailable !== undefined ? Boolean(d.clinicAvailable) : Boolean(activeTypes.clinic),
      };
    });

    return {
      name: form.name.trim(),
      profession: professionValue,
      specialization: form.specialization && !form.specialization.startsWith('Select')
        ? form.specialization
        : (isCaretaker && form.careTypes?.length ? form.careTypes.join(', ') : isLab && form.servicesOffered?.length ? form.servicesOffered[0] : (selectedServiceNames[0] || '')),
      experience: form.experience,
      languages: isLab ? '' : form.languages,
      homeFee: activeTypes.home ? form.homeFee : '',
      onlineFee: activeTypes.online ? form.onlineFee : '',
      clinicFee: activeTypes.clinic ? form.clinicFee : '',
      consultTypes: activeTypes,
      hours: Object.fromEntries(CONSULT_TYPES.filter((t) => activeTypes[t]).map((t) => [t, hours[t]])),
      state: form.state.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      locality: form.locality.trim(),
      gender: isLab ? null : form.gender,
      qualification: isLab ? '' : form.qualification,
      registrationNumber: isCaretaker ? '' : form.registrationNumber,
      registrationCouncil: isCaretaker ? '' : form.registrationCouncil,
      contactPerson: isLab ? form.contactPerson.trim() : '',
      centreType: isLab ? form.centreType.trim() : '',
      servicesOffered: selectedServiceNames,
      services: structuredServices,
      accreditation: isLab ? form.accreditation.trim() : '',
      careTypes: isCaretaker ? (Array.isArray(form.careTypes) ? form.careTypes : (form.careTypes ? String(form.careTypes).split(',').map((c) => c.trim()).filter(Boolean) : [])) : [],
      trainingCertificates: isCaretaker ? form.trainingCertificates.trim() : '',
      pincode: form.pincode,
      homeVisitRadiusKm: form.homeVisitRadiusKm,
      bio: form.bio,
      ...(form.img ? { img: form.img } : {}),
      phone,
      email: form.email || undefined,
      clinic: activeTypes.clinic ? {
        name: clinicName,
        address: clinicAddress,
        phone,
        website: form.clinicWebsite,
      } : undefined,
      ...(aadhaar.number.trim() || aadhaar.photo ? {
        aadhaar: {
          number: aadhaar.number.replace(/\s/g, ''),
          photo: aadhaar.photo || undefined,
        },
      } : {}),
      bank: {
        holderName: form.holderName,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,
      },
    };
  };

  const goFromProfile = () => {
    const msg = validateProfile();
    setFormError(msg);
    if (!msg) {
      if (isLab) {
        setForm((f) => ({
          ...f,
          clinicName: f.clinicName || f.name,
          clinicAddress: f.clinicAddress || [f.locality, f.city, f.state].filter(Boolean).join(', '),
          clinicPhone: f.clinicPhone || f.phone,
        }));
      }
      setStep(noClinicStep ? 4 : 3);
    }
  };

  const goFromClinic = () => {
    const msg = validateClinic() || (activeTypes.clinic ? checkConsultation({
      types: { clinic: true },
      hours,
      clinicName: form.clinicName || (isLab ? form.name : ''),
      clinicAddress: form.clinicAddress || (isLab ? [form.locality, form.city, form.state].filter(Boolean).join(', ') : ''),
    }) : '');
    setFormError(msg);
    if (!msg) setStep(4);
  };

  const handleSubmitVerification = async () => {
    const msg = validateProfile();
    if (msg) { setFormError(msg); setStep(2); return; }
    const clinicMsg = validateClinic();
    if (clinicMsg) { setFormError(clinicMsg); setStep(3); return; }

    const aadhaarDigits = aadhaar.number.replace(/\s/g, '');
    if (!aadhaarDigits && !aadhaarOnFile?.last4) {
      setFormError(isLab ? 'Please enter the 12-digit owner or signatory Aadhaar / ID number.' : 'Please enter your 12-digit Aadhaar number.');
      return;
    }
    if (aadhaarDigits && !/^[2-9]\d{11}$/.test(aadhaarDigits)) {
      setFormError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!aadhaar.photo && !aadhaarOnFile?.photoUploaded) {
      setFormError(isLab ? 'Please upload a photo of the owner or signatory ID card.' : 'Please upload a photo of your Aadhaar card.');
      return;
    }
    if (!form.holderName.trim() || !form.bankName.trim() || !form.ifsc.trim() || (!form.accountNumber.trim() && !providerStatus)) {
      setFormError('Please fill in all bank details.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const signup = getPendingSignup();
      if (signup && !getSessionUser()) {
        const data = await api.register(signup.name, signup.identifier, signup.password, 'doctor', { profile: buildPayload() });
        saveSession(data);
        clearPendingSignup();
        finishDraft(); // submitted – the draft is no longer needed
        setProviderStatus(data.provider.status);
        setStep(5);
        return;
      }
      const { provider } = await api.submitOnboarding(buildPayload());
      finishDraft();
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
    const msg = validateTimings();
    if (msg) { setFormError(msg); return; }
    setSaving(true);
    setFormError('');
    try {
      await api.submitOnboarding(buildPayload());
      finishDraft();
      navigate('/doctor/dashboard');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const specOptions = [...new Set([...(specializationOptions[profession] || []), ...(profession === 'MBBS Doctor' ? catalogSpecs : [])])];
  const specOther = specIsOther || (!!form.specialization && !specOptions.includes(form.specialization));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const baseSteps = [
    { id: 1, title: 'Account', sub: 'Sign-in details' },
    { id: 2, title: isLab ? 'Centre Profile' : 'Profile', sub: isLab ? 'Lab details and services' : 'Qualifications and consultations' },
    { id: 3, title: isLab ? 'Facility' : 'Clinic', sub: isLab ? 'Lab location and timings' : 'Clinic address and timings' },
    { id: 4, title: 'Verification', sub: 'Documents and payouts' },
    { id: 5, title: 'Availability', sub: isLab ? 'Sample collection timings' : 'Online and home visit timings' },
  ];

  const visibleSteps = baseSteps.filter((s) => !(noClinicStep && s.id === 3));

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
  const signingUp = !!getPendingSignup() && !getSessionUser();

  const handleSaveExit = () => {
    if (signingUp) { clearPendingSignup(); navigate('/doctor'); return; } // the draft stays, so they can continue later
    navigate(providerStatus ? '/doctor/dashboard' : '/');
  };

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
          <h1 className="font-serif text-[28px] sm:text-[36px] font-semibold leading-tight">
            {isLab ? 'Complete your laboratory centre profile' : 'Complete your professional profile'}
          </h1>
          <p className="mt-2 text-white/75 max-w-2xl text-[15px]">
            {isLab
              ? 'Register your diagnostic or pathology centre. Patients can find your test offerings and book home sample collections or centre visits once approved.'
              : 'It takes about 5 minutes. After you submit, the Carevaa team reviews your profile. Patients can find and book you once it is approved.'}
          </p>
          {signingUp && <p data-testid="signup-pending" className="mt-3 inline-block text-[13.5px] bg-white/10 ring-1 ring-white/20 rounded-xl px-3.5 py-2">Your account is created only when you submit this form (Submit for Verification). What you type is kept on this device – if you leave, sign up again with the same email or phone to continue where you stopped.</p>}
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

          {/* Steps sidebar */}
          <aside className="w-full lg:w-[290px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <nav aria-label="Profile steps" className="bg-white rounded-3xl ring-1 ring-line-soft shadow-[0_24px_60px_-34px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] p-5 sm:p-6">
                <ol className="flex lg:flex-col gap-3 lg:gap-0 overflow-x-auto no-scrollbar">
                  {steps.map((s, i) => {
                    const done = s.id === 1 || step > s.num;
                    const current = step === s.num;
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
                  <li className="flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0 text-on-deep mt-0.5" /> {isLab ? 'Valid licence earns a verified diagnostic badge.' : 'Your registration number earns a verified badge.'}</li>
                  <li className="flex gap-2"><Camera className="w-4 h-4 shrink-0 text-on-deep mt-0.5" /> {isLab ? 'A clear centre logo attracts more patients.' : 'A clear photo helps patients choose you.'}</li>
                  <li className="flex gap-2"><Calendar className="w-4 h-4 shrink-0 text-on-deep mt-0.5" /> Your city and PIN code decide which requests reach you.</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">

            {/* STEP 2: PROFILE */}
            {step <= 4 && <DraftNotice draft={draft} className="mb-5" />}
            {step === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-9 ring-1 ring-line-soft shadow-[0_24px_60px_-34px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] cv-rise">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="font-serif text-[26px] font-semibold text-primary mb-1">
                    {isLab ? 'Laboratory Centre Profile' : 'Your Professional Profile'}
                  </h2>
                  <p className="text-sm text-gray-500">Patients see this on your public profile. Fields marked * are required.</p>
                </div>

                {/* Photo / Logo Upload */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
                  <label className="relative w-24 h-24 shrink-0 rounded-2xl sm:rounded-full cursor-pointer group" aria-label={isLab ? 'Upload centre logo or photo' : 'Upload profile photo'}>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" data-testid="photo-input" onChange={async (e) => {
                      const file = e.target.files?.[0]; e.target.value = '';
                      if (!file) return;
                      try { const img = await resizePhoto(file); setForm((f) => ({ ...f, img })); setFormError(''); } catch (err) { setFormError(err.message); }
                    }} />
                    {form.img
                      ? <img src={form.img} alt="Preview" className={`w-24 h-24 ${isLab ? 'rounded-2xl' : 'rounded-full'} object-cover ring-4 ring-secondary/20`} data-testid="photo-preview" />
                      : <span className={`w-24 h-24 ${isLab ? 'rounded-2xl' : 'rounded-full'} bg-tint border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition`}><Camera className="w-7 h-7 mb-1" /><span className="text-[10px] font-bold">Upload</span></span>}
                    {form.img && <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center ring-2 ring-white"><Camera className="w-4 h-4" /></span>}
                  </label>
                  <div>
                    <h3 className="font-bold text-gray-700 mb-1">{isLab ? 'Centre logo or exterior photo' : 'Profile photo'}</h3>
                    <p className="text-xs text-gray-500 max-w-sm">
                      {isLab
                        ? 'Upload the official logo or exterior photo of your lab centre. JPG, PNG or WebP; we crop it to a square.'
                        : 'A clear, front-facing headshot builds trust with patients. JPG, PNG or WebP; we crop it to a square.'}
                    </p>
                    {form.img && <button type="button" onClick={() => setForm((f) => ({ ...f, img: '' }))} className="mt-2 text-xs font-semibold text-secondary hover:underline">Remove image</button>}
                  </div>
                </div>

                {/* SECTION 1: ABOUT */}
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-4 pt-6 border-t border-line-soft first-of-type:border-0 first-of-type:pt-0">
                  {isLab ? 'About the Laboratory Centre' : 'About You'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  {/* Profession selector */}
                  <div className="md:col-span-2">
                    <label htmlFor="ob-profession" className="block text-[13px] font-semibold text-primary mb-1.5">Profession / Provider Type *</label>
                    <select id="ob-profession" value={profession} onChange={(e) => handleProfessionChange(e.target.value)} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition font-medium">
                      <option value="">Select Profession</option>
                      <option>MBBS Doctor</option>
                      <option>Homeopathy Doctor</option>
                      <option>Ayurveda Doctor</option>
                      <option>Physiotherapist</option>
                      <option>Nurse</option>
                      <option>Caretaker</option>
                      <option>Lab Centre</option>
                      <option>BHS</option>
                      <option value="Other">Other</option>
                    </select>
                    {profession === 'Other' && (
                      <input id="ob-profession-other" aria-label="Your profession" value={otherProfession} onChange={(e) => setOtherProfession(e.target.value.slice(0, 60))} placeholder="Type your profession, e.g. Clinical Nutritionist / Dentist" className="mt-2 w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                    )}
                  </div>

                  {/* Name field */}
                  <div className={isLab ? "md:col-span-1" : "md:col-span-1"}>
                    <label htmlFor="ob-name" className="block text-[13px] font-semibold text-primary mb-1.5">
                      {isLab ? 'Lab Centre Name *' : 'Full Name *'}
                    </label>
                    <input id="ob-name" type="text" value={form.name} onChange={updateForm('name')} placeholder={isLab ? 'e.g. Carevaa Diagnostic & Pathology Centre' : 'Dr. Priya Sharma'} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>

                  {/* Lab Centre: Owner / Contact Person */}
                  {isLab && (
                    <div>
                      <label htmlFor="ob-contact-person" className="block text-[13px] font-semibold text-primary mb-1.5">Owner / Contact Person Name *</label>
                      <input id="ob-contact-person" type="text" value={form.contactPerson} onChange={updateForm('contactPerson')} placeholder="e.g. Dr. Rajesh Kumar / Ananya Sen" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                    </div>
                  )}

                  {/* Gender (Hidden for Lab Centre!) */}
                  {!isLab && (
                    <div>
                      <label htmlFor="ob-gender" className="block text-[13px] font-semibold text-primary mb-1.5">Gender</label>
                      <select id="ob-gender" value={form.gender} onChange={updateForm('gender')} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition text-gray-600">
                        <option value="">Prefer not to say</option>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                    </div>
                  )}

                  {/* Lab Centre: Centre Type */}
                  {isLab && (
                    <div>
                      <label htmlFor="ob-centre-type" className="block text-[13px] font-semibold text-primary mb-1.5">Centre Type *</label>
                      <select id="ob-centre-type" value={form.centreType} onChange={updateForm('centreType')} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition">
                        {LAB_CENTRE_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Lab Centre: Contact Phone & Email */}
                  {isLab && (
                    <>
                      <div>
                        <label htmlFor="ob-clinic-phone" className="block text-[13px] font-semibold text-primary mb-1.5">Contact Number *</label>
                        <input id="ob-clinic-phone" type="tel" value={form.clinicPhone} onChange={updateForm('clinicPhone')} placeholder="+91 98765 43210" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                      </div>
                      <div>
                        <label htmlFor="ob-email" className="block text-[13px] font-semibold text-primary mb-1.5">Email Address</label>
                        <input id="ob-email" type="email" value={form.email} onChange={updateForm('email')} placeholder="contact@carevaalab.com" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                      </div>
                    </>
                  )}

                  {/* Dynamic Services Selector (All Professions) */}
                  {professionServices.length > 0 && (
                    <div className="md:col-span-2 bg-tint/60 border border-line-soft rounded-2xl p-4 sm:p-5 space-y-3" data-testid="profession-services-selector">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div>
                          <label className="block text-[14px] font-bold text-primary flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-secondary" />
                            Services Provided * <span className="font-normal text-xs text-gray-500">(connected to Carevaa Admin Panel)</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Select the services you offer. Newly added services for {professionValue} in the admin panel appear here automatically.
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-secondary">
                          {(form.servicesOffered || []).length} selected
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 pt-1">
                        {professionServices.map((svc) => {
                          const isSelected = (form.servicesOffered || []).includes(svc.name);
                          const d = form.servicesDetails?.[svc.name] || {};
                          return (
                            <div
                              key={svc.id || svc.name}
                              className={`rounded-xl border p-3.5 transition-all ${
                                isSelected
                                  ? 'bg-white border-secondary shadow-sm ring-1 ring-secondary/30'
                                  : 'bg-white/60 border-line hover:border-secondary/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleService(svc)}
                                    className="rounded border-gray-300 text-secondary focus:ring-secondary mt-1 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-primary text-[14px] leading-tight">{svc.name}</p>
                                    {(svc.short || svc.desc) && (
                                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{svc.short || svc.desc}</p>
                                    )}
                                    {svc.price && (
                                      <span className="inline-block mt-1 text-[11.5px] font-bold text-secondary">
                                        Starting: {svc.price}
                                      </span>
                                    )}
                                  </div>
                                </label>
                              </div>

                              {/* Service specific customization when selected */}
                              {isSelected && (
                                <div className="mt-3 pt-2.5 border-t border-line-soft space-y-2.5 text-xs text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700 w-16 shrink-0">Fee (₹):</span>
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder={svc.price ? String(svc.price).replace(/[^\d]/g, '') : "e.g. 500"}
                                      value={d.price ?? ''}
                                      onChange={(e) => updateServiceDetail(svc.name, 'price', e.target.value)}
                                      className="flex-1 h-8 px-2.5 bg-tint/40 border border-line rounded-lg text-xs outline-none focus:border-secondary"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700 w-16 shrink-0">Details:</span>
                                    <input
                                      type="text"
                                      placeholder="Specific notes/offerings for this service"
                                      value={d.description ?? ''}
                                      onChange={(e) => updateServiceDetail(svc.name, 'description', e.target.value)}
                                      className="flex-1 h-8 px-2.5 bg-tint/40 border border-line rounded-lg text-xs outline-none focus:border-secondary"
                                    />
                                  </div>
                                  <div className="flex flex-wrap gap-3 pt-1">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={d.homeAvailable ?? Boolean(activeTypes.home)}
                                        onChange={(e) => updateServiceDetail(svc.name, 'homeAvailable', e.target.checked)}
                                        className="rounded border-gray-300 text-secondary focus:ring-secondary w-3.5 h-3.5"
                                      />
                                      <span>Home Visit</span>
                                    </label>
                                    {!skipClinic && (
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={d.onlineAvailable ?? Boolean(activeTypes.online)}
                                          onChange={(e) => updateServiceDetail(svc.name, 'onlineAvailable', e.target.checked)}
                                          className="rounded border-gray-300 text-secondary focus:ring-secondary w-3.5 h-3.5"
                                        />
                                        <span>Online Consult</span>
                                      </label>
                                    )}
                                    {!skipClinic && (
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={d.clinicAvailable ?? Boolean(activeTypes.clinic)}
                                          onChange={(e) => updateServiceDetail(svc.name, 'clinicAvailable', e.target.checked)}
                                          className="rounded border-gray-300 text-secondary focus:ring-secondary w-3.5 h-3.5"
                                        />
                                        <span>Clinic Visit</span>
                                      </label>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Caretaker: Types of Care Provided (Multi-select Pills) */}
                  {isCaretaker && (
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-semibold text-primary mb-1.5">Types of Care Provided * <span className="font-normal text-gray-500">(select all that apply)</span></label>
                      <div className="flex flex-wrap gap-2 pt-1 pb-2">
                        {CARE_TYPES_LIST.map((care) => {
                          const isSelected = (form.careTypes || []).includes(care);
                          return (
                            <button
                              key={care}
                              type="button"
                              onClick={() => toggleCareType(care)}
                              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all border ${
                                isSelected
                                  ? 'bg-secondary text-white border-secondary shadow-sm'
                                  : 'bg-white text-primary/70 border-line hover:border-secondary/60 hover:bg-secondary/5'
                              }`}
                            >
                              {care} {isSelected && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Lab Centre: Services and Tests Available (Multi-select Pills) */}
                  {isLab && (
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-semibold text-primary mb-1.5">Services and Tests Available * <span className="font-normal text-gray-500">(click to select/unselect)</span></label>
                      <div className="flex flex-wrap gap-2 pt-1 pb-3">
                        {LAB_SERVICES_LIST.map((svc) => {
                          const isSelected = (form.servicesOffered || []).includes(svc);
                          return (
                            <button
                              key={svc}
                              type="button"
                              onClick={() => toggleLabService(svc)}
                              className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-all border ${
                                isSelected
                                  ? 'bg-secondary text-white border-secondary shadow-sm'
                                  : 'bg-white text-primary/70 border-line hover:border-secondary/60 hover:bg-secondary/5'
                              }`}
                            >
                              {svc} {isSelected && '✓'}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customLabService}
                          onChange={(e) => setCustomLabService(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomLabService(); } }}
                          placeholder="Add another test or category, e.g. RT-PCR, ECG, Genetic Screening"
                          className="flex-1 bg-white border border-line rounded-xl px-4 py-2.5 text-[13.5px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomLabService}
                          className="px-4 py-2.5 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white font-semibold text-sm transition"
                        >
                          + Add Test
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Doctors, Physiotherapists, Nurses, Others: Specialization Dropdown */}
                  {!isLab && !isCaretaker && (
                    <div>
                      <label htmlFor="ob-spec" className="block text-[13px] font-semibold text-primary mb-1.5">
                        {isNurse ? 'Nursing Role / Area of Care *' : 'Specialization *'}
                      </label>
                      {profession === 'Other' ? (
                        <input id="ob-spec" value={form.specialization} onChange={updateForm('specialization')} placeholder="Type your specialization (optional)" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                      ) : profession && profession !== 'Select Profession' ? (
                        <>
                          <select id="ob-spec" value={specOther ? OTHER : form.specialization} onChange={(e) => { if (e.target.value === OTHER) { setSpecIsOther(true); setForm((f) => ({ ...f, specialization: '' })); } else { setSpecIsOther(false); setForm((f) => ({ ...f, specialization: e.target.value })); } }} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition text-gray-600">
                            <option value="">Select Specialization</option>
                            {specOptions.map((opt) => (
                              <option key={opt}>{opt}</option>
                            ))}
                            <option value={OTHER}>Other</option>
                          </select>
                          {specOther && <input id="ob-spec-other" aria-label="Your specialization" value={form.specialization} onChange={updateForm('specialization')} placeholder="Type your specialization" className="mt-2 w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />}
                        </>
                      ) : (
                        <input id="ob-spec" type="text" placeholder="Select a profession first" disabled className="w-full bg-tint border border-line rounded-xl px-4 py-3 text-[14px] text-primary/40 cursor-not-allowed" />
                      )}
                    </div>
                  )}

                  {/* Short Introduction / Description */}
                  <div className="md:col-span-2">
                    <label htmlFor="ob-bio" className="block text-[13px] font-semibold text-primary mb-1.5">
                      {isLab ? 'Centre Description & Operating Overview' : 'Short Introduction'} <span className="normal-case font-medium text-gray-400">({600 - (form.bio || '').length} characters left)</span>
                    </label>
                    <textarea
                      id="ob-bio"
                      rows="3"
                      maxLength={600}
                      value={form.bio}
                      onChange={updateForm('bio')}
                      placeholder={
                        isLab
                          ? "E.g. Fully automated diagnostic centre equipped with high-precision analyzers. We provide home sample collection with digital reports delivered within 6 hours. Operating hours: 7:00 AM – 9:00 PM."
                          : isCaretaker
                            ? "E.g. Experienced caregiver providing compassionate, 24/7 bedside assistance, medication reminders, hygiene care, and mobility support for elderly and post-op patients."
                            : "E.g. I help patients recover mobility after surgery and sports injuries, with structured home-based exercise plans."
                      }
                      className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition resize-none"
                    />
                  </div>
                </div>

                {/* SECTION 2: QUALIFICATIONS & REGISTRATION (DYNAMIC PER PROFESSION) */}
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-4 pt-6 border-t border-line-soft first-of-type:border-0 first-of-type:pt-0">
                  {isLab
                    ? 'Laboratory Licence and Accreditation'
                    : isCaretaker
                      ? 'Experience and Training'
                      : isNurse
                        ? 'Nursing Qualifications and Registration'
                        : 'Qualifications and Registration'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  {/* Qualification: Shown for Doctors, Nurses, Physios, Others. Optional for Caretaker. HIDDEN for Lab Centre! */}
                  {!isLab && (
                    <div>
                      <label htmlFor="ob-qual" className="block text-[13px] font-semibold text-primary mb-1.5">
                        {isNurse
                          ? 'Nursing Qualification (ANM, GNM, B.Sc. Nursing, etc.) *'
                          : isCaretaker
                            ? 'Highest Qualification (Optional)'
                            : isPhysio
                              ? 'Highest Qualification (BPT, MPT, etc.) *'
                              : profession === 'MBBS Doctor'
                                ? 'Highest Medical Qualification *'
                                : 'Highest Qualification *'}
                      </label>
                      <input
                        id="ob-qual"
                        type="text"
                        value={form.qualification}
                        onChange={updateForm('qualification')}
                        placeholder={
                          isNurse
                            ? 'B.Sc. Nursing, GNM, ANM'
                            : isCaretaker
                              ? 'e.g. 10th, 12th, Graduate, or Nursing Assistant diploma'
                              : isPhysio
                                ? 'BPT, MPT (Orthopedics)'
                                : 'MBBS, MD (General Medicine)'
                        }
                        className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition"
                      />
                    </div>
                  )}

                  {/* Experience / Operation years */}
                  <div>
                    <label htmlFor="ob-exp" className="block text-[13px] font-semibold text-primary mb-1.5">
                      {isLab ? 'Years of Operation *' : 'Years of Experience *'}
                    </label>
                    <input
                      id="ob-exp"
                      type="number"
                      min="0"
                      value={form.experience}
                      onChange={updateForm('experience')}
                      placeholder={isLab ? '8' : '5'}
                      className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition"
                    />
                  </div>

                  {/* Registration Number: HIDDEN for Caretaker! Custom for Lab Centre, Nurse, Physio, Doctors */}
                  {!isCaretaker && (
                    <div>
                      <label htmlFor="ob-reg" className="block text-[13px] font-semibold text-primary mb-1.5">
                        {isLab
                          ? 'Laboratory Registration or Licence Number *'
                          : isNurse
                            ? 'Nursing Council Registration Number *'
                            : isPhysio
                              ? 'Professional Registration Number (Optional)'
                              : profession === 'MBBS Doctor'
                                ? 'Medical Council Registration Number *'
                                : 'Registration Number *'}
                      </label>
                      <input
                        id="ob-reg"
                        type="text"
                        value={form.registrationNumber}
                        onChange={updateForm('registrationNumber')}
                        placeholder={
                          isLab
                            ? 'LAB-LIC-2023-4567 or CEA Reg. No.'
                            : isNurse
                              ? 'TNC/98765'
                              : isPhysio
                                ? 'IAP/12345 (if registered)'
                                : 'TNMC 123456'
                        }
                        className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition uppercase placeholder:normal-case"
                      />
                    </div>
                  )}

                  {/* Registered With / Council: HIDDEN for Caretaker! */}
                  {!isCaretaker && (
                    <div>
                      <label htmlFor="ob-council" className="block text-[13px] font-semibold text-primary mb-1.5">
                        {isLab
                          ? 'Registered With (Health Authority / Municipal Body)'
                          : isNurse
                            ? 'Registered With (Nursing Council) *'
                            : isPhysio
                              ? 'Registered With (Optional)'
                              : 'Registered With (Council) *'}
                      </label>
                      <input
                        id="ob-council"
                        type="text"
                        value={form.registrationCouncil}
                        onChange={updateForm('registrationCouncil')}
                        placeholder={
                          isLab
                            ? 'State Directorate of Health Services / Municipal Corp.'
                            : isNurse
                              ? 'Tamil Nadu Nurses and Midwives Council'
                              : isPhysio
                                ? 'Indian Association of Physiotherapists (IAP)'
                                : 'Tamil Nadu Medical Council'
                        }
                        className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition"
                      />
                    </div>
                  )}

                  {/* Lab Centre: Accreditation Details */}
                  {isLab && (
                    <div className="md:col-span-2">
                      <label htmlFor="ob-accreditation" className="block text-[13px] font-semibold text-primary mb-1.5">Accreditation Details *</label>
                      <select
                        id="ob-accreditation"
                        value={form.accreditation}
                        onChange={updateForm('accreditation')}
                        className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition"
                      >
                        {ACCREDITATION_OPTIONS.map((acc) => <option key={acc}>{acc}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Caretaker: Relevant Training Certificates / Details (Optional) */}
                  {isCaretaker && (
                    <div>
                      <label htmlFor="ob-training" className="block text-[13px] font-semibold text-primary mb-1.5">Relevant Training / Certifications (Optional)</label>
                      <input
                        id="ob-training"
                        type="text"
                        value={form.trainingCertificates}
                        onChange={updateForm('trainingCertificates')}
                        placeholder="e.g. First Aid & CPR Certified, Geriatric Care, Red Cross"
                        className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition"
                      />
                    </div>
                  )}

                  {/* Languages Spoken (for all individual professionals; not applicable for Lab Centre) */}
                  {!isLab && (
                    <div className={isCaretaker ? "md:col-span-1" : "md:col-span-2"}>
                      <label htmlFor="ob-lang" className="block text-[13px] font-semibold text-primary mb-1.5">Languages Spoken</label>
                      <input
                        id="ob-lang"
                        type="text"
                        value={form.languages}
                        onChange={updateForm('languages')}
                        placeholder="English, Hindi, Tamil"
                        className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition"
                      />
                    </div>
                  )}
                </div>

                {/* SECTION 3: LOCATION */}
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-4 pt-6 border-t border-line-soft first-of-type:border-0 first-of-type:pt-0">
                  {isLab ? 'Centre Location and Service Coverage' : 'Where You Work'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  {isLab && (
                    <div className="md:col-span-2">
                      <label htmlFor="ob-street-addr" className="block text-[13px] font-semibold text-primary mb-1.5">Centre Address *</label>
                      <input
                        id="ob-street-addr"
                        type="text"
                        value={form.clinicAddress}
                        onChange={updateForm('clinicAddress')}
                        placeholder="e.g. 45, First Floor, Gandhi Road, Near City Hospital"
                        className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition"
                      />
                    </div>
                  )}
                  <PincodeFields idPrefix="ob" value={form} onChange={patchForm} lookup={pinLookup} fieldCls="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" labelCls="block text-[13px] font-semibold text-primary mb-1.5" className="md:col-span-2 space-y-4" />
                  {activeTypes.home && (
                    <div>
                      <label htmlFor="ob-radius" className="block text-[13px] font-semibold text-primary mb-1.5">
                        {isLab ? 'Home sample collection radius' : 'Home visits within'}
                      </label>
                      <select id="ob-radius" value={form.homeVisitRadiusKm} onChange={updateForm('homeVisitRadiusKm')} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition">
                        <option value="5">5 km</option>
                        <option value="10">10 km</option>
                        <option value="15">15 km</option>
                        <option value="25">25 km</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* SECTION 4: CONSULTATIONS & FEES */}
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent mb-1 pt-6 border-t border-line-soft first-of-type:border-0 first-of-type:pt-0">
                  {isLab ? 'Diagnostic Modes and Base Fees' : 'Consultations You Offer'}
                </h3>
                <p className="text-[13px] text-primary/55 mb-4">
                  {isLab
                    ? 'Tick the test submission modes you provide and set starting fees. Patients only see these options when booking.'
                    : 'Tick every option you provide and enter its fee. Patients will only see these options when they book you.'}
                </p>
                <div className="mb-8">
                  <ConsultTypePicker
                    idPrefix="ob"
                    allowed={offered}
                    types={activeTypes}
                    onToggle={(t, on) => setTypes((x) => ({ ...x, [t]: on }))}
                    fees={{ home: form.homeFee, clinic: form.clinicFee, online: form.onlineFee }}
                    onFee={(t, v) => setForm((f) => ({ ...f, [{ home: 'homeFee', clinic: 'clinicFee', online: 'onlineFee' }[t]]: v }))}
                    labels={
                      isLab ? {
                        clinic: 'Visit Lab Centre (Walk-in Tests)',
                        home: 'Home Sample Collection',
                      } : isCaretaker ? {
                        home: 'Home Care Service',
                      } : isNurse ? {
                        home: 'Home Nursing Visit',
                      } : {}
                    }
                    subLabels={
                      isLab ? {
                        clinic: 'Patients visit your centre for test sample submission and scans',
                        home: 'Phlebotomist / technician visits patient home for sample collection',
                      } : isCaretaker ? {
                        home: 'In-home daily or hourly caregiving and patient assistance',
                      } : isNurse ? {
                        home: 'In-home clinical nursing care, dressing, injections and monitoring',
                      } : {}
                    }
                  />
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

            {/* STEP 3: CLINIC / FACILITY */}
            {step === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-9 ring-1 ring-line-soft shadow-[0_24px_60px_-34px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] cv-rise">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="font-serif text-[26px] font-semibold text-primary mb-1">
                    {isLab ? 'Lab Centre Facility Details' : 'Add Clinic Details'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isLab ? 'Confirm your lab centre location, contact numbers and diagnostic operating hours.' : 'Link your clinic and manage its information.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">{isLab ? 'Lab Centre Name *' : 'Clinic Name *'}</label>
                    <input type="text" value={form.clinicName || (isLab ? form.name : '')} onChange={updateForm('clinicName')} placeholder={isLab ? 'Carevaa Diagnostic Centre' : 'Carevaa Health Clinic'} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">{isLab ? 'Lab Centre Complete Address *' : 'Clinic Address *'}</label>
                    <textarea rows="2" value={form.clinicAddress || (isLab ? [form.locality, form.city, form.state].filter(Boolean).join(', ') : '')} onChange={updateForm('clinicAddress')} placeholder="123 Health Avenue, Block B..." className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition resize-none"></textarea>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">{isLab ? 'Lab Contact Phone Number' : 'Phone Number'}</label>
                    <input type="tel" value={form.clinicPhone} onChange={updateForm('clinicPhone')} placeholder="+91 98765 43210" className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">Website / Google Maps</label>
                    <input type="url" value={form.clinicWebsite} onChange={updateForm('clinicWebsite')} placeholder="https://..." className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
                  </div>
                </div>

                <div className="mb-8">
                  <HoursEditor idPrefix="ob-clinic" title={isLab ? 'Diagnostic centre operating days and timings' : 'Clinic working days and timings'} value={hours.clinic} onChange={setHoursFor('clinic')} />
                </div>

                <div className="mb-8">
                  <label className="block text-[13px] font-semibold text-primary mb-2">{isLab ? 'Centre Photos' : 'Clinic Photos'}</label>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    <div className="w-32 h-24 shrink-0 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs font-bold">+ Add Photo</span>
                    </div>
                  </div>
                </div>

                {formError && <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{formError}</p>}
                <div className="flex gap-4 border-t border-gray-100 pt-6">
                  <button onClick={goFromClinic} className="bg-secondary hover:brightness-95 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-[0_12px_26px_-12px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)]">
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

                {/* Document checklist cards (dynamic per profession) */}
                <div className="rounded-2xl bg-tint ring-1 ring-line-soft p-5 mb-8">
                  <p className="text-[14px] text-primary/75">Keep these ready. After you submit, our verification team will verify them securely.</p>
                  <ul className="mt-4 grid sm:grid-cols-3 gap-3">
                    {(isLab ? [
                      ['Laboratory Licence', 'Valid registration or operating licence'],
                      ['Accreditation Details', 'NABL / ISO / ICMR certificate (if accredited)'],
                      ['Owner / Signatory ID', 'Aadhaar or Government ID – add below'],
                    ] : isCaretaker ? [
                      ['Identity Proof', 'Aadhaar card – add below'],
                      ['Training / Police Check', 'Care certificates or clearance (optional)'],
                      ['Address Proof', 'Current residential address proof'],
                    ] : isNurse ? [
                      ['Nursing Registration', 'From State / Indian Nursing Council'],
                      ['Nursing Degree/Diploma', 'ANM / GNM / B.Sc. certificate'],
                      ['ID Proof', 'Aadhaar card – add below'],
                    ] : isPhysio ? [
                      ['Degree Certificate', 'BPT / MPT degree certificate'],
                      ['IAP / Council Membership', 'Association certificate (if registered)'],
                      ['ID Proof', 'Aadhaar card – add below'],
                    ] : [
                      ['Medical Registration', 'From State Medical Council / NMC'],
                      ['Qualification Degree', 'MBBS / PG degree certificate'],
                      ['ID Proof', 'Aadhaar card – add below'],
                    ]).map(([t, sub]) => (
                      <li key={t} className="bg-white rounded-xl ring-1 ring-line-soft p-4 flex items-start gap-3">
                        <span className="w-9 h-9 rounded-lg bg-mint text-accent flex items-center justify-center shrink-0"><FileText className="w-[18px] h-[18px]" /></span>
                        <span className="leading-tight"><span className="block text-[14px] font-semibold">{t}</span><span className="block text-[12px] text-primary/55 mt-0.5">{sub}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Aadhaar / ID proof */}
                <div className="mb-6 pb-4 border-b border-gray-100 mt-10">
                  <h2 className="font-serif text-[22px] font-semibold text-primary mb-1">
                    {isLab ? 'Owner / Signatory ID Proof (Aadhaar)' : 'Aadhaar (ID proof)'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isLab
                      ? 'Only the Carevaa verification team can see this. Enter the Aadhaar or government ID number of the lab owner or authorized signatory.'
                      : 'Only the Carevaa verification team can see this. It is never shown on your public profile.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" data-testid="aadhaar-section">
                  <div>
                    <label htmlFor="ob-aadhaar" className="block text-[13px] font-semibold text-primary mb-1.5">
                      {isLab ? 'Owner / Signatory Aadhaar Number' : 'Aadhaar Number'} {aadhaarOnFile?.last4 ? '' : '*'}
                    </label>
                    <input id="ob-aadhaar" inputMode="numeric" autoComplete="off" value={aadhaar.number} onChange={(e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 12); setAadhaar((a) => ({ ...a, number: d.replace(/(\d{4})(?=\d)/g, '$1 ') })); }} placeholder={aadhaarOnFile?.last4 ? `On file: •••• •••• ${aadhaarOnFile.last4} (type to change)` : '1234 5678 9012'} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition tracking-wider" />
                  </div>
                  <div>
                    <p className="block text-[13px] font-semibold text-primary mb-1.5">
                      {isLab ? 'Owner / Signatory ID Card Photo' : 'Aadhaar card photo'} {aadhaarOnFile?.photoUploaded ? '' : '*'}
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-line hover:border-secondary/60 bg-white px-4 py-3 transition">
                      <input id="ob-aadhaar-photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={async (e) => {
                        const file = e.target.files?.[0]; e.target.value = '';
                        if (!file) return;
                        try { const photo = await resizeDocument(file); setAadhaar((a) => ({ ...a, photo })); setFormError(''); } catch (err) { setFormError(err.message); }
                      }} />
                      {aadhaar.photo
                        ? <img src={aadhaar.photo} alt="ID card" className="h-12 w-20 object-cover rounded-md ring-1 ring-line" />
                        : <Upload className="w-5 h-5 text-accent shrink-0" />}
                      <span className="text-[13px] text-primary/75">{aadhaar.photo ? 'Photo added – click to change' : aadhaarOnFile?.photoUploaded ? 'Photo on file – click to replace' : 'Upload a clear photo of the ID card (JPG / PNG)'}</span>
                    </label>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="mb-6 pb-4 border-b border-gray-100 mt-10">
                  <h2 className="font-serif text-[22px] font-semibold text-primary mb-1">
                    {isLab ? 'Lab Centre Bank Account' : 'Bank Details'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isLab
                      ? 'Provide your business or current bank account for receiving test payments and settlement payouts.'
                      : 'Provide your bank information for receiving consultation payouts.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-[13px] font-semibold text-primary mb-1.5">
                      {isLab ? 'Account Holder / Business Entity Name *' : 'Account Holder Name *'}
                    </label>
                    <input type="text" value={form.holderName} onChange={updateForm('holderName')} placeholder={isLab ? 'Carevaa Diagnostic Centre Pvt Ltd' : 'Dr. Priya Sharma'} className="w-full bg-white border border-line rounded-xl px-4 py-3 text-[14px] text-primary placeholder:text-placeholder focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition" />
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
                  <button onClick={() => setStep(noClinicStep ? 2 : 3)} className="bg-white border border-line text-primary/70 hover:text-primary hover:bg-tint px-8 py-3.5 rounded-xl font-semibold transition-all">
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: AVAILABILITY */}
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
                      <p className="text-sm text-gray-500">
                        {isLab ? 'Set operating days and sample collection timings for each service mode.' : 'Set the days and timings for each consultation you offer. Patients can only book your free slots.'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5 mb-8">
                    {['online', 'home', 'clinic'].filter((t) => activeTypes[t]).map((t) => (
                      <HoursEditor
                        key={t}
                        idPrefix={`ob5-${t}`}
                        title={
                          isLab
                            ? (t === 'clinic' ? 'Lab Centre Walk-in Timings' : 'Home Sample Collection Timings')
                            : `${CONSULT_LABEL[t]} timings`
                        }
                        value={hours[t]}
                        onChange={setHoursFor(t)}
                      />
                    ))}
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
