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

    // SECURITY: Validate UUID format to prevent injection attacks
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!bookingId || typeof bookingId !== 'string' || !uuidRegex.test(bookingId)) {
      console.error("Invalid booking ID format:", bookingId);
      return new Response(
        JSON.stringify({ error: "Invalid booking ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // SECURITY: Verify booking was created recently (within 5 minutes) to prevent abuse
    const bookingCreatedAt = new Date(booking.created_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (bookingCreatedAt < fiveMinutesAgo) {
      console.error("Booking confirmation request for old booking:", bookingId);
      return new Response(
        JSON.stringify({ error: "Confirmation window expired" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmation - Rank Pharmacy</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f7f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f7f4;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center;">
                      <img src="https://jjdcnilifpualykwigmb.supabase.co/storage/v1/object/public/service-media/logo-dark.png" alt="Rank Pharmacy" style="height: 48px; width: auto; margin-bottom: 16px;" />
                      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Appointment Confirmed</h1>
                      <p style="color: #e5e5e5; font-size: 16px; margin: 8px 0 0 0;">We're looking forward to seeing you</p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="font-size: 16px; line-height: 1.6; color: #1a1a1a; margin: 0 0 24px 0;">
                        Hi <strong>${booking.patient_first_name}</strong>,
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #4a4a4a; margin: 0 0 32px 0;">
                        Your appointment has been successfully confirmed. Here are your booking details:
                      </p>
                      
                      <!-- Appointment Details Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f8f7f4 0%, #faf9f7 100%); border-radius: 12px; margin-bottom: 32px; overflow: hidden; border: 1px solid #e8e7e3;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px 0; letter-spacing: -0.3px;">Appointment Details</h2>
                            
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e8e7e3;">
                                  <span style="font-size: 14px; color: #666; display: block; margin-bottom: 4px;">Service</span>
                                  <span style="font-size: 16px; color: #1a1a1a; font-weight: 600;">${serviceName}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e8e7e3;">
                                  <span style="font-size: 14px; color: #666; display: block; margin-bottom: 4px;">Date</span>
                                  <span style="font-size: 16px; color: #1a1a1a; font-weight: 600;">${bookingDate}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e8e7e3;">
                                  <span style="font-size: 14px; color: #666; display: block; margin-bottom: 4px;">Time</span>
                                  <span style="font-size: 16px; color: #1a1a1a; font-weight: 600;">${bookingTime}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="font-size: 14px; color: #666; display: block; margin-bottom: 4px;">With</span>
                                  <span style="font-size: 16px; color: #1a1a1a; font-weight: 600;">${pharmacistName}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Location Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; margin-bottom: 32px; border: 1px solid #e8e7e3;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px 0; letter-spacing: -0.3px;">Location</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #4a4a4a; margin: 0;">
                              <strong style="color: #1a1a1a;">${pharmacyName}</strong><br/>
                              ${booking.pharmacies.address_line1 || ''}<br/>
                              ${booking.pharmacies.city || ''}, ${booking.pharmacies.postcode || ''}<br/>
                              <a href="tel:${booking.pharmacies.phone || ''}" style="color: #1a1a1a; text-decoration: none; margin-top: 8px; display: inline-block;">${booking.pharmacies.phone || ''}</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      ${booking.notes ? `
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbf0; border-radius: 12px; margin-bottom: 32px; border: 1px solid #f5e6b3;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px 0;">Your Note</h3>
                            <p style="font-size: 15px; line-height: 1.6; color: #4a4a4a; margin: 0;">${booking.notes}</p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <p style="font-size: 15px; line-height: 1.6; color: #666; margin: 0 0 24px 0;">
                        Please arrive 5 minutes before your appointment time. If you need to reschedule or cancel, please contact us as soon as possible.
                      </p>
                      
                      <table role="presentation" style="width: 100%; margin-top: 32px;">
                        <tr>
                          <td align="center">
                            <a href="tel:${booking.pharmacies.phone || ''}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">Contact Us</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f7f4; padding: 30px; text-align: center; border-top: 1px solid #e8e7e3;">
                      <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">
                        Thank you for choosing <strong style="color: #1a1a1a;">${pharmacyName}</strong>
                      </p>
                      <p style="font-size: 13px; color: #999; margin: 0;">
                        This is an automated confirmation email. Please do not reply to this message.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const { error: patientEmailError } = await resend.emails.send({
        from: "Rank Pharmacy <bookings@appy.farm>",
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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f7f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f7f4;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center;">
                      <img src="https://jjdcnilifpualykwigmb.supabase.co/storage/v1/object/public/service-media/logo-dark.png" alt="Rank Pharmacy" style="height: 48px; width: auto; margin-bottom: 16px;" />
                      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">New Booking Received</h1>
                      <p style="color: #e5e5e5; font-size: 16px; margin: 8px 0 0 0;">Booking system notification</p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="font-size: 16px; line-height: 1.6; color: #1a1a1a; margin: 0 0 32px 0;">
                        A new appointment has been booked through your website. Please review the details below:
                      </p>
                      
                      <!-- Patient Information Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%); border-radius: 12px; margin-bottom: 24px; overflow: hidden; border: 1px solid #cce5ff;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px 0; letter-spacing: -0.3px;">Patient Information</h2>
                            
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #cce5ff;">
                                  <span style="font-size: 14px; color: #0066cc; display: block; margin-bottom: 4px; font-weight: 600;">Name</span>
                                  <span style="font-size: 16px; color: #1a1a1a; font-weight: 600;">${booking.patient_first_name} ${booking.patient_last_name}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #cce5ff;">
                                  <span style="font-size: 14px; color: #0066cc; display: block; margin-bottom: 4px; font-weight: 600;">Email</span>
                                  <a href="mailto:${booking.patient_email}" style="font-size: 16px; color: #1a1a1a; text-decoration: none; font-weight: 600;">${booking.patient_email}</a>
                                </td>
                              </tr>
                              ${booking.patient_phone ? `
                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="font-size: 14px; color: #0066cc; display: block; margin-bottom: 4px; font-weight: 600;">Phone</span>
                                  <a href="tel:${booking.patient_phone}" style="font-size: 16px; color: #1a1a1a; text-decoration: none; font-weight: 600;">${booking.patient_phone}</a>
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Appointment Details Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f8f7f4 0%, #faf9f7 100%); border-radius: 12px; margin-bottom: 24px; overflow: hidden; border: 1px solid #e8e7e3;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px 0; letter-spacing: -0.3px;">Appointment Details</h2>
                            
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e8e7e3;">
                                  <span style="font-size: 14px; color: #666; display: block; margin-bottom: 4px;">Service</span>
                                  <span style="font-size: 16px; color: #1a1a1a; font-weight: 600;">${serviceName}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e8e7e3;">
                                  <span style="font-size: 14px; color: #666; display: block; margin-bottom: 4px;">Date</span>
                                  <span style="font-size: 16px; color: #1a1a1a; font-weight: 600;">${bookingDate}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e8e7e3;">
                                  <span style="font-size: 14px; color: #666; display: block; margin-bottom: 4px;">Time</span>
                                  <span style="font-size: 16px; color: #1a1a1a; font-weight: 600;">${bookingTime}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="font-size: 14px; color: #666; display: block; margin-bottom: 4px;">Assigned To</span>
                                  <span style="font-size: 16px; color: #1a1a1a; font-weight: 600;">${pharmacistName}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      ${booking.notes ? `
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbf0; border-radius: 12px; margin-bottom: 32px; border: 1px solid #f5e6b3;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px 0;">Patient Note</h3>
                            <p style="font-size: 15px; line-height: 1.6; color: #4a4a4a; margin: 0;">${booking.notes}</p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <table role="presentation" style="width: 100%; margin-top: 32px;">
                        <tr>
                          <td align="center">
                            <a href="https://jjdcnilifpualykwigmb.supabase.co/portal/bookings" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">View in Portal</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f7f4; padding: 30px; text-align: center; border-top: 1px solid #e8e7e3;">
                      <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">
                        <strong style="color: #1a1a1a;">Rank Pharmacy Portal</strong> · Automated Notification
                      </p>
                      <p style="font-size: 13px; color: #999; margin: 0;">
                        Booking ID: ${booking.id}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `;

        const ccEmails = emailSettings?.cc_email 
          ? [notificationEmail, emailSettings.cc_email]
          : [notificationEmail];

        const { error: pharmacyEmailError } = await resend.emails.send({
          from: "Rank Pharmacy <bookings@appy.farm>",
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
