import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Service = {
  id: string;
  slug: string;
  custom_title: string | null;
  short_summary: string | null;
  hero_image_url: string | null;
  service_catalogue: {
    name: string;
    default_description: string | null;
  } | null;
};

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("pharmacy_services")
        .select(`
          id,
          slug,
          custom_title,
          short_summary,
          hero_image_url,
          service_catalogue (
            name,
            default_description
          )
        `)
        .eq("is_active", true)
        .limit(6);

      if (error) {
        console.error("Error fetching services:", error);
      } else {
        setServices(data || []);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="section-spacing container-padding bg-card">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Healthcare Services</h2>
            <p className="text-lg text-secondary">
              We offer a wide range of pharmacy services to support your health and
              wellbeing – from prescription management and NHS services to private
              consultations and expert health advice.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-2">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <section id="services" className="section-spacing container-padding bg-card">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Healthcare Services</h2>
            <p className="text-lg text-secondary">
              We offer a wide range of pharmacy services to support your health and
              wellbeing – from prescription management and NHS services to private
              consultations and expert health advice.
            </p>
          </div>
          <p className="text-center text-muted-foreground">
            No services are currently available. Please check back soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="section-spacing container-padding bg-card">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Healthcare Services</h2>
          <p className="text-lg text-secondary">
            We offer a wide range of pharmacy services to support your health and
            wellbeing – from prescription management and NHS services to private
            consultations and expert health advice.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const title = service.custom_title || service.service_catalogue?.name || "Service";
            const description = service.short_summary || service.service_catalogue?.default_description || "";
            const image = service.hero_image_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80";
            
            return (
              <Card
                key={service.id}
                className="overflow-hidden border-2 hover:shadow-xl smooth-transition animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover hover-scale"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold">{title}</h3>
                  <p className="text-secondary line-clamp-5">{description}</p>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-2 w-full hover:bg-muted"
                  >
                    <Link to={`/services/${service.slug}`}>Book Now</Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-2"
          >
            <Link to="/services">View All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Services;
