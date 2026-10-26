import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "./components/layout/Layout"
import { Dashboard } from "./pages/Dashboard"
import { Patients } from "./pages/Patients"
import { PatientProfile } from "./pages/PatientProfile"
import { Providers } from "./pages/Providers"
import { ProviderProfile } from "./pages/ProviderProfile"
import { EditProvider } from "./pages/EditProvider"
import { Specializations } from "./pages/Specializations"
import { Caretakers } from "./pages/Caretakers"
import { LabCentres } from "./pages/LabCentres"
import { Services } from "./pages/Services"
import { Appointments } from "./pages/Appointments"
import { Consultations } from "./pages/Consultations"
import { Availability } from "./pages/Availability"
import { EmergencyRequests } from "./pages/EmergencyRequests"
import { Payments } from "./pages/Payments"
import { Transactions } from "./pages/Transactions"
import { Refunds } from "./pages/Refunds"
import { ProviderPayouts } from "./pages/ProviderPayouts"
import { SuperAdminProfile } from "./pages/SuperAdminProfile"
import { Enquiries } from "./pages/Enquiries"
import { JobApplications } from "./pages/JobApplications"
import { WebsiteContent } from "./pages/WebsiteContent"
import { ClinicRecords } from "./pages/ClinicRecords"

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<PatientProfile />} />
          <Route path="providers" element={<Providers />} />
          <Route path="providers/new" element={<EditProvider />} />
          <Route path="providers/:id" element={<ProviderProfile />} />
          <Route path="providers/:id/edit" element={<EditProvider />} />
          <Route path="specializations" element={<Specializations />} />
          <Route path="caretakers" element={<Caretakers />} />
          <Route path="labs" element={<LabCentres />} />
          <Route path="services" element={<Services />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="clinic" element={<ClinicRecords />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="availability" element={<Availability />} />
          <Route path="emergency" element={<EmergencyRequests />} />
          <Route path="payments" element={<Payments />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="refunds" element={<Refunds />} />
          <Route path="payouts" element={<ProviderPayouts />} />
          <Route path="settings" element={<SuperAdminProfile />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="applications" element={<JobApplications />} />
          <Route path="content" element={<WebsiteContent />} />
          <Route path="*" element={<div className="p-8 text-center text-muted">Page under construction</div>} />
        </Route>
      </Routes>
    
  )
}

export default App
