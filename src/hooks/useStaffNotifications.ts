
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useStaffNotifications() {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('appointments-notifications')
      .on('postgres_changes', 
        {
          event: 'UPDATE', 
          schema: 'public',
          table: 'appointments',
          filter: 'status=eq.checked_in'
        }, 
        (payload) => {
          // A customer has just checked in
          toast({
            title: "Customer Check-in",
            description: `A customer has checked in for appointment #${payload.new.id.substring(0, 8)}`,
            duration: 5000,
          });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
}
