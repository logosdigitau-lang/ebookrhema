
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-rhema-light"><span className="material-symbols-outlined animate-spin text-rhema-primary text-4xl">progress_activity</span></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== 'admin' && role !== 'secretary') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
