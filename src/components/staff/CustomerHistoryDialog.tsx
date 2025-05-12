
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/components/customer/CustomerSearchBox';
import { Appointment } from '@/hooks/use-appointments';

interface CustomerHistoryDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomerHistoryDialog: React.FC<CustomerHistoryDialogProps> = ({ 
  customer, 
  open, 
  onOpenChange 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState('appointments');

  // Fetch customer history when dialog opens
  useEffect(() => {
    if (customer && open) {
      fetchCustomerHistory(customer.id);
    }
  }, [customer, open]);

  const fetchCustomerHistory = async (customerId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-history', {
        body: { customerId }
      });

      if (error) throw error;
      
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching customer history:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('customer.historyError')
      });
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('customer.history')}</DialogTitle>
          <DialogDescription>{t('customer.historyDescription')}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>{customer.first_name} {customer.last_name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {customer.phone && <div>📱 {customer.phone}</div>}
              {customer.email && <div>📧 {customer.email}</div>}
            </CardContent>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="appointments">{t('staff.appointments')}</TabsTrigger>
              <TabsTrigger value="notes">{t('appointments.notes')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appointments">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : appointments.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('appointments.date')}</TableHead>
                        <TableHead>{t('appointments.service')}</TableHead>
                        <TableHead>{t('appointments.status.scheduled')}</TableHead>
                        <TableHead>{t('appointments.reasonForVisit')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {format(new Date(appointment.scheduled_time), 'PPP')}
                          </TableCell>
                          <TableCell>{appointment.service_id}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs font-medium capitalize bg-gray-100">
                              {t(`appointments.status.${appointment.status}`)}
                            </span>
                          </TableCell>
                          <TableCell>{appointment.reason_for_visit || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  {t('customer.noAppointmentHistory')}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="notes">
              <div className="text-center p-8 text-muted-foreground">
                {t('performance.comingSoon')}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerHistoryDialog;
