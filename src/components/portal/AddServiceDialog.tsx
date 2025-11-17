import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePharmacist } from '@/hooks/usePharmacist';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Check } from 'lucide-react';

interface ServiceCatalogue {
  id: string;
  code: string;
  name: string;
  default_description: string | null;
  is_nhs_service: boolean | null;
}

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceAdded: () => void;
}

export default function AddServiceDialog({ open, onOpenChange, onServiceAdded }: AddServiceDialogProps) {
  const { pharmacist } = usePharmacist();
  const { toast } = useToast();
  const [catalogue, setCatalogue] = useState<ServiceCatalogue[]>([]);
  const [existingServiceIds, setExistingServiceIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (open && pharmacist) {
      fetchCatalogueAndExisting();
    }
  }, [open, pharmacist]);

  const fetchCatalogueAndExisting = async () => {
    setLoading(true);

    // Fetch service catalogue
    const { data: catalogueData, error: catalogueError } = await supabase
      .from('service_catalogue')
      .select('*')
      .order('name');

    if (catalogueError) {
      console.error('Error fetching catalogue:', catalogueError);
      toast({
        title: 'Error',
        description: 'Failed to load service catalogue',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Fetch existing pharmacy services
    const { data: existingData, error: existingError } = await supabase
      .from('pharmacy_services')
      .select('service_catalogue_id')
      .eq('pharmacy_id', pharmacist!.pharmacy_id);

    if (existingError) {
      console.error('Error fetching existing services:', existingError);
    }

    setCatalogue(catalogueData || []);
    setExistingServiceIds(
      new Set(existingData?.map((s) => s.service_catalogue_id) || [])
    );
    setLoading(false);
  };

  const addService = async (service: ServiceCatalogue) => {
    if (!pharmacist?.pharmacy_id) return;

    setAdding(service.id);

    const slug = service.code;
    const customTitle = service.name;

    const { error } = await supabase.from('pharmacy_services').insert({
      pharmacy_id: pharmacist.pharmacy_id,
      service_catalogue_id: service.id,
      slug,
      custom_title: customTitle,
      description: service.default_description,
      is_active: false,
      booking_enabled: false,
    });

    setAdding(null);

    if (error) {
      console.error('Error adding service:', error);
      toast({
        title: 'Error',
        description: 'Failed to add service',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Service Added',
      description: `${service.name} has been added to your pharmacy`,
    });

    setExistingServiceIds((prev) => new Set(prev).add(service.id));
    onServiceAdded();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Service</DialogTitle>
          <DialogDescription>
            Select a service from the catalogue to add to your pharmacy
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading services...
          </div>
        ) : (
          <div className="space-y-3">
            {catalogue.map((service) => {
              const isAdded = existingServiceIds.has(service.id);
              const isAdding = adding === service.id;

              return (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-base">{service.name}</CardTitle>
                          {service.is_nhs_service && (
                            <Badge variant="secondary" className="shrink-0">
                              NHS
                            </Badge>
                          )}
                        </div>
                        {service.default_description && (
                          <CardDescription className="line-clamp-2">
                            {service.default_description}
                          </CardDescription>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => addService(service)}
                        disabled={isAdded || isAdding}
                        variant={isAdded ? "outline" : "default"}
                      >
                        {isAdded ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Added
                          </>
                        ) : isAdding ? (
                          'Adding...'
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
