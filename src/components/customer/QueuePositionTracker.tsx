
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { formatWaitTime } from '@/lib/queue';
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments';
import { useToast } from '@/hooks/use-toast';

const QueuePositionTracker: React.FC = () => {
  const { userPosition, estimatedWaitTime, appointments } = useRealtimeAppointments();
  const { toast } = useToast();
  const [previousPosition, setPreviousPosition] = useState<number | null>(null);
  
  // Effect to detect position changes and notify the user
  useEffect(() => {
    if (userPosition === null || previousPosition === null) {
      setPreviousPosition(userPosition);
      return;
    }
    
    // If the position has improved (number decreased)
    if (userPosition < previousPosition) {
      toast({
        title: "Queue position update",
        description: `Your position has moved up! You are now ${userPosition === 1 ? 'next' : `#${userPosition}`} in line.`,
        duration: 5000,
      });
      
      // If the user is next, send a more urgent notification
      if (userPosition === 1) {
        toast({
          title: "You're next!",
          description: "Please be ready, you will be called soon.",
          variant: "default",
          duration: 8000,
        });
      }
    }
    
    setPreviousPosition(userPosition);
  }, [userPosition, previousPosition, toast]);

  // Find user's appointment for additional details
  const userAppointment = appointments.find(appt => 
    appt.status === 'checked_in' || appt.status === 'scheduled'
  );

  if (!userPosition || !userAppointment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Queue Status</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>You don't have any active appointments in the queue.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center justify-between">
          <span>Your Queue Position</span>
          {userPosition === 1 && (
            <Bell className="h-5 w-5 text-primary animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <div className="text-4xl font-bold mb-2">
            {userPosition === 1 ? (
              <span className="text-primary animate-pulse">You're Next!</span>
            ) : (
              <>{userPosition}</>
            )}
          </div>
          <Badge variant={userPosition <= 3 ? "default" : "outline"}>
            {userPosition === 1 
              ? 'Please be ready' 
              : `${userPosition - 1} customer${userPosition - 1 !== 1 ? 's' : ''} ahead of you`
            }
          </Badge>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Estimated Wait</p>
              <p className="font-medium">{formatWaitTime(estimatedWaitTime || 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Service</p>
              <p className="font-medium truncate">{userAppointment?.service_id || "General"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{userAppointment?.status === 'checked_in' ? 'Checked In' : 'Scheduled'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium truncate">{userAppointment?.location_id || "Main Office"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueuePositionTracker;
