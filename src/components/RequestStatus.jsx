import React from 'react';
import { Check, XCircle } from 'lucide-react';

export const STEPS = ['New', 'Contacted', 'Scheduled', 'Converted'];
const STEP_LABEL = { New: 'Received', Contacted: 'Advisor called', Scheduled: 'Visit scheduled', Converted: 'Booked' };
export const TYPE_LABEL = { booking: 'Home visit request', callback: 'Callback request', plan: 'Care plan enquiry', requirement: 'Requirement', contact: 'Contact message', partner: 'Partnership enquiry', referral: 'Referral' };
export const STATUS_BADGE = {
  New: 'bg-amber-50 text-amber-700',
  Contacted: 'bg-blue-50 text-blue-700',
  Scheduled: 'bg-indigo-50 text-indigo-700',
  Converted: 'bg-green-50 text-green-700',
  Closed: 'bg-gray-100 text-gray-600',
};

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

// Progress tracker + timeline for one enquiry (used on /track and in the patient dashboard)
export default function RequestStatus({ enquiry, onCancel, cancelling }) {
  const closed = enquiry.status === 'Closed';
  const current = STEPS.indexOf(enquiry.status);
  const canCancel = onCancel && !['Converted', 'Closed'].includes(enquiry.status);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8" data-testid="request-status">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{TYPE_LABEL[enquiry.type] || 'Request'}</p>
          <h3 className="text-2xl font-bold font-poppins text-primary">{enquiry.code}</h3>
          <p className="text-sm text-gray-500">Submitted {enquiry.createdLabel}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_BADGE[enquiry.status] || STATUS_BADGE.New}`}>{enquiry.status === 'Converted' ? 'Booked' : enquiry.status}</span>
      </div>

      {closed ? (
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 mb-6 text-gray-600 text-sm"><XCircle className="w-5 h-5 shrink-0" /> {enquiry.closedReason || 'This request is closed.'}</div>
      ) : (
        <ol className="grid grid-cols-4 gap-2 mb-8">
          {STEPS.map((s, i) => {
            const done = i <= current;
            return (
              <li key={s} className="flex flex-col items-center text-center relative">
                {i > 0 && <span className={`absolute top-4 right-1/2 w-full h-0.5 ${i <= current ? 'bg-secondary' : 'bg-gray-200'}`} />}
                <span className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-400'}`}>{done ? <Check className="w-4 h-4" /> : i + 1}</span>
                <span className={`mt-2 text-[11px] sm:text-xs font-semibold ${done ? 'text-primary' : 'text-gray-400'}`}>{STEP_LABEL[s]}</span>
              </li>
            );
          })}
        </ol>
      )}

      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
        {[
          ['Name', enquiry.name],
          ['Mobile', enquiry.phone],
          ['Service', enquiry.service],
          ['Care plan', enquiry.plan],
          ['Organisation', enquiry.organisation],
          ['Subject', enquiry.subject],
          ['City', enquiry.city],
          ['Preferred date', enquiry.preferredDateLabel],
          ['Best time to call', enquiry.preferredTime],
          ['Professional', enquiry.provider],
          ['Appointment ID', enquiry.appointmentCode],
        ].filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex justify-between sm:block border-b border-gray-50 pb-2">
            <dt className="text-gray-500">{k}</dt>
            <dd className="font-semibold text-primary">{v}</dd>
          </div>
        ))}
      </dl>

      <h4 className="font-bold text-primary mb-3">Updates</h4>
      <ul className="space-y-4 border-l-2 border-gray-100 ml-2 pl-5">
        {[...enquiry.timeline].reverse().map((t, i) => (
          <li key={i} className="relative">
            <span className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full ${i === 0 ? 'bg-secondary' : 'bg-gray-300'}`} />
            <p className="text-sm text-primary font-medium">{t.note}</p>
            <p className="text-xs text-gray-400">{fmt(t.at)}</p>
          </li>
        ))}
      </ul>

      {canCancel && (
        <button type="button" onClick={onCancel} disabled={cancelling} className="mt-6 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-60">
          {cancelling ? 'Cancelling…' : 'Cancel this request'}
        </button>
      )}
    </div>
  );
}
