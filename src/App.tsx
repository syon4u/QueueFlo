
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from './pages/Index';
import Login from './pages/Login';
import StaffPage from './pages/StaffPage';
import AdminPage from './pages/AdminPage';
import CustomerPage from './pages/CustomerPage';
import ProfilePage from './pages/ProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import PerformanceReportPage from './pages/PerformanceReportPage';

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  }
});

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set default language based on browser settings or a default value
    const storedLanguage = localStorage.getItem('i18nextLng') || navigator.language || 'en';
    i18n.changeLanguage(storedLanguage);
  }, [i18n]);
  
  return (
    <div className="App">
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/staff" 
                element={
                  <ProtectedRoute pageType="staff">
                    <StaffPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/performance" 
                element={
                  <ProtectedRoute pageType="staff">
                    <PerformanceReportPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute pageType="admin">
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer" 
                element={
                  <ProtectedRoute pageType="customer">
                    <CustomerPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute pageType="customer">
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/appointments" 
                element={
                  <ProtectedRoute pageType="customer">
                    <AppointmentsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/appointments/new" 
                element={
                  <ProtectedRoute pageType="customer">
                    <NewAppointmentPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
