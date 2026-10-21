import { useEffect, useState } from 'react';
import { request } from './api';

// Live platform numbers (provider counts, ratings, patients served) shared by the marketing pages.
let cache = null;
let pending = null;

export function usePublicStats() {
  const [stats, setStats] = useState(cache);
  useEffect(() => {
    if (cache) return;
    pending = pending || request('/public/stats', { auth: false }).then((d) => { cache = d.stats; return cache; });
    pending.then(setStats).catch(() => { pending = null; });
  }, []);
  return stats;
}

// "1 Certified Doctor" / "12 Certified Doctors"
export const plural = (n, word, pluralWord) => `${n} ${n === 1 ? word : pluralWord || `${word}s`}`;

// Service page -> provider "spec" values it covers (same mapping the booking modal uses)
export const SERVICE_SPECS = {
  physiotherapy: ['Physiotherapist'],
  'nurse-care': ['Nurse'],
  'home-doctor': ['General Physician'],
  'care-taker': ['Care Taker'],
  'baby-care': ['Pediatrician'],
  ayurveda: ['Ayurveda Doctor'],
  bhs: ['BHS'],
};

export function serviceStats(stats, serviceType, allDoctors = false) {
  if (!stats) return null;
  const specs = allDoctors ? null : SERVICE_SPECS[serviceType] || [];
  const entries = Object.entries(stats.bySpec || {}).filter(([spec]) => (specs ? specs.includes(spec) : true));
  const providers = allDoctors ? stats.doctors : entries.reduce((t, [, s]) => t + s.providers, 0);
  const visits = entries.reduce((t, [, s]) => t + s.completedVisits, 0);
  const rated = entries.filter(([, s]) => s.rating);
  const reviews = rated.reduce((t, [, s]) => t + s.reviews, 0);
  const rating = reviews ? Math.round((rated.reduce((t, [, s]) => t + s.rating * s.reviews, 0) / reviews) * 10) / 10 : null;
  const fees = entries.map(([, s]) => s.minFee).filter(Boolean);
  const minFee = fees.length ? Math.min(...fees) : null;
  return { providers, visits, rating, minFee };
}

// Package pricing rules stored in the database (GET /api/content/pricing)
let pricingCache = null;
export function usePricingRules() {
  const [rules, setRules] = useState(pricingCache);
  useEffect(() => {
    if (pricingCache) return;
    request('/content/pricing', { auth: false }).then((d) => { pricingCache = d.items?.[0] || null; setRules(pricingCache); }).catch(() => {});
  }, []);
  return rules;
}

export function packagePrices(single, rules) {
  if (!single || !rules) return null;
  const perSession = Math.round(single * (1 - rules.packDiscountPct / 100));
  const pack = perSession * rules.packSessions;
  return {
    single,
    perSession,
    pack,
    packSessions: rules.packSessions,
    packSaving: single * rules.packSessions - pack,
    monthly: single * rules.monthlyMultiplier,
    emiMinimum: rules.emiMinimum,
  };
}

export const inr = (n) => (n || n === 0 ? `₹${Number(n).toLocaleString('en-IN')}` : '—');
