import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock data - replace with actual data fetching and processing
const mockAppointmentData = [
  { date: '2024-05-01', count: 15, type: 'booked' },
  { date: '2024-05-01', count: 12, type: 'completed' },
  { date: '2024-05-01', count: 2, type: 'cancelled' },
  { date: '2024-05-02', count: 20, type: 'booked' },
  { date: '2024-05-02', count: 18, type: 'completed' },
  { date: '2024-05-02', count: 1, type: 'cancelled' },
  { date: '2024-05-03', count: 12, type: 'booked' },
  { date: '2024-05-03', count: 10, type: 'completed' },
  { date: '2024-05-03', count: 0, type: 'cancelled' },
  // Add more data points
];

const mockQueueData = [
  { time: '09:00', avgWait: 15, peakSize: 10 },
  { time: '10:00', avgWait: 20, peakSize: 12 },
  { time: '11:00', avgWait: 25, peakSize: 15 },
  { time: '12:00', avgWait: 18, peakSize: 10 },
  { time: '13:00', avgWait: 22, peakSize: 14 },
  { time: '14:00', avgWait: 30, peakSize: 18 },
  { time: '15:00', avgWait: 20, peakSize: 11 },
  { time: '16:00', avgWait: 15, peakSize: 8 },
];

const SystemAnalytics: React.FC = () => {
  // In a real application, you would fetch and process data from your backend.
  // For example, using a custom hook: `const { data, loading, error } = useAnalyticsData();`

  // Process appointment data for chart
  const appointmentChartData = mockAppointmentData.reduce((acc, curr) => {
    let entry = acc.find(item => item.date === curr.date);
    if (!entry) {
      entry = { date: curr.date, booked: 0, completed: 0, cancelled: 0 };
      acc.push(entry);
    }
    if (curr.type === 'booked') entry.booked += curr.count;
    if (curr.type === 'completed') entry.completed += curr.count;
    if (curr.type === 'cancelled') entry.cancelled += curr.count;
    return acc;
  }, [] as Array<{ date: string; booked: number; completed: number; cancelled: number }>);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">System Analytics</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Appointments Overview</CardTitle>
          <CardDescription>Daily appointment statistics.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="booked" fill="#8884d8" name="Booked" />
              <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
              <Bar dataKey="cancelled" fill="#ff7300" name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queue Performance</CardTitle>
          <CardDescription>Average wait times and peak queue sizes throughout the day.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockQueueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" label={{ value: 'Avg Wait (min)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Peak Size', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="avgWait" stroke="#8884d8" name="Avg. Wait Time (min)" />
              <Line yAxisId="right" type="monotone" dataKey="peakSize" stroke="#82ca9d" name="Peak Queue Size" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Add more charts and data displays as needed */}
      {/* e.g., Staff Performance, Service Popularity, Customer Satisfaction (from surveys) */}
      <Card>
        <CardHeader>
          <CardTitle>More Analytics Coming Soon</CardTitle>
          <CardDescription>Detailed reports on staff performance, service popularity, and customer feedback will be available here.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-gray-500">Stay tuned for more insights!</p>
        </CardContent>
      </Card>

    </div>
  );
};

export default SystemAnalytics;

