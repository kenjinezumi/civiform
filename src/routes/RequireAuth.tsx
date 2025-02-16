// src/routes/RequireAuth.tsx
import React, { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface RequireAuthProps {
  children: JSX.Element;
}

function RequireAuth({ children }: RequireAuthProps) {
  const isAuth = authService.isAuthenticated();
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default RequireAuth;
