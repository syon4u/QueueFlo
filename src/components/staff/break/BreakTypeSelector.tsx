
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BREAK_TYPES } from '../performance/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BreakTypeSelectorProps {
  breakType: string;
  onBreakTypeChange: (value: string) => void;
  customDuration: number;
  onCustomDurationChange: (value: number) => void;
}

const BreakTypeSelector: React.FC<BreakTypeSelectorProps> = ({
  breakType,
  onBreakTypeChange,
  customDuration,
  onCustomDurationChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="break-type">{t('staff.breakType')}</Label>
        <Select 
          value={breakType} 
          onValueChange={onBreakTypeChange}
        >
          <SelectTrigger id="break-type">
            <SelectValue placeholder={t('staff.selectBreakType')} />
          </SelectTrigger>
          <SelectContent>
            {BREAK_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {t(`staff.breakType_${type.value}`, { defaultValue: type.label })} ({type.duration} {t('common.minutes')})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {breakType === 'custom' && (
        <div className="grid gap-2">
          <Label htmlFor="duration">{t('staff.customDuration')}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="duration"
              type="number"
              min={5}
              max={480}
              value={customDuration}
              onChange={(e) => onCustomDurationChange(parseInt(e.target.value) || 15)}
            />
            <span className="text-sm text-muted-foreground">{t('common.minutes')}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default BreakTypeSelector;
