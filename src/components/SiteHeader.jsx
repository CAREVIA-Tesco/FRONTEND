import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, Phone, ArrowRight, PhoneCall, SearchCheck, Briefcase, Stethoscope, ShieldCheck } from 'lucide-react';
import { getSessionUser } from '../services/api';
import { useContact } from '../services/useSiteContent';
import { useServices } from '../data/services';
import BookingModal from './BookingModal';
import EnquiryModal from './EnquiryModal';
import { useBookNow } from './BookNow';

// Public website header (Portea-style: cream bar, services menu, phone box, orange Book Now).
// The login page keeps its original <Navbar />.
export default function SiteHeader() {
  const SERVICES = useServices();
  const sessionUser = getSessionUser();
  const accountLink = sessionUser
    ? (sessionUser.role === 'admin' ? '/admin' : sessionUser.role === 'doctor' ? (sessionUser.providerId ? '/doctor/dashboard' : '/professional/onboarding') : '/patient/dashboard')
    : '/login';
  const accountLabel = sessionUser ? 'My Dashboard' : 'Login';
  const contact = useContact();
  const bookNow = useBookNow();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const menuRef = useRef(null);
  // Partners menu: sign-in pages for doctors / professionals and for the Carevaa admin team
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [mobilePartners, setMobilePartners] = useState(false);
  const partnersRef = useRef(null);
  const PARTNER_LINKS = [
    { to: '/doctor', label: 'Doctor Login', sub: 'Doctors & care professionals', icon: Stethoscope },
    { to: '/admin', label: 'Admin Login', sub: 'Carevaa admin team', icon: ShieldCheck },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setMobileOpen(false); setPartnersOpen(false); }, [location.pathname]);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (partnersRef.current && !partnersRef.current.contains(e.target)) setPartnersOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') { setMenuOpen(false); setPartnersOpen(false); } };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', onKey); };
  }, []);

  const navCls = ({ isActive }) => `whitespace-nowrap text-[15px] xl:text-base transition-colors py-2 ${isActive ? 'text-accent' : 'text-primary hover:text-accent'}`;

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 bg-tint transition-shadow duration-300 ${scrolled ? 'shadow-[0_6px_24px_color-mix(in_srgb,var(--color-primary)_8%,transparent)]' : ''}`}>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 h-[72px] lg:h-[88px] flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center shrink-0" aria-label="Carevaa home">
            <img src="/logo.png" alt="Carevaa Logo" className="h-12 lg:h-[60px] w-auto object-contain mix-blend-multiply" />
          </Link>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-10 ml-auto">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                className={`flex items-center gap-3 whitespace-nowrap text-[15px] xl:text-base py-2 transition-colors ${menuOpen ? 'text-accent' : 'text-primary hover:text-accent'}`}
              >
                Our Services <ChevronDown className={`w-5 h-5 text-accent transition-transform ${menuOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
              </button>
              <div className={`absolute left-1/2 -translate-x-1/2 top-full pt-5 transition-all duration-200 ${menuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                <div className="w-[680px] bg-white rounded-2xl shadow-2xl border border-black/5 p-5">
                  <div className="grid grid-cols-2 gap-1">
                    {SERVICES.map((s) => (
                      <Link key={s.key} to={s.link} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream group transition-colors">
                        <span className="w-12 h-12 rounded-xl overflow-hidden bg-mint shrink-0"><img src={s.img} alt="" className="w-full h-full object-cover" /></span>
                        <span>
                          <span className="block font-semibold text-primary text-[15px] group-hover:text-accent transition-colors">{s.title}</span>
                          <span className="block text-xs text-gray-500">{s.short}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                    <Link to="/services" className="font-semibold text-primary flex items-center gap-1 hover:text-accent">View all services <ArrowRight className="w-4 h-4" /></Link>
                    <span aria-hidden="true" />
                    <Link to="/track" className="text-gray-600 flex items-center gap-1.5 hover:text-accent"><SearchCheck className="w-4 h-4" /> Track your request</Link>
                    <Link to="/hire-professional" className="text-gray-600 flex items-center gap-1.5 justify-end hover:text-accent">Hire a professional</Link>
                    <Link to="/jobs" className="text-gray-600 flex items-center gap-1.5 hover:text-accent"><Briefcase className="w-4 h-4" /> Careers</Link>
                    <Link to="/refer" className="text-gray-600 flex items-center gap-1.5 justify-end hover:text-accent">Refer a friend</Link>
                    <Link to="/reviews" className="text-gray-600 flex items-center gap-1.5 hover:text-accent">Patient reviews</Link>
                  </div>
                </div>
              </div>
            </div>
            <NavLink to="/doctors" className={navCls}>Find Doctors</NavLink>
            <NavLink to="/about" className={navCls}>About Us</NavLink>
            <NavLink to="/blog" className={navCls}>Blogs</NavLink>
            <span className="hidden xl:inline-flex"><NavLink to="/contact" className={navCls}>Contact</NavLink></span>
            <div className="relative" ref={partnersRef}>
              <button
                type="button"
                onClick={() => setPartnersOpen((v) => !v)}
                aria-expanded={partnersOpen}
                aria-haspopup="true"
                className={`flex items-center gap-2 whitespace-nowrap text-[15px] xl:text-base py-2 transition-colors ${partnersOpen ? 'text-accent' : 'text-primary hover:text-accent'}`}
              >
                Partners <ChevronDown className={`w-5 h-5 text-accent transition-transform ${partnersOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
              </button>
              <div className={`absolute right-0 top-full pt-5 transition-all duration-200 ${partnersOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                <div className="w-[280px] bg-white rounded-2xl shadow-2xl border border-black/5 p-2" role="menu" aria-label="Partners" data-testid="partners-menu">
                  {PARTNER_LINKS.map((l) => (
                    <Link key={l.to} to={l.to} role="menuitem" onClick={() => setPartnersOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream group transition-colors">
                      <span className="w-10 h-10 rounded-xl bg-mint text-accent flex items-center justify-center shrink-0"><l.icon className="w-5 h-5" /></span>
                      <span>
                        <span className="block font-semibold text-primary text-[15px] group-hover:text-accent transition-colors">{l.label}</span>
                        <span className="block text-xs text-gray-500">{l.sub}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-3 xl:gap-7 shrink-0">
            <Link to={accountLink} className="whitespace-nowrap text-[15px] text-primary hover:text-accent transition-colors">{accountLabel}</Link>
            {contact.phone && (
              <a href={contact.phoneHref} aria-label={`Call ${contact.phone}`} className="flex items-center gap-3 bg-white rounded-lg px-3 xl:px-4 py-3 shadow-[0_2px_10px_color-mix(in_srgb,var(--color-primary)_6%,transparent)] hover:shadow-md transition-shadow">
                <Phone className="w-5 h-5 text-accent fill-accent" />
                <span className="hidden xl:inline font-bold text-primary text-base whitespace-nowrap">{contact.phone}</span>
              </a>
            )}
            <button type="button" onClick={() => bookNow()} className="whitespace-nowrap bg-secondary hover:bg-secondary-hover text-white px-5 xl:px-6 py-3.5 rounded-lg font-bold text-[15px] xl:text-[17px] leading-none shadow-sm hover:shadow-lg transition-all">
              Book Now
            </button>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            {contact.phone && (
              <a href={contact.phoneHref} aria-label="Call us" className="w-10 h-10 rounded-lg bg-white text-accent flex items-center justify-center shadow-sm"><Phone className="w-4 h-4 fill-accent" /></a>
            )}
            <button type="button" onClick={() => bookNow()} className="hidden sm:inline-flex bg-secondary text-white px-4 py-2.5 rounded-lg font-bold text-sm">Book Now</button>
            <button type="button" aria-label="Menu" className="w-10 h-10 flex items-center justify-center text-primary" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden transition-[max-height] duration-300 bg-white ${mobileOpen ? 'max-h-[85vh] overflow-y-auto border-t border-gray-100' : 'max-h-0'}`}>
          <div className="px-4 py-4 flex flex-col">
            <button type="button" onClick={() => setMobileServices((v) => !v)} className="flex items-center justify-between py-3 font-semibold text-primary border-b border-gray-100">
              Our Services <ChevronDown className={`w-4 h-4 text-accent transition-transform ${mobileServices ? 'rotate-180' : ''}`} />
            </button>
            {mobileServices && (
              <div className="grid grid-cols-2 gap-2 py-3 border-b border-gray-100">
                {SERVICES.map((s) => (
                  <Link key={s.key} to={s.link} className="flex items-center gap-2 p-2 rounded-lg bg-cream text-sm font-medium text-primary">
                    <s.icon className="w-4 h-4 shrink-0 text-accent" /> {s.title}
                  </Link>
                ))}
              </div>
            )}
            {[['/services', 'All Services'], ['/doctors', 'Find Doctors'], ['/hire-professional', 'Hire a Professional'], ['/about', 'About Us'], ['/blog', 'Blogs'], ['/contact', 'Contact Us'], ['/reviews', 'Patient Reviews'], ['/track', 'Track Request'], ['/refer', 'Refer a Friend'], ['/jobs', 'Careers']].map(([to, label]) => (
              <Link key={to} to={to} className="py-3 font-medium text-primary border-b border-gray-100">{label}</Link>
            ))}
            <button type="button" onClick={() => setMobilePartners((v) => !v)} aria-expanded={mobilePartners} className="flex items-center justify-between py-3 font-semibold text-primary border-b border-gray-100">
              Partners <ChevronDown className={`w-4 h-4 text-accent transition-transform ${mobilePartners ? 'rotate-180' : ''}`} />
            </button>
            {mobilePartners && (
              <div className="py-2 border-b border-gray-100" data-testid="partners-menu-mobile">
                {PARTNER_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className="flex items-center gap-2.5 py-2.5 pl-2 text-[15px] font-medium text-primary">
                    <l.icon className="w-4 h-4 text-accent" /> {l.label}
                  </Link>
                ))}
              </div>
            )}
            <Link to={accountLink} className="py-3 font-bold text-primary">{accountLabel}</Link>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button type="button" onClick={() => { setMobileOpen(false); setCallbackOpen(true); }} className="border-2 border-accent text-accent py-3 rounded-lg font-semibold">Request Callback</button>
              <button type="button" onClick={() => { setMobileOpen(false); bookNow(); }} className="bg-secondary text-white py-3 rounded-lg font-bold">Book Now</button>
            </div>
          </div>
        </div>
      </header>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
      <EnquiryModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />
    </>
  );
}
