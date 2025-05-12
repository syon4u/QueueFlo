
import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AppointmentStepperProps {
  currentStep: number;
}

const AppointmentStepper: React.FC<AppointmentStepperProps> = ({ currentStep }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-4">
      <div className="flex items-center">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div 
              className={cn(
                "rounded-full h-10 w-10 flex items-center justify-center border-2",
                currentStep === step 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : currentStep > step
                  ? "border-primary text-primary"
                  : "border-muted text-muted-foreground"
              )}
            >
              {step}
            </div>
            
            {step < 4 && (
              <div 
                className={cn(
                  "h-1 w-16", 
                  currentStep > step ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex justify-between mt-2 text-sm">
        <div>{t('appointments.steps.location')}</div>
        <div>{t('appointments.steps.service')}</div>
        <div>{t('appointments.steps.dateTime')}</div>
        <div>{t('appointments.steps.confirm')}</div>
      </div>
    </div>
  );
};

export default AppointmentStepper;
