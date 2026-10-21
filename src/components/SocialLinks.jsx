import React from 'react';

// Social media icons for the footer – links come from Admin → Website Content → Contact details
const ICONS = {
  facebook: <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" />
    </>
  ),
  x: <path d="M17.8 3.5h3L14.3 11l7.7 9.5h-6l-4.7-5.8-5.4 5.8h-3l7-7.6L2.5 3.5h6.1l4.2 5.3 5-5.3zm-1 15.3h1.7L7.7 5.1H5.9l10.9 13.7z" />,
  linkedin: <path d="M4.5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3 9h3v11.5H3V9zm6 0h2.9v1.6h.1c.4-.8 1.4-1.8 3-1.8 3.2 0 3.8 2.1 3.8 4.8v6.9h-3v-6.1c0-1.5 0-3.3-2-3.3s-2.3 1.6-2.3 3.2v6.2H9V9z" />,
  youtube: <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />,
  whatsapp: <path d="M12 2.5a9.4 9.4 0 0 0-8.1 14.2L2.6 21.5l4.9-1.3A9.4 9.4 0 1 0 12 2.5zm0 17.1c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A7.7 7.7 0 1 1 12 19.6zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.3 6.3 0 0 1-3.1-2.7c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.5 1.5.6 2 .7 2.7.6.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1l-.4-.2z" />,
};
// each network in its own brand colour
const COLORS = {
  facebook: { background: '#1877F2' },
  instagram: { background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' },
  x: { background: '#000000' },
  linkedin: { background: '#0A66C2' },
  youtube: { background: '#FF0000' },
  whatsapp: { background: '#25D366' },
};
const LABELS = { facebook: 'Facebook', instagram: 'Instagram', x: 'X (Twitter)', linkedin: 'LinkedIn', youtube: 'YouTube', whatsapp: 'WhatsApp' };

export default function SocialLinks({ links = [], className = '' }) {
  if (!links.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2.5 ${className}`} aria-label="Carevaa on social media">
      {links.map(({ key, href }) => (
        <li key={key}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Carevaa on ${LABELS[key]}`} title={LABELS[key]}
            style={COLORS[key]}
            className="w-10 h-10 rounded-full ring-2 ring-white/15 flex items-center justify-center text-white shadow-md hover:-translate-y-1 hover:shadow-lg hover:ring-white/40 transition">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">{ICONS[key]}</svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
