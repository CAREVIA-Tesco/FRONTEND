const fs = require('fs');

let content = fs.readFileSync('src/admin/components/layout/Sidebar.tsx', 'utf8');

// Prepend /admin to all hrefs
content = content.replace(/href: "\/"/g, 'href: "/admin"');
content = content.replace(/href: "\/([a-z]+)"/g, 'href: "/admin/$1"');
content = content.replace(/to="\/settings"/g, 'to="/admin/settings"');

fs.writeFileSync('src/admin/components/layout/Sidebar.tsx', content);
console.log('Fixed sidebar routes');
