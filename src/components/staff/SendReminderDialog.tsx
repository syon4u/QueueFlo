
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AppointmentReminderForm } from './AppointmentReminderForm';
import type { Appointment } from '@/hooks/use-appointments';

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export const SendReminderDialog: React.FC<SendReminderDialogProps> = ({
  open,
  onOpenChange,
  appointment,
}) => {
  const handleComplete = () => {
    onOpenChange(false);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Reminder</DialogTitle>
          <DialogDescription>
            Send a custom reminder to the customer for their appointment.
          </DialogDescription>
        </DialogHeader>
        <AppointmentReminderForm 
          appointment={appointment} 
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
