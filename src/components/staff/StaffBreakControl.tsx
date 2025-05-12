
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Coffee } from 'lucide-react';

interface StaffBreakControlProps {
  onStatusChange?: () => void;
}

const StaffBreakControl: React.FC<StaffBreakControlProps> = ({ onStatusChange }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [duration, setDuration] = useState(15);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startBreak = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // In a real app with a staff_status table, we'd update that
      // For now, we'll just simulate the status change
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      // Log the attempted action for debugging
      console.log('Starting break for user:', user.id, 'with duration:', duration, 'minutes');
      console.log('Handover notes:', handoverNotes);
      
      setIsOnBreak(true);
      toast({
        title: t('staff.statusUpdated'),
        description: t('staff.status.break')
      });
      
      onStatusChange?.();
      setOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const endBreak = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // In a real app with a staff_status table, we'd update that
      // For now, we'll just simulate the status change
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      // Log the attempted action for debugging
      console.log('Ending break for user:', user.id);
      
      setIsOnBreak(false);
      toast({
        title: t('staff.statusUpdated'),
        description: t('staff.status.available')
      });
      
      onStatusChange?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {isOnBreak ? (
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={endBreak}
          disabled={isSubmitting}
        >
          <Coffee className="h-4 w-4" />
          {t('staff.status.endBreak')}
        </Button>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              {t('staff.status.break')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('staff.status.takeBreak')}</DialogTitle>
              <DialogDescription>
                {t('staff.status.breakDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  {t('staff.status.breakDuration')}
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  max={60}
                  className="col-span-3"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="handover" className="text-right">
                  {t('staff.status.handoverNotes')}
                </Label>
                <Textarea
                  id="handover"
                  className="col-span-3"
                  placeholder={t('staff.status.handoverPlaceholder')}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="button" onClick={startBreak} disabled={isSubmitting}>
                {isSubmitting ? t('common.loading') : t('staff.status.startBreak')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StaffBreakControl;
