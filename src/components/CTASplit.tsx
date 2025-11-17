import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASplit = () => {
  const benefits = [
    "Direct GP ordering using NHS login",
    "Item level tracking on your orders",
    "Pharmacy service booking",
  ];

  return (
    <section className="section-spacing container-padding bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Get your health{" "}
              <span className="italic">journey started today!</span>
            </h2>
            <p className="text-lg opacity-90">
              As a token of our appreciation, we're delighted to offer you a FREE
              consultation with one of our experienced healthcare professionals.
              Claim your card now to enjoy these incredible benefits.
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 text-success" />
                  <span className="text-lg">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              size="lg"
              className="rounded-full bg-card text-card-foreground hover:bg-card/90 px-8"
            >
              <a href="/#signup">Get Started</a>
            </Button>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-accent/30 to-info">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80"
                alt="Mobile app interface of Rank Pharmacy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASplit;
