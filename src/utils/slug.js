// Blog post URLs: /blog/<slug>
export const slugify = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const postSlug = (p) => p.slug || slugify(p.title);
