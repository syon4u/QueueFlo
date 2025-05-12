
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatWaitTime } from '@/lib/queue';

const formSchema = z.object({
  appointment_code: z.string().min(1, "Appointment code is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AppointmentStatus {
  id: string;
  status: string;
  service_name: string;
  scheduled_time: string;
  estimated_wait: number | null;
  position: number | null;
}

const AppointmentStatusCard = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentStatus | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointment_code: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here we would call an API to get appointment status
      const { data: appointmentData, error } = await supabase.functions.invoke('appointments', {
        method: 'GET',
        body: JSON.stringify({ appointment_code: data.appointment_code }),
      });

      if (error) throw error;

      if (appointmentData) {
        setAppointment(appointmentData);
      } else {
        toast({
          title: "Not Found",
          description: "No appointment found with that code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking appointment status:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve appointment status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to get the appropriate badge color based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'secondary';
      case 'checked_in':
        return 'default';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'outline';
      case 'cancelled':
      case 'no_show':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Status</CardTitle>
        <CardDescription>
          Check the status of your appointment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="appointment_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your appointment code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Checking..." : "Check Status"}
            </Button>
          </form>
        </Form>

        {appointment && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Appointment Details</h3>
              <Badge variant={getStatusBadgeVariant(appointment.status)}>
                {appointment.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span>{appointment.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span>{new Date(appointment.scheduled_time).toLocaleString()}</span>
              </div>
              
              {appointment.position && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span>#{appointment.position} in line</span>
                </div>
              )}
              
              {appointment.estimated_wait !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wait Time:</span>
                  <span>{formatWaitTime(appointment.estimated_wait)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentStatusCard;
