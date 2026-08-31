import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AppProviders } from './providers';
import { AppRouter } from './router';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AuthModal } from '../components/common/AuthModal';
import { useAuth } from '../features/auth/useAuth';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isWorkspace = location.pathname.startsWith('/problems/') && location.pathname !== '/problems';

  return (
    <div className={`app-shell min-h-screen flex flex-col antialiased ${isAdmin ? 'admin-experience' : 'user-experience'}`}>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <AppRouter />
      </main>
      {!isWorkspace && <Footer />}
      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProviders>
  );
};