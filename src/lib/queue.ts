
import type { Customer } from "@/context/QueueContext";

// Calculate estimated wait time based on position in queue and average serve time
export const calculateEstimatedWaitTime = (
  position: number, 
  averageServeTime: number = 5
): number => {
  return position * averageServeTime;
};

// Format wait time into minutes/hours
export const formatWaitTime = (minutes: number): string => {
  if (minutes < 1) return 'Less than a minute';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  
  return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
};

// Format timestamp to readable time
export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

// Calculate queue position for a customer
export const getQueuePosition = (
  customerId: string, 
  customers: Customer[]
): number => {
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
  
  const index = waitingCustomers.findIndex(c => c.id === customerId);
  return index === -1 ? -1 : index + 1;
};

// Get status display text
export const getStatusDisplay = (status: Customer['status']): string => {
  switch (status) {
    case 'waiting': return 'Waiting';
    case 'serving': return 'Now Serving';
    case 'served': return 'Served';
    case 'no-show': return 'No Show';
    default: return status;
  }
};

// Get color class for different statuses
export const getStatusColor = (status: Customer['status']): string => {
  switch (status) {
    case 'waiting': return 'text-yellow-600 bg-yellow-100';
    case 'serving': return 'text-green-700 bg-green-100 animate-pulse-light';
    case 'served': return 'text-blue-700 bg-blue-100';
    case 'no-show': return 'text-red-700 bg-red-100';
    default: return 'text-gray-700 bg-gray-100';
  }
};

// Priority label helper
export const getPriorityLabel = (priority: Customer['priority']): string => {
  return priority === 'priority' ? 'Priority' : 'Regular';
};

// Calculate service efficiency (% of customers served vs total)
export const calculateServiceEfficiency = (
  servedCount: number, 
  totalCount: number
): number => {
  if (totalCount === 0) return 0;
  return Math.round((servedCount / totalCount) * 100);
};
