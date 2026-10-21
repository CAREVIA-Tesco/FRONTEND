# Carevaa Frontend

React + Vite website for https://www.carevaa.com – public website, Book Now, patient dashboard, doctor dashboard and the admin panel (`/admin`).

```bash
npm install
npm run dev      # http://localhost:5173 (API calls go to http://localhost:5000)
npm run build    # production build in dist/ – talks to https://backend-roy6.onrender.com/api
```

| Path | Purpose |
|---|---|
| `index.html` | page shell, title, link-preview tags |
| `src/App.jsx` | all page addresses (routes) |
| `src/pages/` | website pages, login, dashboards, visit summary (PDF) |
| `src/components/` | shared parts: header, footer, Book Now, booking popup, dashboard layout |
| `src/admin/` | admin panel: `pages/`, `components/`, `lib/` |
| `src/data/services.js` | services shown on the site (managed in Admin → Services) |
| `src/services/api.js` | every call to the backend |
| `src/index.css` | theme colours (palettes chosen in Admin → Website Content), fonts, animations |
| `public/` | images and logo; `.htaccess`, `_redirects` and `../vercel.json` make deep links work on any host |
| `.env.production` | backend address used for the live build |

See `../README.md` for the whole project.
