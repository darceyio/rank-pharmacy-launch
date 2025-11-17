import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      name: "John Smith",
      rating: 5,
      text: "Had an issue with my prescription and they sorted it quickly with no hassle. It's clear they genuinely care about their patients – really impressed.",
    },
    {
      name: "Moh Afridi",
      rating: 5,
      text: "Had an issue with my prescription and they sorted it quickly with no hassle. It's clear they genuinely care about their patients – really impressed.",
    },
    {
      name: "Janet Stephenson",
      rating: 5,
      text: "Had an issue with my prescription and they sorted it quickly with no hassle. It's clear they genuinely care about their patients – really impressed.",
    },
    {
      name: "Ismail Blake",
      rating: 5,
      text: "Had an issue with my prescription and they sorted it quickly with no hassle. It's clear they genuinely care about their patients – really impressed.",
    },
  ];

  return (
    <section className="section-spacing container-padding bg-card">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-2">
            Our customers <span className="italic">say it best.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="p-6 space-y-4 bg-background hover:shadow-xl smooth-transition animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-accent text-accent"
                  />
                ))}
              </div>
              <p className="text-secondary">{testimonial.text}</p>
              <p className="font-semibold">{testimonial.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
