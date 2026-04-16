const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Patient, Booking, WalletTransaction } = require('../models');

// ─── Helper: simple token (base64, demo-grade) ───────────────────────────────
function makeToken(patientId) {
  return Buffer.from(`patient:${patientId}:${Date.now()}`).toString('base64');
}

function parseToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts[0] === 'patient') return parts[1]; // patientId
    return null;
  } catch { return null; }
}

// Middleware: require patient token
function requirePatient(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  const patientId = parseToken(auth.replace('Bearer ', ''));
  if (!patientId) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
  req.patientId = patientId;
  next();
}

/**
 * POST /api/patients/register
 * Create a new patient account.
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, nationality, phone } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check duplicate email
    const existing = await Patient.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const patient = await Patient.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      nationality: nationality?.trim() || 'International',
      phone: phone?.trim() || '',
      walletBalance: 500,  // 🎁 Welcome credit — covers BNPL on most procedures
    });

    const token = makeToken(patient._id.toString());

    res.status(201).json({
      success: true,
      data: {
        token,
        patient: {
          patientId: patient._id,
          name: patient.name,
          email: patient.email,
          nationality: patient.nationality,
          walletBalance: patient.walletBalance,
        },
      },
    });
  } catch (err) {
    console.error('POST /api/patients/register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/patients/login
 * Authenticate a patient with email + password.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const patient = await Patient.findOne({ email: email.toLowerCase().trim() });
    if (!patient) {
      return res.status(401).json({ success: false, message: 'No account found with this email.' });
    }

    const valid = await bcrypt.compare(password, patient.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const token = makeToken(patient._id.toString());

    res.json({
      success: true,
      data: {
        token,
        patient: {
          patientId: patient._id,
          name: patient.name,
          email: patient.email,
          nationality: patient.nationality,
          walletBalance: patient.walletBalance,
        },
      },
    });
  } catch (err) {
    console.error('POST /api/patients/login error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

/**
 * GET /api/patients/me
 * Returns current patient profile + wallet balance.
 * Requires: Authorization: Bearer <token>
 */
router.get('/me', requirePatient, async (req, res) => {
  try {
    const patient = await Patient.findById(req.patientId).lean();
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    res.json({
      success: true,
      data: {
        patientId: patient._id,
        name: patient.name,
        email: patient.email,
        nationality: patient.nationality,
        phone: patient.phone,
        walletBalance: patient.walletBalance,
        createdAt: patient.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
});

/**
 * GET /api/patients/me/bookings
 * Returns all bookings for the logged-in patient.
 */
router.get('/me/bookings', requirePatient, async (req, res) => {
  try {
    const bookings = await Booking.find({ patientId: req.patientId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

/**
 * GET /api/patients/me/transactions
 * Returns wallet transaction history.
 */
router.get('/me/transactions', requirePatient, async (req, res) => {
  try {
    const txns = await WalletTransaction.find({ patientId: req.patientId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: txns });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
});

/**
 * GET /api/patients/:patientId/wallet  (legacy — kept for backward compat)
 */
router.get('/:patientId/wallet', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).lean();
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    res.json({ success: true, data: { walletBalance: patient.walletBalance } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet.' });
  }
});

module.exports = router;
