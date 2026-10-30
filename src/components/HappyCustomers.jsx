import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Quote } from 'lucide-react';
import api, { reviewVideoUrl } from '../services/api';
import { readCache, writeCache } from '../services/persistentCache';

// Homepage "Happy Customers": only the text and video reviews the admin team adds in
// Admin → Customer Reviews. The last list is remembered so the section does not jump on reload.
function useCustomerReviews() {
  const [reviews, setReviews] = useState(() => readCache('customer-reviews') || []);
  const [loaded, setLoaded] = useState(() => readCache('customer-reviews') !== undefined);
  useEffect(() => {
    let live = true;
    api.customerReviews()
      .then((d) => { if (!live) return; const list = d.reviews || []; setReviews(list); setLoaded(true); writeCache('customer-reviews', list); })
      .catch(() => { if (live) setLoaded(true); });
    return () => { live = false; };
  }, []);
  return { reviews, loaded };
}

const initial = (name = '') => String(name).trim().charAt(0).toUpperCase() || '★';

function TextReviewCard({ r }) {
  const [open, setOpen] = useState(false);
  const long = String(r.text || '').length > 220;
  return (
    <figure className="h-full bg-white rounded-2xl ring-1 ring-black/[0.06] shadow-[0_10px_34px_-18px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] p-6 lg:p-7 flex flex-col relative overflow-hidden" data-testid="text-review">
      <Quote className="absolute -top-2 right-4 w-20 h-20 text-accent/[0.07] rotate-180" aria-hidden="true" />
 <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center" aria-hidden="true"><Quote className="w-5 h-5 fill-current rotate-180" /></span>
      <blockquote className={`relative mt-4 text-[15px] lg:text-[16px] leading-[1.75] text-gray-700 ${open ? '' : 'line-clamp-6'}`}>“{r.text}”</blockquote>
      {long && <button type="button" onClick={() => setOpen(!open)} className="self-start mt-2 font-semibold text-accent underline underline-offset-4 text-[14px]">{open ? 'Read less' : 'Read more'}</button>}
      <figcaption className="mt-auto pt-6 flex items-center gap-3.5">
        <span className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary text-white text-lg font-bold flex items-center justify-center shrink-0" aria-hidden="true">{initial(r.name)}</span>
        <span className="min-w-0">
          <span className="block font-bold text-primary text-[16px] truncate">{r.name}</span>
          <span className="block text-[13px] text-gray-500 truncate">{r.place || 'Carevaa customer'}</span>
        </span>
      </figcaption>
    </figure>
  );
}

// a video review: big play / pause button over the video, and the usual controls while it plays
function VideoReviewCard({ r, playing, onPlay }) {
  const ref = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => { if (playing !== r.id && ref.current && !ref.current.paused) ref.current.pause(); }, [playing, r.id]);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { onPlay(r.id); v.play().catch(() => {}); } else v.pause();
  };
  return (
    <figure className="h-full bg-white rounded-2xl ring-1 ring-black/[0.06] shadow-[0_10px_34px_-18px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] overflow-hidden flex flex-col" data-testid="video-review">
      <div className="relative aspect-[4/5] bg-deep">
        <video
          ref={ref}
          src={`${reviewVideoUrl(r.videoId)}#t=0.1`}
          preload="metadata"
          playsInline
          controls={isPlaying}
          onPlay={() => { setIsPlaying(true); onPlay(r.id); }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="absolute inset-0 w-full h-full object-contain"
          aria-label={`Video review by ${r.name}`}
        />
        {!isPlaying && (
          <button type="button" onClick={toggle} aria-label={`Play video review by ${r.name}`} className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/45 via-black/5 to-transparent group">
            <span className="w-16 h-16 rounded-full bg-white/95 text-accent flex items-center justify-center shadow-xl ring-8 ring-white/25 group-hover:scale-105 transition-transform"><Play className="w-7 h-7 ml-1 fill-current" /></span>
          </button>
        )}
        {isPlaying && (
          <button type="button" onClick={toggle} aria-label={`Pause video review by ${r.name}`} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70"><Pause className="w-5 h-5 fill-current" /></button>
        )}
      </div>
      <figcaption className="p-4 sm:p-5">
        <span className="block font-bold text-primary text-[16px] truncate">{r.name}</span>
        <span className="block text-[13px] text-gray-500 truncate">{r.place || 'Carevaa customer'}</span>
        {r.text && <span className="block mt-2 text-[14px] leading-relaxed text-gray-700 line-clamp-3">“{r.text}”</span>}
      </figcaption>
    </figure>
  );
}

