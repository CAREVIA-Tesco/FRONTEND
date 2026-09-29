const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.jsx', 'utf8');

const oldRouting = `{role === 'doctor' ? (
                    <Link to="/doctor/dashboard" className="block text-center w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5">
                      Login
                    </Link>
                  ) : (
                    <Link to="/patient/dashboard" className="block text-center w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5">
                      Login
                    </Link>
                  )}`;

const newRouting = `<Link 
                    to={role === 'admin' ? '/admin/dashboard' : (role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')} 
                    className="block text-center w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
                  >
                    Login
                  </Link>`;

if (content.includes(oldRouting)) {
  content = content.replace(oldRouting, newRouting);
  fs.writeFileSync('src/pages/Login.jsx', content);
  console.log('Fixed login routing');
} else {
  console.log('Failed to find login routing block');
}
