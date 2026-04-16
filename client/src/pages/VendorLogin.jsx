import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import API from '../services/api';
import './VendorLogin.css';

export default function VendorLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/api/vendor/login', { username, password });
      const { token, vendor } = res.data.data;
      localStorage.setItem('vendor_token', token);
      localStorage.setItem('vendor_name', vendor.name);
      navigate('/vendor/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vlogin-page">
      <div className="vlogin-bg" />

      <motion.div
        className="vlogin-card card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Back to home */}
        <Link to="/" className="vlogin-back" id="vendor-login-back">
          <ArrowLeft size={15} /> Back to Search
        </Link>

        {/* Logo */}
        <div className="vlogin-logo">
          <div className="vlogin-logo__mark">R</div>
          <span>ogveda</span>
        </div>

        <div className="vlogin-header">
          <div className="vlogin-badge">
            <ShieldCheck size={14} />
            <span>Vendor Portal</span>
          </div>
          <h1 className="vlogin-title">Welcome back</h1>
          <p className="vlogin-subtitle">Sign in to manage your patient bookings</p>
        </div>

        <form id="vendor-login-form" onSubmit={handleLogin} className="vlogin-form">
          <div className="form-group">
            <label className="form-label" htmlFor="vendor-username">Username</label>
            <input
              id="vendor-username"
              type="text"
              className="form-control"
              placeholder="apollo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="vendor-password">Password</label>
            <div className="vlogin-pass-wrap">
              <input
                id="vendor-password"
                type={showPass ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="vlogin-pass-toggle"
                id="toggle-password"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert--warning" role="alert">{error}</div>
          )}

          <button
            id="vendor-login-submit"
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="vlogin-hint">
          Demo credentials: <code>apollo</code> / <code>apollo123</code>
        </p>
      </motion.div>
    </div>
  );
}
