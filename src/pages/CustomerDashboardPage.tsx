import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppointments, Appointment } from '@/hooks/useAppointments'; // Adjust path as needed
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Loader2, PlusCircle } from 'lucide-react';

// Mock function to get current user ID - replace with actual auth context
const getCurrentUserId = () => {
  // In a real app, this would come from your auth context or similar
  return 'user-123-placeholder'; 
};

const CustomerDashboardPage: React.FC = () => {
  const { appointments, loading, error, fetchAppointments, cancelAppointment } = useAppointments();
  const userId = getCurrentUserId();

  useEffect(() => {
    if (userId) {
      fetchAppointments({ userId }); // Fetch appointments for the current user
    }
  }, [fetchAppointments, userId]);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(appointmentId);
        // Optionally, refetch appointments or filter out the cancelled one locally
        if (userId) fetchAppointments({ userId }); 
      } catch (err) {
        // Handle error (e.g., show a toast notification)
        console.error('Failed to cancel appointment:', err);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <Button asChild>
          <Link to="/book-appointment">
            <PlusCircle className="mr-2 h-4 w-4" /> Book New Appointment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Past Appointments</CardTitle>
          <CardDescription>View and manage your scheduled appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="ml-2">Loading appointments...</p>
            </div>
          )}
          {error && <p className="text-red-500 text-center">Error loading appointments: {error.message || 'Unknown error'}</p>}
          {!loading && !error && appointments.length === 0 && (
            <p className="text-center text-gray-500">You have no appointments scheduled.</p>
          )}
          {!loading && !error && appointments.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.service_id}</TableCell> {/* Replace with service name once available */}
                    <TableCell>{appt.location_id}</TableCell> {/* Replace with location name once available */}
                    <TableCell>{format(new Date(appt.start_time), 'PPP')}</TableCell>
                    <TableCell>{format(new Date(appt.start_time), 'p')} - {format(new Date(appt.end_time), 'p')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={appt.status === 'confirmed' ? 'default' : appt.status === 'cancelled' ? 'destructive' : 'secondary'}
                      >
                        {appt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {appt.status === 'confirmed' && (
                        <Button variant="outline" size="sm" onClick={() => handleCancelAppointment(appt.id)}>
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for Queue Status - to be developed further */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Live Queue Status</CardTitle>
          <CardDescription>Check your current position in the queue if you are waiting.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Queue status feature coming soon.</p>
          {/* 
            Example of what might be here:
            - If in queue: Display position, estimated wait time.
            - If not in queue: Message indicating so.
            - This would require real-time updates, possibly via Supabase Realtime.
          */}
        </CardContent>
      </Card>

    </div>
  );
};

export default CustomerDashboardPage;

