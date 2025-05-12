
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface AppointmentFormNavigationProps {
  currentStep: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const AppointmentFormNavigation: React.FC<AppointmentFormNavigationProps> = ({
  currentStep,
  onPrevStep,
  onNextStep,
  onSubmit,
  isSubmitting
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex justify-between">
      {currentStep > 1 ? (
        <Button variant="outline" onClick={onPrevStep}>
          {t('common.back')}
        </Button>
      ) : (
        <Button asChild variant="outline">
          <Link to="/appointments">{t('common.cancel')}</Link>
        </Button>
      )}
      
      {currentStep < 4 ? (
        <Button onClick={onNextStep}>
          {t('common.next')} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? t('common.submitting') : t('appointments.schedule')}
        </Button>
      )}
    </div>
  );
};

export default AppointmentFormNavigation;
