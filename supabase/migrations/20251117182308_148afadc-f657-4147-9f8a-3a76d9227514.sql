-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'pharmacy_owner', 'pharmacist');

-- Create pharmacies table
CREATE TABLE public.pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'United Kingdom',
  phone TEXT,
  primary_email TEXT,
  logo_url TEXT,
  time_zone TEXT DEFAULT 'Europe/London',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create pharmacists table (user profiles)
CREATE TABLE public.pharmacists (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role public.app_role NOT NULL DEFAULT 'pharmacist',
  photo_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create service_catalogue table (NHS-aligned services)
CREATE TABLE public.service_catalogue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  default_description TEXT,
  nhs_service_code TEXT,
  nhs_service_url TEXT,
  is_nhs_service BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create pharmacy_services table
CREATE TABLE public.pharmacy_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE NOT NULL,
  service_catalogue_id UUID REFERENCES public.service_catalogue(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  booking_enabled BOOLEAN DEFAULT false,
  custom_title TEXT,
  short_summary TEXT,
  description TEXT,
  price_from NUMERIC(10,2),
  duration_minutes INTEGER,
  hero_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(pharmacy_id, service_catalogue_id)
);

CREATE INDEX idx_pharmacy_services_active ON public.pharmacy_services(pharmacy_id, is_active, booking_enabled);
CREATE INDEX idx_pharmacy_services_slug ON public.pharmacy_services(pharmacy_id, slug);

-- Create service_images table
CREATE TABLE public.service_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_service_id UUID REFERENCES public.pharmacy_services(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_service_images_service ON public.service_images(pharmacy_service_id, sort_order);

-- Create service_staff_assignments table
CREATE TABLE public.service_staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_service_id UUID REFERENCES public.pharmacy_services(id) ON DELETE CASCADE NOT NULL,
  pharmacist_id UUID REFERENCES public.pharmacists(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(pharmacy_service_id, pharmacist_id)
);

CREATE INDEX idx_service_staff_service ON public.service_staff_assignments(pharmacy_service_id);
CREATE INDEX idx_service_staff_pharmacist ON public.service_staff_assignments(pharmacist_id);

-- Create service_availability table
CREATE TABLE public.service_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_service_id UUID REFERENCES public.pharmacy_services(id) ON DELETE CASCADE NOT NULL,
  pharmacist_id UUID REFERENCES public.pharmacists(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_length_minutes INTEGER NOT NULL CHECK (slot_length_minutes BETWEEN 5 AND 180),
  max_bookings_per_slot INTEGER DEFAULT 1 CHECK (max_bookings_per_slot > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CHECK (start_time < end_time)
);

CREATE INDEX idx_service_availability_service ON public.service_availability(pharmacy_service_id, is_active);
CREATE INDEX idx_service_availability_pharmacist ON public.service_availability(pharmacist_id);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE NOT NULL,
  pharmacy_service_id UUID REFERENCES public.pharmacy_services(id) ON DELETE CASCADE NOT NULL,
  pharmacist_id UUID REFERENCES public.pharmacists(id) ON DELETE SET NULL,
  patient_first_name TEXT NOT NULL,
  patient_last_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT,
  notes TEXT,
  booking_start TIMESTAMPTZ NOT NULL,
  booking_end TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending','confirmed','cancelled','no_show')) DEFAULT 'pending',
  source TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CHECK (booking_start < booking_end)
);

CREATE INDEX idx_bookings_pharmacy_start ON public.bookings(pharmacy_id, booking_start);
CREATE INDEX idx_bookings_service_start ON public.bookings(pharmacy_service_id, booking_start);
CREATE INDEX idx_bookings_pharmacist_start ON public.bookings(pharmacist_id, booking_start);
CREATE INDEX idx_bookings_status ON public.bookings(status, booking_start);

-- Create email_settings table
CREATE TABLE public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE UNIQUE NOT NULL,
  booking_notification_email TEXT,
  cc_email TEXT,
  send_patient_confirmation BOOLEAN DEFAULT true,
  send_pharmacy_notification BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create cms_pages table for future extensibility
CREATE TABLE public.cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  content_json JSONB,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(pharmacy_id, slug)
);

CREATE INDEX idx_cms_pages_pharmacy ON public.cms_pages(pharmacy_id, is_published);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON public.pharmacies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pharmacists_updated_at BEFORE UPDATE ON public.pharmacists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pharmacy_services_updated_at BEFORE UPDATE ON public.pharmacy_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_availability_updated_at BEFORE UPDATE ON public.service_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_settings_updated_at BEFORE UPDATE ON public.email_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON public.cms_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pharmacists
    WHERE id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Security definer function to get user's pharmacy_id
CREATE OR REPLACE FUNCTION public.get_user_pharmacy_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pharmacy_id
  FROM public.pharmacists
  WHERE id = _user_id
    AND is_active = true
  LIMIT 1
$$;

-- RLS Policies for pharmacies
CREATE POLICY "Super admins can manage all pharmacies"
  ON public.pharmacies
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Staff can view their own pharmacy"
  ON public.pharmacies
  FOR SELECT
  TO authenticated
  USING (id = public.get_user_pharmacy_id(auth.uid()));

-- RLS Policies for pharmacists
CREATE POLICY "Super admins can manage all pharmacists"
  ON public.pharmacists
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Pharmacy owners can manage pharmacists in their pharmacy"
  ON public.pharmacists
  FOR ALL
  TO authenticated
  USING (
    pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    AND public.has_role(auth.uid(), 'pharmacy_owner')
  )
  WITH CHECK (
    pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    AND public.has_role(auth.uid(), 'pharmacy_owner')
  );

CREATE POLICY "Pharmacists can view colleagues in their pharmacy"
  ON public.pharmacists
  FOR SELECT
  TO authenticated
  USING (pharmacy_id = public.get_user_pharmacy_id(auth.uid()));

CREATE POLICY "Pharmacists can update their own profile"
  ON public.pharmacists
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policies for service_catalogue (public read, admin write)
CREATE POLICY "Anyone can view service catalogue"
  ON public.service_catalogue
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Super admins can manage service catalogue"
  ON public.service_catalogue
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for pharmacy_services
CREATE POLICY "Public can view active services"
  ON public.pharmacy_services
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Staff can view all services in their pharmacy"
  ON public.pharmacy_services
  FOR SELECT
  TO authenticated
  USING (pharmacy_id = public.get_user_pharmacy_id(auth.uid()));

CREATE POLICY "Staff can manage services in their pharmacy"
  ON public.pharmacy_services
  FOR ALL
  TO authenticated
  USING (pharmacy_id = public.get_user_pharmacy_id(auth.uid()))
  WITH CHECK (pharmacy_id = public.get_user_pharmacy_id(auth.uid()));

-- RLS Policies for service_images (inherit from pharmacy_services)
CREATE POLICY "Public can view service images for active services"
  ON public.service_images
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacy_services ps
      WHERE ps.id = pharmacy_service_id AND ps.is_active = true
    )
  );

