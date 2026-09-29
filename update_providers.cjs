const fs = require('fs');

let content = fs.readFileSync('src/admin/pages/Providers.tsx', 'utf8');

if (!content.includes('import { getDoctors, saveDoctors }')) {
  content = content.replace(
    'import { Search, Filter, Download, Plus, MoreHorizontal, Users, UserCheck, AlertTriangle, ShieldCheck, Ban } from "lucide-react"',
    `import { Search, Filter, Download, Plus, MoreHorizontal, Users, UserCheck, AlertTriangle, ShieldCheck, Ban, Check, X } from "lucide-react"
import { getDoctors, saveDoctors } from "../../utils/storage"
import { useState, useEffect } from "react"`
  );
}

// Remove the hardcoded providers array
const arrayRegex = /const providers = \[[\s\S]*?\]\n\nexport function Providers\(\) \{/;
if (content.match(arrayRegex)) {
  content = content.replace(arrayRegex, 'export function Providers() {');
}

// Add state and effect
const functionRegex = /export function Providers\(\) \{/;
if (content.match(functionRegex) && !content.includes('const [providersList, setProvidersList]')) {
  content = content.replace(
    'export function Providers() {',
    `export function Providers() {
  const [providersList, setProvidersList] = useState([]);
  
  useEffect(() => {
    loadDoctors();
  }, []);
  
  const loadDoctors = () => {
    const docs = getDoctors();
    setProvidersList(docs);
  };
  
  const handleApprove = (id) => {
    const docs = getDoctors();
    const updated = docs.map(d => d.id === id ? { ...d, status: 'ACTIVE' } : d);
    saveDoctors(updated);
    loadDoctors();
  };
  
  const handleReject = (id) => {
    const docs = getDoctors();
    const updated = docs.map(d => d.id === id ? { ...d, status: 'REJECTED' } : d);
    saveDoctors(updated);
    loadDoctors();
  };
  
  const totalProviders = providersList.length;
  const activeProviders = providersList.filter(p => p.status === 'ACTIVE' || !p.status).length;
  const pendingProviders = providersList.filter(p => p.status === 'PENDING').length;
  const rejectedProviders = providersList.filter(p => p.status === 'REJECTED').length;
`
  );
  
  // Update KPI Cards
  content = content.replace(/{ label: "Total Providers", value: "1,284"/, '{ label: "Total Providers", value: totalProviders.toString()');
  content = content.replace(/{ label: "Active Providers", value: "1,126"/, '{ label: "Active Providers", value: activeProviders.toString()');
  content = content.replace(/{ label: "Pending Verification", value: "48"/, '{ label: "Pending Verification", value: pendingProviders.toString()');
  content = content.replace(/{ label: "Verified Providers", value: "1,084"/, '{ label: "Verified Providers", value: activeProviders.toString()');
  content = content.replace(/{ label: "Suspended", value: "32"/, '{ label: "Rejected", value: rejectedProviders.toString()');
  
  // Replace `providers.map` with `providersList.map`
  content = content.replace(/providers\.map\(\(provider\) => \(/g, 'providersList.map((provider) => (');
  
  fs.writeFileSync('src/admin/pages/Providers.tsx', content);
  console.log('Successfully injected state into Providers.tsx');
} else {
  console.log('Could not find function signature');
}
