import React, { useEffect, useState } from 'react';
import { ClipboardList, ChevronRight, ArrowLeft, Plus } from 'lucide-react';
import api from '../services/api';
import RequestStatus, { STATUS_BADGE, TYPE_LABEL } from './RequestStatus';
import EnquiryModal from './EnquiryModal';

// Patient dashboard tab: callback / care-plan requests made from the website, with live status.
export default function MyRequests() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const load = () => api.myEnquiries().then((d) => setList(d.enquiries || [])).catch((e) => { setError(e.message); setList([]); });
  useEffect(() => { load(); }, []);

  const selected = list?.find((e) => e.id === openId);
  const cancel = async () => {
    setCancelling(true);
    try { await api.cancelEnquiry(selected.id); await load(); } catch (e) { setError(e.message); } finally { setCancelling(false); }
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
          <p className="text-gray-500 text-sm">Callback and care-plan requests you sent us, and what our care team has done.</p>
        </div>
        <button type="button" onClick={() => setNewOpen(true)} className="bg-strong text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:opacity-90"><Plus className="w-4 h-4" /> New request</button>
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      {selected ? (
        <div className="space-y-4">
          <button type="button" onClick={() => setOpenId(null)} className="text-sm font-bold text-strong flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> All requests</button>
          <RequestStatus enquiry={selected} onCancel={cancel} cancelling={cancelling} />
        </div>
      ) : list === null ? (
        <p className="text-gray-500">Loading…</p>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 text-center py-16">
          <ClipboardList className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No requests yet</h3>
          <p className="text-gray-500 text-sm">Need help choosing care? Request a callback and a care advisor will call you.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 divide-y divide-gray-100">
          {list.map((e) => (
            <button key={e.id} type="button" onClick={() => setOpenId(e.id)} className="w-full text-left flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{e.code} · {e.requestedProvider ? `Appointment with ${e.requestedProvider}` : e.service || e.subject || TYPE_LABEL[e.type]}</p>
                <p className="text-sm text-gray-500 truncate">{TYPE_LABEL[e.type]}{e.plan ? ` · ${e.plan}` : ''} · {e.createdLabel}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{e.timeline[e.timeline.length - 1]?.note}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${STATUS_BADGE[e.status]}`}>{e.status === 'Converted' ? 'Booked' : e.status}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
      <EnquiryModal open={newOpen} onClose={() => { setNewOpen(false); load(); }} />
    </div>
  );
}