CREATE POLICY "Staff can manage images for their pharmacy services"
  ON public.service_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacy_services ps
      WHERE ps.id = pharmacy_service_id
        AND ps.pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pharmacy_services ps
      WHERE ps.id = pharmacy_service_id
        AND ps.pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    )
  );

-- RLS Policies for service_staff_assignments
CREATE POLICY "Public can view staff assignments for active services"
  ON public.service_staff_assignments
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacy_services ps
      WHERE ps.id = pharmacy_service_id AND ps.is_active = true
    )
  );

CREATE POLICY "Staff can manage assignments in their pharmacy"
  ON public.service_staff_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacy_services ps
      WHERE ps.id = pharmacy_service_id
        AND ps.pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pharmacy_services ps
      WHERE ps.id = pharmacy_service_id
        AND ps.pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    )
  );

-- RLS Policies for service_availability
CREATE POLICY "Public can view availability for booking-enabled services"
  ON public.service_availability
  FOR SELECT
  TO authenticated, anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.pharmacy_services ps
      WHERE ps.id = pharmacy_service_id
        AND ps.is_active = true
        AND ps.booking_enabled = true
    )
  );

CREATE POLICY "Staff can manage availability in their pharmacy"
  ON public.service_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacy_services ps
      WHERE ps.id = pharmacy_service_id
        AND ps.pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pharmacy_services ps
      WHERE ps.id = pharmacy_service_id
        AND ps.pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Anyone can create bookings for booking-enabled services"
  ON public.bookings
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pharmacy_services ps
      WHERE ps.id = pharmacy_service_id
        AND ps.is_active = true
        AND ps.booking_enabled = true
    )
    AND booking_start > now()
  );

CREATE POLICY "Staff can view bookings in their pharmacy"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (pharmacy_id = public.get_user_pharmacy_id(auth.uid()));

CREATE POLICY "Staff can update bookings in their pharmacy"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (pharmacy_id = public.get_user_pharmacy_id(auth.uid()))
  WITH CHECK (pharmacy_id = public.get_user_pharmacy_id(auth.uid()));

-- RLS Policies for email_settings
CREATE POLICY "Pharmacy owners can manage email settings"
  ON public.email_settings
  FOR ALL
  TO authenticated
  USING (
    pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    AND public.has_role(auth.uid(), 'pharmacy_owner')
  )
  WITH CHECK (
    pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    AND public.has_role(auth.uid(), 'pharmacy_owner')
  );

CREATE POLICY "Pharmacists can view email settings"
  ON public.email_settings
  FOR SELECT
  TO authenticated
  USING (pharmacy_id = public.get_user_pharmacy_id(auth.uid()));

-- RLS Policies for cms_pages
CREATE POLICY "Public can view published CMS pages"
  ON public.cms_pages
  FOR SELECT
  TO authenticated, anon
  USING (is_published = true);

CREATE POLICY "Staff can view all CMS pages in their pharmacy"
  ON public.cms_pages
  FOR SELECT
  TO authenticated
  USING (pharmacy_id = public.get_user_pharmacy_id(auth.uid()));

CREATE POLICY "Pharmacy owners can manage CMS pages"
  ON public.cms_pages
  FOR ALL
  TO authenticated
  USING (
    pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    AND public.has_role(auth.uid(), 'pharmacy_owner')
  )
  WITH CHECK (
    pharmacy_id = public.get_user_pharmacy_id(auth.uid())
    AND public.has_role(auth.uid(), 'pharmacy_owner')
  );