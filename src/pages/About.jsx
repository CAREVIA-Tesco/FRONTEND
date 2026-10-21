import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { usePublicStats } from '../services/usePublicStats';
import { HeartPulse, Shield, Users, Award, ChevronRight } from 'lucide-react';

export default function About() {
  const platform = usePublicStats();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="theme-portea font-sans text-primary bg-cream min-h-screen relative">
      <SiteHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="bg-green-50 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 mb-6 shadow-sm border border-green-100 uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          Our Story
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins text-primary leading-tight mb-6">
          Redefining Healthcare,<br /> One Home at a Time
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl font-medium mb-10">
          At Carevaa, we believe that the best place to heal is where you feel most comfortable. We are on a mission to bring world-class, professional medical care directly to your doorstep.
        </p>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">{platform ? platform.patientsServed.toLocaleString('en-IN') : '...'}</div>
              <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Families Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">{platform ? platform.providers.toLocaleString('en-IN') : '...'}</div>
              <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Certified Experts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">24/7</div>
              <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Support Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">{platform ? (platform.rating ? `${platform.rating}/5` : 'New') : '...'}</div>
              <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-blue-100 rounded-[2rem] transform -rotate-3 scale-105 -z-10"></div>
            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop" alt="Carevaa Team" className="rounded-[2rem] shadow-2xl object-cover w-full h-[500px]" />
          </div>
          
          <div className="lg:w-1/2">
            <div className="flex items-center gap-2 text-accent font-medium mb-4">
              <span className="w-4 h-0.5 bg-secondary"></span> Our Core Values
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-primary mb-8">
              Why thousands trust Carevaa with their loved ones
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2">Uncompromising Safety</h3>
                  <p className="text-gray-600">Every single professional undergoes a rigorous 5-step background check and clinical skill verification process before they ever knock on your door.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2">Compassionate Care</h3>
                  <p className="text-gray-600">We don't just treat symptoms. We build relationships, ensuring emotional support and mental well-being go hand-in-hand with medical treatment.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2">Clinical Excellence</h3>
                  <p className="text-gray-600">From basic caretaking to ICU-level setups at home, our protocols are designed by leading medical experts to guarantee hospital-grade care.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-primary rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold font-poppins mb-6 relative z-10">Experience the Carevaa Difference</h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto relative z-10">
            Join the thousands of families who have chosen a better, safer, and more comfortable way to heal.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-secondary hover:bg-white hover:text-accent text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg relative z-10">
            Explore Services <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
      
      <SiteFooter />
    </div>
  );
}
