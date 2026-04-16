import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, HeartPulse, ArrowLeft } from 'lucide-react';
import API from '../services/api';
import { useApp } from '../context/AppContext';
import './PatientAuth.css';

export default function PatientLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setPatient } = useApp();
  const from = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/api/patients/login', { email, password });
      const { token, patient } = res.data.data;
      localStorage.setItem('patient_token', token);
      setPatient(patient);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pauth-page">
      <div className="pauth-bg" />
      <motion.div
        className="pauth-card card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Back */}
        <Link to="/" className="pauth-back" id="patient-login-back">
          <ArrowLeft size={16} /> Back to Search
        </Link>

        {/* Logo */}
        <div className="pauth-logo">
          <div className="pauth-logo__mark"><HeartPulse size={20} /></div>
          <span>Rogveda</span>
        </div>

        <div className="pauth-header">
          <h1 className="pauth-title">Welcome back</h1>
          <p className="pauth-subtitle">Sign in to access your wallet and bookings</p>
        </div>

        <form id="patient-login-form" onSubmit={handleSubmit} className="pauth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="patient-email">Email address</label>
            <input
              id="patient-email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="patient-password">Password</label>
            <div className="pauth-pass-wrap">
              <input
                id="patient-password"
                type={showPass ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button type="button" className="pauth-toggle" onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide' : 'Show'}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div className="alert alert--warning">{error}</div>}

          <button id="patient-login-submit" type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="pauth-switch">
          Don't have an account?{' '}
          <Link to="/register" id="go-register-link" className="pauth-link">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
