import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../../services/api"
import { inr } from "../lib/useApi"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent } from "../components/ui/Card"
import { Modal } from "../components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { ChevronRight, Edit, Ban, CalendarDays, CheckCircle2, Clock, IndianRupee, Video, Download, Eye, FileText, AlertTriangle, FileSignature, Stethoscope } from "lucide-react"

export function PatientProfile() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  
  const tabs = ['Overview', 'Appointments', 'Consultations', 'Medical History', 'Payments', 'Documents'];

  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [selectedConsult, setSelectedConsult] = useState<any>(null);
  const [isEditOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", age: "", gender: "", city: "", bloodGroup: "", allergies: "", conditions: "", ecName: "", ecRelation: "", ecPhone: "" });

  const load = () => {
    api.getPatient(id as string)
      .then((d: any) => { setPatient(d.patient); setAppointments(d.appointments || []); setPayments(d.payments || []); })
      .catch((e: Error) => setError(e.message));
  };
  useEffect(load, [id]);

  const pt = patient || {};
  const initials = (pt.name || "").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const completed = appointments.filter((a) => a.status === "Completed");
  const upcoming = appointments.filter((a) => a.status === "Waiting" || a.status === "Confirmed");
  const totalSpent = payments.filter((t) => t.type === "Payment" && t.status === "Success").reduce((t, x) => t + x.amount, 0);
  const consultations = appointments.filter((a) => a.consultationType === "online" && a.status === "Completed");
  const documents = completed.map((a) => ({ id: a.id, name: `Visit summary & prescription – ${a.code}`, date: a.shortDate, type: "pdf" }));
  const openSummary = (apptId: string) => window.open(`/visit-summary/${apptId}`, "_blank", "noopener");
  const apptBadge = (st: string) => st === "Completed" ? <Badge variant="success">Completed</Badge> : st === "Cancelled" ? <Badge variant="error">Cancelled</Badge> : st === "Confirmed" ? <Badge variant="info">Confirmed</Badge> : <Badge variant="warning">Pending</Badge>;

  const toggleStatus = async () => {
    try {
      await api.updatePatient(id as string, { status: pt.status === "Active" ? "Inactive" : "Active" });
      load();
    } catch (e: any) { setError(e.message); }
  };
  const openEdit = () => {
    setEditForm({
      name: pt.name || "", phone: pt.phone || "", email: pt.email || "", age: pt.age ?? "", gender: pt.gender || "", city: pt.city || "",
      bloodGroup: pt.bloodGroup || "", allergies: (pt.allergies || []).join(", "), conditions: (pt.conditions || []).join(", "),
      ecName: pt.emergencyContact?.name || "", ecRelation: pt.emergencyContact?.relation || "", ecPhone: pt.emergencyContact?.phone || "",
    });
    setEditOpen(true);
  };
  const saveEdit = async () => {
    try {
      const { ecName, ecRelation, ecPhone, ...rest } = editForm as any;
      const body: any = { ...rest, emergencyContact: { name: ecName, relation: ecRelation, phone: ecPhone } };
      ["name", "phone", "email", "age", "gender", "city"].forEach((k) => { if (body[k] === "") delete body[k]; });
      await api.updatePatient(id as string, body);
      setEditOpen(false);
      load();
    } catch (e: any) { setError(e.message); }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-muted mb-4">
        <Link to="/admin/patients" className="hover:text-brand-600 transition-colors">Patients</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-charcoal font-medium">{pt.name || "Loading..."}</span>
      </div>
      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: Profile Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="h-24 w-24 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-3xl mb-4">
                  {initials}
                </div>
                <h2 className="text-xl font-bold text-charcoal">{pt.name}</h2>
                <p className="text-brand-600 font-medium mt-1">{pt.code}</p>
                <div className="mt-3">
                  {pt.status === "Inactive" ? <Badge variant="default">Inactive</Badge> : <Badge variant="success">Active</Badge>}
                </div>
              </div>
              
              <div className="py-6 space-y-4 border-b border-slate-100">
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Age</span>
                  <span className="font-medium text-sm">{pt.age ? `${pt.age} Years` : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Gender</span>
                  <span className="font-medium text-sm">{pt.gender || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Blood Group</span>
                  <span className="font-medium text-sm">{pt.bloodGroup || "Not recorded"}</span>
                </div>
              </div>

              <div className="py-6 space-y-4 border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-muted text-sm mb-1">Phone</span>
                  <span className="font-medium text-sm">{pt.phone || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted text-sm mb-1">Email</span>
                  <span className="font-medium text-sm">{pt.email || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted text-sm mb-1">Location</span>
                  <span className="font-medium text-sm">{pt.city || "-"}</span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Button className="w-full text-brand-600 border-brand-200 hover:bg-brand-50" variant="outline" onClick={openEdit}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Patient
                </Button>
                <Button className="w-full text-error border-error/30 hover:bg-red-50 hover:border-error" variant="outline" onClick={toggleStatus}>
                  <Ban className="h-4 w-4 mr-2" /> {pt.status === "Inactive" ? "Reactivate Account" : "Suspend Account"}
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
                    <p className="text-2xl font-bold text-charcoal">{appointments.length}</p>
                    <p className="text-xs text-muted mt-1">Total Appts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="h-6 w-6 text-success mb-2" />
                    <p className="text-2xl font-bold text-charcoal">{completed.length}</p>
                    <p className="text-xs text-muted mt-1">Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Clock className="h-6 w-6 text-info mb-2" />
                    <p className="text-2xl font-bold text-charcoal">{upcoming.length}</p>
                    <p className="text-xs text-muted mt-1">Upcoming</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <IndianRupee className="h-6 w-6 text-warning mb-2" />
                    <p className="text-2xl font-bold text-charcoal">{inr(totalSpent)}</p>
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
                      <p className="text-sm font-medium">{pt.emergencyContact?.name ? `${pt.emergencyContact.name}${pt.emergencyContact.relation ? ` (${pt.emergencyContact.relation})` : ""}` : "Not recorded"}</p>
                      {pt.emergencyContact?.phone && <p className="text-sm text-muted">{pt.emergencyContact.phone}</p>}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted mb-2">Allergies</h4>
                      <div className="flex gap-2">
                        {(pt.allergies || []).length ? pt.allergies.map((a: string, i: number) => (
                          <Badge key={a} variant={i % 2 ? "warning" : "error"} className={i % 2 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}>{a}</Badge>
                        )) : <span className="text-sm font-medium text-charcoal">None reported</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted mb-2">Medical Conditions</h4>
                      <p className="text-sm font-medium text-charcoal">{(pt.conditions || []).length ? pt.conditions.join(", ") : "None reported"}</p>
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
                      {appointments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted py-6">No appointments yet.</TableCell></TableRow>}
                      {appointments.map((a) => (
                      <TableRow key={a.id}>
                         <TableCell className="text-brand-600 font-medium">{a.code}</TableCell>
                         <TableCell className="font-medium">{a.provider}</TableCell>
                         <TableCell>{a.shortDate} <span className="text-muted text-xs block">{a.timeSlot}</span></TableCell>
                         <TableCell>{a.type}</TableCell>
                         <TableCell>{apptBadge(a.status)}</TableCell>
                      </TableRow>
                      ))}
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
                      {consultations.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted py-6">No completed online consultations.</TableCell></TableRow>}
                      {consultations.map((a) => (
                      <TableRow key={a.id}>
                         <TableCell className="text-brand-600 font-medium">{a.code}</TableCell>
                         <TableCell className="font-medium">{a.provider}</TableCell>
                         <TableCell>{a.shortDate}</TableCell>
                         <TableCell>
                           <div className="flex items-center gap-1.5 font-medium text-charcoal">
                             <Video className="h-4 w-4 text-muted" /> {a.timeSlot}
                           </div>
                         </TableCell>
                         <TableCell>
                           <Button variant="outline" size="sm" className="h-8 border-slate-200 text-charcoal font-medium hover:bg-slate-50" onClick={() => { setSelectedConsult(a); setSummaryModalOpen(true); }}>View Summary</Button>
                         </TableCell>
                      </TableRow>
                      ))}
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
                     ...completed.map((a) => ({ date: a.shortDate, title: a.title, desc: `With ${a.provider}. ${a.visitNotes?.symptoms || ""} ${a.visitNotes?.prescription ? `Prescription: ${a.visitNotes.prescription}` : ""}`.trim(), icon: CheckCircle2, color: "text-success", bg: "bg-green-50" })),
                     ...(completed.length === 0 ? [{ date: "-", title: "No medical history yet", desc: "Completed visits and prescriptions will appear here.", icon: FileText, color: "text-brand-600", bg: "bg-brand-50" }] : []),
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
                      {payments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted py-6">No payments yet.</TableCell></TableRow>}
                      {payments.map((t) => (
                      <TableRow key={t.id}>
                         <TableCell className="text-brand-600 font-medium">{t.txnId}</TableCell>
                         <TableCell>{t.date}</TableCell>
                         <TableCell>{t.type === "Refund" ? "Refund" : appointments.find((a) => a.id === t.appointmentId)?.title || "Consultation"}</TableCell>
                         <TableCell className="font-semibold text-charcoal">{t.type === "Refund" ? `-${t.amountLabel}` : t.amountLabel}</TableCell>
                         <TableCell>{t.status === "Success" ? <Badge variant="success">{t.type === "Refund" ? "Refunded" : "Paid"}</Badge> : t.status === "Pending" ? <Badge variant="warning">Pending</Badge> : <Badge variant="default">{t.status}</Badge>}</TableCell>
                      </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </div>
          )}

          {activeTab === 'Documents' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-4">Patient Documents & Reports</h3>
                <div className="space-y-4">
                  {documents.length === 0 && <p className="text-sm text-muted">No documents yet. The summary and prescription of each completed visit appear here.</p>}
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-xl gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-charcoal">{doc.name}</p>
                          <span className="text-xs text-muted">Visit on {doc.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="h-8 px-3 flex-1 sm:flex-none" onClick={() => openSummary(doc.id)}>
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-3 flex-1 sm:flex-none" onClick={() => openSummary(doc.id)}>
                          <Download className="h-4 w-4 mr-2" /> Download PDF
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
                  <p className="text-sm font-medium text-charcoal">{selectedConsult?.code}</p>
                  <p className="text-xs text-muted">{selectedConsult?.shortDate}</p>
               </div>
               <div className="text-right">
                  <p className="text-sm font-medium text-charcoal">{selectedConsult?.provider}</p>
                  <p className="text-xs text-muted">{selectedConsult?.specialization}</p>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5"><Stethoscope className="h-3 w-3" /> Symptoms</h4>
                  <p className="text-sm text-charcoal">{selectedConsult?.visitNotes?.symptoms || "Not recorded"}</p>
               </div>
               
               <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Diagnosis</h4>
                  <p className="text-sm text-charcoal">{selectedConsult?.title}</p>
               </div>

               <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5"><FileSignature className="h-3 w-3" /> Prescription & Advice</h4>
                  <ul className="list-disc pl-4 text-sm text-charcoal space-y-1">
                     {(selectedConsult?.visitNotes?.prescription || "Not recorded").split(/\n|\. /).filter(Boolean).map((line: string, i: number) => <li key={i}>{line}</li>)}
                  </ul>
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
               <Button variant="outline" onClick={() => setSummaryModalOpen(false)}>Close</Button>
               <Button className="bg-brand-600 hover:bg-brand-700 text-white" disabled={!selectedConsult?.id} onClick={() => openSummary(selectedConsult.id)}><Download className="h-4 w-4 mr-2"/> Download PDF</Button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setEditOpen(false)} title="Edit Patient">
         <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {[["name", "Full Name"], ["phone", "Phone"], ["email", "Email"], ["age", "Age"], ["gender", "Gender"], ["city", "City"], ["bloodGroup", "Blood Group"], ["allergies", "Allergies (comma separated)"], ["conditions", "Medical Conditions (comma separated)"], ["ecName", "Emergency Contact Name"], ["ecRelation", "Emergency Contact Relation"], ["ecPhone", "Emergency Contact Phone"]].map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium text-charcoal block">{label}</label>
                <input
                  type={key === "age" ? "number" : "text"}
                  value={(editForm as any)[key]}
                  onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
               <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
               <Button onClick={saveEdit}>Save Changes</Button>
            </div>
         </div>
      </Modal>
    </div>
  )
}
