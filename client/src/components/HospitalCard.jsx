import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Award, Users, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './HospitalCard.css';

// Hospital placeholder images using a neutral gradient
const HOSPITAL_COLORS = {
  'Apollo Spectra': '#1e3a5f',
  'Max Saket':      '#1e2d5f',
  'Fortis Gurgaon': '#1e4a3f',
};

function getLowestPrice(doctors) {
  let lowest = Infinity;
  let lowestDoctor = null;
  let lowestRoom = null;

  doctors.forEach((doc) => {
    doc.pricing.forEach((p) => {
      if (p.priceUSD < lowest) {
        lowest = p.priceUSD;
        lowestDoctor = doc;
        lowestRoom = p.roomType;
      }
    });
  });

  return { priceUSD: lowest, doctor: lowestDoctor, roomType: lowestRoom };
}

export default function HospitalCard({ hospital, index }) {
  const { formatPrice, setPendingBooking } = useApp();
  const navigate = useNavigate();

  const { priceUSD: lowestPrice, doctor: lowestDoctor, roomType: lowestRoom } = useMemo(
    () => getLowestPrice(hospital.doctors),
    [hospital.doctors]
  );

  const [selectedDoctor, setSelectedDoctor] = useState(lowestDoctor?._id || '');
  const [selectedRoom, setSelectedRoom] = useState(lowestRoom || '');

  // Available rooms for selected doctor
  const currentDoctor = useMemo(
    () => hospital.doctors.find((d) => d._id === selectedDoctor),
    [hospital.doctors, selectedDoctor]
  );

  const availableRooms = useMemo(
    () => currentDoctor?.pricing.map((p) => p.roomType) || [],
    [currentDoctor]
  );

  const currentPrice = useMemo(() => {
    if (!currentDoctor) return lowestPrice;
    const p = currentDoctor.pricing.find((p) => p.roomType === selectedRoom);
    return p ? p.priceUSD : lowestPrice;
  }, [currentDoctor, selectedRoom, lowestPrice]);

  const handleDoctorChange = useCallback(
    (e) => {
      const docId = e.target.value;
      setSelectedDoctor(docId);
      const doc = hospital.doctors.find((d) => d._id === docId);
      if (doc && doc.pricing.length > 0) {
        setSelectedRoom(doc.pricing[0].roomType);
      }
    },
    [hospital.doctors]
  );

  const handleRoomChange = useCallback((e) => setSelectedRoom(e.target.value), []);

  const handleBookNow = useCallback(() => {
    const doctorObj = hospital.doctors.find((d) => d._id === selectedDoctor);
    setPendingBooking({
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      doctorId: selectedDoctor,
      doctorName: doctorObj?.name || '',
      doctorExp: doctorObj?.experience || 0,
      roomType: selectedRoom,
      priceUSD: currentPrice,
      accreditations: hospital.accreditations || [],
    });
    navigate('/booking');
  }, [hospital, selectedDoctor, selectedRoom, currentPrice, setPendingBooking, navigate]);

  const bgColor = HOSPITAL_COLORS[hospital.name] || '#1e2a4a';
  const isLowest = currentPrice === lowestPrice;

  return (
    <motion.article
      className="hcard"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      aria-label={`Hospital: ${hospital.name}`}
    >
      {/* Image Panel */}
      <div className="hcard__image">
        {hospital.imageUrl ? (
          <img
            src={hospital.imageUrl}
            alt={hospital.name}
            className="hcard__img"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback gradient overlay (shown if no image or image fails) */}
        <div
          className="hcard__img-fallback"
          style={{
            display: hospital.imageUrl ? 'none' : 'flex',
            background: `linear-gradient(135deg, ${bgColor} 0%, #0a0f1c 100%)`,
          }}
        >
          <div className="hcard__image-content">
            <div className="hcard__hospital-initial">{hospital.name.charAt(0)}</div>
            <p className="hcard__hospital-abbr">{hospital.name}</p>
          </div>
        </div>

        {/* Dark overlay on real image for readability */}
        {hospital.imageUrl && (
          <div className="hcard__img-overlay">
            <p className="hcard__img-name">{hospital.name}</p>
          </div>
        )}

        {/* Accreditation badges */}
        <div className="hcard__badges">
          {hospital.accreditations?.includes('NABH') && (
            <span className="badge badge--nabh">NABH</span>
          )}
          {hospital.accreditations?.includes('JCI') && (
            <span className="badge badge--jci">JCI</span>
          )}
        </div>
      </div>

      {/* Content Panel */}
      <div className="hcard__body">
        {/* Header */}
        <div className="hcard__header">
          <div>
            <h2 className="hcard__name">{hospital.name}</h2>
            <div className="hcard__meta">
              <span className="hcard__meta-item">
                <MapPin size={12} />
                {hospital.city}
              </span>
              <span className="hcard__meta-item">
                <Star size={12} className="star-icon" />
                {hospital.rating}
              </span>
              <span className="hcard__meta-item">
                <Users size={12} />
                {hospital.totalPatients?.toLocaleString()}+ patients
              </span>
            </div>
          </div>
          {isLowest && (
            <span className="hcard__lowest-tag">Best Price</span>
          )}
        </div>

        <div className="hcard__procedure">
          <span className="procedure-label">Procedure</span>
          <span className="procedure-name">{hospital.procedure}</span>
        </div>

        {/* Selectors */}
        <div className="hcard__selectors">
          <div className="form-group">
            <label className="form-label" htmlFor={`doctor-${hospital._id}`}>
              <Award size={11} /> Surgeon
            </label>
            <div className="select-wrapper">
              <select
                id={`doctor-${hospital._id}`}
                className="form-control"
                value={selectedDoctor}
                onChange={handleDoctorChange}
              >
                {hospital.doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.experience} yrs exp)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor={`room-${hospital._id}`}>
              <Clock size={11} /> Room Type
            </label>
            <div className="select-wrapper">
              <select
                id={`room-${hospital._id}`}
                className="form-control"
                value={selectedRoom}
                onChange={handleRoomChange}
              >
                {availableRooms.map((room) => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="hcard__footer">
          <div className="hcard__price-block">
            <p className="hcard__price-label">All-inclusive package</p>
            <p className="hcard__price">
              {formatPrice(currentPrice)}
              <span className="hcard__price-usd">
                {currentPrice !== currentPrice /* always show orig */ && `($${currentPrice.toLocaleString()})`}
              </span>
            </p>
            <p className="hcard__bnpl">Reserve with $0 now · Pay on arrival</p>
          </div>

          <button
            id={`book-now-${hospital._id}`}
            className="btn btn--primary hcard__cta"
            onClick={handleBookNow}
            aria-label={`Book ${hospital.name}`}
          >
            Book Now <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
