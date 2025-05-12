
// Types for metrics data
export interface StaffMetric {
  staff_id: string;
  staff_name: string;
  appointments_served: number;
  average_service_time: number;
  no_shows: number;
}

export interface ServiceMetric {
  service_id: string;
  service_name: string;
  appointments_count: number;
  average_wait_time: number;
}

export interface DailyMetric {
  date: string;
  appointments: number;
  wait_time: number;
}

export interface TimePeriodOption {
  value: string;
  label: string;
  days: number;
}

export interface PerformanceHeaderProps {
  timeRange: string;
  setTimeRange: (value: string) => void;
  isLoading: boolean;
  onDownload: () => void;
}

export interface DailyPerformanceChartProps {
  dailyMetrics: DailyMetric[] | undefined;
}

export interface StaffPerformanceCardProps {
  staffMetrics: StaffMetric[] | undefined;
}

export interface ServiceMetricsCardProps {
  serviceMetrics: ServiceMetric[] | undefined;
}

export interface SummaryMetricsProps {
  dailyMetrics: DailyMetric[] | undefined;
  staffMetrics: StaffMetric[] | undefined;
  serviceMetrics: ServiceMetric[] | undefined;
}
