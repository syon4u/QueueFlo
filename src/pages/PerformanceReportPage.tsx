
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import DailyPerformanceChart from '@/components/staff/performance/DailyPerformanceChart';
import PerformanceHeader from '@/components/staff/performance/PerformanceHeader';
import ServiceMetricsCard from '@/components/staff/performance/ServiceMetricsCard';
import StaffPerformanceCard from '@/components/staff/performance/StaffPerformanceCard';
import SummaryMetrics from '@/components/staff/performance/SummaryMetrics';
import FeatureTrackingList from '@/components/admin/FeatureTrackingList';
import { ArrowLeft } from 'lucide-react';
import { useDailyMetrics, useServiceMetrics, useStaffMetrics } from '@/hooks/admin/use-performance-metrics';
import { TIME_PERIODS } from '@/components/staff/performance/constants';

const PerformanceReportPage = () => {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('summary');
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <PerformanceHeader 
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          isLoading={isLoading}
          onDownload={downloadReportCSV}
        />
        
        {/* Main Content */}
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full grid-cols-5">
              <TabsTrigger value="summary">
                {t('performance.summary')}
              </TabsTrigger>
              <TabsTrigger value="staff">
                {t('performance.staff')}
              </TabsTrigger>
              <TabsTrigger value="services">
                {t('performance.services')}
              </TabsTrigger>
              <TabsTrigger value="daily">
                {t('performance.daily')}
              </TabsTrigger>
              {role === 'admin' && (
                <TabsTrigger value="features">
                  Feature Status
                </TabsTrigger>
              )}
            </TabsList>
            
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <TabsContent value="summary" className="mt-0">
                    <SummaryMetrics 
                      dailyMetrics={dailyMetrics}
                      staffMetrics={staffMetrics}
                      serviceMetrics={serviceMetrics}
                    />
                  </TabsContent>
                  
                  <TabsContent value="staff" className="mt-0">
                    <StaffPerformanceCard staffMetrics={staffMetrics} />
                  </TabsContent>
                  
                  <TabsContent value="services" className="mt-0">
                    <ServiceMetricsCard serviceMetrics={serviceMetrics} />
                  </TabsContent>
                  
                  <TabsContent value="daily" className="mt-0">
                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">
                        {t('performance.dailyActivity')}
                      </h2>
                      <DailyPerformanceChart dailyMetrics={dailyMetrics} />
                    </Card>
                  </TabsContent>
                  
                  {role === 'admin' && (
                    <TabsContent value="features" className="mt-0">
                      <FeatureTrackingList />
                    </TabsContent>
                  )}
                </>
              )}
            </ScrollArea>
          </Tabs>
        </div>
        
        {/* Back button */}
        <div className="mt-6">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/staff">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReportPage;
