import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { useSiteContent } from '../services/useSiteContent';

export const LEGAL_PAGES = [
  ['/privacy-policy', 'legal-privacy', 'Privacy Policy'],
  ['/terms', 'legal-terms', 'Terms & Conditions'],
  ['/patient-rights', 'legal-patient-rights', 'Patient Rights'],
];

// Privacy policy, terms and patient rights – text is edited in Admin → Website Content
export default function LegalPage({ contentKey, fallbackTitle }) {
  const doc = useSiteContent(contentKey)[0];
  useEffect(() => { window.scrollTo(0, 0); }, [contentKey]);
  const body = Array.isArray(doc?.body) ? doc.body : String(doc?.body || '').split(/\n{2,}/).filter(Boolean);

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip">
      <SiteHeader />
      <article className="pt-[110px] lg:pt-[140px] pb-16 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-10">
          <nav className="flex flex-wrap gap-2 mb-6">
            {LEGAL_PAGES.map(([to, , label]) => (
              <Link key={to} to={to} className={`text-xs font-semibold rounded-full px-3 py-1.5 ${label === (doc?.title || fallbackTitle) ? 'bg-accent text-white' : 'bg-mint text-accent'}`}>{label}</Link>
            ))}
          </nav>
          <h1 className="font-poppins font-semibold text-3xl sm:text-4xl text-primary">{doc?.title || fallbackTitle}</h1>
          {doc?.updated && <p className="text-sm text-gray-500 mt-2">Last updated: {doc.updated}</p>}
          <div className="mt-8 space-y-4 text-gray-700 leading-relaxed">
            {!doc && <p className="text-gray-500">Loading…</p>}
            {body.map((para, i) => (para.startsWith('## ')
              ? <h2 key={i} className="font-bold text-primary text-lg pt-4">{para.slice(3)}</h2>
              : <p key={i}>{para}</p>))}
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
