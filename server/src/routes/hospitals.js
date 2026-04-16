const express = require('express');
const router = express.Router();
const { Hospital, Doctor, Pricing } = require('../models');

/**
 * GET /api/hospitals
 * Returns all hospitals with nested doctors and full pricing matrix.
 */
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find().lean();

    const result = await Promise.all(
      hospitals.map(async (hospital) => {
        const doctors = await Doctor.find({ hospitalId: hospital._id }).lean();

        const doctorsWithPricing = await Promise.all(
          doctors.map(async (doctor) => {
            const pricing = await Pricing.find({
              hospitalId: hospital._id,
              doctorId: doctor._id,
            }).lean();

            return {
              _id: doctor._id,
              name: doctor.name,
              specialty: doctor.specialty,
              experience: doctor.experience,
              pricing: pricing.map(p => ({
                roomType: p.roomType,
                priceUSD: p.priceUSD,
              })),
            };
          })
        );

        return {
          ...hospital,
          doctors: doctorsWithPricing,
        };
      })
    );

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('GET /api/hospitals error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch hospitals' });
  }
});

module.exports = router;
