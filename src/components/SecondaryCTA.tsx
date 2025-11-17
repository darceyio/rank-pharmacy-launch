import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SecondaryCTA = () => {
  const benefits = [
    "Manage prescriptions easily",
    "Book services online",
    "Trusted NHS pharmacy",
  ];

  return (
    <section className="section-spacing container-padding bg-card">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Get started with <span className="italic">Rank Pharmacy today!</span>
        </h2>

        <ul className="space-y-4 mb-8 inline-block text-left">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0 text-success" />
              <span className="text-lg">{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            <a href="#signup">Register now</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SecondaryCTA;
