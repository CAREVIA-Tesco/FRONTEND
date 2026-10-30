// Auto-saved drafts for long forms (professional registration, patient forms).
//
// What a person types is kept in this browser (localStorage) while they fill the form, so closing the
// tab or navigating away does not lose it. The draft is only a convenience copy on this device: nothing
// is sent to the server, and the record is created only when the form is submitted. Passwords are never
// part of a draft. The draft is removed after a successful submit (clear()).
//
//   const draft = useFormDraft(key, snapshot, { ready, onRestore });
//   ...on successful submit: draft.clear();
//   <DraftNotice draft={draft} />   shows "We kept what you entered" with a "Start over" button
import { useCallback, useEffect, useRef, useState } from 'react';

const PREFIX = 'carevaa_draft_v1:';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // drafts older than 30 days are dropped

export function readDraft(key) {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object' || !d.data) return null;
    if (d.savedAt && Date.now() - d.savedAt > MAX_AGE_MS) { localStorage.removeItem(PREFIX + key); return null; }
    return d;
  } catch {
    return null;
  }
}

// big photos (data:image/...) may not fit in browser storage – then the rest of the draft is still kept
const withoutPhotos = (value) => JSON.parse(JSON.stringify(value, (_k, v) => (typeof v === 'string' && v.startsWith('data:') && v.length > 2000 ? '' : v)));

export function writeDraft(key, data) {
  if (!key) return;
  const entry = { savedAt: Date.now(), data };
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    try { localStorage.setItem(PREFIX + key, JSON.stringify({ ...entry, data: withoutPhotos(data) })); } catch { /* storage full or blocked */ }
  }
}

export function clearDraft(key) {
  if (!key) return;
  try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
}

/**
 * key       – which draft (e.g. `pro-onboarding:<user id>`); null = no draft for now
 * snapshot  – the current form values (plain JSON; leave passwords out)
 * ready     – false while the form is still loading its own saved data (the draft is applied after it)
 * onRestore – called once with the saved values when a draft exists
 */
export function useFormDraft(key, snapshot, { ready = true, onRestore } = {}) {
  const [restoredAt, setRestoredAt] = useState(null);
  const state = useRef({ key: null, baseline: null, cleared: false, timer: null });
  const latest = useRef(snapshot);
  latest.current = snapshot;
  const restoreRef = useRef(onRestore);
  restoreRef.current = onRestore;

  const serialized = JSON.stringify(snapshot ?? null);

  // apply a saved draft once per key, after the form has loaded its own data
  useEffect(() => {
    if (!key || !ready || state.current.key === key) return;
    state.current = { key, baseline: serialized, cleared: false, timer: null };
    const saved = readDraft(key);
    if (saved) {
      restoreRef.current?.(saved.data);
      setRestoredAt(saved.savedAt || Date.now());
      state.current.baseline = null; // the restored values count as changes – keep saving them
    } else {
      setRestoredAt(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  const save = useCallback(() => {
    const s = state.current;
    if (!s.key || s.cleared) return;
    const now = JSON.stringify(latest.current ?? null);
    if (s.baseline !== null && now === s.baseline) return; // nothing typed yet
    writeDraft(s.key, latest.current);
  }, []);

  // save shortly after each change, and right away when the page is hidden or closed
  useEffect(() => {
    const s = state.current;
    if (!key || s.key !== key || s.cleared) return undefined;
    clearTimeout(s.timer);
    s.timer = setTimeout(save, 400);
    return () => clearTimeout(s.timer);
  }, [serialized, key, save]);

  useEffect(() => {
    const flush = () => save();
    const onVisibility = () => { if (document.visibilityState === 'hidden') save(); };
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      flush(); // leaving the page inside the app (route change) keeps the latest values too
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [save]);

  // after a successful submit: forget the draft and stop saving this form
  const clear = useCallback(() => {
    const s = state.current;
    clearTimeout(s.timer);
    s.cleared = true;
    clearDraft(s.key || key);
    setRestoredAt(null);
  }, [key]);

  // "Start over": remove the draft and reload the empty form
  const discard = useCallback(() => {
    clear();
    window.location.reload();
  }, [clear]);

  return { restoredAt, clear, discard };
}
