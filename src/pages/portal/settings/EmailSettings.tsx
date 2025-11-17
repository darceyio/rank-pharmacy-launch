import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePharmacist } from '@/hooks/usePharmacist';
import PortalLayoutNew from '@/components/portal/PortalLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

export default function EmailSettings() {
  const { pharmacist } = usePharmacist();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    booking_notification_email: '',
    cc_email: '',
    send_patient_confirmation: true,
    send_pharmacy_notification: true,
  });

  useEffect(() => {
    if (!pharmacist?.pharmacy_id) return;

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('pharmacy_id', pharmacist.pharmacy_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching email settings:', error);
      } else if (data) {
        setSettings({
          booking_notification_email: data.booking_notification_email || '',
          cc_email: data.cc_email || '',
          send_patient_confirmation: data.send_patient_confirmation,
          send_pharmacy_notification: data.send_pharmacy_notification,
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, [pharmacist?.pharmacy_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: existing } = await supabase
      .from('email_settings')
      .select('id')
      .eq('pharmacy_id', pharmacist?.pharmacy_id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('email_settings')
        .update(settings)
        .eq('pharmacy_id', pharmacist?.pharmacy_id));
    } else {
      ({ error } = await supabase
        .from('email_settings')
        .insert({ ...settings, pharmacy_id: pharmacist?.pharmacy_id }));
    }

    if (error) {
      console.error('Error updating email settings:', error);
      toast.error('Failed to update email settings');
    } else {
      toast.success('Email settings updated successfully');
    }
    setSaving(false);
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

  const isOwner = pharmacist?.role === 'pharmacy_owner' || pharmacist?.role === 'super_admin';

  return (
    <PortalLayoutNew>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Email Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure booking notification emails
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Manage how and where booking notifications are sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="booking_notification_email">
                  Booking Notification Email *
                </Label>
                <Input
                  id="booking_notification_email"
                  type="email"
                  value={settings.booking_notification_email}
                  onChange={(e) => setSettings({ ...settings, booking_notification_email: e.target.value })}
                  placeholder="bookings@darcey.com"
                  required
                  disabled={!isOwner}
                />
                <p className="text-sm text-muted-foreground">
                  Primary email address for booking notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cc_email">CC Email (Optional)</Label>
                <Input
                  id="cc_email"
                  type="email"
                  value={settings.cc_email}
                  onChange={(e) => setSettings({ ...settings, cc_email: e.target.value })}
                  placeholder="manager@darcey.com"
                  disabled={!isOwner}
                />
                <p className="text-sm text-muted-foreground">
                  Additional email address to receive copies of booking notifications
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="send_patient_confirmation">
                      Send Patient Confirmation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically email booking confirmation to patients
                    </p>
                  </div>
                  <Switch
                    id="send_patient_confirmation"
                    checked={settings.send_patient_confirmation}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, send_patient_confirmation: checked })
                    }
                    disabled={!isOwner}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="send_pharmacy_notification">
                      Send Pharmacy Notification
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify pharmacy staff of new bookings
                    </p>
                  </div>
                  <Switch
                    id="send_pharmacy_notification"
                    checked={settings.send_pharmacy_notification}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, send_pharmacy_notification: checked })
                    }
                    disabled={!isOwner}
                  />
                </div>
              </div>

              {isOwner ? (
                <div className="flex gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button type="button" variant="outline" disabled>
                    Send Test Email
                  </Button>
                </div>
              ) : (
                <div className="p-3 text-sm rounded-md bg-muted text-muted-foreground">
                  Only pharmacy owners can edit these settings
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </PortalLayoutNew>
  );
}
