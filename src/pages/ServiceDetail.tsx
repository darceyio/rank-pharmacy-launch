import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Coins, ChevronLeft, Calendar } from 'lucide-react';
import BookingWidget from '@/components/booking/BookingWidget';

interface ServiceDetail {
  id: string;
  slug: string;
  custom_title: string | null;
  short_summary: string | null;
  description: string | null;
  price_from: number | null;
  duration_minutes: number | null;
  hero_image_url: string | null;
  booking_enabled: boolean | null;
  service_catalogue: {
    name: string;
    default_description: string | null;
  } | null;
  pharmacy: {
    name: string;
    phone: string | null;
    primary_email: string | null;
  } | null;
}

interface Pharmacist {
  id: string;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  bio: string | null;
  role: string;
}

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('pharmacy_services')
        .select(`
          id,
          slug,
          custom_title,
          short_summary,
          description,
          price_from,
          duration_minutes,
          hero_image_url,
          booking_enabled,
          service_catalogue (
            name,
            default_description
          ),
          pharmacy:pharmacies (
            name,
            phone,
            primary_email
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching service:', error);
      } else {
        setService(data);

        // Fetch assigned pharmacists
        const { data: assignments } = await supabase
          .from('service_staff_assignments')
          .select(`
            pharmacist:pharmacists (
              id,
              first_name,
              last_name,
              photo_url,
              bio,
              role
            )
          `)
          .eq('pharmacy_service_id', data.id);

        if (assignments) {
          setPharmacists(assignments.map((a: any) => a.pharmacist).filter(Boolean));
        }
      }
      setLoading(false);
    };

    fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container-padding mx-auto max-w-4xl pt-32 pb-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container-padding mx-auto max-w-4xl pt-32 pb-16">
          <Card>
            <CardHeader>
              <CardTitle>Service Not Found</CardTitle>
              <CardDescription>
                The service you're looking for doesn't exist or is no longer available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/services')} variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Media - Full Width, Visual Only */}
      {service.hero_image_url && (
        <div className="relative w-full h-[50vh] md:h-[60vh] min-h-[300px] md:min-h-[400px] max-h-[500px] md:max-h-[600px] overflow-hidden">
          {service.hero_image_url.includes('.mp4') || service.hero_image_url.includes('.webm') ? (
            <video
              src={service.hero_image_url}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={service.hero_image_url}
              alt={service.custom_title || service.service_catalogue?.name || ''}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30" />
        </div>
      )}
      
      <main className={`container-padding mx-auto max-w-4xl pb-16 ${service.hero_image_url ? '-mt-8' : 'pt-32'}`}>
        {/* Main Content Card */}
        <Card className={`${service.hero_image_url ? 'shadow-lg' : ''} mb-8`}>
          <CardContent className="pt-8 pb-8 space-y-6">
            {/* Back Button */}
            <Button
              onClick={() => navigate('/services')}
              variant="ghost"
              size="sm"
              className="mb-2"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Button>

            {/* Service Title */}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {service.custom_title || service.service_catalogue?.name}
              </h1>
              
              {/* Badges Row */}
              <div className="flex flex-wrap gap-3 mb-4">
                {service.duration_minutes && (
                  <Badge variant="secondary" className="text-sm px-3 py-1.5">
                    <Clock className="h-4 w-4 mr-1.5" />
                    {service.duration_minutes} mins
                  </Badge>
                )}
                {service.price_from && (
                  <Badge variant="secondary" className="text-sm px-3 py-1.5">
                    <Coins className="h-4 w-4 mr-1.5" />
                    From £{service.price_from}
                  </Badge>
                )}
                {service.booking_enabled && (
                  <Badge className="text-sm px-3 py-1.5">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    Book Online Available
                  </Badge>
                )}
              </div>

              {/* Short Summary */}
              {service.short_summary && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {service.short_summary}
                </p>
              )}
            </div>

            {/* Primary CTA */}
            {!showBooking && (
              <div>
                {service.booking_enabled ? (
                  <Button 
                    onClick={() => setShowBooking(true)} 
                    size="lg" 
                    className="w-full md:w-auto text-base px-8"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Appointment
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Contact us to book:</p>
                    <div className="flex flex-wrap gap-4">
                      {service.pharmacy?.phone && (
                        <Button asChild variant="outline" size="lg">
                          <a href={`tel:${service.pharmacy.phone}`}>
                            📞 {service.pharmacy.phone}
                          </a>
                        </Button>
                      )}
                      {service.pharmacy?.primary_email && (
                        <Button asChild variant="outline" size="lg">
                          <a href={`mailto:${service.pharmacy.primary_email}`}>
                            ✉️ Email Us
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Separator */}
            <Separator className="my-6" />

            {/* About This Service */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Service</h2>
              <p className="whitespace-pre-line text-foreground leading-relaxed">
                {service.description || service.service_catalogue?.default_description || 'No description available.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Widget (shown when CTA clicked) */}
        {showBooking && service.booking_enabled && (
          <div className="mb-8">
            <BookingWidget serviceId={service.id} />
          </div>
        )}

        {/* Our Team Section */}
        {pharmacists.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pharmacists.map((pharmacist) => (
                <Card key={pharmacist.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {pharmacist.photo_url ? (
                        <img
                          src={pharmacist.photo_url}
                          alt={`${pharmacist.first_name} ${pharmacist.last_name}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                          {pharmacist.first_name?.charAt(0)}{pharmacist.last_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {pharmacist.first_name} {pharmacist.last_name}
                        </CardTitle>
                        <CardDescription className="capitalize">
                          {pharmacist.role.replace('_', ' ')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {pharmacist.bio && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{pharmacist.bio}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
