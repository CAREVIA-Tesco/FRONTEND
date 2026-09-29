const fs = require('fs');
let content = fs.readFileSync('src/admin/pages/Patients.tsx', 'utf8');

if (!content.includes('import { getPatients }')) {
  content = content.replace(
    'import { Search, Filter, Download, Plus, MoreHorizontal } from "lucide-react"',
    `import { Search, Filter, Download, Plus, MoreHorizontal } from "lucide-react"\nimport { getPatients } from "../../utils/storage"\nimport { useState, useEffect } from "react"`
  );
}

// Remove static array
const arrayRegex = /const patients = \[[\s\S]*?\]\n\nexport function Patients\(\) \{/;
if (content.match(arrayRegex)) {
  content = content.replace(arrayRegex, 'export function Patients() {');
}

// Add state and effect
const functionRegex = /export function Patients\(\) \{/;
if (content.match(functionRegex) && !content.includes('const [patientList, setPatientList]')) {
  content = content.replace(
    'export function Patients() {',
    `export function Patients() {
  const [patientList, setPatientList] = useState([]);
  
  useEffect(() => {
    setPatientList(getPatients());
  }, []);
  
  const totalPatients = patientList.length;
`
  );
  
  // Replace metrics
  content = content.replace(/{ label: "Total Patients", value: "24,860" }/, '{ label: "Total Patients", value: totalPatients.toString() }');
  content = content.replace(/{ label: "Active Patients", value: "21,432" }/, '{ label: "Active Patients", value: totalPatients.toString() }');
  content = content.replace(/{ label: "New This Month", value: "1,248" }/, '{ label: "New This Month", value: totalPatients.toString() }');
  
  // Update table map
  content = content.replace(/patients\.map\(patient => \(/g, 'patientList.map(patient => (');
  
  // Update the row cells manually since properties differ
  const oldMapRegex = /\{patientList\.map\(patient => \([\s\S]*?<\/TableRow>\n\s*\)\)}/;
  const newMap = `{patientList.map(patient => (
               <TableRow key={patient.id}>
                  <TableCell className="text-center">
                     <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                           {patient.name?.charAt(0) || 'P'}
                        </div>
                        <span className="font-medium text-charcoal">{patient.name || 'Anonymous'}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-muted text-sm">{patient.id}</TableCell>
                  <TableCell className="text-sm">{patient.email || '-'}</TableCell>
                  <TableCell className="text-sm">{patient.phone || '-'}</TableCell>
                  <TableCell className="text-sm">{patient.age || '-'}</TableCell>
                  <TableCell className="text-sm">{patient.gender || '-'}</TableCell>
                  <TableCell className="text-sm font-medium">0</TableCell>
                  <TableCell>
                     <Badge variant="success">Active</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted">Today</TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" asChild>
                        <Link to={\`/admin/patients/\${patient.id}\`}>
                           <MoreHorizontal className="h-4 w-4" />
                        </Link>
                     </Button>
                  </TableCell>
               </TableRow>
            ))}`;
            
  if (content.match(oldMapRegex)) {
    content = content.replace(oldMapRegex, newMap);
  }
  
  fs.writeFileSync('src/admin/pages/Patients.tsx', content);
  console.log('Successfully injected state into Patients.tsx');
}
