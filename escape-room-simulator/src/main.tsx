import React from 'react';
import { createRoot } from 'react-dom/client';
import AppShell from './components/AppShell';

const el = document.getElementById('root');
if (!el) throw new Error('Missing #root element');

createRoot(el).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>
);
