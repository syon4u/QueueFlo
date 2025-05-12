
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { AlertCircle } from 'lucide-react';

interface BlackoutPeriodControlProps {
  locationId?: string;
}

const BlackoutPeriodControl: React.FC<BlackoutPeriodControlProps> = ({ locationId }) => {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [isBlackoutActive, setIsBlackoutActive] = useState(false);
  const [reason, setReason] = useState('');
  const [estimatedEndTime, setEstimatedEndTime] = useState('');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if blackout is active on component mount
  useEffect(() => {
    if (locationId) {
      checkBlackoutStatus(locationId);
    }
  }, [locationId]);
  
  const checkBlackoutStatus = async (locationId: string) => {
    try {
      // For now, we'll just simulate the blackout status
      // In a real app, these columns would need to be added to the locations table
      // We'll just use local state to simulate the functionality
      
      // Log what we're trying to do
      console.log('Checking blackout status for location:', locationId);
      
      // Simulated data
      // In a real implementation, we would fetch this from the database
      setIsBlackoutActive(false);
      setReason('');
      setEstimatedEndTime('');
    } catch (error) {
      console.error('Error checking blackout status:', error);
    }
  };
  
  const toggleBlackoutPeriod = async (active: boolean) => {
    if (!user || !locationId) return;
    if (role !== 'admin' && role !== 'staff') return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would update the locations table
      // For now, we'll just simulate the status change with local state
      
      // Log the attempted action for debugging
      console.log('Toggling blackout period:', active ? 'Enable' : 'Disable', 'for location:', locationId);
      if (active) {
        console.log('Reason:', reason);
        console.log('Estimated end time:', estimatedEndTime);
      }
      
      setIsBlackoutActive(active);
      if (active) {
        setReason(reason);
        setEstimatedEndTime(estimatedEndTime);
      } else {
        setReason('');
        setEstimatedEndTime('');
      }
      
      toast({
        title: t('common.success'),
        description: active 
          ? t('staff.blackoutPeriod.enabled') 
          : t('staff.blackoutPeriod.disabled')
      });
      
      if (active) {
        setOpen(false);
      }
    } catch (error) {
      console.error('Error toggling blackout period:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to update blackout period',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!locationId || (role !== 'admin' && role !== 'staff')) {
    return null;
  }
  
  return (
    <div className="mb-4">
      {isBlackoutActive ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('staff.blackoutPeriod.active')}</AlertTitle>
            <AlertDescription>
              {reason || t('staff.blackoutPeriod.description')}
              {estimatedEndTime && (
                <span className="block mt-1">
                  {t('staff.blackoutPeriod.estimatedEnd')}: {new Date(estimatedEndTime).toLocaleString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => toggleBlackoutPeriod(false)}
            disabled={isSubmitting}
          >
            {t('staff.blackoutPeriod.disable')}
          </Button>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              {t('staff.blackoutPeriod.enable')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('staff.blackoutPeriod.enable')}</DialogTitle>
              <DialogDescription>
                {t('staff.blackoutPeriod.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reason">{t('staff.blackoutPeriod.reason')}</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('staff.blackoutPeriod.reasonPlaceholder')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimatedEndTime">
                  {t('staff.blackoutPeriod.estimatedEndTime')}
                </Label>
                <Input
                  id="estimatedEndTime"
                  type="datetime-local"
                  value={estimatedEndTime}
                  onChange={(e) => setEstimatedEndTime(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => toggleBlackoutPeriod(true)}
                disabled={isSubmitting}
              >
                {t('staff.blackoutPeriod.confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BlackoutPeriodControl;
