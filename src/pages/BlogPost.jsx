import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Tag, ArrowRight } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import EnquiryModal from '../components/EnquiryModal';
import { useSiteContent } from '../services/useSiteContent';
import { postSlug } from '../utils/slug';


export default function BlogPost() {
  const { slug } = useParams();
  const posts = useSiteContent('blog');
  const [callbackOpen, setCallbackOpen] = useState(false);
  const post = posts.find((p) => postSlug(p) === slug);
  const related = posts.filter((p) => p !== post).slice(0, 3);
  const body = post ? (Array.isArray(post.body) ? post.body : String(post.body || post.desc || '').split(/\n{2,}/)).filter(Boolean) : [];

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  return (
    <div className="theme-portea font-sans text-primary bg-white min-h-screen overflow-x-clip">
      <SiteHeader />
      <article className="pt-28 md:pt-32 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-accent mb-6 hover:gap-3 transition-all"><ArrowLeft className="w-4 h-4" /> All articles</Link>
          {!post ? (
            <p className="text-gray-500 py-20 text-center">{posts.length ? 'Article not found.' : 'Loading article…'}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                {post.category && <span className="inline-flex items-center gap-1.5 bg-tint text-primary font-semibold px-3 py-1 rounded-full"><Tag className="w-3.5 h-3.5" /> {post.category}</span>}
                {post.date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {post.date}</span>}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-poppins text-primary leading-tight mb-6">{post.title}</h1>
              {post.desc && <p className="text-lg text-gray-600 mb-8">{post.desc}</p>}
              {post.img && <img src={post.img} alt={post.title} className="w-full h-64 sm:h-96 object-cover rounded-3xl mb-10 bg-tint" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
              <div className="space-y-5 text-[17px] leading-relaxed text-gray-700">
                {body.map((para, i) => <p key={i}>{para}</p>)}
              </div>
              <div className="mt-12 bg-tint rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-primary text-lg">Need help with care at home?</p>
                  <p className="text-sm text-gray-600">Talk to a Carevaa care advisor – it&apos;s free.</p>
                </div>
                <button type="button" onClick={() => setCallbackOpen(true)} className="bg-secondary hover:bg-secondary-hover text-white px-6 py-3 rounded-full font-semibold shrink-0">Request a callback</button>
              </div>
            </>
          )}
        </div>
      </article>

      {post && related.length > 0 && (
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold font-poppins text-primary mb-6">More articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.title} to={`/blog/${postSlug(p)}`} className="group bg-cream rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                  <div className="h-44 overflow-hidden bg-tint"><img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display = 'none'; }} /></div>
                  <div className="p-5">
                    <p className="text-xs font-semibold text-accent mb-1">{p.date}</p>
                    <h3 className="font-bold text-primary group-hover:text-accent transition-colors">{p.title}</h3>
                    <span className="mt-3 text-sm font-semibold text-primary inline-flex items-center gap-1">Read article <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
      <EnquiryModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />
    </div>
  );
}
