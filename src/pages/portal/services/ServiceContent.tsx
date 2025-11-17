import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePharmacist } from '@/hooks/usePharmacist';
import PortalLayoutNew from '@/components/portal/PortalLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MediaUpload from '@/components/portal/MediaUpload';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye } from 'lucide-react';

export default function ServiceContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pharmacist } = usePharmacist();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [service, setService] = useState({
    custom_title: '',
    short_summary: '',
    description: '',
    price_from: '',
    duration_minutes: '',
    meta_title: '',
    meta_description: '',
    slug: '',
    hero_image_url: '',
  });

  useEffect(() => {
    if (!id || !pharmacist?.pharmacy_id) return;

    const fetchService = async () => {
      const { data, error } = await supabase
        .from('pharmacy_services')
        .select(`
          *,
          service_catalogue(name, code)
        `)
        .eq('id', id)
        .eq('pharmacy_id', pharmacist.pharmacy_id)
        .single();

      if (error) {
        console.error('Error fetching service:', error);
        toast.error('Failed to load service');
        navigate('/portal/services');
      } else if (data) {
        setService({
          custom_title: data.custom_title || '',
          short_summary: data.short_summary || '',
          description: data.description || '',
          price_from: data.price_from?.toString() || '',
          duration_minutes: data.duration_minutes?.toString() || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          slug: data.slug || '',
          hero_image_url: data.hero_image_url || '',
        });
      }
      setLoading(false);
    };

    fetchService();
  }, [id, pharmacist?.pharmacy_id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updateData: any = {
      custom_title: service.custom_title,
      short_summary: service.short_summary,
      description: service.description,
      meta_title: service.meta_title,
      meta_description: service.meta_description,
      hero_image_url: service.hero_image_url,
    };

    if (service.price_from) {
      updateData.price_from = parseFloat(service.price_from);
    }
    if (service.duration_minutes) {
      updateData.duration_minutes = parseInt(service.duration_minutes);
    }

    const { error } = await supabase
      .from('pharmacy_services')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to save changes');
    } else {
      toast.success('Service updated successfully');
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
          <h1 className="text-3xl font-bold">Edit Service Content</h1>
          <p className="text-muted-foreground mt-2">
            Customize service information and SEO settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Media</CardTitle>
              <CardDescription>
                Cover photo or video displayed at the top of the service page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUpload
                serviceId={id!}
                currentMediaUrl={service.hero_image_url}
                onUploadSuccess={(url) => setService({ ...service, hero_image_url: url })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core service details displayed to patients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom_title">Service Title *</Label>
                <Input
                  id="custom_title"
                  value={service.custom_title}
                  onChange={(e) => setService({ ...service, custom_title: e.target.value })}
                  placeholder="e.g., NHS Flu Vaccination"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  The main heading for this service
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_summary">Short Summary *</Label>
                <Textarea
                  id="short_summary"
                  value={service.short_summary}
                  onChange={(e) => setService({ ...service, short_summary: e.target.value })}
                  placeholder="Brief description for service cards"
                  rows={2}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  2-3 sentences displayed on service cards
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={service.description}
                  onChange={(e) => setService({ ...service, description: e.target.value })}
                  placeholder="Detailed service description"
                  rows={8}
                />
                <p className="text-sm text-muted-foreground">
                  Complete service details shown on the service page
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_from">Price From (£)</Label>
                  <Input
                    id="price_from"
                    type="number"
                    step="0.01"
                    value={service.price_from}
                    onChange={(e) => setService({ ...service, price_from: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={service.duration_minutes}
                    onChange={(e) => setService({ ...service, duration_minutes: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={service.meta_title}
                  onChange={(e) => setService({ ...service, meta_title: e.target.value })}
                  placeholder="Leave blank to use service title"
                  maxLength={60}
                />
                <p className="text-sm text-muted-foreground">
                  {service.meta_title.length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={service.meta_description}
                  onChange={(e) => setService({ ...service, meta_description: e.target.value })}
                  placeholder="Leave blank to use short summary"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-sm text-muted-foreground">
                  {service.meta_description.length}/160 characters
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Preview URL</p>
                <p className="text-sm text-muted-foreground break-all">
                  /services/{service.slug}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" className="gap-2" disabled>
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </form>
      </div>
    </PortalLayoutNew>
  );
}
