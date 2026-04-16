import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, HeartPulse, ArrowLeft } from 'lucide-react';
import API from '../services/api';
import { useApp } from '../context/AppContext';
import './PatientAuth.css';

export default function PatientRegister() {
  const navigate = useNavigate();
  const { setPatient } = useApp();

  const [form, setForm] = useState({ name: '', email: '', password: '', nationality: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/patients/register', form);
      const { token, patient } = res.data.data;
      localStorage.setItem('patient_token', token);
      setPatient(patient);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <Link to="/" className="pauth-back" id="patient-register-back">
          <ArrowLeft size={16} /> Back to Search
        </Link>

        <div className="pauth-logo">
          <div className="pauth-logo__mark"><HeartPulse size={20} /></div>
          <span>Rogveda</span>
        </div>

        <div className="pauth-header">
          <h1 className="pauth-title">Create account</h1>
          <p className="pauth-subtitle">Start your medical travel journey with a free account</p>
        </div>

        {/* Wallet bonus chip */}
        <div className="pauth-bonus">
          🎁 New accounts start with <strong>$500 wallet credit</strong> — book today!
        </div>

        <form id="patient-register-form" onSubmit={handleSubmit} className="pauth-form">
          <div className="pauth-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" name="name" type="text" className="form-control"
                placeholder="Sarah Johnson" value={form.name} onChange={onChange} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-nationality">Nationality</label>
              <input id="reg-nationality" name="nationality" type="text" className="form-control"
                placeholder="United Kingdom" value={form.nationality} onChange={onChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input id="reg-email" name="email" type="email" className="form-control"
              placeholder="you@example.com" value={form.email} onChange={onChange}
              autoComplete="email" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="pauth-pass-wrap">
              <input id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                className="form-control" placeholder="Min. 6 characters"
                value={form.password} onChange={onChange} autoComplete="new-password" required />
              <button type="button" className="pauth-toggle" onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide' : 'Show'}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div className="alert alert--warning">{error}</div>}

          <button id="patient-register-submit" type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p className="pauth-switch">
          Already have an account?{' '}
          <Link to="/login" id="go-login-link" className="pauth-link">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
