
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';

// Fetch daily queue statistics for a given time range
export const useDailyQueueStats = (days = 7) => {
  return useQuery({
    queryKey: ['daily-queue-stats', days],
    queryFn: async () => {
      const today = new Date();
      const startDate = subDays(today, days);
      
      const { data, error } = await supabase.functions.invoke('admin-stats', {
        body: {
          type: 'daily',
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        }
      });
      
      if (error) throw error;
      return data?.dailyStats || [];
    }
  });
};

// Fetch general queue statistics
export const useQueueStats = () => {
  return useQuery({
    queryKey: ['queue-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-stats', {
        body: {
          type: 'queue'
        }
      });
      
      if (error) throw error;
      return data?.queueStats || [];
    }
  });
};

// Fetch all locations
export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });
};

// Fetch all services
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });
};
