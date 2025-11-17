import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePharmacist } from '@/hooks/usePharmacist';
import PortalLayoutNew from '@/components/portal/PortalLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Briefcase, Users, ArrowRight, Settings } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { pharmacist } = usePharmacist();
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    activeServices: 0,
    totalPharmacists: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pharmacist?.pharmacy_id) return;

    const fetchDashboardData = async () => {
      try {
        const now = new Date().toISOString();
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch upcoming bookings count
        const { count: bookingsCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('pharmacy_id', pharmacist.pharmacy_id)
          .gte('booking_start', now)
          .in('status', ['pending', 'confirmed']);

        // Fetch active services count
        const { count: servicesCount } = await supabase
          .from('pharmacy_services')
          .select('*', { count: 'exact', head: true })
          .eq('pharmacy_id', pharmacist.pharmacy_id)
          .eq('is_active', true);

        // Fetch total pharmacists count
        const { count: pharmacistsCount } = await supabase
          .from('pharmacists')
          .select('*', { count: 'exact', head: true })
          .eq('pharmacy_id', pharmacist.pharmacy_id)
          .eq('is_active', true);

        // Fetch next 5 upcoming bookings with details
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            pharmacy_services!inner(custom_title, slug),
            pharmacists(first_name, last_name)
          `)
          .eq('pharmacy_id', pharmacist.pharmacy_id)
          .gte('booking_start', now)
          .lte('booking_start', weekFromNow)
          .in('status', ['pending', 'confirmed'])
          .order('booking_start', { ascending: true })
          .limit(5);

        setStats({
          upcomingBookings: bookingsCount || 0,
          activeServices: servicesCount || 0,
          totalPharmacists: pharmacistsCount || 0,
        });

        setUpcomingBookings(bookingsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [pharmacist?.pharmacy_id]);

  if (loading) {
    return (
      <PortalLayoutNew>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </PortalLayoutNew>
    );
  }

  return (
    <PortalLayoutNew>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {pharmacist?.first_name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Next 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeServices}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Available for booking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPharmacists}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active pharmacists
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/portal/services">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Briefcase className="h-4 w-4" />
                Manage Services
              </Button>
            </Link>
            <Link to="/portal/bookings">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                View Bookings
              </Button>
            </Link>
            <Link to="/portal/settings/pharmacy">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Pharmacy Settings
              </Button>
            </Link>
            <Link to="/portal/settings/email">
              <Button variant="outline" className="w-full justify-start gap-2">
                <ArrowRight className="h-4 w-4" />
                Email Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Next appointments this week</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming bookings for the next 7 days
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">
                        {booking.patient_first_name} {booking.patient_last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.pharmacy_services.custom_title}
                      </div>
                      {booking.pharmacists && (
                        <div className="text-xs text-muted-foreground">
                          with {booking.pharmacists.first_name} {booking.pharmacists.last_name}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {format(new Date(booking.booking_start), 'EEE, MMM d')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(booking.booking_start), 'h:mm a')}
                      </div>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          booking.status === 'confirmed' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Link to="/portal/bookings">
                  <Button variant="outline" className="w-full">
                    View All Bookings
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayoutNew>
  );
}
