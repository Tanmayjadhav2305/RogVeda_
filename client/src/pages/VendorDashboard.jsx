import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle2, Circle, Building2, Users, DollarSign, Activity
} from 'lucide-react';
import API from '../services/api';
import './VendorDashboard.css';

function StatusBadge({ status }) {
  const cls = {
    Confirmed:   'badge--confirmed',
    'In Progress': 'badge--progress',
    Completed:   'badge--completed',
  }[status] || 'badge--status';
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function VendorDashboard() {
  const navigate = useNavigate();
  const vendorName = localStorage.getItem('vendor_name') || 'Vendor';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingTask, setUpdatingTask] = useState(null);  // { bookingId, taskIndex }

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/api/vendor/bookings');
      setBookings(res.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('vendor_token');
        navigate('/vendor/login', { replace: true });
      } else {
        setError('Failed to load bookings. Please try refreshing.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  function handleLogout() {
    localStorage.removeItem('vendor_token');
    localStorage.removeItem('vendor_name');
    navigate('/vendor/login', { replace: true });
  }

  async function handleCompleteTask(bookingId, taskIndex) {
    setUpdatingTask({ bookingId, taskIndex });
    try {
      const res = await API.patch(`/api/vendor/tasks/${bookingId}`, { taskIndex });
      const { tasks, status } = res.data.data;
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, tasks, status } : b
        )
      );
    } catch (err) {
      alert('Failed to update task. Please try again.');
    } finally {
      setUpdatingTask(null);
    }
  }

  // Stats
  const stats = {
    total:      bookings.length,
    confirmed:  bookings.filter(b => b.status === 'Confirmed').length,
    inProgress: bookings.filter(b => b.status === 'In Progress').length,
    completed:  bookings.filter(b => b.status === 'Completed').length,
    revenue:    bookings.reduce((s, b) => s + (b.priceUSD || 0), 0),
  };

  return (
    <div className="vdash-page">
      {/* Sidebar */}
      <aside className="vdash-sidebar">
        <div className="vdash-logo">
          <div className="vdash-logo__mark">R</div>
          <span>ogveda</span>
        </div>
        <nav className="vdash-nav">
          <div className="vdash-nav-item active">
            <Activity size={18} />
            <span>Bookings</span>
          </div>
        </nav>
        <div className="vdash-sidebar__footer">
          <div className="vdash-user">
            <div className="vdash-user__avatar">
              {vendorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="vdash-user__name">{vendorName}</p>
              <p className="vdash-user__role">Vendor Account</p>
            </div>
          </div>
          <button
            className="btn btn--ghost btn--sm vdash-logout"
            id="vendor-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Mobile top bar (sidebar hidden on mobile) */}
      <div className="vdash-mobile-bar">
        <div className="vdash-logo">
          <div className="vdash-logo__mark">R</div>
          <span>ogveda Vendor</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="btn btn--ghost btn--sm"
            onClick={fetchBookings}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
          </button>
          <button
            className="btn btn--ghost btn--sm"
            id="vendor-logout-btn-mobile"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="vdash-main">
        {/* Header */}
        <div className="vdash-header">
          <div>
            <h1 className="vdash-title">Booking Dashboard</h1>
            <p className="vdash-subtitle">Manage patient bookings and update task status</p>
          </div>
          <button
            className="btn btn--ghost btn--sm"
            id="refresh-bookings-btn"
            onClick={fetchBookings}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="vdash-stats">
          <div className="stat-card">
            <div className="stat-icon stat-icon--blue"><Users size={20} /></div>
            <div>
              <p className="stat-value">{stats.total}</p>
              <p className="stat-label">Total Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--green"><CheckCircle2 size={20} /></div>
            <div>
              <p className="stat-value">{stats.confirmed}</p>
              <p className="stat-label">Confirmed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--amber"><Activity size={20} /></div>
            <div>
              <p className="stat-value">{stats.inProgress}</p>
              <p className="stat-label">In Progress</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--violet"><DollarSign size={20} /></div>
            <div>
              <p className="stat-value">${stats.revenue.toLocaleString()}</p>
              <p className="stat-label">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="alert alert--warning">{error}</div>}

        {/* Loading */}
        {loading && (
          <div className="vdash-loading">
            <span className="spinner" />
            <p>Loading bookings…</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <h3>No bookings yet</h3>
            <p>Patient bookings will appear here once they are made through the platform.</p>
          </div>
        )}

        {/* Bookings Table */}
        {!loading && bookings.length > 0 && (
          <div className="vdash-bookings">
            <div className="booking-table-header">
              <span>Patient</span>
              <span>Hospital</span>
              <span>Doctor</span>
              <span>Room</span>
              <span>Amount</span>
              <span>Status</span>
              <span></span>
            </div>

            <div className="booking-rows">
              {bookings.map((b, i) => (
                <motion.div
                  key={b._id}
                  className="booking-row-wrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {/* Main Row */}
                  <div
                    className={`booking-row ${expandedId === b._id ? 'expanded' : ''}`}
                    onClick={() => setExpandedId(expandedId === b._id ? null : b._id)}
                    role="button"
                    id={`booking-row-${b._id}`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setExpandedId(expandedId === b._id ? null : b._id)}
                  >
                    <div className="booking-row__patient">
                      <div className="patient-avatar">{b.patientName?.charAt(0) || '?'}</div>
                      <span>{b.patientName || 'Anonymous'}</span>
                    </div>
                    <div className="booking-row__cell">
                      <Building2 size={13} className="cell-icon" />
                      {b.hospitalName}
                    </div>
                    <div className="booking-row__cell">{b.doctorName}</div>
                    <div className="booking-row__cell">{b.roomType}</div>
                    <div className="booking-row__cell booking-row__price">
                      ${b.priceUSD?.toLocaleString()}
                    </div>
                    <div className="booking-row__cell">
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="booking-row__expand">
                      {expandedId === b._id
                        ? <ChevronUp size={16} />
                        : <ChevronDown size={16} />
                      }
                    </div>
                  </div>

                  {/* Expanded Task Panel */}
                  <AnimatePresence>
                    {expandedId === b._id && (
                      <motion.div
                        className="task-panel"
                        key="tasks"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="task-panel__inner">
                          <p className="task-panel__title">Vendor Tasks</p>
                          <div className="task-list">
                            {b.tasks?.map((task, ti) => (
                              <div key={ti} className={`task-item ${task.completed ? 'task-item--done' : ''}`}>
                                <div className="task-item__left">
                                  {task.completed
                                    ? <CheckCircle2 size={18} className="task-icon task-icon--done" />
                                    : <Circle size={18} className="task-icon" />
                                  }
                                  <span className="task-label">{task.label}</span>
                                </div>
                                {!task.completed && (
                                  <button
                                    id={`complete-task-${b._id}-${ti}`}
                                    className="btn btn--sm btn--primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompleteTask(b._id, ti);
                                    }}
                                    disabled={updatingTask?.bookingId === b._id && updatingTask?.taskIndex === ti}
                                  >
                                    {updatingTask?.bookingId === b._id && updatingTask?.taskIndex === ti
                                      ? <><span className="spinner" /> Updating</>
                                      : 'Mark Complete'
                                    }
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="task-panel__meta">
                            <span>Ref: <strong>{b.bookingReference}</strong></span>
                            <span>Booked: {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
