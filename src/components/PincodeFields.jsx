import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, RotateCw, ChevronDown } from 'lucide-react';

// PIN code first, then City / District / State / Area filled from India Post.
// Every field stays editable, so the person can correct or type the details if the lookup fails.
//
//   const pin = usePincode(address, patch);
//   <PincodeFields idPrefix="bn" value={address} onChange={patch} lookup={pin} errors={errors}
//                  fieldCls={...} labelCls={...} />
//
// Props
//   value      { pincode, city, district, state, locality }
//   onChange   (patch) => void
//   lookup     result of usePincode()
//   errors     { pincode?, city?, locality? }
//   required   marks PIN + City with * (cityRequired: City only)
//   showDetails 'auto' (after a PIN is looked up or when saved details exist) | 'always'
const OTHER = '__other__';

export default function PincodeFields({
  idPrefix = 'addr', value, onChange, lookup, errors = {}, required = true, cityRequired = required, showDetails = 'auto',
  fieldCls = '', labelCls = '', errCls = 'text-[12.5px] text-red-600 mt-1', hintCls = 'text-[12.5px] mt-1', selectCls,
  pinPlaceholder = '6-digit PIN', className = 'space-y-3',
}) {
  const v = value || {};
  const offices = lookup?.offices || [];
  const names = offices.map((o) => o.name);
  const [typingOther, setTypingOther] = useState(false);
  const star = required ? <span className="text-secondary"> *</span> : null;
  const id = (k) => `${idPrefix}-${k}`;
  const Err = ({ k }) => (errors[k] ? <p className={errCls} role="alert">{errors[k]}</p> : null);

  const status = lookup?.status;
  const showAll = showDetails === 'always' || ['found', 'error'].includes(status) || !!(v.district || v.state || v.locality);
  const manualLocality = typingOther || (v.locality && !names.includes(v.locality));
  const useSelect = offices.length > 1 && !manualLocality;

  const onPin = (e) => {
    lookup?.markDirty?.();
    setTypingOther(false);
    onChange({ pincode: e.target.value.replace(/\D/g, '').slice(0, 6) });
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <label htmlFor={id('pin')} className={labelCls}>PIN code{star}</label>
          <span className="relative block">
            <input
              id={id('pin')} aria-label="PIN code" className={`${fieldCls} pr-9`} value={v.pincode || ''} onChange={onPin}
              placeholder={pinPlaceholder} inputMode="numeric" autoComplete="postal-code" maxLength={6}
              aria-invalid={!!errors.pincode || status === 'invalid'} aria-describedby={id('pin-status')} data-status={status || 'idle'}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-primary/50" aria-hidden="true" />}
              {status === 'found' && <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />}
              {(status === 'invalid' || status === 'error') && <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />}
            </span>
          </span>
        </div>
        <div className="min-w-0">
          <label htmlFor={id('city')} className={labelCls}>City{cityRequired ? <span className="text-secondary"> *</span> : null}</label>
          <input id={id('city')} aria-label="City" className={fieldCls} value={v.city || ''} onChange={(e) => onChange({ city: e.target.value })} placeholder={status === 'loading' ? 'Finding…' : 'City'} autoComplete="address-level2" aria-invalid={!!errors.city} />
        </div>
      </div>

      {/* one status line for the PIN lookup */}
      <div id={id('pin-status')} aria-live="polite" className="-mt-1.5">
        {errors.pincode || status === 'invalid' ? (
          <p className={errCls} role="alert">{status === 'invalid' ? lookup.message : errors.pincode}</p>
        ) : status === 'loading' ? (
          <p className={`${hintCls} text-primary/55`}>Finding your area…</p>
        ) : status === 'error' ? (
          <p className={`${hintCls} text-red-600 flex flex-wrap items-center gap-x-2 gap-y-0.5`}>
            <span>{lookup.message}</span>
            <button type="button" onClick={lookup.retry} className="inline-flex items-center gap-1 font-semibold text-secondary underline underline-offset-2">
              <RotateCw className="w-3.5 h-3.5" /> Retry
            </button>
            <span className="text-primary/55 w-full">You can also type the city and area yourself.</span>
          </p>
        ) : status === 'found' && lookup.partial && !v.city ? (
          <p className={`${hintCls} text-primary/60`}>We found the state for this PIN code – please type your city.</p>
        ) : status === 'found' ? (
          <p className={`${hintCls} text-emerald-700`}>{offices.length > 1 ? `${offices.length} areas found for ${lookup.pin} – pick yours below.` : 'Location found – you can edit it if needed.'}</p>
        ) : null}
        {errors.city && <Err k="city" />}
      </div>

      {showAll && (
        <>
          <div>
            <label htmlFor={id('locality')} className={labelCls}>Area / post office{offices.length > 1 ? star : null}</label>
            {useSelect ? (
              <span className="relative block">
                <select
                  id={id('locality')} aria-label="Area / post office" className={`${selectCls || fieldCls} appearance-none pr-10`}
                  value={names.includes(v.locality) ? v.locality : ''} aria-invalid={!!errors.locality}
                  onChange={(e) => {
                    if (e.target.value === OTHER) { setTypingOther(true); onChange({ locality: '' }); }
                    else onChange({ locality: e.target.value });
                  }}
                >
                  <option value="">Select your area</option>
                  {offices.map((o) => <option key={o.name} value={o.name}>{o.name}{o.district && o.district !== v.district ? ` (${o.district})` : ''}</option>)}
                  <option value={OTHER}>Other – type it</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/60" />
              </span>
            ) : (
              <span className="relative block">
                <input id={id('locality')} aria-label="Area / post office" className={`${fieldCls}${offices.length > 1 ? ' pr-14' : ''}`} value={v.locality || ''} onChange={(e) => onChange({ locality: e.target.value })} placeholder="Area or locality" autoComplete="address-level3" aria-invalid={!!errors.locality} />
                {offices.length > 1 && (
                  <button type="button" onClick={() => { setTypingOther(false); onChange({ locality: '' }); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-secondary px-1.5 py-1">List</button>
                )}
              </span>
            )}
            <Err k="locality" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label htmlFor={id('district')} className={labelCls}>District</label>
              <input id={id('district')} aria-label="District" className={fieldCls} value={v.district || ''} onChange={(e) => onChange({ district: e.target.value })} placeholder="District" />
            </div>
            <div className="min-w-0">
              <label htmlFor={id('state')} className={labelCls}>State</label>
              <input id={id('state')} aria-label="State" className={fieldCls} value={v.state || ''} onChange={(e) => onChange({ state: e.target.value })} placeholder="State" autoComplete="address-level1" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
