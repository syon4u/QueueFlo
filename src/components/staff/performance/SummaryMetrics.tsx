
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { SummaryMetricsProps } from './types';

const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ dailyMetrics, serviceMetrics, staffMetrics }) => {
  // Calculate total appointments
  const totalAppointments = Array.isArray(dailyMetrics) ? 
    dailyMetrics.reduce((sum, day) => sum + day.appointments, 0) : 0;
  
  // Calculate average wait time
  const averageWaitTime = Array.isArray(serviceMetrics) && serviceMetrics.length > 0 ?
    (serviceMetrics.reduce((sum, service) => sum + service.average_wait_time, 0) / serviceMetrics.length).toFixed(1) : "0";
  
  // Calculate completed appointments
  const completedAppointments = Array.isArray(staffMetrics) ? 
    staffMetrics.reduce((sum, staff) => sum + staff.appointments_served, 0) : 0;
  
  // Calculate no-shows
  const noShows = Array.isArray(staffMetrics) ? 
    staffMetrics.reduce((sum, staff) => sum + staff.no_shows, 0) : 0;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-sm">Total Appointments</span>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold">
            {totalAppointments}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-sm">Average Wait Time</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold">
            {averageWaitTime} <span className="text-lg font-normal">min</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-sm">Completed</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold">
            {completedAppointments}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-sm">No-Shows</span>
            <XCircle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="text-3xl font-bold">
            {noShows}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryMetrics;
