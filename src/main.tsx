import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { seedDatabase } from './db/seed';

async function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  // Render quick splash while IndexedDB is checked/seeded on very first boot
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
          <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight">ClinicChain Dashboard</h1>
      </div>
      <p className="text-xs text-teal-400 font-medium animate-pulse">
        Initializing local IndexedDB & verifying 6-month seed data...
      </p>
    </div>
  );

  // Request persistent browser storage to prevent IndexedDB eviction under disk pressure
  if (navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log(`[Storage] IndexedDB storage persistence granted: ${isPersisted}`);
    } catch (e) {
      console.warn('[Storage] Could not request storage persistence:', e);
    }
  }

  try {
    await seedDatabase(false);
  } catch (err) {
    console.error('Failed to initialize local IndexedDB:', err);
  }

  // Render application
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
