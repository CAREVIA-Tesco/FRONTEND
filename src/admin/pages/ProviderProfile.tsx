import { Link, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../../services/api"
import { inr } from "../lib/useApi"

const DAY_NAMES: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" }
const fmtDate = (d: any) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-")
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent } from "../components/ui/Card"
import { Modal } from "../components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { useNotice } from "../lib/forms"
import { Notice } from "../components/ui/Notice"
import { Edit, Ban, CalendarDays, CheckCircle2, Clock, Star, FileText, ExternalLink, CheckCircle, MapPin, Video, Users, Stethoscope, HandCoins } from "lucide-react"

export function ProviderProfile() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSuspendModalOpen, setSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const tabs = ['Overview', 'Professional', 'Appointments', 'Availability', 'Reviews', 'Payments', 'Documents', 'Activity'];
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [reviewData, setReviewData] = useState<any>({ reviews: [], summary: { distribution: [] } });

  const load = () => {
    api.getProvider(id as string).then((d: any) => setProvider(d.provider)).catch((e: Error) => setError(e.message));
    api.getAppointments({ providerId: id }).then((d: any) => setAppointments(d.appointments || [])).catch(() => {});
    api.getPayments().then((d: any) => setPayments((d.payments || []).filter((t: any) => t.providerId === id))).catch(() => {});
    api.getReviews({ providerId: id }).then((d: any) => setReviewData(d)).catch(() => {});
  };
  useEffect(load, [id]);

  const [notice, setNotice] = useNotice();
  const p = provider || {};
  const initials = (p.name || "").replace(/^Dr\.?\s*/, "").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const code = p.code || `DOC-${String(p.id || "").slice(-4).toUpperCase()}`;
  const count = (st: string[]) => appointments.filter((a) => st.includes(a.status)).length;
  const apptStats = { total: appointments.length, completed: count(["Completed"]), upcoming: count(["Waiting", "Confirmed"]), cancelled: count(["Cancelled"]) };
  const earnings = payments.filter((t) => t.type === "Payment" && t.status === "Success");
  const gross = earnings.reduce((t, x) => t + x.amount, 0);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthGross = earnings.filter((t) => new Date(t.createdAt) >= monthStart).reduce((t, x) => t + x.amount, 0);
  const paidOut = payments.filter((t) => t.type === "Payout").reduce((t, x) => t + x.amount, 0);
  const commission = Math.round(gross * 0.1);
  const statusBadge = p.status === "ACTIVE" ? <Badge variant="success">Active</Badge> : p.status === "PENDING" ? <Badge variant="warning">Pending</Badge> : <Badge variant="error">{p.status === "SUSPENDED" ? "Suspended" : "Rejected"}</Badge>;

  const setStatus = async (status: string) => {
    setError("");
    try {
      await api.setProviderStatus(id as string, status);
      setSuspendModalOpen(false);
      load();
    } catch (e: any) { setError(e.message); }
  };
  const handleDelete = async () => {
    try {
      await api.deleteProvider(id as string);
      navigate("/admin/providers");
    } catch (e: any) { setError(e.message); setDeleteModalOpen(false); }
  };

  const activity = [
    p.updatedAt && { date: fmtDate(p.updatedAt), title: "Provider profile updated", desc: "Profile details were last updated.", icon: Edit, color: "text-brand-600", bg: "bg-brand-50" },
    ...appointments.filter((a) => a.status === "Completed").slice(0, 2).map((a) => ({ date: a.shortDate, title: "Appointment completed", desc: `Completed ${a.title?.toLowerCase()} with ${a.patient}.`, icon: CheckCircle2, color: "text-success", bg: "bg-green-50" })),
    p.verifiedAt && { date: fmtDate(p.verifiedAt), title: "Provider verified", desc: "Admin approved the provider profile.", icon: ShieldCheck, color: "text-success", bg: "bg-green-50" },
    p.createdAt && { date: fmtDate(p.createdAt), title: "Registration submitted", desc: "Provider created an account and submitted the profile.", icon: FileText, color: "text-charcoal", bg: "bg-slate-100" },
  ].filter(Boolean) as any[];

  return (
    <div className="space-y-6">
      <Notice text={notice} onClose={() => setNotice("")} />
      <div className="flex items-center text-sm text-muted mb-4">
        <span className="hover:text-charcoal transition-colors cursor-pointer">Management</span>
        <span className="mx-2">/</span>
        <Link to="/admin/providers" className="hover:text-brand-600 transition-colors">Doctors & Providers</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal font-medium">{p.name || "Loading..."}</span>
      </div>
      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: Profile Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="h-24 w-24 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-3xl mb-4 overflow-hidden">
                  {p.img ? <img src={p.img} alt={p.name} className="h-full w-full object-cover" /> : initials}
                </div>
                <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
                  {p.name}
                  {p.status === "ACTIVE" && <CheckCircle className="h-5 w-5 text-success fill-green-100" />}
                </h2>
                <p className="text-muted font-medium mt-1">{p.profession}</p>
                <p className="text-brand-600 font-medium text-sm mt-1">{p.specialization || p.spec}</p>
                <div className="mt-3 flex gap-2">
                  {statusBadge}
                </div>
              </div>
              
              <div className="py-6 space-y-4 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Experience</span>
                  <span className="font-medium text-sm">{p.exp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Languages</span>
                  <span className="font-medium text-sm text-right">{(p.languages || []).join(", ") || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Location</span>
                  <span className="font-medium text-sm flex items-center"><MapPin className="h-3 w-3 mr-1"/> {p.loc || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Rating</span>
                  <span className="font-medium text-sm flex items-center"><Star className="h-3 w-3 mr-1 fill-warning text-warning"/> {p.rating} ({p.reviews || 0})</span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Link to={`/admin/providers/${id}/edit`} className="block w-full">
                  <Button className="w-full bg-brand-600 text-white hover:bg-brand-700">
                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                </Link>
                {p.status === "ACTIVE" && (
                  <a href={`/doctors/${id}`} target="_blank" rel="noreferrer" className="block w-full">
                    <Button variant="outline" className="w-full"><ExternalLink className="h-4 w-4 mr-2" /> View on website</Button>
                  </a>
                )}
                {p.status === "ACTIVE" ? (
                <Button className="w-full text-error border-error/30 hover:bg-red-50 hover:border-error" variant="outline" onClick={() => setSuspendModalOpen(true)}>
                  <Ban className="h-4 w-4 mr-2" /> Suspend Provider
                </Button>
                ) : (
                <Button className="w-full text-success border-success/30 hover:bg-green-50" variant="outline" onClick={() => setStatus("ACTIVE")}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> {p.status === "PENDING" ? "Approve Provider" : "Reactivate Provider"}
                </Button>
                )}
                {p.status === "PENDING" && (
                <Button className="w-full text-error border-error/30 hover:bg-red-50 hover:border-error" variant="outline" onClick={() => setStatus("REJECTED")}>
                  <Ban className="h-4 w-4 mr-2" /> Reject Registration
                </Button>
                )}
                <Button className="w-full text-charcoal border-slate-200 hover:bg-slate-50" variant="outline" onClick={() => setDeleteModalOpen(true)}>
                  Delete Provider
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
               <h3 className="text-md font-bold text-charcoal mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  Provider Verification
               </h3>
               <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                     <span className="text-sm text-muted">Status</span>
                     {p.status === "ACTIVE" ? <Badge variant="success">Verified</Badge> : p.status === "PENDING" ? <Badge variant="warning">Pending Review</Badge> : <Badge variant="error">Not Verified</Badge>}
                  </div>
                  <div className="flex justify-between">
                     <span className="text-sm text-muted">Date</span>
                     <span className="text-sm font-medium">{fmtDate(p.verifiedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-sm text-muted">By</span>
                     <span className="text-sm font-medium">Super Admin</span>
                  </div>
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
                className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
                  activeTab === tab ? 'bg-brand-50 text-brand-600' : 'text-muted hover:text-charcoal hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Overview' && (
             <div className="space-y-6">
               <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                     { l: "Appts", v: String(apptStats.total), icon: CalendarDays, c: "text-brand-600" },
                     { l: "Completed", v: String(apptStats.completed), icon: CheckCircle2, c: "text-success" },
                     { l: "Upcoming", v: String(apptStats.upcoming), icon: Clock, c: "text-info" },
                     { l: "Cancelled", v: String(apptStats.cancelled), icon: Ban, c: "text-error" },
                     { l: "Rating", v: String(p.rating || "-"), icon: Star, c: "text-warning" }
                  ].map(stat => (
                     <Card key={stat.l}>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                           <stat.icon className={`h-6 w-6 mb-2 ${stat.c}`} />
                           <p className="text-2xl font-bold text-charcoal">{stat.v}</p>
                           <p className="text-xs text-muted mt-1">{stat.l}</p>
                        </CardContent>
                     </Card>
                  ))}
               </div>
               
               <Card>
                  <CardContent className="p-6">
                     <h3 className="text-lg font-bold text-charcoal mb-4">Professional Information</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Full Name</h4>
                           <p className="text-sm font-medium">{p.name}</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Provider Type</h4>
                           <p className="text-sm font-medium">{p.profession}</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Specialization</h4>
                           <p className="text-sm font-medium">{p.specialization || p.spec}</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Qualification</h4>
                           <p className="text-sm font-medium">{p.qualification || "-"}</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Registration Number</h4>
                           <p className="text-sm font-medium">{p.registrationNumber || "-"}</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Consultation Types</h4>
                           <div className="flex gap-2 mt-1">
                              {p.offers?.online && <Badge variant="default" className="bg-slate-100"><Video className="h-3 w-3 mr-1"/> Online</Badge>}
                              {p.offers?.clinic && <Badge variant="default" className="bg-slate-100"><Users className="h-3 w-3 mr-1"/> Clinic</Badge>}
                              {p.offers?.home && <Badge variant="default" className="bg-slate-100"><Users className="h-3 w-3 mr-1"/> Home</Badge>}
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card>
                  <CardContent className="p-6" data-testid="admin-aadhaar">
                     <h3 className="text-lg font-bold text-charcoal mb-1">Aadhaar (ID proof)</h3>
                     <p className="text-xs text-muted mb-4">Visible to the admin team only – check the number against the card before approving.</p>
                     {p.aadhaar?.number || p.aadhaar?.photo ? (
                        <div className="grid sm:grid-cols-[220px_1fr] gap-6 items-start">
                           <div>
                              <h4 className="text-sm font-medium text-muted mb-1">Aadhaar Number</h4>
                              <p className="text-lg font-semibold tracking-wider text-charcoal" data-testid="admin-aadhaar-number">{String(p.aadhaar.number || "").replace(/(\d{4})(?=\d)/g, "$1 ") || "-"}</p>
                              {p.aadhaar.updatedAt && <p className="text-xs text-muted mt-1">Added {new Date(p.aadhaar.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
                           </div>
                           <div>
                              <h4 className="text-sm font-medium text-muted mb-1">Aadhaar card photo</h4>
                              {p.aadhaar.photo ? (
                                 <a href={p.aadhaar.photo} target="_blank" rel="noreferrer" title="Open full size" onClick={(e) => { e.preventDefault(); const w = window.open(); if (w) { w.document.title = "Aadhaar – " + p.name; w.document.body.style.margin = "0"; const img = w.document.createElement("img"); img.src = p.aadhaar.photo; img.style.maxWidth = "100%"; w.document.body.appendChild(img) } }}>
                                    <img src={p.aadhaar.photo} alt={`Aadhaar card of ${p.name}`} className="max-h-56 rounded-lg ring-1 ring-slate-200 hover:ring-brand-500 transition" data-testid="admin-aadhaar-photo" />
                                 </a>
                              ) : <p className="text-sm text-muted">Not uploaded</p>}
                           </div>
                        </div>
                     ) : <p className="text-sm text-muted">Not provided yet.</p>}
                  </CardContent>
               </Card>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                     <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-charcoal mb-4">Consultation Fees</h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-2"><Video className="h-4 w-4 text-muted"/> <span className="text-sm font-medium">Online Consultation</span></div>
                              <span className="font-bold text-charcoal">{p.onlineFee != null ? inr(p.onlineFee) : "-"}</span>
                           </div>
                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-muted"/> <span className="text-sm font-medium">Clinic Consultation</span></div>
                              <span className="font-bold text-charcoal">{p.clinicFee != null ? inr(p.clinicFee) : "-"}</span>
                           </div>
                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted"/> <span className="text-sm font-medium">Home Consultation</span></div>
                              <span className="font-bold text-charcoal">{p.fee != null ? inr(p.fee) : "-"}</span>
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  <Card>
                     <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-charcoal mb-4">Clinic Information</h3>
                        <div className="space-y-4">
                           <div>
                              <h4 className="text-sm font-medium text-muted mb-1">Clinic Name</h4>
                              <p className="text-sm font-medium">{p.clinic?.name || "-"}</p>
                           </div>
                           <div>
                              <h4 className="text-sm font-medium text-muted mb-1">Phone</h4>
                              <p className="text-sm font-medium">{p.clinic?.phone || p.phone || "-"}</p>
                           </div>
                           <div>
                              <h4 className="text-sm font-medium text-muted mb-1">Address</h4>
                              <p className="text-sm font-medium leading-relaxed">{[p.clinic?.address, p.city, p.state].filter(Boolean).join(", ") || "-"}</p>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               </div>
             </div>
          )}
          
          {activeTab === 'Documents' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-1">Verification details</h3>
                <p className="text-sm text-muted mb-4">What the professional entered during onboarding. Check the originals (registration certificate, ID) before approving – document upload is not part of the app yet.</p>
                <div className="space-y-3">
                  {[
                    { name: p.profession === "Lab Centre" ? "Licence number" : "Medical registration", value: p.registrationNumber ? `${p.registrationNumber}${p.registrationCouncil ? ` · ${p.registrationCouncil}` : ""}` : "" },
                    { name: p.profession === "Lab Centre" ? "Accreditation" : "Qualification", value: p.qualification || "" },
                    { name: "Contact", value: [p.phone, p.email].filter(Boolean).join(" · ") },
                    { name: "Bank account", value: p.bank?.accountLast4 ? `${p.bank.bankName || "Bank"} ·· ${p.bank.accountLast4}${p.bank.ifsc ? ` · ${p.bank.ifsc}` : ""}` : "" },
                  ].map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-muted" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-charcoal">{doc.name}</p>
                          <p className="text-xs text-muted truncate">{doc.value || "Not provided"}</p>
                        </div>
                      </div>
                      {doc.value ? <span className="flex items-center gap-1 text-xs font-medium text-success shrink-0"><CheckCircle className="h-3 w-3" /> Provided</span> : <span className="text-xs font-medium text-warning shrink-0">Missing</span>}
                    </div>
                  ))}
                </div>
                <Link to={`/admin/providers/${id}/edit`} className="inline-flex mt-4 text-sm font-medium text-brand-600 hover:underline">Edit these details</Link>
              </CardContent>
            </Card>
          )}

          {activeTab === 'Appointments' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                     { l: "Total", v: String(apptStats.total), icon: CalendarDays, c: "text-brand-600" },
                     { l: "Upcoming", v: String(apptStats.upcoming), icon: Clock, c: "text-info" },
                     { l: "Completed", v: String(apptStats.completed), icon: CheckCircle2, c: "text-success" },
                     { l: "Cancelled", v: String(apptStats.cancelled), icon: Ban, c: "text-error" },
                  ].map(stat => (
                     <Card key={stat.l}>
                        <CardContent className="p-4 flex items-center justify-between">
                           <div>
                             <p className="text-sm font-medium text-muted">{stat.l}</p>
                             <p className="text-xl font-bold text-charcoal mt-1">{stat.v}</p>
                           </div>
                           <stat.icon className={`h-8 w-8 opacity-20 ${stat.c}`} />
                        </CardContent>
                     </Card>
                  ))}
                </div>
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Appointment ID</TableHead>
                         <TableHead>Patient</TableHead>
                         <TableHead>Date & Time</TableHead>
                         <TableHead>Type</TableHead>
                         <TableHead>Amount</TableHead>
                         <TableHead>Status</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {appointments.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted py-6">No appointments yet.</TableCell></TableRow>}
                      {appointments.map((a) => (
                      <TableRow key={a.id}>
                         <TableCell className="text-brand-600 font-medium">{a.code}</TableCell>
                         <TableCell className="font-medium">{a.patient}</TableCell>
                         <TableCell>{a.shortDate} <span className="text-muted text-xs block">{a.timeSlot}</span></TableCell>
                         <TableCell>{a.type}</TableCell>
                         <TableCell>{a.payment}</TableCell>
                         <TableCell>{a.status === "Completed" ? <Badge variant="success">Completed</Badge> : a.status === "Cancelled" ? <Badge variant="error">Cancelled</Badge> : a.status === "Confirmed" ? <Badge variant="info">Confirmed</Badge> : <Badge variant="warning">Pending</Badge>}</TableCell>
                      </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </div>
          )}

          {activeTab === 'Availability' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-4">Consultations and timings</h3>
                <div className="grid sm:grid-cols-3 gap-3 mb-8" data-testid="admin-modes">
                  {(p.modes || []).map((m: any) => (
                    <div key={m.type} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-charcoal">{m.label}{m.fee != null ? ` · ${inr(m.fee)}` : ""}</p>
                      <p className="text-xs text-muted mt-1">{m.hours || "No timings set"}</p>
                      {m.type === "clinic" && p.clinic?.name && <p className="text-xs text-muted mt-1">{p.clinic.name}{p.clinic.address ? ` – ${p.clinic.address}` : ""}</p>}
                    </div>
                  ))}
                </div>
                <h3 className="text-lg font-bold text-charcoal mb-6">Weekly Schedule <span className="text-sm font-normal text-muted">(all consultation types)</span></h3>
                <div className="space-y-4">
                  {[
                  ...Object.keys(DAY_NAMES).map((d) => {
                     const slots = p.schedule?.[d] || [];
                     return { day: DAY_NAMES[d], time: slots.length ? slots.join(", ") : "Unavailable", active: slots.length > 0 };
                  }),
                  ].map(sch => (
                     <div key={sch.day} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                        <span className="font-medium text-charcoal w-32">{sch.day}</span>
                        {sch.active ? (
                           <span className="text-muted bg-slate-50 px-3 py-1 rounded-lg text-sm">{sch.time}</span>
                        ) : (
                           <span className="text-error bg-red-50 px-3 py-1 rounded-lg text-sm font-medium">{sch.time}</span>
                        )}
                     </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'Reviews' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-6">Reviews & Ratings</h3>
                <div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-slate-100 pb-8">
                   <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-6 md:w-1/3">
                      <p className="text-5xl font-bold text-charcoal mb-2">{p.reviews ? p.rating : "-"}</p>
                      <div className="flex items-center text-warning mb-2">
                         {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-5 w-5 ${n <= Math.round(Number(p.rating || 0)) && p.reviews ? "fill-warning" : "opacity-30"}`} />)}
                      </div>
                      <p className="text-sm text-muted">Based on {p.reviews || 0} reviews</p>
                   </div>
                   <div className="md:w-2/3 space-y-3">
                      {[
                         ...(reviewData.summary?.distribution || []).map((d: any) => ({ stars: d.stars, pct: `${d.pct}%` })),
                      ].map((bar: any) => (
                         <div key={bar.stars} className="flex items-center text-sm">
                            <span className="w-12 text-muted font-medium">{bar.stars} Star</span>
                            <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-warning" style={{ width: bar.pct }}></div>
                            </div>
                            <span className="w-8 text-right text-muted">{bar.pct}</span>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-6">
                   {reviewData.reviews.length === 0 && <p className="text-sm text-muted">No reviews yet.</p>}
                   {reviewData.reviews.map((rv: any) => (
                   <div key={rv.id} className="pb-6 border-b border-slate-100 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                         <span className="font-medium text-charcoal">{rv.patient}</span>
                         <span className="text-xs text-muted">{rv.date}</span>
                      </div>
                      <div className="flex items-center text-warning mb-3">
                         {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-3 w-3 ${n <= rv.rating ? "fill-warning" : "opacity-30"}`} />)}
                      </div>
                      <p className="text-sm text-charcoal leading-relaxed">{rv.comment ? `"${rv.comment}"` : "Rated without a comment."}</p>
                   </div>
                   ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'Payments' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                     { l: "Total Earnings", v: inr(gross), icon: HandCoins, c: "text-success", bg: "bg-green-50" },
                     { l: "This Month", v: inr(monthGross), icon: CheckCircle2, c: "text-brand-600", bg: "bg-brand-50" },
                     { l: "Pending Payout", v: inr(Math.max(gross - commission - paidOut, 0)), icon: Clock, c: "text-warning", bg: "bg-amber-50" },
                     { l: "Commission", v: inr(commission), icon: Ban, c: "text-charcoal", bg: "bg-slate-100" },
                  ].map(stat => (
                     <Card key={stat.l}>
                        <CardContent className="p-5 relative overflow-hidden">
                           <div className={`h-10 w-10 rounded-full mb-3 ${stat.bg} flex items-center justify-center ${stat.c}`}>
                              <stat.icon className="h-5 w-5" />
                           </div>
                           <p className="text-2xl font-bold text-charcoal">{stat.v}</p>
                           <p className="text-sm text-muted mt-1">{stat.l}</p>
                        </CardContent>
                     </Card>
                  ))}
                </div>
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Transaction ID</TableHead>
                         <TableHead>Appointment</TableHead>
                         <TableHead>Amount</TableHead>
                         <TableHead>Commission</TableHead>
                         <TableHead>Net Earnings</TableHead>
                         <TableHead>Status</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {payments.filter((t) => t.type === "Payment").length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted py-6">No payments yet.</TableCell></TableRow>}
                      {payments.filter((t) => t.type === "Payment").map((t) => (
                      <TableRow key={t.id}>
                         <TableCell className="text-brand-600 font-medium">{t.txnId}</TableCell>
                         <TableCell className="text-muted">{t.appointmentCode}</TableCell>
                         <TableCell>{t.amountLabel}</TableCell>
                         <TableCell className="text-error">-{inr(Math.round(t.amount * 0.1))}</TableCell>
                         <TableCell className="font-semibold">{inr(t.amount - Math.round(t.amount * 0.1))}</TableCell>
                         <TableCell>{t.status === "Success" ? <Badge variant="success">Paid</Badge> : t.status === "Pending" ? <Badge variant="warning">Pending</Badge> : <Badge variant="default">{t.status}</Badge>}</TableCell>
                      </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </div>
          )}

          {activeTab === 'Activity' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-6">Provider Activity</h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {[
                  ...activity,
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

          {activeTab === 'Professional' && (
             <Card>
                <CardContent className="p-12 text-center">
                   <p className="text-muted">The Professional tab contents are displayed on the Overview tab for this view.</p>
                </CardContent>
             </Card>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <Modal isOpen={isSuspendModalOpen} onClose={() => setSuspendModalOpen(false)} title="Suspend Provider">
         <div className="space-y-4">
            <p className="text-sm text-muted">Suspending this provider will prevent new appointments and consultations.</p>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
               <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">{initials}</div>
               <div>
                  <p className="font-medium text-charcoal text-sm">{p.name}</p>
                  <p className="text-xs text-muted">{code}</p>
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-sm font-medium text-charcoal">Reason for suspension</label>
               <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 bg-white min-h-24 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Enter reason..."></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button variant="outline" onClick={() => setSuspendModalOpen(false)}>Cancel</Button>
               <Button className="bg-error hover:bg-red-700 text-white" onClick={() => setStatus("SUSPENDED")}>Suspend Provider</Button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Provider?">
         <div className="space-y-4">
            <p className="text-sm text-muted">This action cannot be undone. The provider account and associated administrative data may be permanently removed.</p>
            <div className="flex justify-end gap-2 pt-2">
               <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
               <Button className="bg-error hover:bg-red-700 text-white" onClick={handleDelete}>Delete Provider</Button>
            </div>
         </div>
      </Modal>
    </div>
  )
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-3 5.99-4.99a1 1 0 0 1 1.02 0C13 2 15 4 17 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
