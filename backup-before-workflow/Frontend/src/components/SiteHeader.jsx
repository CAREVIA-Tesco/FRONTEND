import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, PhoneCall, Mail, ArrowRight, MapPin } from 'lucide-react';
import { getSessionUser } from '../services/api';
import { useContact } from '../services/useSiteContent';
import { usePublicStats } from '../services/usePublicStats';
import { SERVICES } from '../data/services';
import BookingModal from './BookingModal';

// Header for the public website (Portea-style: utility strip, services mega-menu, phone + Book Now).
// The login page keeps its original <Navbar />.
export default function SiteHeader() {
  const sessionUser = getSessionUser();
  const accountLink = sessionUser
    ? (sessionUser.role === 'admin' ? '/admin' : sessionUser.role === 'doctor' ? (sessionUser.providerId ? '/doctor/dashboard' : '/professional/onboarding') : '/patient/dashboard')
    : '/login';
  const accountLabel = sessionUser ? 'My Dashboard' : 'Login';
  const contact = useContact();
  const stats = usePublicStats();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const navCls = ({ isActive }) => `relative font-medium text-[15px] transition-colors py-2 ${isActive ? 'text-secondary' : 'text-primary hover:text-secondary'}`;

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50">
        {/* Utility strip */}
        <div className={`hidden lg:block bg-primary text-white/90 text-xs transition-all duration-300 overflow-hidden ${scrolled ? 'max-h-0' : 'max-h-10'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-secondary" />
              Home healthcare by verified professionals{stats?.cities ? ` · ${stats.cities} ${stats.cities === 1 ? 'city' : 'cities'}` : ''}
            </p>
            <div className="flex items-center gap-5">
              {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-white"><Mail className="w-3.5 h-3.5" />{contact.email}</a>}
              {contact.hours && <span>{contact.hours}</span>}
              <Link to="/jobs" className="font-semibold text-secondary hover:text-white transition-colors">Join as a Professional</Link>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className={`bg-white/95 backdrop-blur border-b transition-shadow duration-300 ${scrolled ? 'shadow-md border-transparent' : 'border-gray-100'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] lg:h-20 flex items-center justify-between gap-6">
            <Link to="/" className="flex items-center shrink-0" aria-label="Carevia home">
              <img src="/logo.png" alt="Carevia Logo" className="h-14 lg:h-16 w-auto object-contain" />
            </Link>

            <nav className="hidden lg:flex items-center gap-7">
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  className={`flex items-center gap-1 font-medium text-[15px] py-2 transition-colors ${menuOpen ? 'text-secondary' : 'text-primary hover:text-secondary'}`}
                >
                  Our Services <ChevronDown className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 transition-all duration-200 ${menuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="w-[640px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
                    <div className="grid grid-cols-2 gap-1">
                      {SERVICES.map((s) => (
                        <Link key={s.key} to={s.link} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F4FF] group transition-colors">
                          <span className="w-11 h-11 rounded-xl bg-[#F0F4FF] group-hover:bg-white flex items-center justify-center text-primary shrink-0 transition-colors">
                            <s.icon className="w-5 h-5" />
                          </span>
                          <span>
                            <span className="block font-semibold text-primary text-sm group-hover:text-secondary transition-colors">{s.title}</span>
                            <span className="block text-xs text-gray-500">{s.short}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-sm text-gray-500">Not sure what you need? Talk to a care advisor.</p>
                      <button type="button" onClick={() => { setMenuOpen(false); setBookingOpen(true); }} className="text-sm font-semibold text-secondary flex items-center gap-1 hover:gap-2 transition-all">
                        Book a consultation <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <NavLink to="/doctors" className={navCls}>Find Doctors</NavLink>
              <NavLink to="/hire-professional" className={navCls}>Hire a Professional</NavLink>
              <NavLink to="/about" className={navCls}>About Us</NavLink>
              <NavLink to="/blog" className={navCls}>Blogs</NavLink>
              <NavLink to="/jobs" className={navCls}>Careers</NavLink>
            </nav>

            <div className="hidden lg:flex items-center gap-4 shrink-0">
              {contact.phone && (
                <a href={contact.phoneHref} className="flex items-center gap-2 font-semibold text-primary hover:text-secondary transition-colors">
                  <span className="w-9 h-9 rounded-full bg-[#F0F4FF] flex items-center justify-center"><PhoneCall className="w-4 h-4" /></span>
                  <span className="text-sm">{contact.phone}</span>
                </a>
              )}
              <Link to={accountLink} className="font-bold text-primary hover:text-secondary transition-colors text-sm">{accountLabel}</Link>
              <button type="button" onClick={() => setBookingOpen(true)} className="bg-secondary hover:bg-secondary-hover text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Book Now
              </button>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              {contact.phone && (
                <a href={contact.phoneHref} aria-label="Call us" className="w-10 h-10 rounded-full bg-[#F0F4FF] text-primary flex items-center justify-center"><PhoneCall className="w-4 h-4" /></a>
              )}
              <button type="button" onClick={() => setBookingOpen(true)} className="hidden sm:inline-flex bg-secondary text-white px-4 py-2 rounded-full font-semibold text-sm">Book Now</button>
              <button type="button" aria-label="Menu" className="w-10 h-10 flex items-center justify-center text-primary" onClick={() => setMobileOpen((v) => !v)}>
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`lg:hidden overflow-hidden transition-[max-height] duration-300 bg-white ${mobileOpen ? 'max-h-[85vh] overflow-y-auto border-t border-gray-100' : 'max-h-0'}`}>
            <div className="px-4 py-4 flex flex-col">
              <button type="button" onClick={() => setMobileServices((v) => !v)} className="flex items-center justify-between py-3 font-semibold text-primary border-b border-gray-100">
                Our Services <ChevronDown className={`w-4 h-4 transition-transform ${mobileServices ? 'rotate-180' : ''}`} />
              </button>
              {mobileServices && (
                <div className="grid grid-cols-2 gap-2 py-3 border-b border-gray-100">
                  {SERVICES.map((s) => (
                    <Link key={s.key} to={s.link} className="flex items-center gap-2 p-2 rounded-lg bg-[#F0F4FF] text-sm font-medium text-primary">
                      <s.icon className="w-4 h-4 shrink-0" /> {s.title}
                    </Link>
                  ))}
                </div>
              )}
              {[['/doctors', 'Find Doctors'], ['/hire-professional', 'Hire a Professional'], ['/about', 'About Us'], ['/blog', 'Blogs'], ['/jobs', 'Careers']].map(([to, label]) => (
                <Link key={to} to={to} className="py-3 font-medium text-primary border-b border-gray-100">{label}</Link>
              ))}
              <Link to={accountLink} className="py-3 font-bold text-primary">{accountLabel}</Link>
              <button type="button" onClick={() => { setMobileOpen(false); setBookingOpen(true); }} className="mt-2 bg-secondary text-white py-3 rounded-full font-semibold">Book Now</button>
            </div>
          </div>
        </div>
      </header>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
