import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, User, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './MobileBottomNav.css';

export default function MobileBottomNav({ active }) {
  const { patient } = useApp();
  const location = useLocation();

  const current = active || (
    location.pathname === '/'             ? 'home'     :
    location.pathname === '/my-bookings'  ? 'bookings' :
    location.pathname === '/profile'      ? 'profile'  : ''
  );

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <Link
        to="/"
        id="mnav-home"
        className={`mnav-item ${current === 'home' ? 'mnav-item--active' : ''}`}
      >
        <div className="mnav-icon"><Home size={22} /></div>
        <span className="mnav-label">Home</span>
      </Link>

      <Link
        to="/my-bookings"
        id="mnav-bookings"
        className={`mnav-item ${current === 'bookings' ? 'mnav-item--active' : ''}`}
      >
        <div className="mnav-icon"><CalendarDays size={22} /></div>
        <span className="mnav-label">Bookings</span>
      </Link>

      <Link
        to={patient ? '/profile' : '/login'}
        id="mnav-profile"
        className={`mnav-item ${current === 'profile' ? 'mnav-item--active' : ''}`}
      >
        {patient ? (
          <div className="mnav-avatar">{patient.name?.charAt(0)?.toUpperCase()}</div>
        ) : (
          <div className="mnav-icon"><User size={22} /></div>
        )}
        <span className="mnav-label">{patient ? 'Profile' : 'Sign In'}</span>
        {!patient && <div className="mnav-dot" aria-hidden="true" />}
      </Link>
    </nav>
  );
}
