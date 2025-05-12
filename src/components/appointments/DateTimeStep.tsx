
import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateTimeStepProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  time: string;
  onTimeChange: (time: string) => void;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({ date, onDateChange, time, onTimeChange }) => {
  const { t } = useTranslation();
  const [hour, minute, amPm] = time ? time.split(/[:\s]/) : ['', '', ''];

  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = ['00', '15', '30', '45'];
  const amPmOptions = ['AM', 'PM'];

  const handleHourChange = (value: string) => {
    onTimeChange(`${value}:${minute || '00'} ${amPm || 'AM'}`);
  };

  const handleMinuteChange = (value: string) => {
    onTimeChange(`${hour || '9'}:${value} ${amPm || 'AM'}`);
  };

  const handleAmPmChange = (value: string) => {
    onTimeChange(`${hour || '9'}:${minute || '00'} ${value}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t('appointments.selectDate')}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>{t('appointments.selectDatePlaceholder')}</span>}
              <CalendarIcon className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>{t('appointments.selectTime')}</Label>
        <div className="flex space-x-2 items-center">
          <Clock className="h-4 w-4 text-muted-foreground" />
          
          <Select value={hour} onValueChange={handleHourChange}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder={t('appointments.hour')} />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map((h) => (
                <SelectItem key={h} value={h.toString()}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span>:</span>
          
          <Select value={minute} onValueChange={handleMinuteChange}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder={t('appointments.minute')} />
            </SelectTrigger>
            <SelectContent>
              {minuteOptions.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={amPm} onValueChange={handleAmPmChange}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              {amPmOptions.map((ap) => (
                <SelectItem key={ap} value={ap}>
                  {ap}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DateTimeStep;
