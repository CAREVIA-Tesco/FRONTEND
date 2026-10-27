// A doctor's sign-up details (name, email/phone, password) are kept in memory only while they fill in the
// professional form. The account is created when the form is submitted – not before.
// Nothing is written to storage, so a page refresh asks them to start the sign-up again.
let pending = null;
export const setPendingSignup = (v) => { pending = v ? { ...v } : null; };
export const getPendingSignup = () => pending;
export const clearPendingSignup = () => { pending = null; };
