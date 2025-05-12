
import React from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TimePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  time: string;
  onTimeChange: (time: string) => void;
}

const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
const minuteOptions = ['00', '15', '30', '45'];
const amPmOptions = ['AM', 'PM'];

const TimePicker = ({ date, onDateChange, time, onTimeChange }: TimePickerProps) => {
  const [hour, minute, amPm] = time ? time.split(/[:\s]/) : ['', '', ''];

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
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Preferred Date</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(date, "PPP") : <span>Select a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4" />
              </Button>
            </FormControl>
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
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Preferred Time</FormLabel>
        <div className="flex space-x-2 items-center">
          <Clock className="h-4 w-4 text-muted-foreground" />
          
          <Select value={hour} onValueChange={handleHourChange}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Hour" />
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
              <SelectValue placeholder="Min" />
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
      </FormItem>
    </div>
  );
};

export default TimePicker;
