import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePharmacist } from '@/hooks/usePharmacist';
import PortalLayoutNew from '@/components/portal/PortalLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Clock, Trash2 } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ServiceAvailability() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pharmacist } = usePharmacist();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<any>(null);
  const [pharmacists, setPharmacists] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);

  useEffect(() => {
    if (!id || !pharmacist?.pharmacy_id) return;

    const fetchData = async () => {
      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from('pharmacy_services')
        .select('*, service_catalogue(name)')
        .eq('id', id)
        .eq('pharmacy_id', pharmacist.pharmacy_id)
        .single();

      if (serviceError) {
        console.error('Error fetching service:', serviceError);
        toast.error('Failed to load service');
        navigate('/portal/services');
        return;
      }

      setService(serviceData);

      // Fetch pharmacists
      const { data: pharmacistsData } = await supabase
        .from('pharmacists')
        .select('*')
        .eq('pharmacy_id', pharmacist.pharmacy_id)
        .eq('is_active', true)
        .order('first_name');

      setPharmacists(pharmacistsData || []);

      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('service_staff_assignments')
        .select('*, pharmacists(first_name, last_name)')
        .eq('pharmacy_service_id', id);

      setAssignments(assignmentsData || []);

      // Fetch availability
      const { data: availabilityData } = await supabase
        .from('service_availability')
        .select('*, pharmacists(first_name, last_name)')
        .eq('pharmacy_service_id', id)
        .order('day_of_week')
        .order('start_time');

      setAvailability(availabilityData || []);
      setLoading(false);
    };

    fetchData();
  }, [id, pharmacist?.pharmacy_id, navigate]);

  const toggleStaffAssignment = async (pharmacistId: string) => {
    const existing = assignments.find(a => a.pharmacist_id === pharmacistId);

    if (existing) {
      const { error } = await supabase
        .from('service_staff_assignments')
        .delete()
        .eq('id', existing.id);

      if (error) {
        toast.error('Failed to remove staff assignment');
      } else {
        setAssignments(assignments.filter(a => a.id !== existing.id));
        toast.success('Staff member removed');
      }
    } else {
      const { data, error } = await supabase
        .from('service_staff_assignments')
        .insert({
          pharmacy_service_id: id,
          pharmacist_id: pharmacistId,
          is_primary: false,
        })
        .select('*, pharmacists(first_name, last_name)')
        .single();

      if (error) {
        toast.error('Failed to assign staff');
      } else {
        setAssignments([...assignments, data]);
        toast.success('Staff member assigned');
      }
    }
  };

  const toggleAvailabilityActive = async (availabilityId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('service_availability')
      .update({ is_active: !currentValue })
      .eq('id', availabilityId);

    if (error) {
      toast.error('Failed to update availability');
    } else {
      setAvailability(availability.map(a => 
        a.id === availabilityId ? { ...a, is_active: !currentValue } : a
      ));
      toast.success(currentValue ? 'Availability disabled' : 'Availability enabled');
    }
  };

  const deleteAvailability = async (availabilityId: string) => {
    if (!confirm('Are you sure you want to delete this availability rule?')) return;

    const { error } = await supabase
      .from('service_availability')
      .delete()
      .eq('id', availabilityId);

    if (error) {
      toast.error('Failed to delete availability');
    } else {
      setAvailability(availability.filter(a => a.id !== availabilityId));
      toast.success('Availability rule deleted');
    }
  };

  if (loading) {
    return (
      <PortalLayoutNew>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </PortalLayoutNew>
    );
  }

  return (
    <PortalLayoutNew>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Link to="/portal/services">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {service?.custom_title || service?.service_catalogue?.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage staff assignments and availability
          </p>
        </div>

        {/* Staff Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Staff</CardTitle>
            <CardDescription>
              Select which pharmacists can deliver this service
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pharmacists.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active staff members found
              </p>
            ) : (
              <div className="space-y-3">
                {pharmacists.map((pharm) => {
                  const isAssigned = assignments.some(a => a.pharmacist_id === pharm.id);
                  
                  return (
                    <div
                      key={pharm.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <div className="font-medium">
                          {pharm.first_name} {pharm.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {pharm.role.replace('_', ' ')}
                        </div>
                      </div>
                      <Switch
                        checked={isAssigned}
                        onCheckedChange={() => toggleStaffAssignment(pharm.id)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Availability Rules</CardTitle>
                <CardDescription>
                  Define when this service is available for booking
                </CardDescription>
              </div>
              <Button size="sm" className="gap-2" disabled>
                <Plus className="h-4 w-4" />
                Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No availability rules</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add availability rules to enable online booking
                </p>
                <Button size="sm" className="gap-2" disabled>
                  <Plus className="h-4 w-4" />
                  Add Your First Rule
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {availability.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {DAYS[rule.day_of_week]}
                        </Badge>
                        <span className="font-medium">
                          {rule.start_time.substring(0, 5)} - {rule.end_time.substring(0, 5)}
                        </span>
                        {!rule.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rule.slot_length_minutes} min slots • Max {rule.max_bookings_per_slot} per slot
                        {rule.pharmacists && ` • ${rule.pharmacists.first_name} ${rule.pharmacists.last_name}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => toggleAvailabilityActive(rule.id, rule.is_active)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAvailability(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Availability rule creation UI is coming soon. 
              For now, rules can be added directly via the database.
            </p>
          </CardContent>
        </Card>
      </div>
    </PortalLayoutNew>
  );
}
