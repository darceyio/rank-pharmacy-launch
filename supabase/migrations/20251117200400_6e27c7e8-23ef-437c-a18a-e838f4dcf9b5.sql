-- Create storage bucket for service media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-media',
  'service-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
);

-- Allow authenticated users to upload service media for their pharmacy
CREATE POLICY "Staff can upload service media for their pharmacy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-media' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM pharmacy_services 
    WHERE pharmacy_id = get_user_pharmacy_id(auth.uid())
  )
);

-- Allow authenticated users to update service media for their pharmacy
CREATE POLICY "Staff can update service media for their pharmacy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-media' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM pharmacy_services 
    WHERE pharmacy_id = get_user_pharmacy_id(auth.uid())
  )
);

-- Allow authenticated users to delete service media for their pharmacy
CREATE POLICY "Staff can delete service media for their pharmacy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-media' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM pharmacy_services 
    WHERE pharmacy_id = get_user_pharmacy_id(auth.uid())
  )
);

-- Allow public to view service media
CREATE POLICY "Public can view service media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'service-media');