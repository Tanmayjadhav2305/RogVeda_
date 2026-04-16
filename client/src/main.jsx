import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './index.css';

// Register service worker with auto-update
registerSW({
  onNeedRefresh() {
    // Could show a "New version available" toast here
    console.log('New content available — refreshing…');
  },
  onOfflineReady() {
    console.log('Rogveda is ready to work offline!');
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
