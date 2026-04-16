import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, HeartPulse, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import './BookingSuccess.css';

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient } = useApp();

  const { booking, wallet } = location.state || {};

  useEffect(() => {
    if (!booking) navigate('/', { replace: true });
  }, []);

  if (!booking) return null;

  const isNegative = wallet?.newBalance < 0;

  return (
    <div className="success-page">
      <Navbar />

      <main className="success-main container">
        <motion.div
          className="success-card card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Animated Check */}
          <div className="success-icon-wrap">
            <div className="success-ring" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 size={64} className="success-icon" />
            </motion.div>
          </div>

          <motion.h1
            className="success-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            Booking Confirmed!
          </motion.h1>

          <motion.p
            className="success-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            Your journey to better health begins now. We'll be in touch within 2 hours.
          </motion.p>

          {/* Booking Reference */}
          <motion.div
            className="booking-ref-box"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="booking-ref-label">Booking Reference</p>
            <p className="booking-ref-code">{booking.bookingReference}</p>
          </motion.div>

          {/* Details Grid */}
          <motion.div
            className="success-details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="success-detail-item">
              <span className="detail-label">Hospital</span>
              <span className="detail-value">{booking.hospitalName}</span>
            </div>
            <div className="success-detail-item">
              <span className="detail-label">Doctor</span>
              <span className="detail-value">{booking.doctorName}</span>
            </div>
            <div className="success-detail-item">
              <span className="detail-label">Room</span>
              <span className="detail-value">{booking.roomType}</span>
            </div>
            <div className="success-detail-item">
              <span className="detail-label">Amount</span>
              <span className="detail-value">${booking.priceUSD.toLocaleString()}</span>
            </div>
            <div className="success-detail-item">
              <span className="detail-label">Status</span>
              <span className="badge badge--confirmed">{booking.status}</span>
            </div>
          </motion.div>

          {/* Wallet Section */}
          <motion.div
            className={`wallet-update ${isNegative ? 'wallet-update--negative' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <HeartPulse size={18} />
            <div>
              <p className="wallet-update__title">Wallet Balance Updated</p>
              <p className="wallet-update__balance">
                New balance: <strong>${wallet?.newBalance?.toFixed(0)}</strong>
                {isNegative && ' (Pay on arrival — BNPL active)'}
              </p>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            className="next-steps"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <p className="next-steps__title">What happens next?</p>
            <ol className="next-steps__list">
              <li>Your care coordinator will call you within 2 hours</li>
              <li>Visa invitation letter sent within 48 hours</li>
              <li>Airport transfer and accommodation assistance arranged</li>
            </ol>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="success-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link to="/" className="btn btn--primary" id="back-home-btn">
              <Home size={16} /> Back to Home
            </Link>
            <a href="tel:+911234567890" className="btn btn--ghost" id="contact-btn">
              <Phone size={16} /> Contact Coordinator
            </a>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
