import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Adjust path
import { Database } from '@/integrations/supabase/types'; // Adjust path
import { useAppointments, Appointment } from '@/hooks/useAppointments'; // Assuming this hook can fetch by status
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, UserCheck, UserX, PhoneCall, SkipForward } from 'lucide-react';
import { useLocations, Location } from '@/hooks/useLocations'; // To select a location

// Define possible appointment statuses relevant to queue management
const QUEUE_STATUSES = ['booked', 'checked_in', 'called', 'serving', 'completed', 'no_show', 'cancelled'] as const;
type QueueStatus = typeof QUEUE_STATUSES[number];

interface StaffQueueManagementProps {
  // staffId: string; // To filter queues/locations relevant to the staff if needed
}

const StaffQueueManagementPage: React.FC<StaffQueueManagementProps> = () => {
  const { locations, fetchLocations, loading: locationsLoading } = useLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [errorQueue, setErrorQueue] = useState<string | null>(null);
  const { updateAppointment } = useAppointments(); // Assuming updateAppointment can change status

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const fetchQueueForLocation = useCallback(async (locationId: string) => {
    if (!locationId) return;
    setLoadingQueue(true);
    setErrorQueue(null);
    try {
      // Fetch appointments that are in a queue-relevant status for the selected location
      // This might need specific filtering in your Supabase query/function
      const { data, error } = await supabase
        .from('appointments')
        .select('*, services(name), locations(name)') // Adjust select as needed
        .eq('location_id', locationId)
        .in('status', ['booked', 'checked_in', 'called']) // Relevant statuses for an active queue
        .order('created_at', { ascending: true }); // Or by appointment_time

      if (error) throw error;
      setQueue(data as any[] || []);
    } catch (e: any) {
      console.error("Failed to fetch queue:", e);
      setErrorQueue(e.message || "Failed to load queue for the location.");
      setQueue([]);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      fetchQueueForLocation(selectedLocationId);
    }
  }, [selectedLocationId, fetchQueueForLocation]);

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    setQueue([]); // Clear previous queue
  };

  const callNextCustomer = async () => {
    if (!selectedLocationId) return;
    setLoadingQueue(true);
    try {
      // This logic should ideally be in a Supabase Edge Function `callNextInQueue`
      // For now, we'll find the first 'checked_in' or 'booked' customer and update their status to 'called'
      const nextCustomer = queue.find(app => app.status === 'checked_in' || app.status === 'booked');
      if (nextCustomer) {
        await updateAppointmentStatus(nextCustomer.id, 'called');
      } else {
        alert("No customers available to call.");
      }
    } catch (e: any) {
      alert(`Error calling next customer: ${e.message}`);
    } finally {
      setLoadingQueue(false);
      if (selectedLocationId) fetchQueueForLocation(selectedLocationId); // Refresh queue
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: QueueStatus) => {
    setLoadingQueue(true);
    try {
      await updateAppointment(appointmentId, { status });
      // Optionally, send notifications based on status change here or via a Supabase Function trigger
    } catch (e: any) {
      console.error(`Failed to update appointment ${appointmentId} to status ${status}:`, e);
      alert(`Error updating status: ${e.message}`);
      // Re-throw to be caught by calling function if needed for UI updates
      throw e;
    } finally {
      setLoadingQueue(false);
      if (selectedLocationId) fetchQueueForLocation(selectedLocationId); // Refresh queue
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Staff Queue Management</h2>

      <Card>
        <CardHeader>
          <CardTitle>Select Location</CardTitle>
        </CardHeader>
        <CardContent>
          {locationsLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select onValueChange={handleLocationChange} value={selectedLocationId || undefined}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a location to manage queue" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedLocationId && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Current Queue: {locations.find(l => l.id === selectedLocationId)?.name}</CardTitle>
                <Button onClick={callNextCustomer} disabled={loadingQueue || !queue.some(app => app.status === 'checked_in' || app.status === 'booked')}>
                    <PhoneCall className="mr-2 h-4 w-4" /> Call Next Customer
                </Button>
            </div>
            <CardDescription>Manage customers waiting for service.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingQueue && <div className="flex items-center justify-center py-4"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-2">Loading queue...</p></div>}
            {errorQueue && <p className="text-red-500"><AlertCircle className="inline mr-1" /> {errorQueue}</p>}
            {!loadingQueue && !errorQueue && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booked/Checked-in At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.length > 0 ? queue.map(app => (
                    <TableRow key={app.id}>
                      <TableCell>{app.customer_name || 'N/A'}</TableCell>
                      <TableCell>{(app as any).services?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                          ${app.status === 'called' ? 'bg-yellow-200 text-yellow-800' : 
                            app.status === 'serving' ? 'bg-blue-200 text-blue-800' : 
                            app.status === 'checked_in' ? 'bg-green-200 text-green-800' : 
                            'bg-gray-200 text-gray-800'}`}>
                          {app.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(app.created_at).toLocaleTimeString()}</TableCell> {/* Or app.appointment_time */}
                      <TableCell className="text-right space-x-1">
                        {app.status === 'called' && (
                          <Button variant="outline" size="sm" onClick={() => updateAppointmentStatus(app.id, 'serving')} disabled={loadingQueue}>
                            Start Serving
                          </Button>
                        )}
                        {(app.status === 'checked_in' || app.status === 'booked') && app.status !== 'called' && (
                            <Button variant="outline" size="sm" onClick={() => updateAppointmentStatus(app.id, 'called')} disabled={loadingQueue}>
                                <PhoneCall className="h-3 w-3 mr-1" /> Call
                            </Button>
                        )}
                        {app.status === 'serving' && (
                          <Button variant="default" size="sm" onClick={() => updateAppointmentStatus(app.id, 'completed')} disabled={loadingQueue}>
                            <UserCheck className="h-3 w-3 mr-1" /> Mark Served
                          </Button>
                        )}
                         {(app.status === 'booked' || app.status === 'checked_in' || app.status === 'called') && (
                            <Button variant="ghost" size="sm" onClick={() => updateAppointmentStatus(app.id, 'no_show')} disabled={loadingQueue} title="Mark as No Show">
                                <UserX className="h-3 w-3"/>
                            </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-4">No customers in the queue for this location.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffQueueManagementPage;

