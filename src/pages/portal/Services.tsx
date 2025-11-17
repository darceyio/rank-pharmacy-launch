import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePharmacist } from '@/hooks/usePharmacist';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit, Calendar, Eye, Plus, Search, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function Services() {
  const { pharmacist } = usePharmacist();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!pharmacist?.pharmacy_id) return;

    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('pharmacy_services')
        .select(`
          *,
          service_catalogue(name, code)
        `)
        .eq('pharmacy_id', pharmacist.pharmacy_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } else {
        setServices(data || []);
      }
      setLoading(false);
    };

    fetchServices();
  }, [pharmacist?.pharmacy_id]);

  const toggleServiceActive = async (serviceId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('pharmacy_services')
      .update({ is_active: !currentValue })
      .eq('id', serviceId);

    if (error) {
      toast.error('Failed to update service');
    } else {
      setServices(services.map(s => 
        s.id === serviceId ? { ...s, is_active: !currentValue } : s
      ));
      toast.success(currentValue ? 'Service deactivated' : 'Service activated');
    }
  };

  const toggleBookingEnabled = async (serviceId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('pharmacy_services')
      .update({ booking_enabled: !currentValue })
      .eq('id', serviceId);

    if (error) {
      toast.error('Failed to update booking setting');
    } else {
      setServices(services.map(s => 
        s.id === serviceId ? { ...s, booking_enabled: !currentValue } : s
      ));
      toast.success(currentValue ? 'Online booking disabled' : 'Online booking enabled');
    }
  };

  const filteredServices = services.filter(service =>
    (service.custom_title || service.service_catalogue?.name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <PortalLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded"></div>
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
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-muted-foreground mt-2">
              Manage your pharmacy's service offerings
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Services List */}
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery ? 'Try a different search term' : 'Get started by adding your first service'}
              </p>
              {!searchQuery && (
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">
                        {service.custom_title || service.service_catalogue?.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {service.short_summary || service.description}
                      </CardDescription>
                      {service.price_from && (
                        <div className="text-sm font-medium text-primary">
                          From £{service.price_from}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Toggle Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
                        <Label htmlFor={`active-${service.id}`} className="cursor-pointer">
                          Service Active
                        </Label>
                        <Switch
                          id={`active-${service.id}`}
                          checked={service.is_active}
                          onCheckedChange={() => toggleServiceActive(service.id, service.is_active)}
                        />
                      </div>
                      <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
                        <Label htmlFor={`booking-${service.id}`} className="cursor-pointer">
                          Online Booking
                        </Label>
                        <Switch
                          id={`booking-${service.id}`}
                          checked={service.booking_enabled}
                          onCheckedChange={() => toggleBookingEnabled(service.id, service.booking_enabled)}
                          disabled={!service.is_active}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/portal/services/${service.id}/content`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Content
                        </Button>
                      </Link>
                      <Link to={`/portal/services/${service.id}/availability`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-4 w-4" />
                          Availability & Staff
                        </Button>
                      </Link>
                      <Link to={`/portal/services/${service.id}/bookings`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View Bookings
                        </Button>
                      </Link>
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
