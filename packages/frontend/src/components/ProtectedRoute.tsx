import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, ROLE_HOME } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { DashboardSkeleton } from './DashboardSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // If we are still checking auth, show nothing or a spinner
  if (loading) {
    return <DashboardSkeleton />;
  }

  // ONLY redirect if we are 100% sure the user is not there
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user role isn't allowed here, show access denied
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-500 mt-2">You don't have permission to view the {allowedRoles.join('/')} dashboard.</p>
        <button 
          onClick={() => window.location.href = ROLE_HOME[user.role]}
          className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-hover transition-all"
        >
          Go to My Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
