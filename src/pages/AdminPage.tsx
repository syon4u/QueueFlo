
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { LocationsTab } from '@/components/admin/LocationsTab';
import { ServicesTab } from '@/components/admin/ServicesTab';
import { StatsTab } from '@/components/admin/StatsTab';
import { QueueManagementTab } from '@/components/admin/QueueManagementTab';
import { SystemSettingsTab } from '@/components/admin/SystemSettingsTab';
import { DashboardTab } from '@/components/admin/DashboardTab';
import UserManagementTab from '@/components/admin/UserManagementTab';
import { QueueProvider } from '@/context/QueueContext';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminPage = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Handle tab switching from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    if (tabParam && ['dashboard', 'users', 'locations', 'services', 'queue', 'stats', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage system settings, users, and view analytics</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Logged in as: {user?.email} (Role: {role || 'admin'})
          </div>
        </div>

        <Tabs defaultValue="dashboard" onValueChange={setActiveTab} value={activeTab} className="w-full">
          <TabsList className={`grid ${isMobile ? 'grid-cols-4' : 'grid-cols-7'} mb-6`}>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users & Staff</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="stats">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <Card>
            <CardContent className="p-6">
              <TabsContent value="dashboard">
                <DashboardTab />
              </TabsContent>
              <TabsContent value="users">
                <UserManagementTab />
              </TabsContent>
              <TabsContent value="locations">
                <LocationsTab />
              </TabsContent>
              <TabsContent value="services">
                <ServicesTab />
              </TabsContent>
              <TabsContent value="queue">
                <QueueProvider>
                  <QueueManagementTab />
                </QueueProvider>
              </TabsContent>
              <TabsContent value="stats">
                <StatsTab />
              </TabsContent>
              <TabsContent value="settings">
                <SystemSettingsTab />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
        
        <div className="flex space-x-4 mt-6">
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/staff">Staff Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
