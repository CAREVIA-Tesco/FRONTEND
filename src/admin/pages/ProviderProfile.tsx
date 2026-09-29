import { Link } from "react-router-dom"
import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent } from "../components/ui/Card"
import { Modal } from "../components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Edit, Ban, CalendarDays, CheckCircle2, Clock, Star, Download, Eye, FileText, CheckCircle, MapPin, Video, Users, Stethoscope, HandCoins } from "lucide-react"

export function ProviderProfile() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSuspendModalOpen, setSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const tabs = ['Overview', 'Professional', 'Appointments', 'Availability', 'Reviews', 'Payments', 'Documents', 'Activity'];

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-muted mb-4">
        <span className="hover:text-charcoal transition-colors cursor-pointer">Management</span>
        <span className="mx-2">/</span>
        <Link to="/providers" className="hover:text-brand-600 transition-colors">Doctors & Providers</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal font-medium">Dr. Priya Sharma</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: Profile Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="h-24 w-24 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-3xl mb-4">
                  PS
                </div>
                <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
                  Dr. Priya Sharma
                  <CheckCircle className="h-5 w-5 text-success fill-green-100" />
                </h2>
                <p className="text-muted font-medium mt-1">Homeopathy Doctor</p>
                <p className="text-brand-600 font-medium text-sm mt-1">Skin & Allergy</p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
              
              <div className="py-6 space-y-4 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Experience</span>
                  <span className="font-medium text-sm">8 Years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Languages</span>
                  <span className="font-medium text-sm text-right">English, Hindi, Tamil</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Location</span>
                  <span className="font-medium text-sm flex items-center"><MapPin className="h-3 w-3 mr-1"/> Chennai</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Rating</span>
                  <span className="font-medium text-sm flex items-center"><Star className="h-3 w-3 mr-1 fill-warning text-warning"/> 4.8 (126)</span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Link to="/providers/DOC-10284/edit" className="block w-full">
                  <Button className="w-full bg-brand-600 text-white hover:bg-brand-700">
                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                </Link>
                <Button className="w-full text-error border-error/30 hover:bg-red-50 hover:border-error" variant="outline" onClick={() => setSuspendModalOpen(true)}>
                  <Ban className="h-4 w-4 mr-2" /> Suspend Provider
                </Button>
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
                     <Badge variant="success">Verified</Badge>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-sm text-muted">Date</span>
                     <span className="text-sm font-medium">12 Sep 2026</span>
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
                     { l: "Appts", v: "486", icon: CalendarDays, c: "text-brand-600" },
                     { l: "Completed", v: "428", icon: CheckCircle2, c: "text-success" },
                     { l: "Upcoming", v: "32", icon: Clock, c: "text-info" },
                     { l: "Cancelled", v: "26", icon: Ban, c: "text-error" },
                     { l: "Rating", v: "4.8", icon: Star, c: "text-warning" }
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
                           <p className="text-sm font-medium">Dr. Priya Sharma</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Provider Type</h4>
                           <p className="text-sm font-medium">Homeopathy Doctor</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Specialization</h4>
                           <p className="text-sm font-medium">Skin & Allergy</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Qualification</h4>
                           <p className="text-sm font-medium">BHMS</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Registration Number</h4>
                           <p className="text-sm font-medium">HOM-2020-10284</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-muted mb-1">Consultation Types</h4>
                           <div className="flex gap-2 mt-1">
                              <Badge variant="default" className="bg-slate-100"><Video className="h-3 w-3 mr-1"/> Online</Badge>
                              <Badge variant="default" className="bg-slate-100"><Users className="h-3 w-3 mr-1"/> Clinic</Badge>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                     <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-charcoal mb-4">Consultation Fees</h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-2"><Video className="h-4 w-4 text-muted"/> <span className="text-sm font-medium">Online Consultation</span></div>
                              <span className="font-bold text-charcoal">₹500</span>
                           </div>
                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-muted"/> <span className="text-sm font-medium">Clinic Consultation</span></div>
                              <span className="font-bold text-charcoal">₹600</span>
                           </div>
                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted"/> <span className="text-sm font-medium">Home Consultation</span></div>
                              <span className="font-bold text-charcoal">₹800</span>
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
                              <p className="text-sm font-medium">Carevia Health Clinic</p>
                           </div>
                           <div>
                              <h4 className="text-sm font-medium text-muted mb-1">Phone</h4>
                              <p className="text-sm font-medium">+91 98765 43210</p>
                           </div>
                           <div>
                              <h4 className="text-sm font-medium text-muted mb-1">Address</h4>
                              <p className="text-sm font-medium leading-relaxed">123 Health Avenue,<br/>Block B, Chennai,<br/>Tamil Nadu</p>
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
                <h3 className="text-lg font-bold text-charcoal mb-4">Documents</h3>
                <div className="space-y-4">
                  {[
                    { name: "Medical Registration Certificate", verified: true },
                    { name: "Qualification Certificate (BHMS)", verified: true },
                    { name: "Government ID", verified: true },
                    { name: "Address Proof", verified: true }
                  ].map((doc, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-xl gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-charcoal">{doc.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {doc.verified && <CheckCircle className="h-3 w-3 text-success" />}
                            <span className="text-xs text-success font-medium">Verified</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="h-8 px-3 flex-1 sm:flex-none">
                          <Eye className="h-4 w-4 mr-2" /> Preview
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

          {activeTab === 'Appointments' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                     { l: "Total", v: "486", icon: CalendarDays, c: "text-brand-600" },
                     { l: "Upcoming", v: "32", icon: Clock, c: "text-info" },
                     { l: "Completed", v: "428", icon: CheckCircle2, c: "text-success" },
                     { l: "Cancelled", v: "26", icon: Ban, c: "text-error" },
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
                      <TableRow>
                         <TableCell className="text-brand-600 font-medium">APT-10284</TableCell>
                         <TableCell className="font-medium">Rahul Sharma</TableCell>
                         <TableCell>21 Sep 2026 <span className="text-muted text-xs block">10:00 AM</span></TableCell>
                         <TableCell>Online</TableCell>
                         <TableCell>₹500</TableCell>
                         <TableCell><Badge variant="success">Completed</Badge></TableCell>
                      </TableRow>
                   </TableBody>
                </Table>
             </div>
          )}

          {activeTab === 'Availability' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-6">Weekly Schedule</h3>
                <div className="space-y-4">
                  {[
                     { day: "Monday", time: "09:00 AM – 06:00 PM", active: true },
                     { day: "Tuesday", time: "09:00 AM – 06:00 PM", active: true },
                     { day: "Wednesday", time: "09:00 AM – 06:00 PM", active: true },
                     { day: "Thursday", time: "09:00 AM – 06:00 PM", active: true },
                     { day: "Friday", time: "09:00 AM – 06:00 PM", active: true },
                     { day: "Saturday", time: "09:00 AM – 02:00 PM", active: true },
                     { day: "Sunday", time: "Unavailable", active: false },
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
                      <p className="text-5xl font-bold text-charcoal mb-2">4.8</p>
                      <div className="flex items-center text-warning mb-2">
                         <Star className="h-5 w-5 fill-warning"/>
                         <Star className="h-5 w-5 fill-warning"/>
                         <Star className="h-5 w-5 fill-warning"/>
                         <Star className="h-5 w-5 fill-warning"/>
                         <Star className="h-5 w-5 fill-warning opacity-30"/>
                      </div>
                      <p className="text-sm text-muted">Based on 126 reviews</p>
                   </div>
                   <div className="md:w-2/3 space-y-3">
                      {[
                         { stars: 5, pct: "88%", width: "w-[88%]" },
                         { stars: 4, pct: "8%", width: "w-[8%]" },
                         { stars: 3, pct: "3%", width: "w-[3%]" },
                         { stars: 2, pct: "1%", width: "w-[1%]" },
                         { stars: 1, pct: "0%", width: "w-[0%]" },
                      ].map(bar => (
                         <div key={bar.stars} className="flex items-center text-sm">
                            <span className="w-12 text-muted font-medium">{bar.stars} Star</span>
                            <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                               <div className={`h-full bg-warning ${bar.width}`}></div>
                            </div>
                            <span className="w-8 text-right text-muted">{bar.pct}</span>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="pb-6 border-b border-slate-100 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                         <span className="font-medium text-charcoal">Sanjay M.</span>
                         <span className="text-xs text-muted">21 Sep 2026</span>
                      </div>
                      <div className="flex items-center text-warning mb-3">
                         <Star className="h-3 w-3 fill-warning"/><Star className="h-3 w-3 fill-warning"/><Star className="h-3 w-3 fill-warning"/><Star className="h-3 w-3 fill-warning"/><Star className="h-3 w-3 fill-warning"/>
                      </div>
                      <p className="text-sm text-charcoal leading-relaxed">"Very patient and understanding. The online consultation was smooth and helpful. Highly recommended."</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'Payments' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                     { l: "Total Earnings", v: "₹4.82L", icon: HandCoins, c: "text-success", bg: "bg-green-50" },
                     { l: "This Month", v: "₹68,400", icon: CheckCircle2, c: "text-brand-600", bg: "bg-brand-50" },
                     { l: "Pending Payout", v: "₹12,500", icon: Clock, c: "text-warning", bg: "bg-amber-50" },
                     { l: "Commission", v: "₹48,200", icon: Ban, c: "text-charcoal", bg: "bg-slate-100" },
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
                      <TableRow>
                         <TableCell className="text-brand-600 font-medium">TXN-98273</TableCell>
                         <TableCell className="text-muted">APT-10284</TableCell>
                         <TableCell>₹500</TableCell>
                         <TableCell className="text-error">-₹50</TableCell>
                         <TableCell className="font-semibold">₹450</TableCell>
                         <TableCell><Badge variant="success">Paid</Badge></TableCell>
                      </TableRow>
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
                     { date: "21 Sep 2026", time: "11:32 AM", title: "Provider profile updated", desc: "Updated consultation fees and working hours.", icon: Edit, color: "text-brand-600", bg: "bg-brand-50" },
                     { date: "20 Sep 2026", time: "04:15 PM", title: "Appointment completed", desc: "Completed online consultation with Rahul Sharma.", icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
                     { date: "15 Sep 2026", time: "09:00 AM", title: "Provider verified", desc: "Super Admin approved the submitted documents.", icon: ShieldCheck, color: "text-success", bg: "bg-green-50" },
                     { date: "10 Sep 2026", time: "02:20 PM", title: "Registration submitted", desc: "Provider created an account and submitted documents.", icon: FileText, color: "text-charcoal", bg: "bg-slate-100" }
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
               <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">PS</div>
               <div>
                  <p className="font-medium text-charcoal text-sm">Dr. Priya Sharma</p>
                  <p className="text-xs text-muted">DOC-10284</p>
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-sm font-medium text-charcoal">Reason for suspension</label>
               <textarea className="w-full border border-slate-200 rounded-lg p-3 bg-white min-h-24 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Enter reason..."></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button variant="outline" onClick={() => setSuspendModalOpen(false)}>Cancel</Button>
               <Button className="bg-error hover:bg-red-700 text-white" onClick={() => setSuspendModalOpen(false)}>Suspend Provider</Button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Provider?">
         <div className="space-y-4">
            <p className="text-sm text-muted">This action cannot be undone. The provider account and associated administrative data may be permanently removed.</p>
            <div className="flex justify-end gap-2 pt-2">
               <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
               <Button className="bg-error hover:bg-red-700 text-white" onClick={() => setDeleteModalOpen(false)}>Delete Provider</Button>
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
