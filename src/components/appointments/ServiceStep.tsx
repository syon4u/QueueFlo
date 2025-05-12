
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Service } from '@/hooks/useAppointmentForm';

interface ServiceStepProps {
  serviceId: string;
  onServiceChange: (value: string) => void;
  locationId: string;
  services: Service[];
}

const ServiceStep: React.FC<ServiceStepProps> = ({ serviceId, onServiceChange, services = [] }) => {
  const { t } = useTranslation();
  
  const selectedService = services.find(s => s.id === serviceId);

  return (
    <div className="space-y-4">
      <Label>{t('appointments.selectService')}</Label>
      <Select value={serviceId} onValueChange={onServiceChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('appointments.selectServicePlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {services.map(service => (
            <SelectItem key={service.id} value={service.id}>
              {service.name} ({service.duration} {t('appointments.minutes')})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {serviceId && selectedService?.description && (
        <div className="mt-4 text-sm text-muted-foreground">
          {selectedService.description}
        </div>
      )}
      
      {serviceId && (
        <div className="mt-4 text-sm">
          <span className="font-medium">{t('appointments.duration')}: </span>
          {selectedService?.duration} {t('appointments.minutes')}
        </div>
      )}
    </div>
  );
};

export default ServiceStep;
