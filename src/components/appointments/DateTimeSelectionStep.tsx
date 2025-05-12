import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAvailability, DailyAvailability, TimeSlot } from '@/hooks/useAvailability'; // Adjust path as needed
import { Service } from '@/hooks/useServices'; // Assuming Service type is exported
import { Location } from '@/hooks/useLocations'; // Assuming Location type is exported
import { format, addDays, startOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface DateTimeSelectionStepProps {
  selectedLocation: Location;
  selectedService: Service;
  onDateTimeSelect: (dateTime: Date) => void;
  // Optional: if we want to pre-select a date/time
  // currentSelectedDateTime?: Date;
}

const DateTimeSelectionStep: React.FC<DateTimeSelectionStepProps> = ({ selectedLocation, selectedService, onDateTimeSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined);
  const { availability, loading, error, fetchAvailability } = useAvailability();

  // Fetch availability when selectedDate, location, or service changes
  useEffect(() => {
    if (selectedDate && selectedLocation && selectedService) {
      const startDate = format(selectedDate, 'yyyy-MM-dd');
      // Fetch for a range, e.g., 7 days, or adjust as needed by backend capabilities
      const endDate = format(addDays(selectedDate, 0), 'yyyy-MM-dd'); // For now, just fetching for the selected day
      fetchAvailability(selectedLocation.id, selectedService.id, startDate, endDate);
    }
  }, [selectedDate, selectedLocation, selectedService, fetchAvailability]);

  const handleDateSelect = (date?: Date) => {
    setSelectedDate(date ? startOfDay(date) : undefined);
    setSelectedTimeSlot(undefined); // Reset time slot when date changes
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    if (selectedDate) {
      const [hours, minutes] = slot.time.split(':').map(Number);
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(hours, minutes, 0, 0);
      onDateTimeSelect(combinedDateTime);
    }
  };

  const availableSlotsForSelectedDate: TimeSlot[] = useMemo(() => {
    if (!selectedDate || availability.length === 0) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayData = availability.find(day => day.date === dateStr);
    return dayData ? dayData.slots.filter(slot => slot.available) : [];
  }, [selectedDate, availability]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Select Date & Time</CardTitle>
        <CardDescription>
          Choose an available date and time slot for your {selectedService.name} at {selectedLocation.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border p-0"
            disabled={(date) => date < startOfDay(new Date())} // Disable past dates
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Select Time {selectedDate ? `for ${format(selectedDate, 'PPP')}` : ''}</h3>
          {loading && (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading slots...
            </div>
          )}
          {error && <p className="text-red-500">Error loading time slots: {error.message || 'Unknown error'}</p>}
          {!loading && !error && selectedDate && (
            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-2">
              {availableSlotsForSelectedDate.length > 0 ? (
                availableSlotsForSelectedDate.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTimeSlot?.time === slot.time ? "default" : "outline"}
                    onClick={() => handleTimeSelect(slot)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </Button>
                ))
              ) : (
                <p className="col-span-3 text-muted-foreground">No available slots for this date.</p>
              )}
            </div>
          )}
          {!selectedDate && <p className="text-muted-foreground">Please select a date to see available times.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default DateTimeSelectionStep;

