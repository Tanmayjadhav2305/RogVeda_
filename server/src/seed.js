/**
 * Rogveda Seed Script
 * Clears collections and seeds hospitals, doctors, and pricing from the brief.
 * Run: node src/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { Hospital, Doctor, Pricing } = require('./models');

const MONGO_URI = process.env.MONGO_URI;

const seedData = [
  {
    hospital: {
      name: 'Apollo Spectra',
      city: 'Delhi',
      procedure: 'Total Knee Replacement',
      accreditations: ['NABH', 'JCI'],
      imageUrl: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800&q=80',
      rating: 4.9,
      totalPatients: 15000,
    },
    doctors: [
      { name: 'Dr. Ramesh Kumar', specialty: 'Orthopedic Surgery', experience: 16 },
      { name: 'Dr. Priya Sharma', specialty: 'Orthopedic Surgery', experience: 12 },
    ],
    pricing: [
      // Dr. Ramesh Kumar
      { doctorIndex: 0, roomType: 'General Ward', priceUSD: 3200 },
      { doctorIndex: 0, roomType: 'Semi-Private', priceUSD: 3800 },
      { doctorIndex: 0, roomType: 'Private', priceUSD: 4500 },
      // Dr. Priya Sharma
      { doctorIndex: 1, roomType: 'General Ward', priceUSD: 3000 },
      { doctorIndex: 1, roomType: 'Semi-Private', priceUSD: 3600 },
      { doctorIndex: 1, roomType: 'Private', priceUSD: 4200 },
    ],
  },
  {
    hospital: {
      name: 'Max Saket',
      city: 'Delhi',
      procedure: 'Total Knee Replacement',
      accreditations: ['NABH', 'JCI'],
      imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80',
      rating: 4.8,
      totalPatients: 12000,
    },
    doctors: [
      { name: 'Dr. Vikram Singh', specialty: 'Orthopedic Surgery', experience: 18 },
      { name: 'Dr. Anita Desai', specialty: 'Orthopedic Surgery', experience: 15 },
      { name: 'Dr. Mohit Verma', specialty: 'Orthopedic Surgery', experience: 10 },
    ],
    pricing: [
      // Dr. Vikram Singh
      { doctorIndex: 0, roomType: 'General Ward', priceUSD: 3500 },
      { doctorIndex: 0, roomType: 'Semi-Private', priceUSD: 4200 },
      { doctorIndex: 0, roomType: 'Private', priceUSD: 5000 },
      { doctorIndex: 0, roomType: 'Suite', priceUSD: 6500 },
      // Dr. Anita Desai
      { doctorIndex: 1, roomType: 'General Ward', priceUSD: 3400 },
      { doctorIndex: 1, roomType: 'Semi-Private', priceUSD: 4000 },
      { doctorIndex: 1, roomType: 'Private', priceUSD: 4800 },
      { doctorIndex: 1, roomType: 'Suite', priceUSD: 6200 },
      // Dr. Mohit Verma
      { doctorIndex: 2, roomType: 'General Ward', priceUSD: 3100 },
      { doctorIndex: 2, roomType: 'Semi-Private', priceUSD: 3700 },
      { doctorIndex: 2, roomType: 'Private', priceUSD: 4400 },
      { doctorIndex: 2, roomType: 'Suite', priceUSD: 5800 },
    ],
  },
  {
    hospital: {
      name: 'Fortis Gurgaon',
      city: 'Gurgaon',
      procedure: 'Total Knee Replacement',
      accreditations: ['NABH'],
      imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&q=80',
      rating: 4.7,
      totalPatients: 8000,
    },
    doctors: [
      { name: 'Dr. Sunil Mehta', specialty: 'Orthopedic Surgery', experience: 20 },
    ],
    pricing: [
      { doctorIndex: 0, roomType: 'Semi-Private', priceUSD: 3900 },
      { doctorIndex: 0, roomType: 'Private', priceUSD: 4600 },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});
    await Pricing.deleteMany({});
    console.log('🗑  Cleared existing hospitals, doctors, pricing');

    for (const entry of seedData) {
      // Create hospital
      const hospital = await Hospital.create(entry.hospital);
      console.log(`🏥  Created hospital: ${hospital.name}`);

      // Create doctors for this hospital
      const doctors = await Promise.all(
        entry.doctors.map(d => Doctor.create({ ...d, hospitalId: hospital._id }))
      );
      doctors.forEach(d => console.log(`  👨‍⚕️  Created doctor: ${d.name}`));

      // Create pricing rows
      for (const p of entry.pricing) {
        await Pricing.create({
          hospitalId: hospital._id,
          doctorId: doctors[p.doctorIndex]._id,
          roomType: p.roomType,
          priceUSD: p.priceUSD,
        });
      }
      console.log(`  💰  Seeded ${entry.pricing.length} pricing rows`);
    }

    console.log('\n✅ Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
