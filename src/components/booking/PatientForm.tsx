import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';

const formSchema = z.object({
  patient_first_name: z.string().min(2, 'First name must be at least 2 characters'),
  patient_last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  patient_email: z.string().email('Please enter a valid email address'),
  patient_phone: z.string().optional(),
  notes: z.string().optional(),
});

interface PatientFormProps {
  serviceId: string;
  bookingStart: Date;
  bookingEnd: Date;
  onComplete: () => void;
  onBack: () => void;
}

export default function PatientForm({
  serviceId,
  bookingStart,
  bookingEnd,
  onComplete,
  onBack,
}: PatientFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_first_name: '',
      patient_last_name: '',
      patient_email: '',
      patient_phone: '',
      notes: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);

    // Get pharmacy_id from the service
    const { data: service } = await supabase
      .from('pharmacy_services')
      .select('pharmacy_id')
      .eq('id', serviceId)
      .single();

    if (!service) {
      toast({
        title: 'Error',
        description: 'Could not find service details. Please try again.',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('bookings').insert({
      pharmacy_id: service.pharmacy_id,
      pharmacy_service_id: serviceId,
      booking_start: bookingStart.toISOString(),
      booking_end: bookingEnd.toISOString(),
      patient_first_name: values.patient_first_name,
      patient_last_name: values.patient_last_name,
      patient_email: values.patient_email,
      patient_phone: values.patient_phone || null,
      notes: values.notes || null,
      status: 'pending',
      source: 'web',
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: 'Booking Failed',
        description: 'This time slot may no longer be available. Please try another time.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Booking Confirmed!',
      description: 'You will receive a confirmation email shortly.',
    });

    onComplete();
  };

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="ghost" size="sm" disabled={submitting}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Your Appointment</h3>
        <p className="text-sm text-muted-foreground">
          {format(bookingStart, 'EEEE, MMMM d, yyyy')} at {format(bookingStart, 'h:mm a')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patient_first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="patient_last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="patient_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input type="email" {...field} disabled={submitting} />
                </FormControl>
                <FormDescription>
                  We'll send your confirmation to this email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="patient_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={submitting}
                    placeholder="Any information we should know before your appointment?"
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
