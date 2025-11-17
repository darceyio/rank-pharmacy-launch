import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePharmacist } from '@/hooks/usePharmacist';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Bookings() {
  const { pharmacist } = usePharmacist();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!pharmacist?.pharmacy_id) return;

    const fetchBookings = async () => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          pharmacy_services(custom_title, slug),
          pharmacists(first_name, last_name)
        `)
        .eq('pharmacy_id', pharmacist.pharmacy_id)
        .order('booking_start', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };

    fetchBookings();
  }, [pharmacist?.pharmacy_id, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'no_show':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bookings</h1>
            <p className="text-muted-foreground mt-2">
              Manage all pharmacy bookings
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground text-center">
                {statusFilter !== 'all' 
                  ? 'Try changing the filter to see more bookings'
                  : 'Bookings will appear here once patients start making appointments'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {booking.patient_first_name} {booking.patient_last_name}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="text-muted-foreground">
                          <span className="font-medium">Service:</span>{' '}
                          {booking.pharmacy_services?.custom_title}
                        </div>
                        {booking.pharmacists && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Pharmacist:</span>{' '}
                            {booking.pharmacists.first_name} {booking.pharmacists.last_name}
                          </div>
                        )}
                        <div className="text-muted-foreground">
                          <span className="font-medium">Contact:</span>{' '}
                          {booking.patient_email}
                          {booking.patient_phone && ` • ${booking.patient_phone}`}
                        </div>
                        {booking.notes && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Notes:</span> {booking.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="font-semibold">
                          {format(new Date(booking.booking_start), 'EEEE, MMMM d, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(booking.booking_start), 'h:mm a')} -{' '}
                          {format(new Date(booking.booking_end), 'h:mm a')}
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
