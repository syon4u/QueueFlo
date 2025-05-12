
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine } from 'lucide-react';
import { TIME_PERIODS } from './constants';
import { PerformanceHeaderProps } from './types';
import { useTranslation } from 'react-i18next';

const PerformanceHeader: React.FC<PerformanceHeaderProps> = ({ 
  timeRange, 
  setTimeRange, 
  isLoading, 
  onDownload 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-2xl font-bold">Performance Reports</h2>
      
      <div className="flex items-center gap-3">
        {/* Time period selector */}
        <div className="flex bg-muted rounded-lg p-1 text-sm">
          {TIME_PERIODS.map((period) => (
            <button
              key={period.value}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeRange === period.value
                  ? 'bg-white text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTimeRange(period.value)}
            >
              {period.label}
            </button>
          ))}
        </div>
        
        {/* Export button */}
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onDownload}
          disabled={isLoading}
        >
          <ArrowDownToLine size={16} />
          <span className="hidden sm:inline">{t('performance.exportReport')}</span>
        </Button>
      </div>
    </div>
  );
};

export default PerformanceHeader;
