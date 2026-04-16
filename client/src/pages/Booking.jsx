import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, UserRound, BedDouble, DollarSign,
  Wallet, ShieldCheck, Lock, ArrowLeft, ChevronRight, LogIn
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import API from '../services/api';
import './Booking.css';

export default function Booking() {
  const { pendingBooking, patient, updateWallet, formatPrice } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(patient ? 'confirm' : 'auth');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    if (!pendingBooking) navigate('/', { replace: true });
  }, []);

  // ── Step 2: Confirm Booking ───────────────────────────────
  async function handleConfirm() {
    if (!patient || !pendingBooking) return;
    setBookingLoading(true);
    setBookingError('');
    try {
      const token = localStorage.getItem('patient_token');
      const res = await API.post('/api/bookings', {
        patientId: patient.patientId,
        patientName: patient.name,
        hospitalId: pendingBooking.hospitalId,
        hospitalName: pendingBooking.hospitalName,
        doctorId: pendingBooking.doctorId,
        doctorName: pendingBooking.doctorName,
        roomType: pendingBooking.roomType,
        priceUSD: pendingBooking.priceUSD,
      }, token ? { headers: { Authorization: `Bearer ${token}` } } : {});

      const { booking, wallet } = res.data.data;
      updateWallet(wallet.newBalance);
      navigate('/booking/success', { state: { booking, wallet } });
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  }

  if (!pendingBooking) return null;

  const walletBal = patient?.walletBalance ?? 0;
  const newBalancePreview = walletBal - pendingBooking.priceUSD;

  return (
    <div className="booking-page">
      <Navbar />

      <main className="booking-main container">
        <button className="btn btn--ghost btn--sm booking-back" id="back-to-search" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Search
        </button>

        <div className="booking-grid">
          {/* ── Left: Summary Card ─────────────────────────── */}
          <motion.div
            className="booking-summary card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="booking-summary__header">
              <h2 className="booking-summary__title">Booking Summary</h2>
              <span className="badge badge--confirmed">Pending</span>
            </div>

            <div className="booking-detail">
              <div className="booking-detail__row">
                <Building2 size={16} className="detail-icon" />
                <div>
                  <p className="detail-label">Hospital</p>
                  <p className="detail-value">{pendingBooking.hospitalName}</p>
                </div>
              </div>
              <div className="booking-detail__row">
                <UserRound size={16} className="detail-icon" />
                <div>
                  <p className="detail-label">Surgeon</p>
                  <p className="detail-value">{pendingBooking.doctorName}</p>
                  {pendingBooking.doctorExp && <p className="detail-sub">{pendingBooking.doctorExp} yrs experience</p>}
                </div>
              </div>
              <div className="booking-detail__row">
                <BedDouble size={16} className="detail-icon" />
                <div>
                  <p className="detail-label">Room Type</p>
                  <p className="detail-value">{pendingBooking.roomType}</p>
                </div>
              </div>
              <div className="booking-detail__row">
                <DollarSign size={16} className="detail-icon" />
                <div>
                  <p className="detail-label">Procedure Cost</p>
                  <p className="detail-value detail-value--price">{formatPrice(pendingBooking.priceUSD)}</p>
                  <p className="detail-sub">All-inclusive · Tax included</p>
                </div>
              </div>
            </div>

            {pendingBooking.accreditations?.length > 0 && (
              <div className="booking-accreditations">
                {pendingBooking.accreditations.includes('NABH') && (
                  <span className="badge badge--nabh"><ShieldCheck size={10} /> NABH</span>
                )}
                {pendingBooking.accreditations.includes('JCI') && (
                  <span className="badge badge--jci"><ShieldCheck size={10} /> JCI</span>
                )}
              </div>
            )}

            <div className="alert alert--info bnpl-banner">
              <Wallet size={18} />
              <div>
                <p className="bnpl-title">Book Now, Pay Later</p>
                <p>Wallet: <strong>${walletBal.toFixed(0)}</strong> → after booking: <strong className={newBalancePreview < 0 ? 'text-danger' : ''}>${newBalancePreview.toFixed(0)}</strong>. Settle on arrival.</p>
              </div>
            </div>

            <div className="secure-notice">
              <Lock size={12} />
              <span>Your information is encrypted and secure</span>
            </div>
          </motion.div>

          {/* ── Right: Auth / Confirm Flow ─────────────────── */}
          <motion.div
            className="booking-action"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatePresence mode="wait">
              {/* If not logged in — prompt to sign in */}
              {step === 'auth' && (
                <motion.div
                  key="auth"
                  className="auth-panel card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="auth-panel__title">Sign in to continue</h3>
                  <p className="auth-panel__subtitle">
                    Your account holds your wallet balance. Sign in to use BNPL and confirm this booking.
                  </p>

                  <div className="auth-actions">
                    <Link
                      to="/login"
                      state={{ from: '/booking' }}
                      className="btn btn--primary btn--full"
                      id="auth-login-btn"
                    >
                      <LogIn size={16} /> Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn--ghost btn--full"
                      id="auth-register-btn"
                    >
                      Create Free Account
                    </Link>
                  </div>

                  <p className="auth-note">
                    New accounts get <strong>$500 wallet credit</strong> — enough for BNPL on most procedures.
                  </p>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  className="confirm-panel card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="confirm-panel__title">
                    Hello, {patient?.name?.split(' ')[0]}! 👋
                  </h3>
                  <p className="confirm-panel__subtitle">
                    Review your booking and confirm to proceed.
                  </p>

                  <div className="wallet-preview">
                    <div className="wallet-preview__row">
                      <span>Current balance</span>
                      <strong>${walletBal.toFixed(0)}</strong>
                    </div>
                    <div className="wallet-preview__row">
                      <span>Procedure cost</span>
                      <strong className="text-danger">−${pendingBooking.priceUSD.toLocaleString()}</strong>
                    </div>
                    <div className="wallet-preview__divider" />
                    <div className="wallet-preview__row wallet-preview__row--total">
                      <span>Balance after</span>
                      <strong className={newBalancePreview < 0 ? 'text-danger' : 'text-success'}>
                        ${newBalancePreview.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="coordinator-note">
                    <span>🧑‍⚕️</span>
                    <p>Your care coordinator will contact you within 2 hours to arrange everything including your visa invitation.</p>
                  </div>

                  {bookingError && (
                    <div className="alert alert--warning" role="alert">{bookingError}</div>
                  )}

                  <button
                    id="confirm-booking-btn"
                    className="btn btn--primary btn--full"
                    onClick={handleConfirm}
                    disabled={bookingLoading}
                  >
                    {bookingLoading
                      ? <><span className="spinner" /> Confirming…</>
                      : <>Confirm Booking <ChevronRight size={16} /></>
                    }
                  </button>

                  <button
                    className="btn btn--ghost btn--full"
                    id="change-details-btn"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => navigate('/')}
                  >
                    Change selection
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
