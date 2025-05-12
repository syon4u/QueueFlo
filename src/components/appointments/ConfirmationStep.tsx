
import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Location, Service } from '@/hooks/useAppointmentForm';

interface ConfirmationStepProps {
  locations: Location[];
  services: Service[];
  selectedLocationId: string;
  selectedServiceId: string;
  selectedDate: Date | undefined;
  selectedTime: string;
  notes: string;
  onNotesChange: (notes: string) => void;
  reasonForVisit: string;
  onReasonForVisitChange: (reason: string) => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  locations,
  services,
  selectedLocationId,
  selectedServiceId,
  selectedDate,
  selectedTime,
  notes,
  onNotesChange,
  reasonForVisit,
  onReasonForVisitChange
}) => {
  const { t } = useTranslation();

  const selectedLocation = locations.find(l => l.id === selectedLocationId);
  const selectedService = services.find(s => s.id === selectedServiceId);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('appointments.location')}</h3>
          <p className="font-medium">{selectedLocation?.name}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('appointments.service')}</h3>
          <p className="font-medium">{selectedService?.name}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('appointments.date')}</h3>
          <p className="font-medium">{selectedDate ? format(selectedDate, 'PPP') : ''}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('appointments.time')}</h3>
          <p className="font-medium">{selectedTime}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('appointments.duration')}</h3>
          <p className="font-medium">{selectedService?.duration} {t('appointments.minutes')}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reason">{t('appointments.reasonForVisit')}</Label>
        <Textarea
          id="reason"
          value={reasonForVisit}
          onChange={(e) => onReasonForVisitChange(e.target.value)}
          placeholder={t('appointments.reasonForVisitPlaceholder')}
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">{t('appointments.notes')}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t('appointments.notesPlaceholder')}
          rows={3}
        />
      </div>
    </div>
  );
};

export default ConfirmationStep;
