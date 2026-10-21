import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, UserPlus, ShieldCheck, Search, Activity, User, Briefcase, FileText, Settings, X, Check, AlertCircle } from 'lucide-react';
import { getDoctors, saveDoctors, getPatients, getAppointments } from '../utils/storage';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Doctors');
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, pendingApprovals: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Ideally we check if user is admin, but omitting auth guard for prototyping speed
    loadData();
  }, []);

  const loadData = () => {
    const docs = getDoctors();
    setDoctors(docs);
    setStats({
      totalDoctors: docs.length,
      totalPatients: getPatients().length,
      pendingApprovals: docs.filter(d => d.status === 'PENDING').length
    });
  };

  const handleApprove = (id) => {
    const updated = doctors.map(d => d.id === id ? { ...d, status: 'ACTIVE' } : d);
    saveDoctors(updated);
    loadData();
  };

  const handleReject = (id) => {
    const updated = doctors.map(d => d.id === id ? { ...d, status: 'REJECTED' } : d);
    saveDoctors(updated);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-center">
          <Link to="/">
            <img src="/logo.png" alt="Carevaa" className="h-8" />
            <span className="text-xs font-bold text-gray-400 mt-1 block text-center uppercase tracking-widest">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            {['Dashboard', 'Doctors', 'Patients', 'Appointments'].map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}
                >
                  {tab === 'Dashboard' && <Activity className="w-5 h-5" />}
                  {tab === 'Doctors' && <Briefcase className="w-5 h-5" />}
                  {tab === 'Patients' && <User className="w-5 h-5" />}
                  {tab === 'Appointments' && <FileText className="w-5 h-5" />}
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <Link to="/" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition">
            Log Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Super Admin</h1>
            <p className="text-gray-500 font-medium text-sm">Manage users, doctors, and platform health.</p>
          </div>
        </header>

        {activeTab === 'Dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-xl"><Briefcase className="w-6 h-6 text-blue-600" /></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalDoctors}</h3>
              <p className="text-gray-500 font-medium text-sm">Total Doctors</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-green-50 p-3 rounded-xl"><User className="w-6 h-6 text-green-600" /></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalPatients}</h3>
              <p className="text-gray-500 font-medium text-sm">Total Patients</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-400">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-yellow-50 p-3 rounded-xl"><ShieldCheck className="w-6 h-6 text-yellow-600" /></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.pendingApprovals}</h3>
              <p className="text-gray-500 font-medium text-sm">Pending Verifications</p>
            </div>
          </div>
        )}

        {activeTab === 'Doctors' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary">Doctor Verification & Management</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search doctors..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Specialization</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No doctors registered yet.</td></tr>
                  ) : doctors.map(doc => (
                    <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={doc.img || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.exp}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-medium">{doc.spec}</td>
                      <td className="p-4 text-sm text-gray-600 font-medium">{doc.loc}</td>
                      <td className="p-4">
                        {doc.status === 'PENDING' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Pending</span>}
                        {(doc.status === 'ACTIVE' || !doc.status) && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Active</span>}
                        {doc.status === 'REJECTED' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Rejected</span>}
                      </td>
                      <td className="p-4 text-right">
                        {doc.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleApprove(doc.id)} className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleReject(doc.id)} className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button className="text-gray-400 hover:text-primary transition text-sm font-bold">View Profile</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
