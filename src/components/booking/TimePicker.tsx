import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { format, parse, addMinutes, startOfDay, isAfter } from 'date-fns';
import { ChevronLeft, Clock } from 'lucide-react';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

interface TimePickerProps {
  serviceId: string;
  date: Date;
  onTimeSelected: (start: Date, end: Date) => void;
  onBack: () => void;
}

export default function TimePicker({ serviceId, date, onTimeSelected, onBack }: TimePickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      const dayOfWeek = date.getDay();

      // Fetch availability rules for this day
      const { data: availability, error: availError } = await supabase
        .from('service_availability')
        .select('start_time, end_time, slot_length_minutes, max_bookings_per_slot')
        .eq('pharmacy_service_id', serviceId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

      if (availError) {
        console.error('Error fetching availability:', availError);
        setLoading(false);
        return;
      }

      if (!availability || availability.length === 0) {
        setSlots([]);
        setLoading(false);
        return;
      }

      // Generate time slots
      const allSlots: TimeSlot[] = [];
      
      for (const rule of availability) {
        const startTime = parse(rule.start_time, 'HH:mm:ss', startOfDay(date));
        const endTime = parse(rule.end_time, 'HH:mm:ss', startOfDay(date));
        
        let current = startTime;
        while (isAfter(endTime, current)) {
          const slotEnd = addMinutes(current, rule.slot_length_minutes);
          if (!isAfter(slotEnd, endTime)) {
            allSlots.push({
              start: current,
              end: slotEnd,
              available: true,
            });
          }
          current = slotEnd;
        }
      }

      // Fetch existing bookings for this date
      const startOfDate = startOfDay(date);
      const endOfDate = addMinutes(startOfDate, 24 * 60);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('booking_start, booking_end')
        .eq('pharmacy_service_id', serviceId)
        .gte('booking_start', startOfDate.toISOString())
        .lt('booking_start', endOfDate.toISOString())
        .neq('status', 'cancelled');

      // Mark unavailable slots
      const finalSlots = allSlots.map((slot) => {
        const isBooked = bookings?.some((booking) => {
          const bookingStart = new Date(booking.booking_start);
          return bookingStart.getTime() === slot.start.getTime();
        });

        return {
          ...slot,
          available: !isBooked,
        };
      });

      setSlots(finalSlots);
      setLoading(false);
    };

    fetchSlots();
  }, [serviceId, date]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex justify-center py-8">
          <div className="animate-pulse">Loading time slots...</div>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="space-y-4">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-8 text-muted-foreground">
          <p>No time slots available for this date.</p>
          <p className="mt-2">Please select another date.</p>
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="space-y-4">
      <Button onClick={onBack} variant="ghost" size="sm">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Calendar
      </Button>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h3>
        
        {availableSlots.length === 0 ? (
          <p className="text-muted-foreground">All slots are booked for this day.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableSlots.map((slot, idx) => (
              <Button
                key={idx}
                onClick={() => onTimeSelected(slot.start, slot.end)}
                variant="outline"
                className="justify-start"
              >
                <Clock className="mr-2 h-4 w-4" />
                {format(slot.start, 'h:mm a')}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
