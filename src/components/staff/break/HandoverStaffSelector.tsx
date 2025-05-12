
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
}

interface HandoverStaffSelectorProps {
  handoverStaffId: string;
  onHandoverStaffChange: (value: string) => void;
  availableStaff: StaffMember[];
}

const HandoverStaffSelector: React.FC<HandoverStaffSelectorProps> = ({
  handoverStaffId,
  onHandoverStaffChange,
  availableStaff,
}) => {
  const { t } = useTranslation();

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="handover">{t('staff.handoverTo')}</Label>
      <Select 
        value={handoverStaffId} 
        onValueChange={onHandoverStaffChange}
      >
        <SelectTrigger id="handover">
          <SelectValue placeholder={t('staff.selectHandover')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{t('staff.noHandover')}</SelectItem>
          {availableStaff.map((staff) => (
            <SelectItem key={staff.id} value={staff.id}>
              {staff.first_name} {staff.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {t('staff.handoverExplanation')}
      </p>

      {handoverStaffId && handoverStaffId !== 'none' && availableStaff.length > 0 && (
        <div className="flex items-center p-3 bg-muted/50 rounded-md">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback>
                    {getInitials(`${
                      availableStaff.find(s => s.id === handoverStaffId)?.first_name || ''
                    } ${
                      availableStaff.find(s => s.id === handoverStaffId)?.last_name || ''
                    }`)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    {availableStaff.find(s => s.id === handoverStaffId)?.first_name}{' '}
                    {availableStaff.find(s => s.id === handoverStaffId)?.last_name}
                  </h4>
                  <div className="flex items-center pt-2">
                    <Clock className="h-4 w-4 opacity-70 mr-1" />
                    <span className="text-xs text-muted-foreground">
                      {t('staff.currentlyActive')}
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <div>
            <p className="text-sm font-medium">
              {availableStaff.find(s => s.id === handoverStaffId)?.first_name}{' '}
              {availableStaff.find(s => s.id === handoverStaffId)?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('staff.willReceiveHandover')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandoverStaffSelector;
