import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Appointment } from '@/hooks/useAppointments'; // Assuming Appointment type is defined
import { Location } from '@/hooks/useLocations';
import { Service } from '@/hooks/useServices';
import { format } from 'date-fns';

interface AppointmentConfirmationStepProps {
  appointmentDetails: Appointment | null; // Full appointment details from backend
  location: Location | null;
  service: Service | null;
  error?: string | null;
  onBookAnother: () => void;
  onGoToDashboard: () => void;
}

const AppointmentConfirmationStep: React.FC<AppointmentConfirmationStepProps> = ({
  appointmentDetails,
  location,
  service,
  error,
  onBookAnother,
  onGoToDashboard
}) => {
  if (error) {
    return (
      <Card className="w-full max-w-lg mx-auto text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <CardTitle className="mt-4">Booking Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-red-700">
            Unfortunately, we couldn't book your appointment. Please try again.
          </CardDescription>
          <p className="mt-2 text-sm text-gray-500">Error: {error}</p>
          <Button onClick={onBookAnother} className="mt-6 w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!appointmentDetails || !location || !service) {
    // This case should ideally not happen if an appointment is successfully booked
    // Or could be a loading state if confirmation details are fetched separately
    return (
      <Card className="w-full max-w-lg mx-auto text-center">
        <CardHeader>
          <CardTitle>Processing Confirmation...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Waiting for appointment confirmation details.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto text-center">
      <CardHeader>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
        </div>
        <CardTitle className="mt-4">Appointment Confirmed!</CardTitle>
        <CardDescription>
          Your appointment has been successfully booked.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-gray-700">
        <div className="space-y-2 text-left">
          <p><strong>Confirmation ID:</strong> {appointmentDetails.id}</p>
          <p><strong>Service:</strong> {service.name}</p>
          <p><strong>Location:</strong> {location.name}</p>
          {location.address && <p><strong>Address:</strong> {location.address}</p>}
          <p><strong>Date:</strong> {format(new Date(appointmentDetails.start_time), 'PPP')}</p>
          <p><strong>Time:</strong> {format(new Date(appointmentDetails.start_time), 'p')} - {format(new Date(appointmentDetails.end_time), 'p')}</p>
          {appointmentDetails.notes && <p><strong>Notes:</strong> {appointmentDetails.notes}</p>}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          You will receive a confirmation email shortly. Please check your spam folder if you don't see it.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-2 sm:space-y-0">
          <Button onClick={onBookAnother} variant="outline">
            Book Another Appointment
          </Button>
          <Button onClick={onGoToDashboard} asChild>
            <Link to="/customer/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentConfirmationStep;

