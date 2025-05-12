
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, isPast, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

// Types for queue schedule events
interface QueueScheduleEvent {
  id?: string;
  location_id: string;
  title: string;
  description?: string;
  event_type: 'closed' | 'limited' | 'special_hours' | 'holiday';
  start_date: Date;
  end_date: Date;
  created_by: string;
}

interface QueueSchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: string;
  userId: string;
}

const QueueSchedulingDialog: React.FC<QueueSchedulingDialogProps> = ({ 
  open,
  onOpenChange,
  locationId,
  userId
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleEvent, setScheduleEvent] = useState<QueueScheduleEvent>({
    location_id: locationId,
    title: '',
    description: '',
    event_type: 'closed',
    start_date: new Date(),
    end_date: addDays(new Date(), 1),
    created_by: userId
  });
  
  // Validate form
  const isValid = () => {
    if (!scheduleEvent.title.trim()) return false;
    if (isPast(scheduleEvent.start_date) && !isSameDay(scheduleEvent.start_date, new Date())) return false;
    if (scheduleEvent.end_date < scheduleEvent.start_date) return false;
    return true;
  };

  // Handle date selection
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    setScheduleEvent(prev => ({ 
      ...prev, 
      start_date: date,
      end_date: prev.end_date < date ? date : prev.end_date
    }));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    setScheduleEvent(prev => ({ ...prev, end_date: date }));
  };

  // Save schedule event
  const handleSaveEvent = async () => {
    if (!isValid()) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('schedule.invalidEventDetails')
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Format dates for database
      const formattedEvent = {
        ...scheduleEvent,
        start_date: format(scheduleEvent.start_date, 'yyyy-MM-dd'),
        end_date: format(scheduleEvent.end_date, 'yyyy-MM-dd')
      };

      // Insert into database - Using a raw query since we can't use the typed client yet
      const { error } = await supabase
        .from('queue_schedule')
        .insert(formattedEvent as any); // Type assertion needed until Supabase types are updated

      if (error) throw error;

      toast({
        title: t('schedule.eventCreatedTitle'),
        description: t('schedule.eventCreatedDescription')
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving queue schedule event:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('schedule.savingError')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('schedule.advancedScheduling')}</DialogTitle>
          <DialogDescription>{t('schedule.planQueueChanges')}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">{t('schedule.eventTitle')}</Label>
            <Input
              id="title"
              value={scheduleEvent.title}
              onChange={(e) => setScheduleEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('schedule.eventTitlePlaceholder')}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="event_type">{t('schedule.eventType')}</Label>
            <Select 
              value={scheduleEvent.event_type} 
              onValueChange={(value: 'closed' | 'limited' | 'special_hours' | 'holiday') => 
                setScheduleEvent(prev => ({ ...prev, event_type: value }))
              }
            >
              <SelectTrigger id="event_type">
                <SelectValue placeholder={t('schedule.selectEventType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="closed">{t('schedule.queueClosed')}</SelectItem>
                <SelectItem value="limited">{t('schedule.limitedCapacity')}</SelectItem>
                <SelectItem value="special_hours">{t('schedule.specialHours')}</SelectItem>
                <SelectItem value="holiday">{t('schedule.holiday')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('schedule.startDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduleEvent.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleEvent.start_date ? (
                      format(scheduleEvent.start_date, "PPP")
                    ) : (
                      <span>{t('schedule.pickDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduleEvent.start_date}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label>{t('schedule.endDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduleEvent.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleEvent.end_date ? (
                      format(scheduleEvent.end_date, "PPP")
                    ) : (
                      <span>{t('schedule.pickDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduleEvent.end_date}
                    onSelect={handleEndDateChange}
                    fromDate={scheduleEvent.start_date}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">{t('schedule.eventDescription')}</Label>
            <Textarea
              id="description"
              value={scheduleEvent.description || ''}
              onChange={(e) => setScheduleEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('schedule.eventDescriptionPlaceholder')}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSaveEvent} disabled={isSubmitting || !isValid()}>
            {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QueueSchedulingDialog;
