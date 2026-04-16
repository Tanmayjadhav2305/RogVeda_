const express = require('express');
const router = express.Router();
const { Booking, Patient, WalletTransaction } = require('../models');

/**
 * POST /api/bookings
 * Creates a booking, deducts from wallet (BNPL - allows negative balance),
 * creates a wallet transaction, and adds vendor tasks.
 */
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      hospitalId,
      hospitalName,
      doctorId,
      doctorName,
      roomType,
      priceUSD,
    } = req.body;

    // Validate required fields
    if (!patientId || !hospitalId || !doctorId || !roomType || !priceUSD) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking fields: patientId, hospitalId, doctorId, roomType, priceUSD',
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // BNPL logic: deduct from wallet regardless of current balance (allow negative)
    const previousBalance = patient.walletBalance;
    patient.walletBalance = previousBalance - priceUSD;
    await patient.save();

    // Create booking with default vendor task
    const booking = await Booking.create({
      patientId,
      patientName: patientName || patient.name,
      hospitalId,
      hospitalName,
      doctorId,
      doctorName,
      roomType,
      priceUSD,
      status: 'Confirmed',
      tasks: [
        { label: 'Visa Invitation Letter Sent', completed: false },
        { label: 'Pre-Surgery Assessment Scheduled', completed: false },
        { label: 'Airport Transfer Arranged', completed: false },
      ],
    });

    // Create wallet transaction record
    await WalletTransaction.create({
      patientId,
      bookingId: booking._id,
      amount: -priceUSD,
      type: 'debit',
      description: `Booking ${booking.bookingReference} - ${hospitalName} (BNPL)`,
    });

    res.status(201).json({
      success: true,
      data: {
        booking: {
          _id: booking._id,
          bookingReference: booking.bookingReference,
          hospitalName: booking.hospitalName,
          doctorName: booking.doctorName,
          roomType: booking.roomType,
          priceUSD: booking.priceUSD,
          status: booking.status,
          createdAt: booking.createdAt,
        },
        wallet: {
          previousBalance,
          newBalance: patient.walletBalance,
          deducted: priceUSD,
        },
      },
    });
  } catch (err) {
    console.error('POST /api/bookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to create booking. Please try again.' });
  }
});

/**
 * GET /api/bookings/patient/:patientId
 * Returns booking history for a patient.
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const bookings = await Booking.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

module.exports = router;
