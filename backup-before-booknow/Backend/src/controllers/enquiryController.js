import Enquiry, { ENQUIRY_TYPES, ENQUIRY_STATUSES, statusText } from '../models/Enquiry.js';
import Provider from '../models/Provider.js';
import Appointment from '../models/Appointment.js';
import { ApiError, asyncHandler } from '../middleware/error.js';

const digits = (p) => String(p || '').replace(/\D/g, '').slice(-10);
const clean = (v, max = 200) => (v === undefined || v === null ? undefined : String(v).trim().slice(0, max) || undefined);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/enquiries  (public; a logged-in patient is linked automatically)
export const createEnquiry = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const type = ENQUIRY_TYPES.includes(b.type) ? b.type : 'callback';
  const name = clean(b.name, 100) || req.user?.name;
  const phone = clean(b.phone, 20) || req.user?.phone;
  const email = clean(b.email, 120) || (type === 'contact' || type === 'partner' ? undefined : req.user?.email);

  if (!name) throw new ApiError(400, 'Please enter your name');
  if (digits(phone).length < 10) throw new ApiError(400, 'Please enter a valid 10-digit mobile number');
  if (email && !EMAIL.test(email)) throw new ApiError(400, 'Please enter a valid email address');
  if ((type === 'callback' || type === 'plan' || type === 'requirement' || type === 'referral') && !clean(b.service)) throw new ApiError(400, 'Please choose the service you need');
  if (type === 'contact' && !clean(b.message, 2000)) throw new ApiError(400, 'Please type your message');
  if (type === 'partner' && !clean(b.organisation)) throw new ApiError(400, 'Please enter your organisation name');
  if (type === 'referral') {
    if (!clean(b.referrerName, 100)) throw new ApiError(400, 'Please enter your name');
    if (digits(b.referrerPhone).length < 10) throw new ApiError(400, 'Please enter your 10-digit mobile number');
    if (digits(b.referrerPhone) === digits(phone)) throw new ApiError(400, "Your friend's number must be different from yours");
  }
  if (b.consent === false) throw new ApiError(400, 'Please allow us to contact you about this request');

  let preferredDate;
  if (b.preferredDate) {
    preferredDate = new Date(b.preferredDate);
    if (Number.isNaN(preferredDate.getTime())) throw new ApiError(400, 'Invalid preferred date');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (preferredDate < today) throw new ApiError(400, 'Preferred date cannot be in the past');
  }

  // avoid duplicate leads when the same number submits the same request twice in 10 minutes
  const recent = await Enquiry.findOne({
    phone: { $regex: `${digits(phone)}$` },
    type,
    service: clean(b.service),
    status: 'New',
    createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
  });
  if (recent) {
    return res.status(200).json({ success: true, duplicate: true, message: `We already have your request ${recent.code}. Our care advisor will call you shortly.`, enquiry: recent.toPublic() });
  }

  const enquiry = await Enquiry.create({
    type,
    name,
    phone: digits(phone),
    email,
    city: clean(b.city, 80),
    service: clean(b.service, 120),
    plan: clean(b.plan, 120),
    subject: clean(b.subject, 120),
    organisation: clean(b.organisation, 150),
    preferredDate,
    preferredTime: clean(b.preferredTime, 60),
    message: clean(b.message, 2000),
    source: clean(b.source, 120),
    referrer: type === 'referral' ? { name: clean(b.referrerName, 100), phone: digits(b.referrerPhone) } : undefined,
    patientUser: req.user?.role === 'patient' ? req.user._id : undefined,
    timeline: [{ status: 'New', note: statusText('New') }],
  });

  const messages = {
    contact: 'Thanks for writing to us. Our team will get back to you within one working day.',
    partner: 'Thank you for your interest in partnering with Carevia. Our partnerships team will contact you soon.',
    referral: 'Thank you for the referral! Our care advisor will call your friend and share how Carevia can help.',
  };
  res.status(201).json({
    success: true,
    message: messages[type] || 'Request received! A Carevia care advisor will call you shortly.',
    enquiry: enquiry.toPublic(),
  });
});

// GET /api/enquiries/track?code=ENQ-50101&phone=9876543210  (public – both must match)
export const trackEnquiry = asyncHandler(async (req, res) => {
  const code = String(req.query.code || '').trim().toUpperCase();
  const phone = digits(req.query.phone);
  if (!code || phone.length < 10) throw new ApiError(400, 'Enter your request ID and the mobile number you used');
  const enquiry = await Enquiry.findOne({ code });
  if (!enquiry || digits(enquiry.phone) !== phone) throw new ApiError(404, 'No request found with that ID and mobile number');
  res.json({ success: true, enquiry: enquiry.toPublic() });
});

// GET /api/enquiries/mine  (logged-in patient – linked by account or phone number)
export const myEnquiries = asyncHandler(async (req, res) => {
  const or = [{ patientUser: req.user._id }];
  if (digits(req.user.phone).length === 10) or.push({ phone: { $regex: `${digits(req.user.phone)}$` } });
  const list = await Enquiry.find({ $or: or }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, enquiries: list.map((e) => e.toPublic()) });
});

