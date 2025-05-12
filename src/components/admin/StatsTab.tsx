
import React, { useState } from 'react';
import { 
  useDailyQueueStats,
  useQueueStats,
  useLocations,
  useServices
} from '@/hooks/admin/use-admin-data';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format, subDays } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

export const StatsTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [reportType, setReportType] = useState('overview');
  
  const { data: dailyStats = [], isLoading: isLoadingDaily } = useDailyQueueStats(parseInt(timeRange));
  const { data: queueStats = [], isLoading: isLoadingQueue } = useQueueStats();
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations();
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  
  const isLoading = isLoadingDaily || isLoadingQueue || isLoadingLocations || isLoadingServices;

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Format daily data for charts
  const dailyData = React.useMemo(() => {
    if (!dailyStats.length) return [];
    
    return dailyStats.map((day: any) => ({
      date: format(new Date(day.date), 'MMM dd'),
      served: day.customers_served,
      avgWait: day.average_wait_time,
      noShows: day.no_shows || 0,
      totalWaiting: day.total_waiting || 0,
    }));
  }, [dailyStats]);
  
  // Service distribution data
  const serviceData = React.useMemo(() => {
    if (!queueStats.length || !services.length) return [];
    
    const serviceMap = new Map();
    
    queueStats.forEach((stat: any) => {
      if (!serviceMap.has(stat.service_id)) {
        const service = services.find((s: any) => s.id === stat.service_id);
        serviceMap.set(stat.service_id, {
          name: service ? service.name : 'Unknown Service',
          value: 0
        });
      }
      
      const current = serviceMap.get(stat.service_id);
      serviceMap.set(stat.service_id, {
        ...current,
        value: current.value + (stat.customers_served || 0)
      });
    });
    
    return Array.from(serviceMap.values());
  }, [queueStats, services]);
  
  // Location comparison data
  const locationData = React.useMemo(() => {
    if (!queueStats.length || !locations.length) return [];
    
    const locationMap = new Map();
    
    queueStats.forEach((stat: any) => {
      if (!locationMap.has(stat.location_id)) {
        const location = locations.find((l: any) => l.id === stat.location_id);
        locationMap.set(stat.location_id, {
          name: location ? location.name : 'Unknown Location',
          avgWait: 0,
          served: 0,
          waiting: 0,
          count: 0
        });
      }
      
      const current = locationMap.get(stat.location_id);
      locationMap.set(stat.location_id, {
        ...current,
        avgWait: current.avgWait + (stat.average_wait_time || 0),
        served: current.served + (stat.customers_served || 0),
        waiting: current.waiting + (stat.total_waiting || 0),
        count: current.count + 1
      });
    });
    
    // Calculate averages
    return Array.from(locationMap.values()).map((item: any) => ({
      ...item,
      avgWait: Math.round(item.avgWait / Math.max(item.count, 1))
    }));
  }, [queueStats, locations]);
  
  // Generate date range for export button text
  const dateRange = React.useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, parseInt(timeRange));
    return `${format(startDate, 'MMM dd')} - ${format(today, 'MMM dd, yyyy')}`;
  }, [timeRange]);
  
  // Handle report export (mock function)
  const handleExportReport = () => {
    console.log('Exporting report for date range:', dateRange);
    alert('Report export functionality would be implemented here');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                View detailed analytics and generate reports
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="14">Last 14 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedLocation || 'all'} 
                onValueChange={(val) => setSelectedLocation(val === 'all' ? null : val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location: any) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="wait-time">Wait Times</TabsTrigger>
              <TabsTrigger value="service-usage">Service Usage</TabsTrigger>
              <TabsTrigger value="location-compare">Location Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">
                        {dailyStats.reduce((sum: number, day: any) => sum + (day.customers_served || 0), 0)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Average Wait</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">
                        {Math.round(
                          dailyStats.reduce((sum: number, day: any) => sum + (day.average_wait_time || 0), 0) / 
                          Math.max(dailyStats.length, 1)
                        )}
                        <span className="text-lg font-normal ml-1">min</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">No-Shows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">
                        {dailyStats.reduce((sum: number, day: any) => sum + (day.no_shows || 0), 0)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Daily Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {isLoading ? (
                    <div className="w-full aspect-[2/1]">
                      <Skeleton className="w-full h-full" />
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        served: { color: '#8884d8' },
                        noShows: { color: '#82ca9d' }
                      }}
                      className="w-full h-[300px]"
                    >
                      <BarChart
                        data={dailyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="served" name="Customers Served" fill="#8884d8" />
                        <Bar dataKey="noShows" name="No Shows" fill="#82ca9d" />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="wait-time" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Wait Time Trends</CardTitle>
                  <CardDescription>
                    Average wait time over the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {isLoading ? (
                    <div className="w-full aspect-[2/1]">
                      <Skeleton className="w-full h-full" />
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        avgWait: { color: '#8884d8' }
                      }}
                      className="w-full h-[300px]"
                    >
                      <LineChart
                        data={dailyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="avgWait" 
                          name="Avg. Wait Time (min)" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="service-usage" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of services used
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {isLoading ? (
                    <div className="w-full aspect-[2/1]">
                      <Skeleton className="w-full h-full" />
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        value: { color: '#8884d8' }
                      }}
                      className="w-full h-[300px]"
                    >
                      <PieChart>
                        <Pie
                          data={serviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {serviceData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="location-compare" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Location Comparison</CardTitle>
                  <CardDescription>
                    Performance metrics by location
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {isLoading ? (
                    <div className="w-full aspect-[2/1]">
                      <Skeleton className="w-full h-full" />
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        served: { color: '#8884d8' },
                        avgWait: { color: '#82ca9d' }
                      }}
                      className="w-full h-[300px]"
                    >
                      <BarChart
                        data={locationData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="served" name="Customers Served" fill="#8884d8" />
                        <Bar dataKey="avgWait" name="Avg. Wait Time (min)" fill="#82ca9d" />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleExportReport}>
                Export Report ({dateRange})
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
