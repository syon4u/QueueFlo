
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { ServiceMetricsCardProps } from './types';

const ServiceMetricsCard: React.FC<ServiceMetricsCardProps> = ({ serviceMetrics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Service Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium">Service</th>
                <th className="text-center py-2 px-4 font-medium">Appointments</th>
                <th className="text-center py-2 px-4 font-medium">Avg. Wait Time (min)</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(serviceMetrics) && serviceMetrics.length > 0 ? (
                serviceMetrics.map((service) => (
                  <tr key={service.service_id} className="border-b">
                    <td className="py-3 px-4">{service.service_name || 'Unknown'}</td>
                    <td className="text-center py-3 px-4">{service.appointments_count}</td>
                    <td className="text-center py-3 px-4">{service.average_wait_time.toFixed(1)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-muted-foreground">
                    No service data available for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceMetricsCard;
