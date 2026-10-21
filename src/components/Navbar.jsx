import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSessionUser } from '../services/api';
import { ChevronDown, Menu, X } from 'lucide-react';
import BookingModal from './BookingModal';

export default function Navbar() {
  const sessionUser = getSessionUser();
  const accountLink = sessionUser
    ? (sessionUser.role === 'admin' ? '/admin' : sessionUser.role === 'doctor' ? (sessionUser.providerId ? '/doctor/dashboard' : '/professional/onboarding') : '/patient/dashboard')
    : '/login';
  const accountLabel = sessionUser ? 'My Dashboard' : 'Login';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const location = useLocation();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.png" alt="Carevaa Logo" className="h-16 sm:h-20 w-auto object-contain" />
          </Link>
          
          <div className="hidden lg:flex space-x-8 items-center">
            <Link to="/" className="font-medium text-primary hover:text-primary transition">Home</Link>
            
            <div className="relative">
              <button 
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className="font-medium text-primary hover:text-primary transition flex items-center gap-1 focus:outline-none"
              >
                Services <ChevronDown className={`w-4 h-4 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {servicesDropdownOpen && (
                <div className="absolute top-full mt-4 w-56 bg-white rounded-xl shadow-lg py-2 border border-gray-100 flex flex-col z-50">
                  <Link to="/physiotherapy" className="px-4 py-2 hover:bg-gray-50 text-primary font-medium transition">Physiotherapy</Link>
                  <Link to="/baby-care" className="px-4 py-2 hover:bg-gray-50 text-primary font-medium transition">Baby Care</Link>
                  <Link to="/care-taker" className="px-4 py-2 hover:bg-gray-50 text-primary font-medium transition">Care Taker</Link>
                  <Link to="/doctor-visit" className="px-4 py-2 hover:bg-gray-50 text-primary font-medium transition">Doctor Visit</Link>
                  <Link to="/nurse-care" className="px-4 py-2 hover:bg-gray-50 text-primary font-medium transition">Nurse Care</Link>
                  <Link to="/home-doctor" className="px-4 py-2 hover:bg-gray-50 text-primary font-medium transition">Home Doctor</Link>
                  <Link to="/ayurveda" className="px-4 py-2 hover:bg-gray-50 text-primary font-medium transition">Ayurveda</Link>
                  <Link to="/bhs" className="px-4 py-2 hover:bg-gray-50 text-primary font-medium transition">BHS</Link>
                </div>
              )}
            </div>

            <a href="/#how-it-works" className="font-medium text-primary hover:text-primary transition">How It Works</a>
            <Link to="/about" className="font-medium text-primary hover:text-primary transition">About</Link>
            <Link to="/blog" className="font-medium text-primary hover:text-primary transition">Blog</Link>
              
              <Link to="/jobs" className="font-medium text-primary hover:text-primary transition">Careers</Link>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            
            <Link to={accountLink} className="font-bold text-primary hover:text-secondary transition">{accountLabel}</Link>
            
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden text-primary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t mt-3 p-4 shadow-lg absolute w-full">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="font-medium text-primary">Home</Link>
              
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  className="font-medium text-primary flex items-center justify-between focus:outline-none"
                >
                  Services <ChevronDown className={`w-4 h-4 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {servicesDropdownOpen && (
                  <div className="flex flex-col space-y-2 pl-4 border-l-2 border-gray-100 ml-2">
                    <Link to="/physiotherapy" className="text-gray-600 text-sm font-medium">Physiotherapy</Link>
                    <Link to="/baby-care" className="text-gray-600 text-sm font-medium">Baby Care</Link>
                    <Link to="/care-taker" className="text-gray-600 text-sm font-medium">Care Taker</Link>
                    <Link to="/doctor-visit" className="text-gray-600 text-sm font-medium">Doctor Visit</Link>
                    <Link to="/nurse-care" className="text-gray-600 text-sm font-medium">Nurse Care</Link>
                    <Link to="/home-doctor" className="text-gray-600 text-sm font-medium">Home Doctor</Link>
                    <Link to="/ayurveda" className="text-gray-600 text-sm font-medium">Ayurveda</Link>
                    <Link to="/bhs" className="text-gray-600 text-sm font-medium">BHS</Link>
                  </div>
                )}
              </div>

              <Link to="/careers" className="font-medium text-secondary font-bold">For Professionals</Link>
              <Link to="/about" className="font-medium text-primary hover:text-primary transition">About</Link>
              <Link to="/blog" className="font-medium text-primary hover:text-primary transition">Blog</Link>
              <div className="pt-4 border-t flex flex-col space-y-3">
                <Link to={accountLink} className="font-medium text-left text-primary hover:text-primary transition">{accountLabel}</Link>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-secondary text-white px-6 py-2.5 rounded-full font-medium w-full text-center"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </>
  );
}
