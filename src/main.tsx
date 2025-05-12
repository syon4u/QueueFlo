
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/i18n.ts';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';

// Ensure i18n is initialized before rendering
createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);
