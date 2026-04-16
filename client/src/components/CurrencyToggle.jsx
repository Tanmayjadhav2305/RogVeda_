import { useApp, CURRENCY_SYMBOLS } from '../context/AppContext';
import './CurrencyToggle.css';

const CURRENCIES = ['USD', 'INR', 'NGN'];

export default function CurrencyToggle() {
  const { currency, setCurrency } = useApp();

  return (
    <div className="currency-toggle" role="group" aria-label="Currency selector">
      {CURRENCIES.map((c) => (
        <button
          key={c}
          id={`currency-${c.toLowerCase()}`}
          onClick={() => setCurrency(c)}
          className={`currency-btn ${currency === c ? 'active' : ''}`}
          aria-pressed={currency === c}
        >
          <span className="currency-symbol">{CURRENCY_SYMBOLS[c]}</span>
          <span>{c}</span>
        </button>
      ))}
    </div>
  );
}
