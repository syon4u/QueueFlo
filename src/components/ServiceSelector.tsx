
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ServiceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  locationId?: string; // Add the locationId prop
}

const ServiceSelector = ({ value, onChange, locationId }: ServiceSelectorProps) => {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services', locationId], // Include locationId in the query key for proper cache invalidation
    queryFn: async () => {
      // If locationId is provided, filter services by location
      let query = supabase.from('services').select('id, name, duration');
      
      if (locationId) {
        query = query.eq('location_id', locationId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    // Only run the query when we have a locationId
    enabled: !locationId || !!locationId,
  });

  return (
    <FormItem>
      <FormLabel>Service</FormLabel>
      <FormControl>
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services?.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name} ({service.duration} min)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default ServiceSelector;