export default function HappyCustomers({ Heading }) {
  const { reviews } = useCustomerReviews();
  const texts = reviews.filter((r) => r.type === 'text' && r.text);
  const videos = reviews.filter((r) => r.type === 'video' && r.videoId);
  const [playing, setPlaying] = useState(null);

  // text reviews slider: 1 / 2 / 3 per view
  const [perView, setPerView] = useState(3);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const fit = () => setPerView(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  const maxSlide = Math.max(0, texts.length - perView);
  useEffect(() => { setSlide((s) => Math.min(s, maxSlide)); }, [maxSlide]);
  useEffect(() => {
    if (maxSlide === 0 || paused) return undefined;
    const t = setInterval(() => setSlide((s) => (s >= maxSlide ? 0 : s + 1)), 6500);
    return () => clearInterval(t);
  }, [maxSlide, paused]);
  // swipe on phones
  const touch = useRef(null);
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current === null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (Math.abs(dx) < 40) return;
    setSlide((s) => (dx < 0 ? (s >= maxSlide ? 0 : s + 1) : (s <= 0 ? maxSlide : s - 1)));
  };

  if (!texts.length && !videos.length) return null;

  return (
    <section id="testimonials" className="py-14 lg:py-24 bg-gradient-to-b from-white via-tint/60 to-white" data-testid="happy-customers">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <Heading eyebrow="Patient stories" title="Happy Customers" desc="Real stories from the families we care for – hear, in their own words, what Carevaa means to them." />

        {videos.length > 0 && (
          <div className="mb-12 lg:mb-14">
            <p className="text-[12px] font-bold tracking-[0.16em] uppercase text-accent mb-4 text-center">Watch their stories</p>
            {/* phones: swipe sideways; larger screens: a grid */}
            <div className={`flex gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 pb-2 sm:mx-0 sm:px-0 sm:overflow-visible ${videos.length >= 4 ? 'sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'sm:flex-wrap sm:justify-center'}`}>
              {videos.map((r) => (
                <div key={r.id} className={`snap-start shrink-0 w-[78%] ${videos.length >= 4 ? 'sm:w-auto' : 'sm:w-[300px] lg:w-[320px]'}`}><VideoReviewCard r={r} playing={playing} onPlay={setPlaying} /></div>
              ))}
            </div>
          </div>
        )}

        {texts.length > 0 && (
          <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="overflow-hidden -mx-3 py-2" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div className={`flex ${texts.length < perView ? 'justify-center' : ''} transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" `} style={{ transform: `translateX(-${(slide * 100) / perView}%)` }}>
                {texts.map((r) => (
                  <div key={r.id} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}><TextReviewCard r={r} /></div>
                ))}
              </div>
            </div>
            {maxSlide > 0 && (
              <>
                <button type="button" aria-label="Previous review" onClick={() => setSlide((s) => (s <= 0 ? maxSlide : s - 1))} className="hidden sm:flex absolute -left-2 lg:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-black/10 shadow-lg text-accent items-center justify-center hover:bg-accent hover:text-white transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                <button type="button" aria-label="Next review" onClick={() => setSlide((s) => (s >= maxSlide ? 0 : s + 1))} className="hidden sm:flex absolute -right-2 lg:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-black/10 shadow-lg text-accent items-center justify-center hover:bg-accent hover:text-white transition-colors"><ChevronRight className="w-6 h-6" /></button>
                <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Choose reviews">
                  {Array.from({ length: maxSlide + 1 }, (_, i) => (
                    <button key={i} type="button" role="tab" aria-selected={slide === i} aria-label={`Show reviews ${i + 1}`} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all ${slide === i ? 'w-7 bg-accent' : 'w-2 bg-primary/20 hover:bg-primary/35'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
