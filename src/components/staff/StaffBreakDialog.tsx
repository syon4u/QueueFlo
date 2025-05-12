
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { useStaffBreak } from '@/hooks/useStaffBreak';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import BreakTypeSelector from './break/BreakTypeSelector';
import HandoverStaffSelector from './break/HandoverStaffSelector';

interface StaffBreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBreakStatusChange: () => void;
}

const StaffBreakDialog: React.FC<StaffBreakDialogProps> = ({
  open,
  onOpenChange,
  onBreakStatusChange
}) => {
  const { t } = useTranslation();
  const {
    isSubmitting,
    breakType,
    setBreakType,
    customDuration,
    setCustomDuration,
    handoverStaffId,
    setHandoverStaffId,
    availableStaff,
    handleTakeBreak,
    getDuration
  } = useStaffBreak(onBreakStatusChange);

  const onSubmit = async () => {
    const success = await handleTakeBreak();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('staff.takeABreak')}</DialogTitle>
          <DialogDescription>{t('staff.breakDescription')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <BreakTypeSelector
            breakType={breakType}
            onBreakTypeChange={setBreakType}
            customDuration={customDuration}
            onCustomDurationChange={setCustomDuration}
          />
          
          <HandoverStaffSelector 
            handoverStaffId={handoverStaffId}
            onHandoverStaffChange={setHandoverStaffId}
            availableStaff={availableStaff}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            {t('staff.startBreak', { duration: getDuration() })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffBreakDialog;
