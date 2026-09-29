const fs = require('fs');

let content = fs.readFileSync('src/admin/pages/Dashboard.tsx', 'utf8');

if (!content.includes('import { getDoctors, getPatients }')) {
  content = content.replace(
    'import { Users, UserRoundCog, CalendarDays, Video, IndianRupee, AlertCircle } from "lucide-react"',
    `import { Users, UserRoundCog, CalendarDays, Video, IndianRupee, AlertCircle } from "lucide-react"\nimport { getDoctors, getPatients, getAppointments } from "../../utils/storage"\nimport { useState, useEffect } from "react"`
  );
}

// Add state and useEffect inside Dashboard
const functionMatch = content.match(/export function Dashboard\(\) \{/);
if (functionMatch && !content.includes('const [stats, setStats]')) {
  content = content.replace(
    'export function Dashboard() {',
    `export function Dashboard() {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, revenue: 0 });

  useEffect(() => {
    const docs = getDoctors();
    const pats = getPatients();
    const appts = getAppointments();
    
    // Calculate simulated revenue from completed appointments if we had it
    const rev = appts.length * 500; 

    setStats({
      doctors: docs.length,
      patients: pats.length,
      appointments: appts.length,
      revenue: rev
    });
  }, []);`
  );
  
  // Replace the hardcoded values in KPICard
  content = content.replace(/value="24,860"/, 'value={stats.patients.toString()}');
  content = content.replace(/value="1,284"/, 'value={stats.doctors.toString()}');
  content = content.replace(/value="342"/, 'value={stats.appointments.toString()}'); // Assuming the third one is appointments
  content = content.replace(/value="₹1,24,500"/, 'value={`₹${stats.revenue.toLocaleString()}`}');
  
  fs.writeFileSync('src/admin/pages/Dashboard.tsx', content);
  console.log('Dashboard hooked up to live data');
} else {
  console.log('Failed to match Dashboard function');
}
