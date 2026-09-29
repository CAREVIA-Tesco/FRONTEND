import { Link } from "react-router-dom"
import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent } from "../components/ui/Card"
import { Modal } from "../components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { ChevronRight, Edit, Ban, CalendarDays, CheckCircle2, Clock, IndianRupee, Video, Download, Eye, FileText, AlertTriangle, FileSignature, Stethoscope } from "lucide-react"

export function PatientProfile() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [isDocumentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{name: string, date: string, type?: string} | null>(null);
  
  const tabs = ['Overview', 'Appointments', 'Consultations', 'Medical History', 'Payments', 'Documents'];

  const handleViewDocument = (doc: {name: string, date: string, type?: string}) => {
     setSelectedDocument(doc);
     setDocumentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-muted mb-4">
        <Link to="/patients" className="hover:text-brand-600 transition-colors">Patients</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-charcoal font-medium">Arun Kumar</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: Profile Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="h-24 w-24 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-3xl mb-4">
                  AK
                </div>
                <h2 className="text-xl font-bold text-charcoal">Arun Kumar</h2>
                <p className="text-brand-600 font-medium mt-1">PAT-10284</p>
                <div className="mt-3">
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
              
              <div className="py-6 space-y-4 border-b border-slate-100">
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Age</span>
                  <span className="font-medium text-sm">28 Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Gender</span>
                  <span className="font-medium text-sm">Male</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Blood Group</span>
                  <span className="font-medium text-sm">O+</span>
                </div>
              </div>

              <div className="py-6 space-y-4 border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-muted text-sm mb-1">Phone</span>
                  <span className="font-medium text-sm">+91 98765 43210</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted text-sm mb-1">Email</span>
                  <span className="font-medium text-sm">arun@email.com</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted text-sm mb-1">Location</span>
                  <span className="font-medium text-sm">Chennai, Tamil Nadu</span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Button className="w-full text-brand-600 border-brand-200 hover:bg-brand-50" variant="outline">
                  <Edit className="h-4 w-4 mr-2" /> Edit Patient
                </Button>
                <Button className="w-full text-error border-error/30 hover:bg-red-50 hover:border-error" variant="outline">
                  <Ban className="h-4 w-4 mr-2" /> Suspend Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Content Tabs */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="bg-surface rounded-2xl border border-slate-200 p-1 flex overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors border ${
                  activeTab === tab 
                    ? 'bg-brand-50 text-brand-600 border-brand-200 shadow-sm' 
                    : 'bg-transparent text-muted border-transparent hover:text-charcoal hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <CalendarDays className="h-6 w-6 text-brand-500 mb-2" />
                    <p className="text-2xl font-bold text-charcoal">12</p>
                    <p className="text-xs text-muted mt-1">Total Appts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="h-6 w-6 text-success mb-2" />
                    <p className="text-2xl font-bold text-charcoal">9</p>
                    <p className="text-xs text-muted mt-1">Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Clock className="h-6 w-6 text-info mb-2" />
                    <p className="text-2xl font-bold text-charcoal">2</p>
                    <p className="text-xs text-muted mt-1">Upcoming</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <IndianRupee className="h-6 w-6 text-warning mb-2" />
                    <p className="text-2xl font-bold text-charcoal">₹4.2k</p>
                    <p className="text-xs text-muted mt-1">Total Spent</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-charcoal mb-4">Medical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted mb-2">Emergency Contact</h4>
                      <p className="text-sm font-medium">Rahul Kumar (Brother)</p>
                      <p className="text-sm text-muted">+91 98765 12345</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted mb-2">Allergies</h4>
                      <div className="flex gap-2">
                        <Badge variant="error" className="bg-red-100 text-red-700">Penicillin</Badge>
                        <Badge variant="warning" className="bg-amber-100 text-amber-700">Dust</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted mb-2">Medical Conditions</h4>
                      <p className="text-sm font-medium text-charcoal">None reported</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'Appointments' && (
             <div className="space-y-6">
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Appointment ID</TableHead>
                         <TableHead>Provider</TableHead>
                         <TableHead>Date & Time</TableHead>
                         <TableHead>Type</TableHead>
                         <TableHead>Status</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      <TableRow>
                         <TableCell className="text-brand-600 font-medium">APT-10284</TableCell>
                         <TableCell className="font-medium">Dr. Priya Sharma</TableCell>
                         <TableCell>21 Sep 2026 <span className="text-muted text-xs block">10:00 AM</span></TableCell>
                         <TableCell>Online</TableCell>
                         <TableCell><Badge variant="success">Completed</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                         <TableCell className="text-brand-600 font-medium">APT-10192</TableCell>
                         <TableCell className="font-medium">Dr. Rahul Sharma</TableCell>
                         <TableCell>15 Sep 2026 <span className="text-muted text-xs block">11:30 AM</span></TableCell>
                         <TableCell>In-Clinic</TableCell>
                         <TableCell><Badge variant="success">Completed</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                         <TableCell className="text-brand-600 font-medium">APT-10042</TableCell>
                         <TableCell className="font-medium">Apollo Diagnostics</TableCell>
                         <TableCell>02 Sep 2026 <span className="text-muted text-xs block">08:00 AM</span></TableCell>
                         <TableCell>Home Sample</TableCell>
                         <TableCell><Badge variant="success">Completed</Badge></TableCell>
                      </TableRow>
                   </TableBody>
                </Table>
             </div>
          )}

          {activeTab === 'Consultations' && (
             <div className="space-y-6">
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>CONSULTATION ID</TableHead>
                         <TableHead>DOCTOR</TableHead>
                         <TableHead>DATE</TableHead>
                         <TableHead>DURATION</TableHead>
                         <TableHead>ACTION</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      <TableRow>
                         <TableCell className="text-brand-600 font-medium">CON-8472</TableCell>
                         <TableCell className="font-medium">Dr. Priya Sharma</TableCell>
                         <TableCell>21 Sep 2026</TableCell>
                         <TableCell>
                           <div className="flex items-center gap-1.5 font-medium text-charcoal">
                             <Video className="h-4 w-4 text-muted" /> 18 min
                           </div>
                         </TableCell>
                         <TableCell>
                           <Button variant="outline" size="sm" className="h-8 border-slate-200 text-charcoal font-medium hover:bg-slate-50" onClick={() => setSummaryModalOpen(true)}>View Summary</Button>
                         </TableCell>
                      </TableRow>
                      <TableRow>
                         <TableCell className="text-brand-600 font-medium">CON-8410</TableCell>
                         <TableCell className="font-medium">Dr. Rahul Sharma</TableCell>
                         <TableCell>15 Sep 2026</TableCell>
                         <TableCell>
                           <div className="flex items-center gap-1.5 font-medium text-charcoal">
                             <Video className="h-4 w-4 text-muted" /> 24 min
                           </div>
                         </TableCell>
                         <TableCell>
                           <Button variant="outline" size="sm" className="h-8 border-slate-200 text-charcoal font-medium hover:bg-slate-50" onClick={() => setSummaryModalOpen(true)}>View Summary</Button>
                         </TableCell>
                      </TableRow>
                   </TableBody>
                </Table>
             </div>
          )}

          {activeTab === 'Medical History' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-6">Medical Records & History</h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {[
                     { date: "21 Sep 2026", title: "Allergy update", desc: "Added Penicillin to allergy list.", icon: AlertTriangle, color: "text-error", bg: "bg-red-50" },
                     { date: "15 Sep 2026", title: "General Checkup", desc: "Consultation with Dr. Rahul Sharma. Blood pressure normal.", icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
                     { date: "02 Sep 2026", title: "Blood Test Results", desc: "Complete Blood Count (CBC) reports uploaded.", icon: FileText, color: "text-brand-600", bg: "bg-brand-50" }
                  ].map((act, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${act.bg} ${act.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10`}>
                        <act.icon className="h-4 w-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-charcoal">{act.title}</div>
                          <time className="font-medium text-xs text-muted">{act.date}</time>
                        </div>
                        <div className="text-sm text-muted">{act.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'Payments' && (
             <div className="space-y-6">
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Transaction ID</TableHead>
                         <TableHead>Date</TableHead>
                         <TableHead>Service</TableHead>
                         <TableHead>Amount</TableHead>
                         <TableHead>Status</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      <TableRow>
                         <TableCell className="text-brand-600 font-medium">TXN-98273</TableCell>
                         <TableCell>21 Sep 2026</TableCell>
                         <TableCell>Online Consultation</TableCell>
                         <TableCell className="font-semibold text-charcoal">₹500</TableCell>
                         <TableCell><Badge variant="success">Paid</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                         <TableCell className="text-brand-600 font-medium">TXN-98104</TableCell>
                         <TableCell>15 Sep 2026</TableCell>
                         <TableCell>Clinic Visit</TableCell>
                         <TableCell className="font-semibold text-charcoal">₹800</TableCell>
                         <TableCell><Badge variant="success">Paid</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                         <TableCell className="text-brand-600 font-medium">TXN-97842</TableCell>
                         <TableCell>02 Sep 2026</TableCell>
                         <TableCell>Lab Test Package</TableCell>
                         <TableCell className="font-semibold text-charcoal">₹2,900</TableCell>
                         <TableCell><Badge variant="success">Paid</Badge></TableCell>
                      </TableRow>
                   </TableBody>
                </Table>
             </div>
          )}

          {activeTab === 'Documents' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-4">Patient Documents & Reports</h3>
                <div className="space-y-4">
                  {[
                    { name: "CBC Test Report.pdf", date: "02 Sep 2026", type: "pdf" },
                    { name: "Prescription_DrPriya.pdf", date: "21 Sep 2026", type: "pdf" },
                    { name: "Past_Medical_Records.zip", date: "10 Aug 2026", type: "zip" }
                  ].map((doc, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-xl gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-charcoal">{doc.name}</p>
                          <span className="text-xs text-muted">Uploaded on {doc.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 flex-1 sm:flex-none"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-3 flex-1 sm:flex-none">
                          <Download className="h-4 w-4 mr-2" /> Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      <Modal isOpen={isSummaryModalOpen} onClose={() => setSummaryModalOpen(false)} title="Consultation Summary">
         <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
               <div>
                  <p className="text-sm font-medium text-charcoal">CON-8472</p>
                  <p className="text-xs text-muted">21 Sep 2026</p>
               </div>
               <div className="text-right">
                  <p className="text-sm font-medium text-charcoal">Dr. Priya Sharma</p>
                  <p className="text-xs text-muted">Skin & Allergy</p>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5"><Stethoscope className="h-3 w-3" /> Symptoms</h4>
                  <p className="text-sm text-charcoal">Patient reported mild skin rash and itching on the forearms for the past 3 days. No fever or other systemic symptoms.</p>
               </div>
               
               <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Diagnosis</h4>
                  <p className="text-sm text-charcoal">Contact Dermatitis (Mild)</p>
               </div>

               <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5"><FileSignature className="h-3 w-3" /> Prescription & Advice</h4>
                  <ul className="list-disc pl-4 text-sm text-charcoal space-y-1">
                     <li>Apply Calamine lotion twice daily for 5 days.</li>
                     <li>Avoid contact with harsh soaps or detergents.</li>
                     <li>Take prescribed antihistamine if itching persists at night.</li>
                  </ul>
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
               <Button variant="outline" onClick={() => setSummaryModalOpen(false)}>Close</Button>
               <Button className="bg-brand-600 hover:bg-brand-700 text-white"><Download className="h-4 w-4 mr-2"/> Download PDF</Button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={isDocumentModalOpen} onClose={() => setDocumentModalOpen(false)} title="Document Viewer">
         <div className="space-y-4">
            {selectedDocument && (
              <>
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-600" />
                    <span className="font-medium text-charcoal text-sm">{selectedDocument.name}</span>
                  </div>
                  <Badge variant="default" className="bg-slate-200 text-slate-700">{selectedDocument.date}</Badge>
                </div>
                
                {selectedDocument.type === 'zip' ? (
                   <div className="bg-slate-50 border border-slate-200 rounded-xl h-64 flex flex-col items-center justify-center text-center p-6">
                      <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                         <Download className="h-8 w-8 text-brand-500" />
                      </div>
                      <h4 className="font-bold text-charcoal mb-1">ZIP Archive</h4>
                      <p className="text-sm text-muted max-w-xs mb-4">This file format cannot be previewed directly in the browser. Please download to extract and view contents.</p>
                      <Button className="bg-brand-600 hover:bg-brand-700 text-white">Download ZIP</Button>
                   </div>
                ) : (
                   <div className="bg-slate-100 border border-slate-200 rounded-xl h-96 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                      {/* Fake PDF Header / Viewer Mockup */}
                      <div className="absolute top-0 left-0 right-0 bg-slate-700 text-slate-200 p-2 text-xs flex justify-between items-center">
                         <span className="truncate max-w-[200px]">{selectedDocument.name}</span>
                         <div className="flex gap-3">
                            <span>1 / 1</span>
                            <span>100%</span>
                         </div>
                      </div>
                      <div className="bg-white w-3/4 h-5/6 mt-8 shadow-sm p-6 text-left border border-slate-200 relative overflow-hidden">
                         <div className="w-1/3 h-4 bg-slate-200 rounded mb-6"></div>
                         <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
                         <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
                         <div className="w-5/6 h-2 bg-slate-100 rounded mb-8"></div>
                         <div className="w-1/4 h-3 bg-slate-200 rounded mb-4"></div>
                         <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
                         <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
                         <div className="w-4/6 h-2 bg-slate-100 rounded mb-8"></div>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-40 pointer-events-none">
                            <FileText className="h-12 w-12 text-slate-400 mb-2" />
                            <span className="text-slate-500 font-semibold tracking-widest uppercase">Document Preview</span>
                         </div>
                      </div>
                   </div>
                )}
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setDocumentModalOpen(false)}>Close</Button>
                  {selectedDocument.type !== 'zip' && (
                     <Button className="bg-brand-600 hover:bg-brand-700 text-white"><Download className="h-4 w-4 mr-2"/> Download File</Button>
                  )}
                </div>
              </>
            )}
         </div>
      </Modal>
    </div>
  )
}
