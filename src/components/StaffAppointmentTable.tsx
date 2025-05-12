
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Appointment, AppointmentStatus } from '@/hooks/use-appointments';
import { SendReminderDialog } from './staff/SendReminderDialog';
import CustomerHistoryModal from './staff/CustomerHistoryModal';
import { Bell, History, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StaffAppointmentTableProps {
  appointments: Appointment[];
  onStatusChange?: () => void;
}

const StaffAppointmentTable: React.FC<StaffAppointmentTableProps> = ({ 
  appointments, 
  onStatusChange 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    setIsLoading(prev => ({ ...prev, [id]: true }));
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: t('common.success'),
        description: t('appointments.statusUpdated'),
      });

      onStatusChange?.();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: t('common.error'),
        description: t('appointments.statusUpdateError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [id]: false }));
    }
  };
  
  const handleOpenReminderDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setReminderDialogOpen(true);
  };

  if (!appointments.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No active appointments found</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('appointments.scheduledTime')}</TableHead>
            <TableHead>{t('appointments.status')}</TableHead>
            <TableHead>{t('appointments.service')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('appointments.customer')}</TableHead>
            <TableHead>{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                {format(new Date(appointment.scheduled_time), 'PPp')}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(appointment.status)}>
                  {t(`appointments.status.${appointment.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                {appointment.service_id}
                {appointment.reason_for_visit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                        <Info size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="max-w-xs break-words">
                        <span className="font-bold">{t('appointments.reasonForVisit')}:</span> {appointment.reason_for_visit}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">{appointment.customer_id}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateAppointmentStatus(appointment.id, 'checked_in')}
                    disabled={isLoading[appointment.id] || appointment.status !== 'scheduled'}
                    title={t('appointments.checkIn')}
                  >
                    {isLoading[appointment.id] ? t('common.loading') : t('appointments.checkIn')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                    disabled={isLoading[appointment.id] || appointment.status !== 'checked_in'}
                    title={t('appointments.startService')}
                  >
                    {isLoading[appointment.id] ? t('common.loading') : t('appointments.startService')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                    disabled={isLoading[appointment.id] || appointment.status !== 'in_progress'}
                    title={t('appointments.complete')}
                  >
                    {isLoading[appointment.id] ? t('common.loading') : t('appointments.complete')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                    disabled={isLoading[appointment.id] || appointment.status === 'cancelled'}
                    title={t('appointments.cancel')}
                  >
                    {isLoading[appointment.id] ? t('common.loading') : t('appointments.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenReminderDialog(appointment)}
                    title={t('appointments.sendReminder')}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <CustomerHistoryModal 
                    customerId={appointment.customer_id}
                    trigger={
                      <Button
                        size="sm"
                        variant="outline"
                        title={t('customer.viewHistory')}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SendReminderDialog
        open={reminderDialogOpen}
        onOpenChange={setReminderDialogOpen}
        appointment={selectedAppointment}
      />
    </TooltipProvider>
  );
};

// Helper function to determine badge variant based on status
const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case 'checked_in': return 'secondary';
    case 'in_progress': return 'default';
    case 'completed': return 'outline';
    case 'cancelled': 
    case 'no_show': 
      return 'destructive';
    default: return 'outline';
  }
};

export default StaffAppointmentTable;
