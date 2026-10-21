import React, { useEffect } from 'react';
import { Building2, FlaskConical, Stethoscope, Briefcase, ShieldCheck, Users, LineChart, HeartHandshake } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PageHero from '../components/PageHero';
import EnquiryForm from '../components/EnquiryForm';
import Reveal from '../components/Reveal';
import { usePublicStats } from '../services/usePublicStats';

const WHO = [
  { icon: Building2, title: 'Hospitals & clinics', desc: 'Continue care after discharge with physiotherapy, nursing and doctor visits at home.' },
  { icon: FlaskConical, title: 'Diagnostic centres', desc: 'Offer home sample collection and reports to our patients.' },
  { icon: Stethoscope, title: 'Medical equipment', desc: 'Rent or sell equipment our patients need for recovery at home.' },
  { icon: Briefcase, title: 'Companies', desc: 'Health check-ups, doctor consultations and wellness for your employees.' },
];

const WHY = [
  { icon: ShieldCheck, title: 'Verified professionals', desc: 'Qualified doctors, nurses, physios and caregivers.' },
  { icon: Users, title: 'Patients across cities', desc: 'Reach families who need care at home.' },
  { icon: LineChart, title: 'Digital records', desc: 'Every visit, prescription and payment is tracked.' },
  { icon: HeartHandshake, title: 'Dedicated support', desc: 'A partnerships team that works with you directly.' },
];

export default function Partner() {
  const stats = usePublicStats();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="font-sans text-primary bg-[#F7FAFC] min-h-screen overflow-x-clip">
      <SiteHeader />
      <PageHero eyebrow="Partner With Us" title="Grow with Carevia" desc="We work with hospitals, clinics, diagnostic centres, equipment providers and companies to bring quality care home." crumbs={[['Partner With Us']]}>
        {stats && (
          <div className="flex flex-wrap gap-3 mt-8">
            {[[stats.providers, 'verified professionals'], [stats.cities, 'cities'], [stats.completedVisits, 'visits completed']].filter(([n]) => n).map(([n, l]) => (
              <span key={l} className="bg-white rounded-full px-4 py-2 text-sm font-semibold text-primary shadow-sm">{n.toLocaleString('en-IN')} {l}</span>
            ))}
          </div>
        )}
      </PageHero>

      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold font-poppins text-primary mb-8">Who we work with</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHO.map((w, i) => (
            <Reveal key={w.title} delay={i * 80}>
              <div className="h-full bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all">
                <span className="w-12 h-12 rounded-xl bg-[#F0F4FF] text-primary flex items-center justify-center mb-4"><w.icon className="w-5 h-5" /></span>
                <h3 className="font-bold text-primary mb-1">{w.title}</h3>
                <p className="text-sm text-gray-600">{w.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.3fr] gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-poppins text-primary mb-6">Why partner with Carevia?</h2>
            <div className="space-y-4">
              {WHY.map((w) => (
                <div key={w.title} className="flex gap-4">
                  <span className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0"><w.icon className="w-5 h-5" /></span>
                  <div>
                    <h3 className="font-bold text-primary">{w.title}</h3>
                    <p className="text-sm text-gray-600">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <img src="/career-hero.jpg" alt="Carevia healthcare team" className="hidden lg:block mt-10 rounded-3xl w-full h-64 object-cover" />
          </div>
          <Reveal className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
            <h2 className="text-2xl font-bold font-poppins text-primary mb-2">Partnership enquiry</h2>
            <p className="text-gray-600 mb-8">Tell us about your organisation and our partnerships team will contact you.</p>
            <EnquiryForm type="partner" />
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
