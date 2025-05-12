
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

// Define the types that we were trying to import
export interface StaffMetric {
  staff_id: string;
  staff_name: string;
  appointments_served: number;
  average_service_time: number;
  no_shows: number;
}

export interface ServiceMetric {
  service_id: string;
  service_name: string;
  appointments_count: number;
  average_wait_time: number;
}

export interface DailyMetric {
  date: string;
  appointments: number;
  wait_time: number;
}

interface MetricsParams {
  startDate: string;
  endDate: string;
  locationId?: string;
}

// Hook for fetching staff performance metrics
export const useStaffMetrics = (timeRange: string, locationId?: string) => {
  return useQuery({
    queryKey: ['staff-metrics', timeRange, locationId],
    queryFn: async () => {
      const params = getDateRangeFromTimeRange(timeRange);
      if (locationId) {
        params.locationId = locationId;
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('staff-metrics', {
          body: {
            start_date: params.startDate,
            end_date: params.endDate,
            location_id: params.locationId
          }
        });
        
        if (error) throw error;
        return data as StaffMetric[] || [];
      } catch (error) {
        console.error('Error fetching staff metrics:', error);
        throw error;
      }
    }
  });
};

// Hook for fetching service performance metrics
export const useServiceMetrics = (timeRange: string, locationId?: string) => {
  return useQuery({
    queryKey: ['service-metrics', timeRange, locationId],
    queryFn: async () => {
      const params = getDateRangeFromTimeRange(timeRange);
      if (locationId) {
        params.locationId = locationId;
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('service-metrics', {
          body: {
            start_date: params.startDate,
            end_date: params.endDate,
            location_id: params.locationId
          }
        });
        
        if (error) throw error;
        return data as ServiceMetric[] || [];
      } catch (error) {
        console.error('Error fetching service metrics:', error);
        throw error;
      }
    }
  });
};

// Hook for fetching daily appointment metrics
export const useDailyMetrics = (timeRange: string, locationId?: string) => {
  return useQuery({
    queryKey: ['daily-metrics', timeRange, locationId],
    queryFn: async () => {
      const params = getDateRangeFromTimeRange(timeRange);
      if (locationId) {
        params.locationId = locationId;
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('daily-metrics', {
          body: {
            start_date: params.startDate,
            end_date: params.endDate,
            location_id: params.locationId
          }
        });
        
        if (error) throw error;
        
        // Format dates for display
        return (data as DailyMetric[] || []).map((item: DailyMetric) => ({
          ...item,
          date: format(new Date(item.date), 'MMM dd')
        }));
      } catch (error) {
        console.error('Error fetching daily metrics:', error);
        throw error;
      }
    }
  });
};

// Helper function to calculate date range based on time range
const getDateRangeFromTimeRange = (timeRange: string): MetricsParams => {
  const today = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case 'today':
      startDate = today;
      break;
    case 'yesterday':
      startDate = subDays(today, 1);
      break;
    case 'week':
      startDate = subDays(today, 7);
      break;
    case 'month':
      startDate = subDays(today, 30);
      break;
    case 'quarter':
      startDate = subDays(today, 90);
      break;
    default:
      startDate = subDays(today, 7); // Default to week
  }
  
  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(today, 'yyyy-MM-dd')
  };
};
