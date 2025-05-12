
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Appointment } from '@/hooks/use-appointments';

const reminderSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(500, 'Message cannot exceed 500 characters'),
  type: z.enum(['app', 'email', 'sms'], {
    required_error: 'Please select a notification type',
  }),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface AppointmentReminderFormProps {
  appointment: Appointment;
  onComplete?: () => void;
}

export const AppointmentReminderForm: React.FC<AppointmentReminderFormProps> = ({ 
  appointment, 
  onComplete 
}) => {
  const { toast } = useToast();
  
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      message: `Hello, this is a reminder for your upcoming appointment scheduled for ${new Date(appointment.scheduled_time).toLocaleString()}. Please remember to arrive a few minutes early.`,
      type: 'app',
    },
  });

  const onSubmit = async (values: ReminderFormValues) => {
    try {
      const { error } = await supabase.functions.invoke('appointments/reminder', {
        method: 'POST',
        body: {
          appointment_id: appointment.id,
          message: values.message,
          type: values.type,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Reminder has been sent successfully',
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to send reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reminder. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="app">In-App Notification</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter message for the customer"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {field.value?.length || 0}/500 characters
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          {onComplete && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onComplete}
            >
              Cancel
            </Button>
          )}
          <Button type="submit">Send Reminder</Button>
        </div>
      </form>
    </Form>
  );
};
