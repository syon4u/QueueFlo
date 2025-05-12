
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { getVersionString } from '@/version';
import { useAuth } from '@/context/AuthContext';

const Unauthorized = () => {
  const { t } = useTranslation();
  const { role, user } = useAuth();
  const location = useLocation();
  
  // Extract the page the user was trying to access
  const fromPage = location.state?.from?.pathname || "/restricted-page";
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-lg">
        <div className="flex justify-center">
          <ShieldAlert size={64} className="text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-amber-600">{t('unauthorized.title', 'Unauthorized Access')}</h1>
        <p className="text-lg text-muted-foreground mb-2">
          {t('unauthorized.description', "You don't have permission to access this page.")}
        </p>
        
        <div className="bg-slate-50 p-4 rounded-md text-left mb-2">
          <div className="text-sm text-slate-600 mb-1">User details:</div>
          <div className="font-medium">{user?.email}</div>
          <div className="text-sm mt-2 text-slate-600 mb-1">Current role:</div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {role || 'customer'}
          </span>
        </div>
        
        <div className="space-y-4">
          <Button className="w-full" asChild>
            <Link to="/">{t('unauthorized.backToHome', 'Return to Home')}</Link>
          </Button>
          
          {role === 'customer' && (
            <Button className="w-full" variant="outline" asChild>
              <Link to="/customer">{t('unauthorized.customerDashboard', 'Go to Customer Dashboard')}</Link>
            </Button>
          )}
          
          {role === 'staff' && (
            <Button className="w-full" variant="outline" asChild>
              <Link to="/staff">{t('unauthorized.staffDashboard', 'Go to Staff Dashboard')}</Link>
            </Button>
          )}
          
          {role === 'admin' && (
            <Button className="w-full" variant="outline" asChild>
              <Link to="/admin">{t('unauthorized.adminDashboard', 'Go to Admin Dashboard')}</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="mt-8 text-sm text-muted-foreground">
        <p>QUEUE FLOW {getVersionString()}</p>
      </div>
    </div>
  );
};

export default Unauthorized;
