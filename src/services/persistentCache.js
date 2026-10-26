// Remembers the last public data the website received (services, site content, live numbers…)
// so the next page load starts with the same values instead of built-in defaults that are then
// replaced a moment later. Fresh data is still fetched on every page load and replaces it.
const PREFIX = 'carevaa_cache_v1:';

export function readCache(name) {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function writeCache(name, value) {
  try { localStorage.setItem(PREFIX + name, JSON.stringify(value)); } catch { /* storage full or blocked */ }
}
