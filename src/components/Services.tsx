import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Services = () => {
  const services = [
    {
      title: "Earwax Removal",
      description: "Safe, gentle microsuction by trained specialists.",
      image:
        "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&auto=format&fit=crop&q=80",
      alt: "Clinician performing earwax removal",
      href: "/service/earwax-removal/book",
    },
    {
      title: "Blood Pressure Screening",
      description: "Fast, accurate checks by healthcare professionals.",
      image:
        "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80",
      alt: "Patient having blood pressure checked",
      href: "/service/blood-pressure-screening/book",
    },
    {
      title: "Weight Loss Service",
      description:
        "Personalised advice and guidance to help you lose weight safely and effectively.",
      image:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80",
      alt: "Person checking their weight",
      href: "/service/weight-loss/book",
    },
  ];

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
          {services.map((service, index) => (
            <Card
              key={service.title}
              className="overflow-hidden border-2 hover:shadow-xl smooth-transition animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={service.image}
                  alt={service.alt}
                  className="w-full h-full object-cover hover-scale"
                />
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold">{service.title}</h3>
                <p className="text-secondary">{service.description}</p>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-2 w-full hover:bg-muted"
                >
                  <a href={service.href}>Book Now</a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
