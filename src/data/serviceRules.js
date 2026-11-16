// Per-service booking rules (keep in step with Backend/src/utils/serviceRules.js)

// services not listed here can be booked as a home visit, clinic visit or online
export const SERVICE_VISIT_TYPES = {
  'nurse-care': ['home'],
  'home-doctor': ['home'],
  'care-taker': ['home'],
  'baby-care': ['home'],
  'lab-tests': ['home'],
  homeopathy: ['clinic', 'online'],
};
export const ALL_VISIT_TYPES = ['home', 'clinic', 'online'];

// settings saved per service in Admin → Services (visit types and duty hours) override the defaults
const saved = {};
export function registerServiceSettings(list = []) {
  list.forEach((s) => { if (s?.key) saved[s.key] = { visitTypes: s.visitTypes, dutyHours: s.dutyHours }; });
}
export const visitTypesForService = (key) => {
  const v = saved[key]?.visitTypes;
  return Array.isArray(v) && v.length ? ALL_VISIT_TYPES.filter((t) => v.includes(t)) : SERVICE_VISIT_TYPES[key] || ALL_VISIT_TYPES;
};

// duty hours asked when booking these services
export const DUTY_HOURS = ['24 Hours', '12 Hours', '6 Hours'];
export const DUTY_HOUR_SERVICES = ['nurse-care', 'care-taker', 'baby-care'];
export const dutyHoursFor = (key) => {
  const d = saved[key]?.dutyHours;
  return Array.isArray(d) ? DUTY_HOURS.filter((h) => d.includes(h)) : DUTY_HOUR_SERVICES.includes(key) ? DUTY_HOURS : [];
};
export const needsDutyHours = (key) => dutyHoursFor(key).length > 0;

// basic tests that can be picked for Lab Tests (home sample collection)
export const LAB_TESTS = [
  'Complete Blood Count (CBC)',
  'Blood Sugar (Fasting / PP)',
  'HbA1c',
  'Lipid Profile',
  'Thyroid Profile (T3, T4, TSH)',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Urine Routine',
  'Vitamin D',
  'Vitamin B12',
  'Full Body Checkup',
];

// professions whose consultation types are fixed by their service
export const PROFESSION_VISIT_TYPES = {
  Nurse: ['home'],
  Caretaker: ['home'],
  'Lab Centre': ['home'],
  'Homeopathy Doctor': ['clinic', 'online'],
  BHMS: ['clinic', 'online'],
};
export const visitTypesForProfession = (profession) => PROFESSION_VISIT_TYPES[profession] || ALL_VISIT_TYPES;

// services removed from the website (also hidden if an old copy of the list is still cached)
export const isRemovedService = (s) => !!s && (['bhs', 'neuro-rehab', 'neuro-rehab-test', 'diagnostic-rehab'].includes(String(s.key || '').toLowerCase())
  || /^(bhs|neuro\s*rehab(\s*test)?(\s*\d+)?|diagnostic\s*rehab)$/i.test(String(s.title || s.name || '').trim()));

// service key from a title shown on the website (titles renamed earlier still work)
const LEGACY_TITLES = { 'Doctor Visit': 'doctor-visit', 'General Medicine': 'doctor-visit', 'Lab Tests': 'lab-tests', 'Lab Test': 'lab-tests', Homeopathy: 'homeopathy', 'Nurse Care': 'nurse-care', 'Home Doctor': 'home-doctor', 'Care Taker': 'care-taker', 'Baby Care': 'baby-care' };
export const serviceKeyOf = (title, list = []) => list.find((s) => s.title === title)?.key || LEGACY_TITLES[title] || '';
