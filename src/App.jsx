import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import HireProfessional from './pages/HireProfessional.jsx';
import FindJobs from './pages/FindJobs.jsx';
import NurseCare from './pages/NurseCare.jsx';
import HomeDoctor from './pages/HomeDoctor.jsx';
import Ayurveda from './pages/Ayurveda.jsx';
import BHS from './pages/BHS.jsx';
import Doctors from './pages/Doctors.jsx';
import Verification from './pages/Verification.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/physiotherapy" element={<Physiotherapy />} />
        <Route path="/baby-care" element={<BabyCare />} />
        <Route path="/care-taker" element={<CareTaker />} />
        <Route path="/doctor-visit" element={<DoctorVisit />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hire-professional" element={<HireProfessional />} />
        <Route path="/jobs" element={<FindJobs />} />
        <Route path="/nurse-care" element={<NurseCare />} />
        <Route path="/home-doctor" element={<HomeDoctor />} />
        <Route path="/ayurveda" element={<Ayurveda />} />
        <Route path="/bhs" element={<BHS />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/professional/onboarding" element={<ProfessionalOnboarding />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
      </Routes>
    </Router>
  );
}
