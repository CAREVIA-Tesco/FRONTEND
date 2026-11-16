// Shared checks for the website forms (same rules as Backend/src/utils/validate.js).
// Indian mobile numbers: 10 digits starting 6-9; "+91 98765 43210" and "098765 43210" are accepted.
export function cleanMobile(v) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : '';
}
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
export const isName = (v) => { const s = String(v || '').trim(); return s.length >= 2 && s.length <= 100 && /^[\p{L}][\p{L}\p{M} .'-]*$/u.test(s); };
export const MSG = {
  name: 'Please enter your full name (letters only)',
  phone: 'Enter a valid 10-digit mobile number (starting with 6, 7, 8 or 9)',
  email: 'Enter a valid email address',
};
