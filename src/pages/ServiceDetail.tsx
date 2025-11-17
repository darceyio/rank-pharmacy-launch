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
      
      {/* Hero Media - Full Width */}
      {service.hero_image_url && (
        <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
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
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
          
          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 container-padding mx-auto max-w-4xl pb-12">
            <Button
              onClick={() => navigate('/services')}
              variant="ghost"
              className="mb-4 backdrop-blur-lg bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all shadow-lg"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Button>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              {service.custom_title || service.service_catalogue?.name}
            </h1>
          </div>
        </div>
      )}
      
      <main className={`container-padding mx-auto max-w-4xl pb-16 ${service.hero_image_url ? 'pt-12' : 'pt-32'}`}>
        {!service.hero_image_url && (
          <>
            <Button
              onClick={() => navigate('/services')}
              variant="ghost"
              className="mb-6 backdrop-blur-md bg-background/80 border border-border/20 hover:bg-background/90 transition-all"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Button>

            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold">
                  {service.custom_title || service.service_catalogue?.name}
                </h1>
                {service.booking_enabled && (
                  <Badge variant="secondary" className="shrink-0">
                    Book Online
                  </Badge>
                )}
              </div>

              {service.short_summary && (
                <p className="text-xl text-muted-foreground mb-6">
                  {service.short_summary}
                </p>
              )}

              <div className="flex flex-wrap gap-6 text-muted-foreground">
                {service.duration_minutes && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{service.duration_minutes} minutes</span>
                  </div>
                )}
                {service.price_from && (
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    <span>From £{service.price_from}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-8" />
          </>
        )}


        {/* Service Details */}
        <div className="mb-8">
          {service.short_summary && (
            <p className="text-xl text-muted-foreground mb-6">
              {service.short_summary}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 mb-6">
            {service.duration_minutes && (
              <Badge variant="secondary" className="text-base px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                {service.duration_minutes} mins
              </Badge>
            )}
            {service.price_from && (
              <Badge variant="secondary" className="text-base px-4 py-2">
                <Coins className="h-4 w-4 mr-2" />
                From £{service.price_from}
              </Badge>
            )}
            {service.booking_enabled && (
              <Badge className="text-base px-4 py-2">
                <Calendar className="h-4 w-4 mr-2" />
                Book Online
              </Badge>
            )}
          </div>
        </div>

        <div className="prose prose-slate max-w-none mb-8">
          <h2 className="text-2xl font-bold mb-4">About This Service</h2>
          <p className="whitespace-pre-line text-foreground">
            {service.description || service.service_catalogue?.default_description || 'No description available.'}
          </p>
        </div>

        {pharmacists.length > 0 && (
          <>
            <Separator className="my-8" />
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
          </>
        )}

        <Separator className="my-8" />

        {service.booking_enabled ? (
          <div>
            {!showBooking ? (
              <Card>
                <CardHeader>
                  <CardTitle>Book Your Appointment</CardTitle>
                  <CardDescription>
                    Select a date and time that works for you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowBooking(true)} size="lg" className="w-full">
                    <Calendar className="mr-2 h-5 w-5" />
                    Choose Date & Time
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <BookingWidget serviceId={service.id} />
            )}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Contact Us to Book</CardTitle>
              <CardDescription>
                Please call or email the pharmacy to enquire about this service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {service.pharmacy?.phone && (
                <p>
                  <strong>Phone:</strong>{' '}
                  <a href={`tel:${service.pharmacy.phone}`} className="text-accent hover:underline">
                    {service.pharmacy.phone}
                  </a>
                </p>
              )}
              {service.pharmacy?.primary_email && (
                <p>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${service.pharmacy.primary_email}`} className="text-accent hover:underline">
                    {service.pharmacy.primary_email}
                  </a>
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
