import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Building2, Activity, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import './MyBookings.css';

const STATUS_ICON = {
  Confirmed:    <Clock size={14} />,
  'In Progress': <Activity size={14} />,
  Completed:    <CheckCircle2 size={14} />,
};

export default function MyBookings() {
  const { patient } = useApp();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patient) { navigate('/login', { state: { from: '/my-bookings' } }); return; }
    fetchBookings();
  }, [patient]);

  async function fetchBookings() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('patient_token');
      const res = await API.get('/patients/me/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.data);
    } catch (err) {
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mybookings-page">
      <Navbar />
      <main className="mybookings-main container">
        {/* Header */}
        <div className="mybookings-header">
          <div>
            <h1 className="mybookings-title">My Bookings</h1>
            <p className="mybookings-sub">
              {patient?.name ? `Welcome, ${patient.name.split(' ')[0]}` : 'Your booking history'}
            </p>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={fetchBookings} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mybookings-loading">
            <span className="spinner" />
            <p>Loading your bookings…</p>
          </div>
        )}

        {/* Error */}
        {error && <div className="alert alert--warning">{error}</div>}

        {/* Empty */}
        {!loading && !error && bookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <h3>No bookings yet</h3>
            <p>When you book a procedure, it will show up here.</p>
            <Link to="/" className="btn btn--primary" id="browse-hospitals-btn">
              Browse Hospitals
            </Link>
          </div>
        )}

        {/* Cards */}
        {!loading && bookings.length > 0 && (
          <div className="bookings-grid">
            {bookings.map((b, i) => (
              <motion.div
                key={b._id}
                className="booking-card card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                {/* Top row */}
                <div className="bcard__top">
                  <div className="bcard__ref">{b.bookingReference}</div>
                  <span className={`badge badge--${b.status === 'Confirmed' ? 'confirmed' : b.status === 'In Progress' ? 'progress' : 'completed'}`}>
                    {STATUS_ICON[b.status]} {b.status}
                  </span>
                </div>

                {/* Hospital + Doctor */}
                <div className="bcard__hospital">
                  <Building2 size={16} className="bcard__icon" />
                  <div>
                    <p className="bcard__hospital-name">{b.hospitalName}</p>
                    <p className="bcard__doctor">{b.doctorName} · {b.roomType}</p>
                  </div>
                </div>

                {/* Price + Date */}
                <div className="bcard__footer">
                  <span className="bcard__price">${b.priceUSD?.toLocaleString()}</span>
                  <span className="bcard__date">
                    <Calendar size={12} />
                    {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <MobileBottomNav active="bookings" />
    </div>
  );
}
