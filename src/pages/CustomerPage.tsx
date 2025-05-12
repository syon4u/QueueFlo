
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ScheduleAppointmentCard from '@/components/customer/ScheduleAppointmentCard';
import CheckInCard from '@/components/customer/CheckInCard';
import AppointmentStatusCard from '@/components/customer/AppointmentStatusCard';
import WaitTimesCard from '@/components/customer/WaitTimesCard';
import AppointmentConfirmationDialog from '@/components/customer/AppointmentConfirmationDialog';
import QueuePositionTracker from '@/components/customer/QueuePositionTracker';

const CustomerPage = () => {
  const { user, role } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleAppointmentScheduled = (code: string) => {
    setConfirmationCode(code);
    setShowConfirmation(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-gradient text-3xl font-bold">Customer Portal</h1>
            <p className="text-muted-foreground mt-1">Schedule appointments or check your status</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-muted-foreground border border-border/40">
            {user?.email} <span className="text-primary/60 font-medium ml-1">({role || 'customer'})</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="transition-all hover:translate-y-[-2px] duration-300">
            <ScheduleAppointmentCard onAppointmentScheduled={handleAppointmentScheduled} />
          </div>
          
          <div className="space-y-6">
            <div className="transition-all hover:translate-y-[-2px] duration-300">
              <QueuePositionTracker />
            </div>
            <div className="transition-all hover:translate-y-[-2px] duration-300">
              <CheckInCard />
            </div>
            <div className="transition-all hover:translate-y-[-2px] duration-300">
              <AppointmentStatusCard />
            </div>
            <div className="transition-all hover:translate-y-[-2px] duration-300">
              <WaitTimesCard />
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button asChild variant="outline" className="shadow-sm border-gray-200 hover:bg-gray-50 transition-colors">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>

      {/* Appointment Confirmation Dialog */}
      <AppointmentConfirmationDialog 
        open={showConfirmation} 
        onOpenChange={setShowConfirmation} 
        confirmationCode={confirmationCode} 
      />
    </div>
  );
};

export default CustomerPage;
