const mongoose = require('mongoose');

// ─── Hospital ────────────────────────────────────────────────────────────────
const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, default: 'Delhi' },
  procedure: { type: String, default: 'Total Knee Replacement' },
  accreditations: [String],   // e.g. ['NABH', 'JCI']
  imageUrl: String,
  rating: { type: Number, default: 4.8 },
  totalPatients: { type: Number, default: 1000 },
}, { timestamps: true });

// ─── Doctor ───────────────────────────────────────────────────────────────────
const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  specialty: { type: String, default: 'Orthopedic Surgery' },
  experience: Number,   // years
  imageUrl: String,
}, { timestamps: true });

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PricingSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  roomType: { type: String, enum: ['General Ward', 'Semi-Private', 'Private', 'Suite'], required: true },
  priceUSD: { type: Number, required: true },
}, { timestamps: true });

// ─── Patient ──────────────────────────────────────────────────────────────────
const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  nationality: { type: String, default: 'International' },
  phone: { type: String, default: '' },
  walletBalance: { type: Number, default: 0 },  // allowed to go negative (BNPL)
}, { timestamps: true });


// ─── Booking ──────────────────────────────────────────────────────────────────
const BookingSchema = new mongoose.Schema({
  bookingReference: { type: String, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: String,
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  hospitalName: String,
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: String,
  roomType: { type: String, required: true },
  priceUSD: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Confirmed', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Confirmed',
  },
  tasks: [{
    label: String,
    completed: { type: Boolean, default: false },
  }],
}, { timestamps: true });

// Auto-generate booking reference before save
BookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = 'RGV-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

// ─── Wallet Transaction ───────────────────────────────────────────────────────
const WalletTransactionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  amount: Number,     // negative = debit
  type: { type: String, enum: ['debit', 'credit'], default: 'debit' },
  description: String,
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', HospitalSchema);
const Doctor = mongoose.model('Doctor', DoctorSchema);
const Pricing = mongoose.model('Pricing', PricingSchema);
const Patient = mongoose.model('Patient', PatientSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const WalletTransaction = mongoose.model('WalletTransaction', WalletTransactionSchema);

module.exports = { Hospital, Doctor, Pricing, Patient, Booking, WalletTransaction };
