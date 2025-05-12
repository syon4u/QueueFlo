
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  appointment_code: z.string().min(1, "Appointment code is required"),
});

type FormValues = z.infer<typeof formSchema>;

const CheckInCard = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointment_code: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here we would normally call an API to check in the appointment
      const { error } = await supabase.functions.invoke('appointments', {
        method: 'PATCH',
        body: JSON.stringify({ 
          appointment_code: data.appointment_code,
          status: 'checked_in'
        }),
      });

      if (error) throw error;

      toast({
        title: "Check-in Successful",
        description: "You have successfully checked in for your appointment",
      });
      
      form.reset();
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Error",
        description: "Failed to check in. Please verify your appointment code.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check In</CardTitle>
        <CardDescription>
          Enter your appointment code to check in
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
              {isSubmitting ? "Checking in..." : "Check In"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CheckInCard;
