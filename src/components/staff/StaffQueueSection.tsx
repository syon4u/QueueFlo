
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useQueue } from '@/context/QueueContext';
import { useAuth } from '@/context/AuthContext';
import QueueSchedulingDialog from './QueueSchedulingDialog';
import { supabase } from '@/integrations/supabase/client';

const StaffQueueSection: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { queueStatus, setQueueStatus, locationId } = useQueue();
  const { user } = useAuth();
  const [showSchedulingDialog, setShowSchedulingDialog] = useState(false);
  
  const handleQueueStatusChange = async (newStatus: 'open' | 'closed') => {
    if (!locationId) return;
    
    try {
      // Update the location's queue status in the database
      const { error } = await supabase
        .from('locations')
        .update({ queue_status: newStatus })
        .eq('id', locationId);
        
      if (error) throw error;
      
      // Update the UI
      setQueueStatus(newStatus);
      
      toast({
        title: t('staff.queueStatusUpdated'),
        description: t('staff.queueIsNow', { status: t(`staff.queue${newStatus === 'open' ? 'Open' : 'Closed'}`) })
      });
    } catch (error) {
      console.error('Error updating queue status:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('staff.queueStatusUpdateError')
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium mb-1">{t('staff.queueStatus')}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`h-2 w-2 rounded-full ${
              queueStatus === 'open' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {queueStatus === 'open' ? t('staff.queueOpen') : t('staff.queueClosed')}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {queueStatus !== 'open' && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleQueueStatusChange('open')}
            >
              <Play className="mr-2 h-4 w-4" />
              {t('staff.openQueue')}
            </Button>
          )}
          
          {queueStatus !== 'closed' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQueueStatusChange('closed')}
            >
              <Pause className="mr-2 h-4 w-4" />
              {t('staff.closeQueue')}
            </Button>
          )}
          
          {/* Add Advanced Scheduling Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSchedulingDialog(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {t('schedule.advancedScheduling')}
          </Button>
        </div>
      </div>
      
      {/* Queue Scheduling Dialog */}
      {user && locationId && (
        <QueueSchedulingDialog
          open={showSchedulingDialog}
          onOpenChange={setShowSchedulingDialog}
          locationId={locationId}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default StaffQueueSection;
