import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId }: BookingConfirmationRequest = await req.json();

    console.log("Processing booking confirmation for booking ID:", bookingId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch booking details with related data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        pharmacy_services (
          custom_title,
          service_catalogue (name)
        ),
        pharmacies (
          name,
          primary_email,
          address_line1,
          city,
          postcode,
          phone
        ),
        pharmacists (
          first_name,
          last_name
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError);
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetched booking data:", booking);

    // Fetch email settings for the pharmacy
    const { data: emailSettings } = await supabase
      .from("email_settings")
      .select("*")
      .eq("pharmacy_id", booking.pharmacy_id)
      .single();

    console.log("Email settings:", emailSettings);

    const serviceName = booking.pharmacy_services.custom_title || 
                        booking.pharmacy_services.service_catalogue.name;
    const pharmacyName = booking.pharmacies.name;
    const bookingDate = new Date(booking.booking_start).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const bookingTime = new Date(booking.booking_start).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const pharmacistName = booking.pharmacists
      ? `${booking.pharmacists.first_name} ${booking.pharmacists.last_name}`
      : "our pharmacist";

    // Send patient confirmation email
    if (emailSettings?.send_patient_confirmation !== false) {
      console.log("Sending patient confirmation email to:", booking.patient_email);
      
      const patientEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">Appointment Confirmed</h1>
          
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Hi ${booking.patient_first_name},
          </p>
          
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Your appointment has been successfully booked with ${pharmacyName}.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="font-size: 18px; margin-top: 0; color: #000;">Appointment Details</h2>
            <p style="margin: 8px 0;"><strong>Service:</strong> ${serviceName}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${bookingDate}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${bookingTime}</p>
            <p style="margin: 8px 0;"><strong>With:</strong> ${pharmacistName}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="font-size: 16px; margin-top: 0; color: #000;">Location</h3>
            <p style="margin: 4px 0;">${pharmacyName}</p>
            ${booking.pharmacies.address_line1 ? `<p style="margin: 4px 0;">${booking.pharmacies.address_line1}</p>` : ""}
            ${booking.pharmacies.city ? `<p style="margin: 4px 0;">${booking.pharmacies.city}</p>` : ""}
            ${booking.pharmacies.postcode ? `<p style="margin: 4px 0;">${booking.pharmacies.postcode}</p>` : ""}
            ${booking.pharmacies.phone ? `<p style="margin: 4px 0;">Phone: ${booking.pharmacies.phone}</p>` : ""}
          </div>
          
          ${booking.notes ? `
            <div style="margin: 20px 0;">
              <h3 style="font-size: 16px; color: #000;">Your Notes</h3>
              <p style="color: #666;">${booking.notes}</p>
            </div>
          ` : ""}
          
          <p style="font-size: 14px; line-height: 1.5; color: #666; margin-top: 30px;">
            If you need to reschedule or cancel your appointment, please contact us directly.
          </p>
          
          <p style="font-size: 14px; line-height: 1.5; color: #333;">
            Best regards,<br>
            ${pharmacyName} Team
          </p>
        </div>
      `;

      const { error: patientEmailError } = await resend.emails.send({
        from: "Rank Pharmacy <onboarding@resend.dev>",
        to: [booking.patient_email],
        subject: `Appointment Confirmed - ${serviceName}`,
        html: patientEmailHtml,
      });

      if (patientEmailError) {
        console.error("Error sending patient email:", patientEmailError);
      } else {
        console.log("Patient confirmation email sent successfully");
      }
    }

    // Send pharmacy notification email
    if (emailSettings?.send_pharmacy_notification !== false) {
      const notificationEmail = emailSettings?.booking_notification_email || 
                                booking.pharmacies.primary_email;
      
      if (notificationEmail) {
        console.log("Sending pharmacy notification email to:", notificationEmail);
        
        const pharmacyEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">New Booking Received</h1>
            
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
              A new appointment has been booked through your website.
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="font-size: 18px; margin-top: 0; color: #000;">Patient Information</h2>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${booking.patient_first_name} ${booking.patient_last_name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${booking.patient_email}</p>
              ${booking.patient_phone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${booking.patient_phone}</p>` : ""}
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="font-size: 18px; margin-top: 0; color: #000;">Appointment Details</h2>
              <p style="margin: 8px 0;"><strong>Service:</strong> ${serviceName}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${bookingDate}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${bookingTime}</p>
              <p style="margin: 8px 0;"><strong>Assigned to:</strong> ${pharmacistName}</p>
            </div>
            
            ${booking.notes ? `
              <div style="margin: 20px 0;">
                <h3 style="font-size: 16px; color: #000;">Patient Notes</h3>
                <p style="color: #666; background-color: #f9f9f9; padding: 15px; border-radius: 8px;">${booking.notes}</p>
              </div>
            ` : ""}
            
            <p style="font-size: 14px; line-height: 1.5; color: #666; margin-top: 30px;">
              Please log in to your dashboard to view and manage this booking.
            </p>
          </div>
        `;

        const ccEmails = emailSettings?.cc_email 
          ? [notificationEmail, emailSettings.cc_email]
          : [notificationEmail];

        const { error: pharmacyEmailError } = await resend.emails.send({
          from: "Rank Pharmacy Bookings <onboarding@resend.dev>",
          to: ccEmails,
          subject: `New Booking: ${serviceName} - ${bookingDate} at ${bookingTime}`,
          html: pharmacyEmailHtml,
        });

        if (pharmacyEmailError) {
          console.error("Error sending pharmacy notification email:", pharmacyEmailError);
        } else {
          console.log("Pharmacy notification email sent successfully");
        }
      } else {
        console.log("No pharmacy notification email configured");
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Booking confirmation emails sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
