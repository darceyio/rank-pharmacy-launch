import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section id="home" className="section-spacing container-padding pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-info px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-medium">4.9 (600 reviews)</span>
            </div>

            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4">
                Your Health,{" "}
                <span className="italic text-primary">Our Priority</span>
              </h1>
              <p className="text-lg md:text-xl text-secondary max-w-xl">
                Expert NHS and private services in the heart of Manchester,
                streamlined for your convenience and peace of mind.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                <a href="#services">View Services</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-2 hover:bg-muted"
              >
                <a href="#about">Learn More</a>
              </Button>
            </div>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent/20 to-info overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"
                alt="Healthcare professional providing care"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
