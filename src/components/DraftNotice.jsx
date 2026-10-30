import React from 'react';
import { History } from 'lucide-react';

// Shown when a form was refilled from an auto-saved draft
export default function DraftNotice({ draft, className = '' }) {
  if (!draft?.restoredAt) return null;
  const when = new Date(draft.restoredAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  return (
    <div role="status" data-testid="draft-notice" className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-[13px] text-amber-900 ${className}`}>
      <History className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 min-w-[200px]">We kept the details you entered earlier ({when}). Continue where you stopped – nothing is sent until you submit.</span>
      <button type="button" onClick={draft.discard} className="font-semibold underline underline-offset-2 hover:text-amber-700">Start over</button>
    </div>
  );
}
