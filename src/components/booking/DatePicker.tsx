import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { addDays, startOfDay, isSameDay } from 'date-fns';

interface DatePickerProps {
  serviceId: string;
  onDateSelected: (date: Date) => void;
}

export default function DatePicker({ serviceId, onDateSelected }: DatePickerProps) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      const { data, error } = await supabase
        .from('service_availability')
        .select('day_of_week, start_time, end_time')
        .eq('pharmacy_service_id', serviceId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching availability:', error);
        setLoading(false);
        return;
      }

      // Generate next 60 days with available slots
      const dates: Date[] = [];
      const today = startOfDay(new Date());
      
      for (let i = 0; i < 60; i++) {
        const date = addDays(today, i);
        const dayOfWeek = date.getDay();
        
        // Check if this day has availability
        const hasAvailability = data?.some((slot) => slot.day_of_week === dayOfWeek);
        
        if (hasAvailability) {
          dates.push(date);
        }
      }

      setAvailableDates(dates);
      setLoading(false);
    };

    fetchAvailability();
  }, [serviceId]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelected(date);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse">Loading availability...</div>
      </div>
    );
  }

  if (availableDates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No online appointments available at the moment.</p>
        <p className="mt-2">Please contact the pharmacy directly to book.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        disabled={(date) => {
          return !availableDates.some((availDate) => isSameDay(date, availDate));
        }}
        initialFocus
        className="rounded-md border"
      />
    </div>
  );
}
