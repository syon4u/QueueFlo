
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

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const LocationSelector = ({ value, onChange }: LocationSelectorProps) => {
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <FormItem>
      <FormLabel>Location</FormLabel>
      <FormControl>
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            {locations?.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default LocationSelector;
