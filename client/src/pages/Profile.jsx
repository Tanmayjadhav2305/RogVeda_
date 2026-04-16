import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Wallet, Globe, LogOut, ChevronRight,
  TrendingDown, ShieldCheck, Edit3
} from 'lucide-react';
import { useApp, CURRENCY_SYMBOLS } from '../context/AppContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import './Profile.css';

export default function Profile() {
  const { patient, logout } = useApp();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    if (!patient) { navigate('/login', { state: { from: '/profile' } }); return; }
    fetchTransactions();
  }, [patient]);

  async function fetchTransactions() {
    try {
      const token = localStorage.getItem('patient_token');
      const res = await API.get('/api/patients/me/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data.data);
    } catch { /* silent */ }
    finally { setTxLoading(false); }
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const isNegative = patient?.walletBalance < 0;

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-main container">

        {/* Avatar + Name */}
        <motion.div
          className="profile-hero card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="profile-avatar">
            {patient?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{patient?.name}</h1>
            <p className="profile-email">{patient?.email}</p>
            <div className="profile-tags">
              {patient?.nationality && (
                <span className="profile-tag">
                  <Globe size={12} /> {patient.nationality}
                </span>
              )}
              <span className="profile-tag profile-tag--verified">
                <ShieldCheck size={12} /> Verified Patient
              </span>
            </div>
          </div>
        </motion.div>

        {/* Wallet Card */}
        <motion.div
          className={`wallet-card card ${isNegative ? 'wallet-card--negative' : ''}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
        >
          <div className="wallet-card__header">
            <div className="wallet-card__label">
              <Wallet size={16} /> Wallet Balance
            </div>
            {isNegative && (
              <span className="wallet-card__bnpl">BNPL Active — Pay on Arrival</span>
            )}
          </div>
          <div className="wallet-card__balance">
            {CURRENCY_SYMBOLS.USD}{Math.abs(patient?.walletBalance ?? 0).toLocaleString()}
            {isNegative && <span className="wallet-card__negative-label"> owed</span>}
          </div>
          <div className="wallet-card__sub">
            {isNegative
              ? 'Your balance will be settled at the hospital on arrival.'
              : 'Available for your next booking via BNPL.'}
          </div>
        </motion.div>

        {/* Menu Links */}
        <motion.div
          className="profile-menu card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4 }}
        >
          <Link to="/my-bookings" className="profile-menu-item" id="profile-bookings-link">
            <div className="profile-menu-item__left">
              <div className="profile-menu-icon profile-menu-icon--blue">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="profile-menu-label">My Bookings</p>
                <p className="profile-menu-sub">View all procedures booked</p>
              </div>
            </div>
            <ChevronRight size={16} className="profile-menu-arrow" />
          </Link>

          <div className="profile-menu-divider" />

          <Link to="/" className="profile-menu-item" id="profile-search-link">
            <div className="profile-menu-item__left">
              <div className="profile-menu-icon profile-menu-icon--green">
                <Globe size={18} />
              </div>
              <div>
                <p className="profile-menu-label">Browse Hospitals</p>
                <p className="profile-menu-sub">Search and compare procedures</p>
              </div>
            </div>
            <ChevronRight size={16} className="profile-menu-arrow" />
          </Link>
        </motion.div>

        {/* Transaction History */}
        {!txLoading && transactions.length > 0 && (
          <motion.div
            className="profile-transactions card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="profile-section-title">Wallet History</h2>
            <div className="tx-list">
              {transactions.map((tx, i) => (
                <div key={tx._id || i} className="tx-item">
                  <div className="tx-item__icon">
                    <TrendingDown size={14} />
                  </div>
                  <div className="tx-item__info">
                    <p className="tx-item__desc">{tx.description || 'Booking payment'}</p>
                    <p className="tx-item__date">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`tx-item__amount ${tx.type === 'debit' ? 'tx--debit' : 'tx--credit'}`}>
                    {tx.type === 'debit' ? '−' : '+'}{CURRENCY_SYMBOLS.USD}{Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Logout */}
        <motion.button
          id="patient-logout-btn"
          className="btn btn--ghost profile-logout"
          onClick={handleLogout}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <LogOut size={16} /> Sign Out
        </motion.button>

      </main>
      <MobileBottomNav active="profile" />
    </div>
  );
}
