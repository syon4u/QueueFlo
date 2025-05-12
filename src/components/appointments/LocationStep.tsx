
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

interface LocationStepProps {
  locationId: string;
  onLocationChange: (value: string) => void;
  locations: Array<{ id: string; name: string }>;
}

const LocationStep: React.FC<LocationStepProps> = ({ locationId, onLocationChange, locations = [] }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <Label>{t('appointments.selectLocation')}</Label>
      <Select value={locationId} onValueChange={onLocationChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('appointments.selectLocationPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {locations.map(location => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationStep;
