
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatWaitTime } from '@/lib/queue';

interface ServiceWaitTime {
  service_id: string;
  service_name: string;
  wait_time: number;
  queue_length: number;
}

const WaitTimesCard = () => {
  const [waitTimes, setWaitTimes] = useState<ServiceWaitTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWaitTimes = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('appointments', {
          method: 'GET',
          body: JSON.stringify({ request_type: 'wait_times' }),
        });

        if (error) throw error;

        if (data) {
          setWaitTimes(data);
        }
      } catch (error) {
        console.error('Error fetching wait times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitTimes();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Wait Times</CardTitle>
        <CardDescription>
          Estimated wait times for available services
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : waitTimes.length > 0 ? (
          <div className="space-y-3">
            {waitTimes.map((service) => (
              <div key={service.service_id} className="flex justify-between items-center p-2 rounded bg-muted/50">
                <div>
                  <div className="font-medium">{service.service_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {service.queue_length} {service.queue_length === 1 ? 'person' : 'people'} waiting
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatWaitTime(service.wait_time)}</div>
                  <div className="text-xs text-muted-foreground">estimated wait</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No wait time information available at the moment.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WaitTimesCard;
