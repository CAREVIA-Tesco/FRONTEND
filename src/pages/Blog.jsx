import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Search, BookOpen, ChevronRight, CalendarCheck, X } from 'lucide-react';
import api from '../services/api';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import Reveal from '../components/Reveal';
import { useBookNow } from '../components/BookNow';
import { postSlug } from '../utils/slug';

const HOVER = 'transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-secondary)_45%,transparent)]';
// about 200 words a minute
const readTime = (p) => {
  const words = [p.desc, ...(Array.isArray(p.body) ? p.body : [p.body])].filter(Boolean).join(' ').split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};
const Img = ({ src, alt, className }) => (
  <span className={`block bg-[color-mix(in_srgb,var(--color-accent)_10%,white)] ${className}`}>
    {src && <img src={src} alt={alt} loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
  </span>
);

// Blog list – posts come from Admin → Website Content → Blog articles (GET /api/content/blog)
export default function Blog() {
  const bookNow = useBookNow();
  const [posts, setPosts] = useState(null);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Health Blog – Carevaa';
    api.getContent('blog').then((d) => setPosts(d.items || [])).catch(() => setPosts([]));
    return () => { document.title = 'Carevaa | Doctors, Nurses & Home Care Services'; };
  }, []);

  const all = posts || [];
  const categories = useMemo(() => [...new Set(all.map((p) => p.category).filter(Boolean))], [all]);
  const filtered = all
    .filter((p) => category === 'All' || p.category === category)
    .filter((p) => !query.trim() || `${p.title} ${p.desc} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const browsing = category === 'All' && !query.trim();
  const featured = browsing ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen overflow-x-clip" data-testid="blog-page">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-tint pt-28 lg:pt-36 pb-12 lg:pb-16 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
            <Link to="/" className="hover:text-secondary">Home</Link><ChevronRight className="w-3.5 h-3.5" /><span className="text-primary font-medium">Blog</span>
          </nav>
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-black/[0.06] px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-accent"><BookOpen className="w-4 h-4" /> Carevaa health blog</p>
              <h1 className="mt-5 font-poppins font-semibold text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.1]">Recovery tips & <span className="italic text-secondary">care guides</span></h1>
              <p className="mt-4 text-lg text-gray-600 max-w-xl">Practical, easy-to-follow articles on home care, recovery, elder care and everyday health – written for families.</p>
            </div>
            <label className="relative block">
              <span className="sr-only">Search articles</span>
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles…" data-testid="blog-search" className="w-full h-14 rounded-2xl bg-white border border-black/[0.07] pl-12 pr-12 text-[15px] shadow-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15 transition" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:bg-tint"><X className="w-4 h-4" /></button>}
            </label>
          </div>
          {categories.length > 0 && (
            <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1" role="tablist" aria-label="Filter articles by topic">
              {['All', ...categories].map((c) => (
                <button key={c} type="button" role="tab" aria-selected={category === c} onClick={() => setCategory(c)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${category === c ? 'bg-secondary border-secondary text-white' : 'bg-white border-black/[0.07] text-primary hover:border-secondary hover:text-secondary'}`}>
                  {c}{c !== 'All' && <span className="ml-1.5 opacity-70">{all.filter((p) => p.category === c).length}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {posts === null && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-96 rounded-3xl bg-white animate-pulse" />)}</div>
          )}

          {/* Featured */}
          {featured && (
            <Reveal>
              <Link to={`/blog/${postSlug(featured)}`} className={`group grid lg:grid-cols-[1.15fr_1fr] bg-white rounded-3xl border border-black/[0.06] overflow-hidden mb-10 ${HOVER}`} data-testid="blog-featured">
                <Img src={featured.img} alt={featured.title} className="h-64 sm:h-80 lg:h-full lg:min-h-[380px] overflow-hidden" />
                <div className="p-7 sm:p-10 flex flex-col justify-center">
                  <span className="self-start text-[11.5px] font-bold uppercase tracking-[0.14em] text-white bg-secondary rounded-full px-3 py-1">Featured</span>
                  <p className="mt-4 text-[13px] font-semibold text-accent flex flex-wrap items-center gap-x-3 gap-y-1">{featured.category || 'Health'}<span className="flex items-center gap-1 text-gray-500 font-medium"><Calendar className="w-3.5 h-3.5" /> {featured.date}</span><span className="flex items-center gap-1 text-gray-500 font-medium"><Clock className="w-3.5 h-3.5" /> {readTime(featured)} min read</span></p>
                  <h2 className="mt-3 font-poppins font-semibold text-2xl sm:text-[32px] leading-tight group-hover:text-secondary transition-colors">{featured.title}</h2>
                  <p className="mt-3 text-gray-600 text-[16px] leading-relaxed line-clamp-3">{featured.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-bold text-secondary group-hover:gap-3 transition-all">Read article <ArrowRight className="w-4 h-4" /></span>
                </div>
              </Link>
            </Reveal>
          )}

          {posts !== null && (
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 className="font-poppins font-semibold text-2xl sm:text-3xl">{browsing ? 'Latest articles' : `${filtered.length} ${filtered.length === 1 ? 'article' : 'articles'}${category !== 'All' ? ` in ${category}` : ''}`}</h2>
              {!browsing && <button type="button" onClick={() => { setCategory('All'); setQuery(''); }} className="text-sm font-semibold text-secondary hover:underline">Show all</button>}
            </div>
          )}

          {posts !== null && filtered.length === 0 && (
            <div className="bg-white rounded-3xl border border-black/[0.06] p-10 text-center text-gray-600">{all.length ? 'No articles match your search.' : 'New articles are coming soon.'}</div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="blog-grid">
            {rest.map((post, i) => (
              <Reveal key={postSlug(post)} delay={(i % 3) * 70} className="h-full">
                <Link to={`/blog/${postSlug(post)}`} className={`group h-full flex flex-col bg-white rounded-3xl border border-black/[0.06] overflow-hidden ${HOVER}`}>
                  <span className="relative block">
                    <Img src={post.img} alt={post.title} className="aspect-[16/10] overflow-hidden" />
                    {post.category && <span className="absolute top-4 left-4 text-[11.5px] font-bold uppercase tracking-wider bg-white/95 text-accent rounded-full px-3 py-1 shadow-sm">{post.category}</span>}
                  </span>
                  <span className="flex flex-col flex-1 p-6">
                    <span className="flex items-center gap-3 text-[12.5px] text-gray-500"><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {readTime(post)} min read</span></span>
                    <span className="mt-3 block text-[19px] font-semibold leading-snug text-primary group-hover:text-secondary transition-colors line-clamp-2">{post.title}</span>
                    <span className="mt-2 block text-[14.5px] text-gray-600 leading-relaxed line-clamp-3 flex-1">{post.desc}</span>
                    <span className="mt-5 inline-flex items-center gap-1.5 font-bold text-secondary text-[14.5px] group-hover:gap-3 transition-all">Read article <ArrowRight className="w-4 h-4" /></span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-secondary to-primary rounded-3xl px-6 py-7 sm:px-10 sm:py-8 text-white shadow-xl flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-[28px] font-bold font-poppins leading-tight">Need care at home?</h2>
            <p className="text-[15px] md:text-base mt-2 opacity-90">Book a verified doctor, nurse, physiotherapist or care taker in about a minute.</p>
          </div>
          <button type="button" onClick={() => bookNow()} className="shrink-0 self-center bg-white text-primary px-6 py-3 rounded-xl font-bold text-[15px] hover:bg-gray-50 transition shadow-lg inline-flex items-center gap-2"><CalendarCheck className="w-5 h-5" /> Book Now</button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
