import { useCallback, useEffect, useRef, useState } from 'react';
import api from './api';

// Looks up an Indian PIN code (via our backend -> India Post) and fills City, District, State and Locality.
//   const pin = usePincode(address, (patch) => setAddress((a) => ({ ...a, ...patch })));
// address = { pincode, city, district, state, locality }
// - Typing a new PIN replaces the old location details.
// - A PIN that was already saved (profile / edit forms) only fills the fields that are still empty,
//   so details the person corrected by hand are kept.
export const PIN_RE = /^[1-9]\d{5}$/;
export const INVALID_PIN = 'Invalid PIN code. Please enter a valid PIN code.';

const cache = new Map(); // pin -> lookup result (for this browser tab)

export function usePincode(value, onChange) {
  const pin = String(value?.pincode || '');
  const [state, setState] = useState({ status: 'idle', pin: '', offices: [], partial: false, message: '' });
  const [attempt, setAttempt] = useState(0);
  const dirty = useRef(false); // true once the person types in the PIN field
  const applied = useRef(''); // the PIN whose details were last written into the form
  const filled = useRef({}); // what the lookup wrote, so it can be cleared when the PIN changes
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };

  const apply = useCallback((p, r) => {
    setState({ status: 'found', pin: p, offices: r.offices || [], partial: !!r.partial, message: '' });
    if (applied.current === p) return;
    applied.current = p;
    const { value: v, onChange: change } = latest.current;
    const single = (r.offices || []).length === 1 ? r.offices[0].name : '';
    if (dirty.current) {
      filled.current = { city: r.city || '', district: r.district || '', state: r.state || '', locality: single };
      change(filled.current);
    } else {
      // details already saved with this PIN: only fill what is missing
      const patch = {};
      if (!v.city && r.city) patch.city = r.city;
      if (!v.district && r.district) patch.district = r.district;
      if (!v.state && r.state) patch.state = r.state;
      if (!v.locality && single) patch.locality = single;
      if (Object.keys(patch).length) change(patch);
    }
  }, []);

  useEffect(() => {
    // the PIN was changed: remove details that came from the old PIN (anything typed by hand stays)
    if (dirty.current && applied.current && applied.current !== pin) {
      const { value: v, onChange: change } = latest.current;
      const patch = {};
      Object.entries(filled.current).forEach(([k, old]) => { if (old && v[k] === old) patch[k] = ''; });
      applied.current = '';
      filled.current = {};
      if (Object.keys(patch).length) change(patch);
    }
    if (pin.length < 6) {
      setState((s) => (s.status === 'idle' ? s : { status: 'idle', pin: '', offices: [], partial: false, message: '' }));
      return undefined;
    }
    if (!PIN_RE.test(pin)) {
      setState({ status: 'invalid', pin, offices: [], partial: false, message: INVALID_PIN });
      return undefined;
    }
    if (cache.has(pin)) { apply(pin, cache.get(pin)); return undefined; }
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading', pin, message: '' }));
    const timer = setTimeout(() => {
      api.pincode(pin)
        .then((r) => { cache.set(pin, r); if (!cancelled) apply(pin, r); })
        .catch((err) => {
          if (cancelled) return;
          if (err.status === 404 || err.status === 400) setState({ status: 'invalid', pin, offices: [], partial: false, message: INVALID_PIN });
          else setState({ status: 'error', pin, offices: [], partial: false, message: err.status === 429 ? err.message : 'We could not fetch the location for this PIN code.' });
        });
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [pin, attempt, apply]);

  return {
    ...state,
    loading: state.status === 'loading',
    retry: () => setAttempt((n) => n + 1),
    markDirty: () => { dirty.current = true; },
  };
}

// Errors for the address part of a form: { pincode?, city?, locality? }
export function pincodeErrors(value, lookup, { required = true, requireLocality = false } = {}) {
  const er = {};
  const pin = String(value?.pincode || '');
  if (!pin) { if (required) er.pincode = 'Enter your 6-digit PIN code'; }
  else if (!PIN_RE.test(pin) || lookup?.status === 'invalid') er.pincode = INVALID_PIN;
  if (required && !String(value?.city || '').trim()) er.city = 'Enter your city';
  if (requireLocality && !er.pincode && (lookup?.offices?.length || 0) > 1 && !String(value?.locality || '').trim()) er.locality = 'Select your area / post office';
  return er;
}
