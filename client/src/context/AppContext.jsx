import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

export const RATES = { USD: 1, INR: 83, NGN: 1550 };
export const CURRENCY_SYMBOLS = { USD: '$', INR: '₹', NGN: '₦' };

const STORAGE_KEY = 'rogveda_patient';

function loadPatient() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function AppProvider({ children }) {
  const [currency, setCurrency] = useState('USD');
  const [patient, setPatientState] = useState(loadPatient);
  const [pendingBooking, setPendingBooking] = useState(null);

  // Persist patient to localStorage whenever it changes
  const setPatient = useCallback((data) => {
    setPatientState(data);
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setPatientState(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('patient_token');
  }, []);

  const formatPrice = useCallback(
    (priceUSD) => {
      const converted = priceUSD * RATES[currency];
      const symbol = CURRENCY_SYMBOLS[currency];
      return `${symbol}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    },
    [currency]
  );

  const updateWallet = useCallback((newBalance) => {
    setPatientState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, walletBalance: newBalance };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currency, setCurrency,
        patient, setPatient,
        logout,
        pendingBooking, setPendingBooking,
        formatPrice, updateWallet,
        RATES, CURRENCY_SYMBOLS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
