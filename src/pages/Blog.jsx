import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { Home, Calendar, ArrowRight } from 'lucide-react';
import { postSlug } from '../utils/slug';

export default function Blog() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Blog posts are stored in the database (GET /api/content/blog)
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api.getContent('blog').then((d) => setPosts(d.items || [])).catch(() => setPosts([]));
  }, []);
  const [category, setCategory] = useState('All');
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
  const visiblePosts = category === 'All' ? posts : posts.filter((p) => p.category === category);

  return (
    <div className="theme-portea font-sans text-primary bg-white min-h-screen">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-24 bg-gradient-to-b from-tint via-white to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 mb-6">
            <Home className="w-4 h-4" />
            <Link to="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-primary font-bold">Blog</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[64px] font-bold font-poppins text-primary mb-6 leading-tight">
            Insights, <br/>Ideas & Health Tips
          </h1>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-16">
            Explore expert articles, medical trends, and practical tips to keep your family healthy and ahead of the curve.
          </p>

          {/* Collage */}
          <div className="flex justify-center items-center gap-4 h-64 md:h-80 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=300&h=400&fit=crop" alt="Collage 1" className="w-1/5 max-w-[150px] h-3/5 object-cover rounded-3xl hidden md:block" />
            <img src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=300&h=400&fit=crop" alt="Collage 2" className="w-1/4 max-w-[200px] h-4/5 object-cover rounded-[2rem]" />
            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=500&fit=crop" alt="Collage 3" className="w-1/3 max-w-[280px] h-full object-cover rounded-[2.5rem] shadow-xl z-10 relative -top-4" />
            <img src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=400&fit=crop" alt="Collage 4" className="w-1/4 max-w-[200px] h-4/5 object-cover rounded-[2rem]" />
            <img src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=400&fit=crop" alt="Collage 5" className="w-1/5 max-w-[150px] h-3/5 object-cover rounded-3xl hidden md:block" />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-gray-500 font-semibold mb-2 block text-lg">Our Blog</span>
            <h2 className="text-4xl md:text-5xl font-bold font-poppins text-primary leading-tight">
              View All <br/>Knowledge Posts
            </h2>
          </div>
          <p className="text-gray-600 max-w-md text-sm md:text-base leading-relaxed">
            Dive into expert-written articles, tutorials, and insights designed to help you stay ahead in the fast-moving world of healthcare and family well-being.
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-12" role="tablist" aria-label="Filter articles">
            {['All', ...categories].map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${category === c ? 'bg-primary text-white' : 'bg-tint text-primary hover:bg-primary/10'}`}>{c}</button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {posts.length === 0 && <p className="col-span-full text-center text-gray-500">No articles yet.</p>}
          {visiblePosts.map((post, idx) => (
            <Link key={idx} to={`/blog/${postSlug(post)}`} className="group cursor-pointer flex flex-col h-full">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-3">
                <Calendar className="w-4 h-4" /> {post.date}
              </div>
              <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition line-clamp-2">
                {post.title}
              </h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                {post.desc}
              </p>
              <div className="relative rounded-[2rem] overflow-hidden mt-auto aspect-[4/3]">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white text-primary px-6 py-2.5 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                    Read More
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      <SiteFooter />
    </div>
  );
}
