import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireMaster() {
  const { isMaster } = useAuth();

  if (!isMaster) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
