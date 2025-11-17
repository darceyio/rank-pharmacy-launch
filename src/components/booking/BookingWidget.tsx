import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import PatientForm from './PatientForm';

interface BookingWidgetProps {
  serviceId: string;
}

type BookingStep = 'date' | 'time' | 'details' | 'confirmation';

export default function BookingWidget({ serviceId }: BookingWidgetProps) {
  const [step, setStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const handleDateSelected = (date: Date) => {
    setSelectedDate(date);
    setStep('time');
  };

  const handleTimeSelected = (start: Date, end: Date) => {
    setSelectedSlot({ start, end });
    setStep('details');
  };

  const handleBookingComplete = () => {
    setStep('confirmation');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Your Appointment</CardTitle>
        <CardDescription>
          {step === 'date' && 'Select a date for your appointment'}
          {step === 'time' && 'Choose a time slot'}
          {step === 'details' && 'Enter your details'}
          {step === 'confirmation' && 'Booking confirmed'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'date' && (
          <DatePicker serviceId={serviceId} onDateSelected={handleDateSelected} />
        )}
        
        {step === 'time' && selectedDate && (
          <TimePicker
            serviceId={serviceId}
            date={selectedDate}
            onTimeSelected={handleTimeSelected}
            onBack={() => setStep('date')}
          />
        )}
        
        {step === 'details' && selectedSlot && (
          <PatientForm
            serviceId={serviceId}
            bookingStart={selectedSlot.start}
            bookingEnd={selectedSlot.end}
            onComplete={handleBookingComplete}
            onBack={() => setStep('time')}
          />
        )}
        
        {step === 'confirmation' && (
          <div className="text-center space-y-4 py-8">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
            <p className="text-muted-foreground">
              We've sent a confirmation email with all the details.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
