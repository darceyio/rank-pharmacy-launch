import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const formSchema = z.object({
  days: z.array(z.number()).min(1, 'Select at least one day'),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  slot_length_minutes: z.number().min(5, 'Minimum 5 minutes').max(240, 'Maximum 240 minutes'),
  max_bookings_per_slot: z.number().min(1, 'Minimum 1 booking').max(20, 'Maximum 20 bookings'),
  pharmacist_id: z.string().optional(),
}).refine((data) => {
  const [startHour, startMin] = data.start_time.split(':').map(Number);
  const [endHour, endMin] = data.end_time.split(':').map(Number);
  return (endHour * 60 + endMin) > (startHour * 60 + startMin);
}, {
  message: 'End time must be after start time',
  path: ['end_time'],
});

interface AddAvailabilityDialogProps {
  serviceId: string;
  pharmacists: any[];
  onSuccess: () => void;
}

interface Conflict {
  day: number;
  dayLabel: string;
  existingRule: {
    start_time: string;
    end_time: string;
    pharmacist_name?: string;
  };
}

export default function AddAvailabilityDialog({ serviceId, pharmacists, onSuccess }: AddAvailabilityDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [checking, setChecking] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      days: [],
      start_time: '09:00',
      end_time: '17:00',
      slot_length_minutes: 30,
      max_bookings_per_slot: 1,
      pharmacist_id: '',
    },
  });

  // Check for overlapping availability rules
  useEffect(() => {
    const checkOverlaps = async () => {
      const days = form.watch('days');
      const startTime = form.watch('start_time');
      const endTime = form.watch('end_time');
      const pharmacistId = form.watch('pharmacist_id');

      if (!days.length || !startTime || !endTime || !open) {
        setConflicts([]);
        return;
      }

      setChecking(true);
      try {
        // Fetch existing rules for the selected days and service
        let query = supabase
          .from('service_availability')
          .select('*, pharmacists(first_name, last_name)')
          .eq('pharmacy_service_id', serviceId)
          .in('day_of_week', days)
          .eq('is_active', true);

        // If a specific pharmacist is selected, only check their rules
        if (pharmacistId) {
          query = query.eq('pharmacist_id', pharmacistId);
        }

        const { data: existingRules } = await query;

        if (!existingRules || existingRules.length === 0) {
          setConflicts([]);
          return;
        }

        // Check for time overlaps
        const newConflicts: Conflict[] = [];
        
        existingRules.forEach((rule) => {
          // Two time ranges overlap if: start1 < end2 AND start2 < end1
          if (startTime < rule.end_time && endTime > rule.start_time) {
            const dayLabel = DAYS.find(d => d.value === rule.day_of_week)?.label || 'Unknown';
            newConflicts.push({
              day: rule.day_of_week,
              dayLabel,
              existingRule: {
                start_time: rule.start_time,
                end_time: rule.end_time,
                pharmacist_name: rule.pharmacists 
                  ? `${rule.pharmacists.first_name} ${rule.pharmacists.last_name}`
                  : undefined,
              },
            });
          }
        });

        setConflicts(newConflicts);
      } catch (error) {
        console.error('Error checking overlaps:', error);
      } finally {
        setChecking(false);
      }
    };

    checkOverlaps();
  }, [
    form.watch('days'), 
    form.watch('start_time'), 
    form.watch('end_time'), 
    form.watch('pharmacist_id'),
    serviceId,
    open
  ]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Prevent submission if there are conflicts
    if (conflicts.length > 0) {
      toast.error('Please resolve scheduling conflicts before creating availability rules');
      return;
    }

    setSubmitting(true);
    try {
      // Create availability rules for each selected day
      const rules = values.days.map(day => ({
        pharmacy_service_id: serviceId,
        day_of_week: day,
        start_time: values.start_time,
        end_time: values.end_time,
        slot_length_minutes: values.slot_length_minutes,
        max_bookings_per_slot: values.max_bookings_per_slot,
        pharmacist_id: values.pharmacist_id || null,
        is_active: true,
      }));

      const { error } = await supabase
        .from('service_availability')
        .insert(rules);

      if (error) throw error;

      toast.success(`${rules.length} availability rule${rules.length > 1 ? 's' : ''} created`);
      setOpen(false);
      form.reset();
      setConflicts([]);
      onSuccess();
    } catch (error) {
      console.error('Error creating availability:', error);
      toast.error('Failed to create availability rules');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Availability
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Availability Rule</DialogTitle>
          <DialogDescription>
            Define when this service is available for booking. You can select multiple days.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Conflict Warning */}
            {conflicts.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Scheduling Conflicts Detected</div>
                  <ul className="space-y-1 text-sm">
                    {conflicts.map((conflict, idx) => (
                      <li key={idx}>
                        <strong>{conflict.dayLabel}:</strong> Overlaps with existing rule{' '}
                        {conflict.existingRule.start_time} - {conflict.existingRule.end_time}
                        {conflict.existingRule.pharmacist_name && (
                          <> ({conflict.existingRule.pharmacist_name})</>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm">
                    Please adjust your times or deselect conflicting days to continue.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            
            {checking && (
              <div className="text-sm text-muted-foreground">
                Checking for conflicts...
              </div>
            )}
            <FormField
              control={form.control}
              name="days"
              render={() => (
                <FormItem>
                  <FormLabel>Days of Week</FormLabel>
                  <FormDescription>Select the days when this availability applies</FormDescription>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                    {DAYS.map((day) => (
                      <FormField
                        key={day.value}
                        control={form.control}
                        name="days"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, day.value])
                                    : field.onChange(field.value?.filter((value) => value !== day.value));
                                }}
                              />
                            </FormControl>
                            <Label className="font-normal cursor-pointer">{day.label}</Label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slot_length_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Length (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
                        max={240}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Duration of each appointment slot</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_bookings_per_slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Bookings Per Slot</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Allow multiple bookings per time slot</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pharmacist_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Pharmacist (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any available pharmacist" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Any available pharmacist</SelectItem>
                      {pharmacists.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.first_name} {p.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Leave blank to allow any assigned pharmacist to handle bookings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || conflicts.length > 0 || checking}
              >
                {submitting ? 'Creating...' : 'Create Availability'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
