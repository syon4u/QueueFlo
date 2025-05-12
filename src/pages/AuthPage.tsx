
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Login from './Login';

const AuthPage = () => {
  const { user } = useAuth();
  
  // Redirect to home page if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
};

export default AuthPage;
