const fs = require('fs');
const content = fs.readFileSync('src/pages/Login.jsx', 'utf8');
const match = content.match(/const handleSubmit = \(e\) => {[\s\S]*?};/);
if (match) console.log(match[0]);
