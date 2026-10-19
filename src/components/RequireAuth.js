import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Route guard. Waits for Firebase Auth to resolve (so a refresh doesn't bounce
// a logged-in user to /login) and then redirects anonymous users, remembering
// where they were headed so Login can send them back.
const RequireAuth = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ returnPath: location.pathname + location.search }} />;
  }

  return children;
};

export default RequireAuth;
