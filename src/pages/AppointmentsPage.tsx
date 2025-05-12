
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Clock } from 'lucide-react';

interface Appointment {
  id: string;
  status: string;
  scheduled_time: string;
  check_in_time: string | null;
  start_time: string | null;
  end_time: string | null;
  service: {
    name: string;
    duration: number;
  };
  location: {
    name: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-500';
    case 'checked_in': return 'bg-yellow-500';
    case 'in_progress': return 'bg-orange-500';
    case 'completed': return 'bg-green-500';
    case 'cancelled': return 'bg-red-500';
    case 'no_show': return 'bg-gray-500';
    default: return 'bg-gray-300';
  }
};

const AppointmentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  React.useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            status,
            scheduled_time,
            check_in_time,
            start_time,
            end_time,
            service:service_id (name, duration),
            location:location_id (name)
          `)
          .eq('customer_id', user.id)
          .order('scheduled_time', { ascending: false });
          
        if (error) throw error;
        
        setAppointments(data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: t('common.error'),
          description: t('appointments.errorFetching'),
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, [user?.id, toast, t]);
  
  const handleCancel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setAppointments(prev => prev.map(appt => 
        appt.id === id ? { ...appt, status: 'cancelled' } : appt
      ));
      
      toast({
        title: t('appointments.cancelled'),
        description: t('appointments.appointmentCancelled')
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: t('common.error'),
        description: t('appointments.errorCancelling'),
        variant: 'destructive'
      });
    }
  };
  
  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), 'PPp');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('appointments.title')}</h1>
        <Button asChild>
          <Link to="/new-appointment">{t('appointments.newAppointment')}</Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : appointments.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent className="pt-6">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('appointments.noAppointments')}</h2>
            <p className="text-muted-foreground mb-6">{t('appointments.bookAppointment')}</p>
            <Button asChild>
              <Link to="/new-appointment">{t('appointments.scheduleNow')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className={appointment.status === 'cancelled' ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className={getStatusColor(appointment.status)}>{t(`appointments.status.${appointment.status}`)}</Badge>
                    <CardTitle className="mt-2">{appointment.service.name}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t('appointments.location')}</p>
                    <p>{appointment.location.name}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formatDateTime(appointment.scheduled_time)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{t('appointments.duration')}: {appointment.service.duration} {t('appointments.minutes')}</span>
                  </div>
                </div>
                
                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleCancel(appointment.id)}
                    >
                      {t('appointments.cancel')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <Button asChild variant="outline">
          <Link to="/">{t('common.backToHome')}</Link>
        </Button>
      </div>
    </div>
  );
};

export default AppointmentsPage;
