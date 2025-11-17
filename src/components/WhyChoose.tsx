import { Handshake, Clock, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";

const WhyChoose = () => {
  const features = [
    {
      icon: Handshake,
      title: "Trusted Experts in Care",
      description:
        "Our skilled professionals deliver exceptional healthcare tailored to your unique needs.",
    },
    {
      icon: Clock,
      title: "Always Here for You",
      description:
        "We're here for you 24/7, ensuring prompt care and support whenever you need it.",
    },
    {
      icon: Stethoscope,
      title: "Advanced Care",
      description:
        "We use cutting‑edge technology to provide accurate diagnoses and treatments.",
    },
  ];

  return (
    <section id="about" className="section-spacing container-padding">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-2">
            Why Choose <span className="italic">Rank?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="p-8 text-center hover:shadow-xl smooth-transition border-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
                  <Icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
