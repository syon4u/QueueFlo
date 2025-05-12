import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Define the Customer type
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  priority: 'normal' | 'priority';
  status: 'waiting' | 'serving' | 'served' | 'no-show';
  joinedAt: Date;
  estimatedWaitTime?: number;
  serviceId?: string;
}

// Define statistics type
interface QueueStats {
  totalCustomers: number;
  waitingCustomers: number;
  servedCustomers: number;
  noShowCustomers: number;
  averageWaitTime: number;
}

// Define the context type
interface QueueContextType {
  queueStatus: string;
  setQueueStatus: React.Dispatch<React.SetStateAction<string>>;
  locationId: string | null;
  currentQueueNumber: number | null;
  setCurrentQueueNumber: React.Dispatch<React.SetStateAction<number | null>>;
  waitingCount: number;
  setWaitingCount: React.Dispatch<React.SetStateAction<number>>;
  averageWaitTime: number | null;
  setAverageWaitTime: React.Dispatch<React.SetStateAction<number | null>>;
  // Add missing properties
  customers: Customer[];
  currentCustomer: Customer | null;
  stats: QueueStats;
  addCustomer: (customerData: Omit<Customer, 'id' | 'status' | 'joinedAt'>) => void;
  callNextCustomer: () => void;
  markAsServed: () => void;
  markAsNoShow: () => void;
  resetQueue: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queueStatus, setQueueStatus] = useState<string>('closed');
  const [currentQueueNumber, setCurrentQueueNumber] = useState<number | null>(null);
  const [waitingCount, setWaitingCount] = useState<number>(0);
  const [averageWaitTime, setAverageWaitTime] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  
  // Add new state variables
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  const { user } = useAuth();
  
  // Calculate stats whenever customers change
  const stats: QueueStats = {
    totalCustomers: customers.length,
    waitingCustomers: customers.filter(c => c.status === 'waiting').length,
    servedCustomers: customers.filter(c => c.status === 'served').length,
    noShowCustomers: customers.filter(c => c.status === 'no-show').length,
    averageWaitTime: averageWaitTime || 5, // Default to 5 minutes if no data
  };
  
  // Fetch location ID and queue status when the component mounts
  useEffect(() => {
    const fetchQueueStatus = async () => {
      if (!user) return;
      
      try {
        // First get staff's location_id
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('location_id')
          .eq('id', user.id)
          .single();
        
        if (staffError) throw staffError;
        
        if (staffData && staffData.location_id) {
          setLocationId(staffData.location_id);
          
          // Now get the queue status for this location
          const { data: locationData, error: locationError } = await supabase
            .from('locations')
            .select('queue_status')
            .eq('id', staffData.location_id)
            .single();
          
          if (locationError) throw locationError;
          
          if (locationData) {
            // Fix here: Add type assertion or optional chaining
            setQueueStatus(locationData.queue_status as string || 'closed');
          }
        }
      } catch (error) {
        console.error('Error fetching queue status:', error);
      }
    };
    
    fetchQueueStatus();
    
    // Subscribe to queue changes
    const queueSubscription = supabase
      .channel('queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, payload => {
        if (payload.new) {
          // Fix here: Add type assertion
          const newData = payload.new as { queue_status?: string };
          if (newData.queue_status) {
            setQueueStatus(newData.queue_status);
          }
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(queueSubscription);
    };
  }, [user]);

  // Add a customer to the queue
  const addCustomer = (customerData: Omit<Customer, 'id' | 'status' | 'joinedAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: crypto.randomUUID(),
      status: 'waiting',
      joinedAt: new Date(),
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    setWaitingCount(prev => prev + 1);
    
    toast.success(`Added ${newCustomer.name} to the queue`);
    return newCustomer;
  };
  
  // Call the next customer in the queue
  const callNextCustomer = () => {
    const waitingCustomers = customers
      .filter(c => c.status === 'waiting')
      .sort((a, b) => {
        // Sort by priority first
        if (a.priority !== b.priority) {
          return a.priority === 'priority' ? -1 : 1;
        }
        // Then by join time
        return a.joinedAt.getTime() - b.joinedAt.getTime();
      });
    
    if (waitingCustomers.length > 0) {
      const nextCustomer = waitingCustomers[0];
      
      setCustomers(prev => 
        prev.map(c => c.id === nextCustomer.id ? { ...c, status: 'serving' } : c)
      );
      
      setCurrentCustomer(nextCustomer);
      setCurrentQueueNumber(prevNum => (prevNum || 0) + 1);
      
      toast.success(`Now serving: ${nextCustomer.name}`);
    } else {
      toast.info("No customers waiting in queue");
    }
  };
  
  // Mark the current customer as served
  const markAsServed = () => {
    if (!currentCustomer) {
      toast.error("No customer being served");
      return;
    }
    
    setCustomers(prev => 
      prev.map(c => c.id === currentCustomer.id ? { ...c, status: 'served' } : c)
    );
    
    toast.success(`${currentCustomer.name} has been served`);
    setCurrentCustomer(null);
  };
  
  // Mark the current customer as a no-show
  const markAsNoShow = () => {
    if (!currentCustomer) {
      toast.error("No customer being served");
      return;
    }
    
    setCustomers(prev => 
      prev.map(c => c.id === currentCustomer.id ? { ...c, status: 'no-show' } : c)
    );
    
    toast.info(`${currentCustomer.name} marked as no-show`);
    setCurrentCustomer(null);
  };
  
  // Reset the entire queue
  const resetQueue = () => {
    setCustomers([]);
    setCurrentCustomer(null);
    setCurrentQueueNumber(0);
    setWaitingCount(0);
    
    toast.success("Queue has been reset");
  };

  const value = {
    queueStatus,
    setQueueStatus,
    currentQueueNumber,
    setCurrentQueueNumber,
    waitingCount,
    setWaitingCount,
    averageWaitTime,
    setAverageWaitTime,
    locationId,
    // Add missing properties to context value
    customers,
    currentCustomer,
    stats,
    addCustomer,
    callNextCustomer,
    markAsServed,
    markAsNoShow,
    resetQueue,
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
