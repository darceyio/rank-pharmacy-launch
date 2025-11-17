import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import NotFound from "./pages/NotFound";
import Login from "./pages/portal/Login";
import ForgotPassword from "./pages/portal/ForgotPassword";
import ResetPassword from "./pages/portal/ResetPassword";
import Dashboard from "./pages/portal/Dashboard";
import Services from "./pages/portal/Services";
import Bookings from "./pages/portal/Bookings";
import PharmacySettings from "./pages/portal/settings/PharmacySettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/service/:serviceId/book" element={<Booking />} />
          
          {/* Portal Auth Routes */}
          <Route path="/portal/login" element={<Login />} />
          <Route path="/portal/forgot-password" element={<ForgotPassword />} />
          <Route path="/portal/reset-password" element={<ResetPassword />} />
          
          {/* Portal App Routes */}
          <Route path="/portal/dashboard" element={<Dashboard />} />
          <Route path="/portal/services" element={<Services />} />
          <Route path="/portal/bookings" element={<Bookings />} />
          <Route path="/portal/settings/pharmacy" element={<PharmacySettings />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
