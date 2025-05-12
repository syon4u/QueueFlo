
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StaffPerformanceCardProps } from './types';

const StaffPerformanceCard: React.FC<StaffPerformanceCardProps> = ({ staffMetrics }) => {
  const [activeTab, setActiveTab] = useState('metrics');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          Staff Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="chart">Service Time</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Staff Member</th>
                    <th className="text-center py-2 px-4 font-medium">Appointments</th>
                    <th className="text-center py-2 px-4 font-medium">Avg. Service (min)</th>
                    <th className="text-center py-2 px-4 font-medium">No-shows</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(staffMetrics) && staffMetrics.length > 0 ? (
                    staffMetrics.map((staff) => (
                      <tr key={staff.staff_id} className="border-b">
                        <td className="py-3 px-4">{staff.staff_name || 'Unknown'}</td>
                        <td className="text-center py-3 px-4">{staff.appointments_served}</td>
                        <td className="text-center py-3 px-4">{staff.average_service_time.toFixed(1)}</td>
                        <td className="text-center py-3 px-4">{staff.no_shows}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-muted-foreground">
                        No staff data available for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="chart">
            {Array.isArray(staffMetrics) && staffMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={staffMetrics}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="staff_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average_service_time" name="Avg. Service Time (min)" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No staff data available for this period
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StaffPerformanceCard;
