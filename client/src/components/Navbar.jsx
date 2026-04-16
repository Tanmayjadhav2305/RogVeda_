import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, CURRENCY_SYMBOLS } from '../context/AppContext';
import CurrencyToggle from './CurrencyToggle';
import { Wallet, ChevronRight, Menu, X, LayoutDashboard, Search, User } from 'lucide-react';
import './Navbar.css';

// Premium SVG logo mark — heartbeat line forming an R
function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB"/>
          <stop offset="1" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lg1)"/>
      {/* Heartbeat pulse line */}
      <polyline points="4,18 8,18 10,12 12,22 14,10 16,20 18,18 28,18"
        stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9"/>
    </svg>
  );
}

export default function Navbar() {
  const { patient } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const walletBal = patient?.walletBalance ?? null;
  const isNegative = walletBal !== null && walletBal < 0;

  function closeMenu() { setMenuOpen(false); }

  return (
    <>
      <header className="navbar">
        <div className="container navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo" id="nav-logo" onClick={closeMenu}>
            <LogoMark />
            <span className="navbar__logo-text">Rogveda</span>
          </Link>

          {/* Desktop center nav */}
          <nav className="navbar__center hide-mobile" aria-label="Main navigation">
            <Link className="nav-link" to="/">Search</Link>
            <a className="nav-link" href="#">Treatments</a>
            <a className="nav-link" href="#">How it Works</a>
          </nav>

          {/* Desktop right */}
          <div className="navbar__right hide-mobile">
            <CurrencyToggle />
            {patient ? (
              <>
                <div className={`navbar__wallet ${isNegative ? 'negative' : ''}`} title="Wallet balance">
                  <Wallet size={14} />
                  <span>{CURRENCY_SYMBOLS['USD']}{walletBal.toFixed(0)}</span>
                </div>
                <Link to="/profile" className="navbar__avatar" id="nav-profile-btn" title={patient.name}>
                  {patient.name?.charAt(0)?.toUpperCase()}
                </Link>
              </>
            ) : (
              <Link to="/login" className="btn btn--ghost btn--sm" id="nav-login-btn">
                <User size={14} /> Sign In
              </Link>
            )}
            <button
              id="vendor-login-btn"
              className="btn btn--ghost btn--sm"
              onClick={() => navigate('/vendor/login')}
            >
              Vendor <ChevronRight size={14} />
            </button>
          </div>

          {/* Mobile right — wallet + hamburger */}
          <div className="navbar__mobile-right hide-desktop">
            {patient && (
              <div className={`navbar__wallet ${isNegative ? 'negative' : ''}`} title="Wallet balance">
                <Wallet size={13} />
                <span>{CURRENCY_SYMBOLS['USD']}{walletBal.toFixed(0)}</span>
              </div>
            )}
            <button
              className="navbar__hamburger"
              id="mobile-menu-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer" role="dialog" aria-label="Mobile navigation">
          <div className="mobile-drawer__overlay" onClick={closeMenu} />
          <nav className="mobile-drawer__panel">
            <div className="mobile-drawer__header">
              <span className="mobile-drawer__title">Menu</span>
              <button className="navbar__hamburger" onClick={closeMenu} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer__body">
              <Link to="/" className="mobile-nav-link" id="mobile-search-link" onClick={closeMenu}>
                <Search size={18} /> Search Hospitals
              </Link>
              {patient ? (
                <Link to="/profile" className="mobile-nav-link" id="mobile-profile-link" onClick={closeMenu}>
                  <User size={18} /> My Profile & Wallet
                </Link>
              ) : (
                <Link to="/login" className="mobile-nav-link" id="mobile-login-link" onClick={closeMenu}>
                  <User size={18} /> Sign In / Register
                </Link>
              )}
              <Link
                to="/vendor/login"
                className="mobile-nav-link"
                id="mobile-vendor-link"
                onClick={closeMenu}
              >
                <LayoutDashboard size={18} /> Vendor Dashboard
              </Link>
            </div>

            <div className="mobile-drawer__footer">
              <p className="mobile-drawer__label">Currency</p>
              <CurrencyToggle />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}