// PATCH /api/enquiries/:id/cancel  (owner – patient account, or code+phone for guests)
export const cancelEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id).catch(() => null);
  if (!enquiry) throw new ApiError(404, 'Request not found');
  const ownsByAccount = req.user && enquiry.patientUser && enquiry.patientUser.equals(req.user._id);
  const ownsByPhone = (req.user && digits(req.user.phone).length === 10 && digits(req.user.phone) === digits(enquiry.phone))
    || (req.body?.phone && digits(req.body.phone) === digits(enquiry.phone));
  if (!ownsByAccount && !ownsByPhone && req.user?.role !== 'admin') throw new ApiError(403, 'You cannot cancel this request');
  if (['Converted', 'Closed'].includes(enquiry.status)) throw new ApiError(400, `This request is already ${enquiry.status.toLowerCase()}`);
  enquiry.status = 'Closed';
  enquiry.closedReason = 'Cancelled by customer';
  enquiry.timeline.push({ status: 'Closed', note: 'You cancelled this request.' });
  await enquiry.save();
  res.json({ success: true, message: 'Request cancelled', enquiry: enquiry.toPublic() });
});

// GET /api/enquiries?status=&type=&q=  (admin)
export const listEnquiries = asyncHandler(async (req, res) => {
  const filter = {};
  if (ENQUIRY_STATUSES.includes(req.query.status)) filter.status = req.query.status;
  if (ENQUIRY_TYPES.includes(req.query.type)) filter.type = req.query.type;
  let list = await Enquiry.find(filter).sort({ createdAt: -1 }).limit(1000);
  if (req.query.q) {
    const q = String(req.query.q).toLowerCase();
    list = list.filter((e) => [e.code, e.name, e.phone, e.email, e.city, e.service, e.organisation, e.referrer?.name, e.referrer?.phone].join(' ').toLowerCase().includes(q));
  }
  const all = await Enquiry.find().select('status type createdAt').lean();
  const counts = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, all.filter((e) => e.status === s).length]));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  res.json({ success: true, enquiries: list, counts: { ...counts, total: all.length, today: all.filter((e) => e.createdAt >= today).length } });
});

// GET /api/enquiries/:id  (admin)
export const getEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id).catch(() => null);
  if (!enquiry) throw new ApiError(404, 'Request not found');
  res.json({ success: true, enquiry });
});

// PATCH /api/enquiries/:id  { status, note, publicNote, providerId, appointmentCode, followUpAt, closedReason }  (admin)
export const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id).catch(() => null);
  if (!enquiry) throw new ApiError(404, 'Request not found');
  const b = req.body || {};
  const by = req.user?.name || 'Admin';

  if (b.providerId !== undefined) {
    if (!b.providerId) {
      enquiry.provider = undefined;
      enquiry.providerName = undefined;
    } else {
      const provider = await Provider.findById(b.providerId).catch(() => null);
      if (!provider) throw new ApiError(404, 'Provider not found');
      enquiry.provider = provider._id;
      enquiry.providerName = provider.name;
      enquiry.notes.push({ text: `Assigned to ${provider.name}`, by });
    }
  }

  if (b.appointmentCode !== undefined) {
    const code = String(b.appointmentCode || '').trim().toUpperCase();
    if (code) {
      const appt = await Appointment.findOne({ code });
      if (!appt) throw new ApiError(404, `No appointment found with ID ${code}`);
      enquiry.appointment = appt._id;
      enquiry.appointmentCode = appt.code;
      if (!b.status && !['Converted', 'Closed'].includes(enquiry.status)) b.status = 'Converted';
    } else {
      enquiry.appointment = undefined;
      enquiry.appointmentCode = undefined;
    }
  }

  if (b.followUpAt !== undefined) enquiry.followUpAt = b.followUpAt ? new Date(b.followUpAt) : undefined;

  if (b.status && b.status !== enquiry.status) {
    if (!ENQUIRY_STATUSES.includes(b.status)) throw new ApiError(400, 'Invalid status');
    enquiry.status = b.status;
    if (b.status === 'Closed') enquiry.closedReason = clean(b.closedReason, 200) || enquiry.closedReason || 'Closed by Carevia';
    const extra = b.status === 'Converted' && enquiry.appointmentCode ? ` Appointment ID: ${enquiry.appointmentCode}.` : '';
    enquiry.timeline.push({ status: b.status, note: (clean(b.publicNote, 300) || statusText(b.status)) + extra });
  } else if (clean(b.publicNote, 300)) {
    enquiry.timeline.push({ status: enquiry.status, note: clean(b.publicNote, 300) });
  }

  if (clean(b.note, 1000)) enquiry.notes.push({ text: clean(b.note, 1000), by });

  await enquiry.save();
  res.json({ success: true, enquiry });
});
