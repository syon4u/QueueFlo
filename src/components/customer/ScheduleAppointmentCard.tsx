
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ServiceSelector from '@/components/ServiceSelector';
import LocationSelector from '@/components/LocationSelector';
import TimePicker from '@/components/TimePicker';
import CustomerSearchBox, { Customer } from './CustomerSearchBox';

// Form schema for a new customer
const newCustomerFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  service_id: z.string().min(1, "Service is required"),
  location_id: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
  reason_for_visit: z.string().optional(),
});

// Form schema for an existing customer
const existingCustomerFormSchema = z.object({
  service_id: z.string().min(1, "Service is required"),
  location_id: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
  reason_for_visit: z.string().optional(),
});

type NewCustomerFormValues = z.infer<typeof newCustomerFormSchema>;
type ExistingCustomerFormValues = z.infer<typeof existingCustomerFormSchema>;

interface ScheduleAppointmentCardProps {
  onAppointmentScheduled: (code: string) => void;
}

const ScheduleAppointmentCard = ({ onAppointmentScheduled }: ScheduleAppointmentCardProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState('9:00 AM');
  const [step, setStep] = useState<'search' | 'new-customer' | 'existing-customer'>('search');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form for new customers
  const newCustomerForm = useForm<NewCustomerFormValues>({
    resolver: zodResolver(newCustomerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      service_id: "",
      location_id: "",
      notes: "",
      reason_for_visit: "",
    },
  });

  // Form for existing customers
  const existingCustomerForm = useForm<ExistingCustomerFormValues>({
    resolver: zodResolver(existingCustomerFormSchema),
    defaultValues: {
      service_id: "",
      location_id: "",
      notes: "",
      reason_for_visit: "",
    },
  });

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStep('existing-customer');
  };

  const handleCreateNewCustomer = () => {
    setStep('new-customer');
  };

  const handleBackToSearch = () => {
    setStep('search');
    setSelectedCustomer(null);
  };

  const submitNewCustomerAppointment = async (data: NewCustomerFormValues) => {
    if (!selectedDate) {
      toast({
        title: t('common.error'),
        description: t('appointments.selectDate'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse selected date and time
      const [hours, minutes] = selectedTime.split(':');
      const [minutesValue, ampm] = minutes.split(' ');
      let hour = parseInt(hours);
      
      if (ampm === 'PM' && hour < 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }

      // Create a date object with the selected date and time
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hour, parseInt(minutesValue));
      
      const [firstName, ...lastNameParts] = data.name.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;
      
      const appointmentData = {
        service_id: data.service_id,
        location_id: data.location_id,
        scheduled_time: scheduledDate.toISOString(),
        notes: data.notes,
        reason_for_visit: data.reason_for_visit,
        customer_name: data.name,
        phone_number: data.phone,
      };

      // Send the appointment request to the Supabase Edge Function
      const { data: response, error } = await supabase.functions.invoke('appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });

      if (error) throw error;

      // Generate a confirmation code (this would normally come from the server)
      const confirmationCode = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Call the callback with the confirmation code
      onAppointmentScheduled(confirmationCode);
      
      // Reset form and invalidate queries
      newCustomerForm.reset();
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setStep('search');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: t('common.error'),
        description: t('appointments.createError'),
        variant: "destructive",
      });
    }
  };

  const submitExistingCustomerAppointment = async (data: ExistingCustomerFormValues) => {
    if (!selectedDate || !selectedCustomer) {
      toast({
        title: t('common.error'),
        description: t('appointments.selectDateAndCustomer'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse selected date and time
      const [hours, minutes] = selectedTime.split(':');
      const [minutesValue, ampm] = minutes.split(' ');
      let hour = parseInt(hours);
      
      if (ampm === 'PM' && hour < 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }

      // Create a date object with the selected date and time
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hour, parseInt(minutesValue));
      
      const appointmentData = {
        service_id: data.service_id,
        location_id: data.location_id,
        scheduled_time: scheduledDate.toISOString(),
        notes: data.notes,
        reason_for_visit: data.reason_for_visit,
        customer_id: selectedCustomer.id,
        customer_name: `${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
        phone_number: selectedCustomer.phone,
      };

      // Send the appointment request to the Supabase Edge Function
      const { data: response, error } = await supabase.functions.invoke('appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });

      if (error) throw error;

      // Generate a confirmation code (this would normally come from the server)
      const confirmationCode = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Call the callback with the confirmation code
      onAppointmentScheduled(confirmationCode);
      
      // Reset form and invalidate queries
      existingCustomerForm.reset();
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setStep('search');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: t('common.error'),
        description: t('appointments.createError'),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('appointments.newAppointment')}</CardTitle>
        <CardDescription>
          {t('appointments.scheduleDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'search' && (
          <CustomerSearchBox 
            onSelectCustomer={handleSelectCustomer} 
            onCreateNew={handleCreateNewCustomer} 
          />
        )}
        
        {step === 'new-customer' && (
          <Form {...newCustomerForm}>
            <form onSubmit={newCustomerForm.handleSubmit(submitNewCustomerAppointment)} className="space-y-4">
              <FormField
                control={newCustomerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('customer.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('customer.namePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newCustomerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('customer.phone')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('customer.phonePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newCustomerForm.control}
                name="location_id"
                render={({ field }) => (
                  <LocationSelector 
                    value={field.value} 
                    onChange={field.onChange} 
                  />
                )}
              />
              
              <FormField
                control={newCustomerForm.control}
                name="service_id"
                render={({ field }) => (
                  <ServiceSelector 
                    value={field.value} 
                    onChange={field.onChange} 
                  />
                )}
              />
              
              <TimePicker 
                date={selectedDate}
                onDateChange={setSelectedDate}
                time={selectedTime}
                onTimeChange={setSelectedTime}
              />
              
              <FormField
                control={newCustomerForm.control}
                name="reason_for_visit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('appointments.reasonForVisit')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('appointments.reasonPlaceholder')}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newCustomerForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('appointments.notes')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('appointments.notesPlaceholder')}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={handleBackToSearch}>
                  {t('common.back')}
                </Button>
                <Button type="submit">
                  {t('appointments.schedule')}
                </Button>
              </div>
            </form>
          </Form>
        )}
        
        {step === 'existing-customer' && selectedCustomer && (
          <Form {...existingCustomerForm}>
            <form onSubmit={existingCustomerForm.handleSubmit(submitExistingCustomerAppointment)} className="space-y-4">
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="font-medium text-lg">{selectedCustomer.first_name} {selectedCustomer.last_name}</div>
                {selectedCustomer.phone && <div className="text-sm">{selectedCustomer.phone}</div>}
                {selectedCustomer.email && <div className="text-sm">{selectedCustomer.email}</div>}
              </div>
              
              <FormField
                control={existingCustomerForm.control}
                name="location_id"
                render={({ field }) => (
                  <LocationSelector 
                    value={field.value} 
                    onChange={field.onChange} 
                  />
                )}
              />
              
              <FormField
                control={existingCustomerForm.control}
                name="service_id"
                render={({ field }) => (
                  <ServiceSelector 
                    value={field.value} 
                    onChange={field.onChange} 
                  />
                )}
              />
              
              <TimePicker 
                date={selectedDate}
                onDateChange={setSelectedDate}
                time={selectedTime}
                onTimeChange={setSelectedTime}
              />
              
              <FormField
                control={existingCustomerForm.control}
                name="reason_for_visit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('appointments.reasonForVisit')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('appointments.reasonPlaceholder')}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={existingCustomerForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('appointments.notes')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('appointments.notesPlaceholder')}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={handleBackToSearch}>
                  {t('common.back')}
                </Button>
                <Button type="submit">
                  {t('appointments.schedule')}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleAppointmentCard;
