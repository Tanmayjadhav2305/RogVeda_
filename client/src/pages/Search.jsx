import { useEffect, useState } from 'react';
import { Search as SearchIcon, MapPin, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import HospitalCard from '../components/HospitalCard';
import TrustBadges from '../components/TrustBadges';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MobileBottomNav from '../components/MobileBottomNav';
import API from '../services/api';
import './Search.css';

export default function Search() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHospitals() {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get('/hospitals');
        setHospitals(res.data?.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load hospitals. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchHospitals();
  }, []);

  return (
    <div className="search-page">
      <Navbar />

      {/* Hero Section */}
      <section className="search-hero">
        <div className="search-hero__glow" />
        <div className="container search-hero__inner">
          <motion.div
            className="search-hero__content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-eyebrow">
              <Stethoscope size={14} />
              <span>Medical Travel Platform</span>
            </div>
            <h1 className="search-hero__title">
              World-Class Care,<br />
              <span className="highlight">Right Price</span>
            </h1>
            <p className="search-hero__subtitle">
              Compare top hospitals in India for your treatment. Transparent pricing,
              JCI-certified facilities, and full concierge support.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            className="search-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="search-bar__input-wrap">
              <SearchIcon size={18} className="search-bar__icon" />
              <span className="search-bar__text">Total Knee Replacement</span>
            </div>
            <div className="search-bar__location">
              <MapPin size={16} />
              <span>Delhi, India</span>
            </div>
            <button className="btn btn--primary search-bar__btn" id="search-submit-btn">
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Results Section */}
      <section className="search-results">
        <div className="container">
          <div className="results-header">
            <div>
              <h2 className="results-title">
                {loading ? 'Loading results…' : `${hospitals?.length || 0} hospitals found`}
              </h2>
              <p className="results-subtitle">Total Knee Replacement · Delhi, India</p>
            </div>
          </div>

          {loading && <LoadingSkeleton count={3} />}

          {!loading && error && (
            <div className="empty-state">
              <div className="empty-state__icon">⚠️</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button className="btn btn--primary" id="retry-btn" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (!hospitals || hospitals.length === 0) && (
            <div className="empty-state">
              <div className="empty-state__icon">🏥</div>
              <h3>No hospitals found</h3>
              <p>We could not find any hospitals. Please make sure the backend is seeded.</p>
            </div>
          )}

          {!loading && !error && hospitals && hospitals.length > 0 && (
            <div className="results-list">
              {hospitals.map((hospital, i) => (
                <HospitalCard key={hospital._id} hospital={hospital} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="search-footer">
        <div className="container">
          <p>© 2024 Rogveda Medical Travel · All rights reserved</p>
          <p className="footer-note">Prices shown are all-inclusive package estimates in USD. Actual costs may vary.</p>
        </div>
      </footer>

      {/* Mobile bottom nav — only visible on phones */}
      <MobileBottomNav active="home" />
    </div>
  );
}
