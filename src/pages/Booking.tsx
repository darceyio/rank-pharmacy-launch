import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";

const serviceNames: Record<string, string> = {
  "earwax-removal": "Earwax Removal",
  "blood-pressure-screening": "Blood Pressure Screening",
  "weight-loss": "Weight Loss Service",
};

const Booking = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const serviceName = serviceNames[serviceId || ""] || "Service";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: undefined as Date | undefined,
    gender: "",
    postcode: "",
  });

  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.dateOfBirth !== undefined &&
    formData.postcode.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log("Form submitted:", formData);
      // Navigate to next step (date/time selection)
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container-padding section-spacing">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Service Intro */}
            <div className="max-w-md">
              <div className="mb-6">
                <p className="text-accent font-semibold mb-2">{serviceName}</p>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  Booking your{" "}
                  <span className="italic">Appointment</span>
                </h1>
                <h2 className="text-4xl lg:text-5xl font-bold">
                  is quick and easy!
                </h2>
              </div>
              
              <p className="text-secondary text-lg mb-6">
                To secure your appointment, here's what you'll need:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success shrink-0 mt-1" />
                  <span className="text-foreground">Your Name and Email</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success shrink-0 mt-1" />
                  <span className="text-foreground">Date and Time for Your Appointment</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success shrink-0 mt-1" />
                  <span className="text-foreground">Payment for Your Booking Deposit</span>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
              <h3 className="text-2xl font-bold mb-2">Tell us about you</h3>
              <p className="text-muted-foreground mb-6">
                Tell us a little about yourself so we can get your appointment set up quickly and smoothly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dateOfBirth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateOfBirth ? (
                          format(formData.dateOfBirth, "dd / MM / yyyy")
                        ) : (
                          <span>DD / MM / YYYY</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dateOfBirth}
                        onSelect={(date) =>
                          setFormData({ ...formData, dateOfBirth: date })
                        }
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="gender">Select Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="prefer-not-to-say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    type="text"
                    placeholder="Enter your postcode"
                    value={formData.postcode}
                    onChange={(e) =>
                      setFormData({ ...formData, postcode: e.target.value })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isFormValid}
                >
                  Continue
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Booking;
