import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import AdminApp from './admin/AdminApp.tsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import ProfessionalOnboarding from './pages/ProfessionalOnboarding.jsx';
import Physiotherapy from './pages/Physiotherapy.jsx';

import BabyCare from './pages/BabyCare.jsx';
import CareTaker from './pages/CareTaker.jsx';
import DoctorVisit from './pages/DoctorVisit.jsx';
import About from './pages/About.jsx';
import Blog from './pages/Blog.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import HireProfessional from './pages/HireProfessional.jsx';
import FindJobs from './pages/FindJobs.jsx';
import NurseCare from './pages/NurseCare.jsx';
import HomeDoctor from './pages/HomeDoctor.jsx';
import Ayurveda from './pages/Ayurveda.jsx';
import BHS from './pages/BHS.jsx';
import Doctors from './pages/Doctors.jsx';
import Contact from './pages/Contact.jsx';
import Partner from './pages/Partner.jsx';
import TrackRequest from './pages/TrackRequest.jsx';
import BlogPost from './pages/BlogPost.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ServiceDetail from './pages/ServiceDetail';
import ThemeLoader from './components/ThemeLoader.jsx';
import VisitSummary from './pages/VisitSummary.jsx';
import ProfessionalProfile from './pages/ProfessionalProfile.jsx';
import CityCare from './pages/CityCare.jsx';
import Reviews from './pages/Reviews.jsx';
import Refer from './pages/Refer.jsx';
import LegalPage from './pages/LegalPage.jsx';
import ThankYou from './pages/ThankYou.jsx';
import { BookNowProvider } from './components/BookNow.jsx';

export default function App() {
  return (
    <Router>
      <ThemeLoader />
      <BookNowProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/physiotherapy" element={<Physiotherapy />} />
        <Route path="/baby-care" element={<BabyCare />} />
        <Route path="/care-taker" element={<CareTaker />} />
        <Route path="/doctor-visit" element={<DoctorVisit />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:key" element={<ServiceDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="/track" element={<TrackRequest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/hire-professional" element={<HireProfessional />} />
        <Route path="/jobs" element={<FindJobs />} />
        <Route path="/nurse-care" element={<NurseCare />} />
        <Route path="/home-doctor" element={<HomeDoctor />} />
        <Route path="/ayurveda" element={<Ayurveda />} />
        <Route path="/bhs" element={<BHS />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<ProfessionalProfile />} />
        <Route path="/cities/:city" element={<CityCare />} />
        <Route path="/cities/:city/:serviceKey" element={<CityCare />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/visit-summary/:id" element={<VisitSummary />} />
        <Route path="/refer" element={<Refer />} />
        <Route path="/privacy-policy" element={<LegalPage contentKey="legal-privacy" fallbackTitle="Privacy Policy" />} />
        <Route path="/terms" element={<LegalPage contentKey="legal-terms" fallbackTitle="Terms & Conditions" />} />
        <Route path="/patient-rights" element={<LegalPage contentKey="legal-patient-rights" fallbackTitle="Patient Rights" />} />
        <Route path="/verification" element={<Navigate to="/professional/onboarding" replace />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/professional/onboarding" element={<ProfessionalOnboarding />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
      </Routes>
      </BookNowProvider>
    </Router>
  );
}
