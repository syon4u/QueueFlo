import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatWaitTime } from '@/lib/queue';
import { toast } from 'sonner';

type WaitTimeData = {
  service_name: string;
  average_wait_time: number;
  day_name: string;
  time_period: string;
};

const EstimatedWaitTimes: React.FC = () => {
  const [waitTimes, setWaitTimes] = useState<WaitTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get day name from day of week number
  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  // Get time period from hour
  const getTimePeriod = (hour: number): string => {
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  useEffect(() => {
    const fetchWaitTimes = async () => {
      try {
        setIsLoading(true);
        
        // This is a mock query - in a real app, you'd join with services table
        // to get actual service names and more detailed information
        const { data, error } = await supabase
          .from('service_wait_times')
          .select(`
            id,
            service_id,
            day_of_week,
            hour_of_day,
            average_wait_time
          `)
          .order('average_wait_time', { ascending: false })
          .limit(5);
          
        if (error) {
          console.error('Error fetching wait times:', error);
          return;
        }
        
        // Transform the data for display
        // In a real app, you would join with the services table to get actual service names
        if (data) {
          // Simulate joined data with service names since we don't have access to the full schema
          const transformedData: WaitTimeData[] = data.map(item => ({
            service_name: `Service ${item.service_id.substring(0, 6)}...`,
            average_wait_time: item.average_wait_time,
            day_name: getDayName(item.day_of_week),
            time_period: getTimePeriod(item.hour_of_day)
          }));
          
          setWaitTimes(transformedData);
        }
      } catch (err) {
        console.error('Failed to fetch wait times:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWaitTimes();
    
    // Subscribe to real-time updates for service wait times
    const channel = supabase
      .channel('wait-time-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'service_wait_times' 
        },
        () => {
          // Refresh wait times when changes occur
          fetchWaitTimes();
          toast.info('Wait time estimates have been updated');
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Clock className="h-5 w-5 mr-2 text-qflow-teal" />
          Estimated Wait Times
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse h-20 w-full bg-muted rounded-md"></div>
          </div>
        ) : waitTimes.length > 0 ? (
          <div className="space-y-3">
            {waitTimes.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-md bg-card">
                <div>
                  <p className="font-medium">{item.service_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.day_name}, {item.time_period}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-muted">
                  {formatWaitTime(item.average_wait_time)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>No wait time data available</p>
            <p className="text-sm">Wait times will appear as services are completed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimatedWaitTimes;
