
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useStaffMetrics, useServiceMetrics, useDailyMetrics } from '@/hooks/admin/use-performance-metrics';

// Import refactored components
import PerformanceHeader from './performance/PerformanceHeader';
import DailyPerformanceChart from './performance/DailyPerformanceChart';
import StaffPerformanceCard from './performance/StaffPerformanceCard';
import ServiceMetricsCard from './performance/ServiceMetricsCard';
import SummaryMetrics from './performance/SummaryMetrics';
import { TIME_PERIODS } from './performance/constants';

const StaffPerformanceReport: React.FC = () => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('week');
  
  // Use the custom hooks for performance metrics
  const { data: staffMetrics, isLoading: staffLoading } = useStaffMetrics(timeRange);
  const { data: serviceMetrics, isLoading: serviceLoading } = useServiceMetrics(timeRange);
  const { data: dailyMetrics, isLoading: dailyLoading } = useDailyMetrics(timeRange);

  // Download report as CSV
  const downloadReportCSV = () => {
    // Combine all metrics data
    const combinedData = {
      staff: staffMetrics || [],
      services: serviceMetrics || [],
      daily: dailyMetrics || []
    };

    // Convert to CSV format
    const jsonString = JSON.stringify(combinedData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: 'Report Downloaded',
      description: 'Your performance report has been downloaded successfully.'
    });
  };

  // Loading states for queries
  const isLoading = staffLoading || serviceLoading || dailyLoading;

  return (
    <div className="space-y-6">
      {/* Header with time range selector and export button */}
      <PerformanceHeader 
        timeRange={timeRange} 
        setTimeRange={setTimeRange} 
        isLoading={isLoading} 
        onDownload={downloadReportCSV} 
      />

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Daily statistics chart */}
          <DailyPerformanceChart dailyMetrics={dailyMetrics} />

          {/* Staff performance metrics */}
          <StaffPerformanceCard staffMetrics={staffMetrics} />

          {/* Service metrics */}
          <ServiceMetricsCard serviceMetrics={serviceMetrics} />

          {/* Summary metrics */}
          <SummaryMetrics 
            dailyMetrics={dailyMetrics}
            staffMetrics={staffMetrics}
            serviceMetrics={serviceMetrics}
          />
        </div>
      )}
    </div>
  );
};

export default StaffPerformanceReport;
