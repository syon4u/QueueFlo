
import React from 'react';
import { useQueue } from '@/context/QueueContext';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatWaitTime } from '@/lib/queue';

const QueueStats: React.FC = () => {
  const { stats } = useQueue();

  const statItems = [
    {
      label: 'Waiting',
      value: stats.waitingCustomers,
      icon: <Users className="h-5 w-5 text-blue-500" aria-hidden="true" />,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      ariaLabel: `${stats.waitingCustomers} customers waiting`
    },
    {
      label: 'Average Wait',
      value: formatWaitTime(stats.averageWaitTime),
      icon: <Clock className="h-5 w-5 text-amber-500" aria-hidden="true" />,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      ariaLabel: `Average wait time is ${formatWaitTime(stats.averageWaitTime)}`
    },
    {
      label: 'Served',
      value: stats.servedCustomers,
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" aria-hidden="true" />,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      ariaLabel: `${stats.servedCustomers} customers served`
    },
    {
      label: 'No-Shows',
      value: stats.noShowCustomers,
      icon: <XCircle className="h-5 w-5 text-rose-500" aria-hidden="true" />,
      color: 'text-rose-700', 
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      ariaLabel: `${stats.noShowCustomers} no-show customers`
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {statItems.map((item, index) => (
        <Card 
          key={index} 
          className={`border-l-4 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] ${item.borderColor} ${item.bgColor}`}
        >
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
              <p 
                className={`text-2xl font-semibold ${item.color}`}
                aria-label={item.ariaLabel}
              >
                {typeof item.value === 'number' ? item.value : item.value}
              </p>
            </div>
            <div className="bg-white rounded-full p-3 shadow-sm">{item.icon}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QueueStats;
