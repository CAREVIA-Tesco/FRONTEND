import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Banner + breadcrumb used at the top of the inner website pages.
export default function PageHero({ eyebrow, title, desc, crumbs = [], children }) {
  return (
    <section className="relative bg-tint pt-28 md:pt-32 lg:pt-40 pb-14 lg:pb-20 overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
          <Link to="/" className="hover:text-primary">Home</Link>
          {crumbs.map(([label, to]) => (
            <React.Fragment key={label}>
              <ChevronRight className="w-3.5 h-3.5" />
              {to ? <Link to={to} className="hover:text-primary">{label}</Link> : <span className="text-primary font-medium">{label}</span>}
            </React.Fragment>
          ))}
        </nav>
        {eyebrow && <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary mb-3"><span className="w-6 h-0.5 bg-secondary" /> {eyebrow}</span>}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-poppins text-primary leading-tight max-w-3xl">{title}</h1>
        {desc && <p className="mt-4 text-lg text-gray-600 max-w-2xl">{desc}</p>}
        {children}
      </div>
    </section>
  );
}
