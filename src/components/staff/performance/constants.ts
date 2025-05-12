// Time period options for reports
export const TIME_PERIODS = [
  { value: 'today', label: 'Today', days: 0 },
  { value: 'yesterday', label: 'Yesterday', days: 1 },
  { value: 'week', label: 'Week', days: 7 },
  { value: 'month', label: 'Month', days: 30 },
  { value: 'quarter', label: 'Quarter', days: 90 }
];

// Break status types with durations
export const BREAK_TYPES = [
  { value: 'short', label: 'Short Break', duration: 15 },
  { value: 'lunch', label: 'Lunch Break', duration: 30 },
  { value: 'meeting', label: 'Meeting', duration: 60 },
  { value: 'training', label: 'Training', duration: 120 },
  { value: 'custom', label: 'Custom', duration: 0 }
];

// Status colors for UI
export const STATUS_COLORS = {
  active: 'bg-green-500',
  break: 'bg-amber-500',
  inactive: 'bg-gray-400',
  busy: 'bg-red-500',
  available: 'bg-green-500'
};
