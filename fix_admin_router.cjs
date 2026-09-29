const fs = require('fs');

let content = fs.readFileSync('src/admin/App.tsx', 'utf8');

// Remove BrowserRouter wrappers
content = content.replace('<BrowserRouter>', '');
content = content.replace('</BrowserRouter>', '');

// We can just export the Routes block, or even better, a functional component returning Routes.
// Wait, the paths in src/admin/App.tsx are relative to "/" (e.g. `path="/"`, `path="patients"`).
// Since we want to mount this at `/admin/*`, we should just return the `<Routes>` directly!
// BUT if we mount it at `/admin/*` in the parent, the child routes should not have leading slashes, which they don't!
// So just removing BrowserRouter is enough.

fs.writeFileSync('src/admin/App.tsx', content);
console.log('Fixed nested BrowserRouter in src/admin/App.tsx');
