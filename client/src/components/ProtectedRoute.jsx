import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('vendor_token');
  if (!token) return <Navigate to="/vendor/login" replace />;
  return children;
}
