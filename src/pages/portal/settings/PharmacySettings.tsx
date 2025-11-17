import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePharmacist } from '@/hooks/usePharmacist';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PharmacySettings() {
  const { pharmacist } = usePharmacist();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pharmacy, setPharmacy] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postcode: '',
    phone: '',
    primary_email: '',
  });

  useEffect(() => {
    if (!pharmacist?.pharmacy_id) return;

    const fetchPharmacy = async () => {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('id', pharmacist.pharmacy_id)
        .single();

      if (error) {
        console.error('Error fetching pharmacy:', error);
        toast.error('Failed to load pharmacy details');
      } else if (data) {
        setPharmacy({
          name: data.name || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          postcode: data.postcode || '',
          phone: data.phone || '',
          primary_email: data.primary_email || '',
        });
      }
      setLoading(false);
    };

    fetchPharmacy();
  }, [pharmacist?.pharmacy_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('pharmacies')
      .update(pharmacy)
      .eq('id', pharmacist?.pharmacy_id);

    if (error) {
      console.error('Error updating pharmacy:', error);
      toast.error('Failed to update pharmacy details');
    } else {
      toast.success('Pharmacy details updated successfully');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </PortalLayout>
    );
  }

  const isOwner = pharmacist?.role === 'pharmacy_owner' || pharmacist?.role === 'super_admin';

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Pharmacy Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your pharmacy's basic information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pharmacy Details</CardTitle>
            <CardDescription>
              This information will be displayed on your public pharmacy page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pharmacy Name</Label>
                <Input
                  id="name"
                  value={pharmacy.name}
                  onChange={(e) => setPharmacy({ ...pharmacy, name: e.target.value })}
                  required
                  disabled={!isOwner}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line1">Address Line 1</Label>
                <Input
                  id="address_line1"
                  value={pharmacy.address_line1}
                  onChange={(e) => setPharmacy({ ...pharmacy, address_line1: e.target.value })}
                  disabled={!isOwner}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={pharmacy.address_line2}
                  onChange={(e) => setPharmacy({ ...pharmacy, address_line2: e.target.value })}
                  disabled={!isOwner}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={pharmacy.city}
                    onChange={(e) => setPharmacy({ ...pharmacy, city: e.target.value })}
                    disabled={!isOwner}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={pharmacy.postcode}
                    onChange={(e) => setPharmacy({ ...pharmacy, postcode: e.target.value })}
                    disabled={!isOwner}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={pharmacy.phone}
                  onChange={(e) => setPharmacy({ ...pharmacy, phone: e.target.value })}
                  disabled={!isOwner}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary_email">Primary Email</Label>
                <Input
                  id="primary_email"
                  type="email"
                  value={pharmacy.primary_email}
                  onChange={(e) => setPharmacy({ ...pharmacy, primary_email: e.target.value })}
                  disabled={!isOwner}
                />
              </div>

              {isOwner && (
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}

              {!isOwner && (
                <div className="p-3 text-sm rounded-md bg-muted text-muted-foreground">
                  Only pharmacy owners can edit these settings
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
