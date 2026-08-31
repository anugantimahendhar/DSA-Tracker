import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-sm font-semibold text-[#b6b6b6]">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    openAuthModal('login');
    return <Navigate to="/problems" replace />;
  }

  return <>{children}</>;
};