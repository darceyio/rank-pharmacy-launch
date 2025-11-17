import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Coins } from 'lucide-react';

interface PharmacyService {
  id: string;
  slug: string;
  custom_title: string | null;
  short_summary: string | null;
  price_from: number | null;
  duration_minutes: number | null;
  hero_image_url: string | null;
  booking_enabled: boolean | null;
  service_catalogue: {
    name: string;
  } | null;
}

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState<PharmacyService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('pharmacy_services')
        .select(`
          id,
          slug,
          custom_title,
          short_summary,
          price_from,
          duration_minutes,
          hero_image_url,
          booking_enabled,
          service_catalogue (
            name
          )
        `)
        .eq('is_active', true)
        .order('custom_title');

      if (error) {
        console.error('Error fetching services:', error);
      } else {
        setServices(data || []);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container-padding mx-auto max-w-7xl pt-32 pb-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container-padding mx-auto max-w-7xl pt-32 pb-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse our comprehensive range of pharmacy services. Book online or contact us for more information.
          </p>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Services Available</CardTitle>
              <CardDescription>
                We're currently updating our services. Please check back soon or contact the pharmacy directly.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="flex flex-col hover-scale">
                {service.hero_image_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    {service.hero_image_url.includes('.mp4') || service.hero_image_url.includes('.webm') ? (
                      <video
                        src={service.hero_image_url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={service.hero_image_url}
                        alt={service.custom_title || service.service_catalogue?.name || ''}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">
                      {service.custom_title || service.service_catalogue?.name}
                    </CardTitle>
                    {service.booking_enabled && (
                      <Badge variant="secondary" className="shrink-0">
                        Book Online
                      </Badge>
                    )}
                  </div>
                  {service.short_summary && (
                    <CardDescription className="line-clamp-3">
                      {service.short_summary}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {service.duration_minutes && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration_minutes} mins</span>
                      </div>
                    )}
                    {service.price_from && (
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-4 w-4" />
                        <span>From £{service.price_from}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  <Button
                    onClick={() => navigate(`/services/${service.slug}`)}
                    className="flex-1"
                    variant={service.booking_enabled ? "default" : "outline"}
                  >
                    {service.booking_enabled ? 'Book Now' : 'Learn More'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
