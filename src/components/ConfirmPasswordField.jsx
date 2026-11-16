import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// "Confirm Password" for account creation – shows straight away whether it matches "Create Password"
export const PASSWORD_MISMATCH = 'Passwords do not match. Please enter the same password in Create Password and Confirm Password.';

export default function ConfirmPasswordField({ id = 'confirmPassword', value, onChange, password, show = false, inputCls, labelCls }) {
  const mismatch = !!value && value !== password;
  const match = !!value && value === password;
  return (
    <div>
      <label htmlFor={id} className={labelCls}>Confirm Password</label>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Re-enter your password"
        aria-invalid={mismatch}
        aria-describedby={`${id}-hint`}
        className={`${inputCls} ${mismatch ? '!border-red-400 focus:!ring-red-100' : ''}`}
      />
      <p id={`${id}-hint`} className={`text-xs mt-1.5 flex items-center gap-1 ${mismatch ? 'text-red-600' : match ? 'text-green-700' : 'text-primary/50'}`} data-testid="password-match">
        {mismatch ? <><AlertCircle className="w-3.5 h-3.5" /> Passwords do not match</> : match ? <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</> : 'Type the same password again.'}
      </p>
    </div>
  );
}
