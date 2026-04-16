import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import InstallBanner from './components/InstallBanner';

import Search        from './pages/Search';
import Booking       from './pages/Booking';
import BookingSuccess from './pages/BookingSuccess';
import PatientLogin  from './pages/PatientLogin';
import PatientRegister from './pages/PatientRegister';
import MyBookings    from './pages/MyBookings';
import Profile       from './pages/Profile';
import VendorLogin   from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';

function AppRoutes() {
  const { pathname } = useLocation();
  const isVendor = pathname.startsWith('/vendor');

  return (
    <>
      {!isVendor && <InstallBanner />}
      <Routes>
        {/* Patient-facing */}
        <Route path="/"              element={<Search />} />
        <Route path="/booking"       element={<Booking />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/my-bookings"   element={<MyBookings />} />
        <Route path="/profile"       element={<Profile />} />

        {/* Auth */}
        <Route path="/login"    element={<PatientLogin />} />
        <Route path="/register" element={<PatientRegister />} />

        {/* Vendor */}
        <Route path="/vendor/login"     element={<VendorLogin />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
