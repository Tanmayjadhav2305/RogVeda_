const express = require('express');
const router = express.Router();
const { Booking } = require('../models');

const VENDOR_USERNAME = process.env.VENDOR_USERNAME || 'apollo';
const VENDOR_PASSWORD = process.env.VENDOR_PASSWORD || 'apollo123';

/**
 * POST /api/vendor/login
 * Hardcoded vendor auth. Returns a session token (simple approach).
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  if (username === VENDOR_USERNAME && password === VENDOR_PASSWORD) {
    // Simple token (not JWT for simplicity, just a recognizable string)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    return res.json({
      success: true,
      data: { token, vendor: { name: 'Apollo Vendor', username } },
    });
  }

  res.status(401).json({ success: false, message: 'Invalid username or password.' });
});

/**
 * GET /api/vendor/bookings
 * Returns all bookings for the vendor dashboard.
 */
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error('GET /api/vendor/bookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

/**
 * PATCH /api/vendor/tasks/:bookingId
 * Marks a task as complete and updates booking status to "In Progress".
 * Body: { taskIndex: 0 }
 */
router.patch('/tasks/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { taskIndex } = req.body;

    if (taskIndex === undefined || taskIndex === null) {
      return res.status(400).json({ success: false, message: 'taskIndex is required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (taskIndex < 0 || taskIndex >= booking.tasks.length) {
      return res.status(400).json({ success: false, message: 'Invalid task index.' });
    }

    // Mark the task complete
    booking.tasks[taskIndex].completed = true;

    // Update booking status to "In Progress" if not already done/completed
    if (booking.status === 'Confirmed') {
      booking.status = 'In Progress';
    }

    // If ALL tasks are done, mark as Completed
    if (booking.tasks.every(t => t.completed)) {
      booking.status = 'Completed';
    }

    await booking.save();

    res.json({
      success: true,
      data: {
        _id: booking._id,
        status: booking.status,
        tasks: booking.tasks,
      },
    });
  } catch (err) {
    console.error('PATCH /api/vendor/tasks error:', err);
    res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
});

/**
 * GET /api/vendor/bookings/:bookingId
 * Returns details for a single booking.
 */
router.get('/bookings/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).lean();
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking.' });
  }
});

module.exports = router;
