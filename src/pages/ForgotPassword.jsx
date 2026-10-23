import { Navigate, useSearchParams } from 'react-router-dom';

// Old /forgot-password links: the reset form now lives inside the login card.
export default function ForgotPassword() {
  const [params] = useSearchParams();
  const phone = String(params.get('phone') || '').replace(/\D/g, '').slice(-10);
  return <Navigate to={`/login?forgot=1${phone ? `&phone=${phone}` : ''}`} replace />;
}
