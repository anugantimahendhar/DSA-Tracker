import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-sm font-semibold text-[#b6b6b6]">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/problems" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-[#080808]">
        <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#494949] flex items-center justify-center text-[#efefef] mb-4 shadow-2xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#f5f5f5]">403 — Unauthorized Admin Area</h2>
        <p className="text-[#b6b6b6] max-w-md mt-2 mb-6 text-sm">
          You do not have administrative privileges to access this area.
        </p>
        <Button variant="primary" onClick={() => (window.location.href = '/problems')}>
          Return to Problems
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};