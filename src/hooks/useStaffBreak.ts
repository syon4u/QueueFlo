
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BREAK_TYPES } from '@/components/staff/performance/constants';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
}

export function useStaffBreak(onBreakStatusChange: () => void) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breakType, setBreakType] = useState('short');
  const [customDuration, setCustomDuration] = useState(15);
  const [handoverStaffId, setHandoverStaffId] = useState('none');
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);

  // Get duration based on break type
  const getDuration = () => {
    if (breakType === 'custom') return customDuration;
    const selectedBreak = BREAK_TYPES.find(b => b.value === breakType);
    return selectedBreak?.duration || 15;
  };

  // Fetch available staff for handover
  useEffect(() => {
    if (user) {
      const fetchAvailableStaff = async () => {
        try {
          // Get location_id for current staff
          const { data: currentStaff, error: staffError } = await supabase
            .from('staff')
            .select('location_id')
            .eq('id', user.id)
            .single();

          if (staffError) throw staffError;
          
          // Get staff at the same location who are active
          const { data, error } = await supabase
            .from('staff')
            .select('id, first_name, last_name')
            .eq('location_id', currentStaff.location_id)
            .neq('id', user.id)
            .eq('status', 'active') as any;
          
          if (error) throw error;
          
          // Filter to ensure we have valid staff members
          const validStaff = (data || []).filter(
            (s: any) => s.id && s.first_name && s.last_name
          );
          
          setAvailableStaff(validStaff as StaffMember[]);
        } catch (error) {
          console.error('Error fetching available staff:', error);
        }
      };

      fetchAvailableStaff();
    }
  }, [user]);

  // Handle taking a break
  const handleTakeBreak = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const duration = getDuration();
      const returnTime = new Date();
      returnTime.setMinutes(returnTime.getMinutes() + duration);

      // Update staff status and set return time using raw query
      const { error: statusError } = await supabase
        .from('staff')
        .update({
          status: 'break',
          return_time: returnTime.toISOString(),
          handover_staff_id: handoverStaffId !== 'none' ? handoverStaffId : null
        } as any)
        .eq('id', user.id);

      if (statusError) throw statusError;

      // If handover selected, notify that staff
      if (handoverStaffId && handoverStaffId !== 'none') {
        // Insert notification for handover staff using raw query
        const { error: notifyError } = await supabase
          .from('staff_notifications')
          .insert({
            staff_id: handoverStaffId,
            type: 'handover',
            message: t('staff.handoverRequestMessage', { 
              name: user.user_metadata?.name || user.email,
              duration 
            }),
            status: 'unread'
          } as any);

        if (notifyError) throw notifyError;
      }

      toast({
        title: t('staff.breakStartedTitle'),
        description: t('staff.breakStartedDescription', { duration })
      });
      
      onBreakStatusChange();
      return true;
    } catch (error) {
      console.error('Error setting break status:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('staff.breakErrorDescription')
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    breakType,
    setBreakType,
    customDuration,
    setCustomDuration,
    handoverStaffId,
    setHandoverStaffId,
    availableStaff,
    handleTakeBreak,
    getDuration
  };
}
