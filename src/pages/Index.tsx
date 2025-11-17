import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyChoose from "@/components/WhyChoose";
import CTASplit from "@/components/CTASplit";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import SecondaryCTA from "@/components/SecondaryCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <Services />
        <WhyChoose />
        <CTASplit />
        <Testimonials />
        <FAQ />
        <SecondaryCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
