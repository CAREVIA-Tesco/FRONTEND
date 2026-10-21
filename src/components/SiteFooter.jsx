import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Mail, Clock, MapPin, Briefcase, ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../data/services';
import { useContact, useSiteContent } from '../services/useSiteContent';

// Shared footer for the public website (multi-column + legal strip).
export default function SiteFooter() {
  const contact = useContact();
  const cities = useSiteContent('cities');

  const company = [
    ['/about', 'About Us'],
    ['/contact', 'Contact Us'],
    ['/track', 'Track Your Request'],
    ['/reviews', 'Patient Reviews'],
    ['/refer', 'Refer a Friend'],
    ['/partner', 'Partner With Us'],
    ['/jobs', 'Careers'],
    ['/blog', 'Blogs'],
    ['/doctors', 'Find Doctors'],
    ['/hire-professional', 'Hire a Professional'],
    ['/login', 'Login / Register'],
  ];

  return (
    <footer className="bg-primary text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-10 mb-12">
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Link to="/" className="inline-block bg-white rounded-2xl p-1.5 mb-5"><img src="/logo.png" alt="Carevaa Logo" className="h-16 w-auto object-contain" /></Link>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              Quality healthcare, delivered. Book verified doctors, physiotherapists, nurses and caregivers who come to your home or consult online.
            </p>
            <Link to="/partner" className="inline-flex items-center gap-2 text-sm font-semibold text-white border border-white/20 rounded-full px-5 py-2.5 hover:bg-white hover:text-primary transition-colors">
              Partner with us <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5">Company</h4>
            <ul className="space-y-3 text-sm">
              {company.map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5">Our Services</h4>
            <ul className="space-y-3 text-sm">
              {SERVICES.map((s) => (
                <li key={s.key}><Link to={s.link} className="hover:text-white transition-colors">{s.title}</Link></li>
              ))}
              <li><Link to="/services" className="text-white font-semibold hover:text-accent transition-colors">All services →</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-2 lg:col-span-4">
            <h4 className="text-white font-semibold mb-5">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              {contact.phone && (
                <li><a href={contact.phoneHref} className="flex items-center gap-3 hover:text-white transition-colors"><span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0"><PhoneCall className="w-4 h-4 text-accent" /></span>{contact.phone}</a></li>
              )}
              {contact.email && (
                <li><a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-white transition-colors"><span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-accent" /></span>{contact.email}</a></li>
              )}
              {contact.hours && (
                <li className="flex items-center gap-3"><span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-accent" /></span>{contact.hours}</li>
              )}
              {contact.address && (
                <li className="flex items-center gap-3"><span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-accent" /></span>{contact.address}</li>
              )}
              {(contact.careersEmail || contact.careersPhone) && (
                <li className="flex items-center gap-3"><span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Briefcase className="w-4 h-4 text-accent" /></span>
                  <span>Careers: {[contact.careersEmail, contact.careersPhone].filter(Boolean).join(' · ')}</span>
                </li>
              )}
            </ul>
            {cities.length > 0 && (
              <>
                <h4 className="text-white font-semibold mt-8 mb-3">We serve</h4>
                <p className="text-sm leading-relaxed">{cities.map((c, i) => <React.Fragment key={c.name}>{i > 0 && ' · '}<Link to={`/cities/${encodeURIComponent(c.name)}`} className="hover:text-white">{c.name}</Link></React.Fragment>)}</p>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} Carevaa. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
            <Link to="/patient-rights" className="hover:text-white">Patient Rights</Link>
          </div>
          <p className="text-white/50 text-center md:text-right">In a medical emergency, call 108.</p>
        </div>
      </div>
    </footer>
  );
}
