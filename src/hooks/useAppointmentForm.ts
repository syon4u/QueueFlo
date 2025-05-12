
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format, addMinutes, startOfHour } from 'date-fns';

export interface Location {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  description: string | null;
}

export interface AppointmentFormState {
  selectedLocationId: string;
  selectedServiceId: string;
  selectedDate: Date | undefined;
  selectedTime: string;
  notes: string;
  reasonForVisit: string;
  isSubmitting: boolean;
  currentStep: number;
}

export const useAppointmentForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Form state
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Data state
  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        
        setLocations(data || []);
        if (data && data.length > 0) {
          setSelectedLocationId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast({
          title: t('common.error'),
          description: t('appointments.errorFetchingLocations'),
          variant: 'destructive'
        });
      }
    };
    
    fetchLocations();
  }, [toast, t]);
  
  // Fetch services when location changes
  useEffect(() => {
    const fetchServices = async () => {
      if (!selectedLocationId) return;
      
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, duration, description')
          .eq('location_id', selectedLocationId)
          .order('name');
          
        if (error) throw error;
        
        setServices(data || []);
        setSelectedServiceId(''); // Reset service when location changes
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: t('common.error'),
          description: t('appointments.errorFetchingServices'),
          variant: 'destructive'
        });
      }
    };
    
    fetchServices();
  }, [selectedLocationId, toast, t]);
  
  // Generate available times when date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    // Generate time slots from 9 AM to 5 PM
    const times = [];
    let time = startOfHour(new Date(selectedDate));
    time.setHours(9); // Start at 9 AM
    
    while (time.getHours() < 17) { // Until 5 PM
      times.push(format(time, 'HH:mm'));
      time = addMinutes(time, 30); // 30-minute increments
    }
    
    setAvailableTimes(times);
  }, [selectedDate]);
  
  const handleSubmit = async () => {
    if (!user?.id || !selectedLocationId || !selectedServiceId || !selectedDate || !selectedTime) {
      toast({
        title: t('common.error'),
        description: t('appointments.missingFields'),
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledTime = new Date(selectedDate);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // Create appointment
      const { error } = await supabase
        .from('appointments')
        .insert({
          customer_id: user.id,
          service_id: selectedServiceId,
          location_id: selectedLocationId,
          scheduled_time: scheduledTime.toISOString(),
          notes: notes || null,
          reason_for_visit: reasonForVisit || null,
          status: 'scheduled'
        });
        
      if (error) throw error;
      
      toast({
        title: t('appointments.success'),
        description: t('appointments.appointmentCreated')
      });
      
      // Navigate to appointments page
      navigate('/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: t('common.error'),
        description: t('appointments.errorCreating'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const nextStep = () => {
    if (currentStep === 1 && !selectedLocationId) {
      toast({
        title: t('common.error'),
        description: t('appointments.selectLocation'),
        variant: 'destructive'
      });
      return;
    }
    
    if (currentStep === 2 && !selectedServiceId) {
      toast({
        title: t('common.error'),
        description: t('appointments.selectService'),
        variant: 'destructive'
      });
      return;
    }
    
    if (currentStep === 3 && (!selectedDate || !selectedTime)) {
      toast({
        title: t('common.error'),
        description: t('appointments.selectDateTime'),
        variant: 'destructive'
      });
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => setCurrentStep(prev => prev - 1);
  
  return {
    // State
    selectedLocationId,
    setSelectedLocationId,
    selectedServiceId,
    setSelectedServiceId,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    notes,
    setNotes,
    reasonForVisit,
    setReasonForVisit,
    isSubmitting,
    currentStep,
    
    // Data
    locations,
    services,
    availableTimes,
    
    // Actions
    handleSubmit,
    nextStep,
    prevStep
  };
};
