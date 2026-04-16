require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/db/connection');

const hospitalsRouter = require('./src/routes/hospitals');
const bookingsRouter = require('./src/routes/bookings');
const patientsRouter = require('./src/routes/patients');
const vendorRouter = require('./src/routes/vendor');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const allowed = [
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,  // any localhost port
      /\.vercel\.app$/,                               // any vercel.app subdomain
      /\.onrender\.com$/,                             // render.com (self-calls)
    ];
    if (allowed.some(re => re.test(origin))) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/hospitals', hospitalsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/vendor', vendorRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Rogveda API running at http://localhost:${PORT}`);
  });
});
