import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import './InstallBanner.css';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa_banner_dismissed') === '1'
  );

  useEffect(() => {
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('pwa_banner_dismissed', '1');
  }

  if (!show || dismissed) return null;

  return (
    <div className="install-banner" role="banner" aria-label="Install app">
      <div className="install-banner__icon">
        <Download size={18} />
      </div>
      <div className="install-banner__text">
        <strong>Add Rogveda to your home screen</strong>
        <span>Access bookings instantly — no browser needed</span>
      </div>
      <button
        id="pwa-install-btn"
        className="btn btn--primary btn--sm install-banner__cta"
        onClick={handleInstall}
      >
        Install
      </button>
      <button
        className="install-banner__close"
        id="pwa-dismiss-btn"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
      >
        <X size={16} />
      </button>
    </div>
  );
}
