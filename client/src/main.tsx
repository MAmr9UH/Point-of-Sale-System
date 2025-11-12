import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ShoppingCartProvider } from './contexts/ShoppingCart';
import { ToasterProvider } from './contexts/ToastContext.tsx';
import { WelcomePageProvider } from './contexts/WelcomePageContext.tsx';
import './index.css';

import App from './App.tsx';


createRoot(document.getElementById('root')!).render(
  <ToasterProvider>
    <BrowserRouter>
      <ShoppingCartProvider>
        <WelcomePageProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </WelcomePageProvider>
      </ShoppingCartProvider>
    </BrowserRouter>
  </ToasterProvider>
);
