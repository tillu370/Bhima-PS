import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { UiProvider } from './context/UiContext.jsx';
import './styles/style.css';
import './styles/polish.css';
import './styles/vibe.css';
import './styles/vibe2.css';
import './styles/animations.css';
import './styles/pages.css';
import './styles/studio.css';
import './styles/mobile.css';
import './styles/pastel-theme.css';
import './styles/deal.css';
import './styles/diwali-theme.css';
import './styles/christmas-theme.css';
import './styles/festive-theme.css';
import './styles/sankranthi-theme.css';
import './styles/new-year-theme.css';
import './styles/admin-dashboard.css';
import './styles/festive-promo-layout.css';
import './styles/festive-brand-contrast.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <UiProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </UiProvider>
    </BrowserRouter>
  </React.StrictMode>
);
