import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'sonner';

interface MediaUploadProps {
  serviceId: string;
  currentMediaUrl?: string | null;
  onUploadSuccess: (url: string) => void;
}

export default function MediaUpload({ serviceId, currentMediaUrl, onUploadSuccess }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentMediaUrl || null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(
    currentMediaUrl ? (currentMediaUrl.includes('.mp4') || currentMediaUrl.includes('.webm') ? 'video' : 'image') : null
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm'];
    const isImage = validImageTypes.includes(file.type);
    const isVideo = validVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      toast.error('Please upload a valid image (JPEG, PNG, WebP) or video (MP4, WebM) file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10485760) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Delete existing file if present
      if (currentMediaUrl) {
        const oldPath = currentMediaUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('service-media').remove([oldPath]);
      }

      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `${serviceId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('service-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('service-media')
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      setMediaType(isImage ? 'image' : 'video');
      onUploadSuccess(publicUrl);
      toast.success('Media uploaded successfully');
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentMediaUrl) return;

    try {
      const path = currentMediaUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('service-media').remove([path]);
      
      setPreview(null);
      setMediaType(null);
      onUploadSuccess('');
      toast.success('Media removed successfully');
    } catch (error) {
      console.error('Error removing media:', error);
      toast.error('Failed to remove media');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Hero Media (Cover Photo/Video)</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a hero image or video that will be displayed at the top of the service page. 
          Recommended: 1920x600px for images. Max 10MB.
        </p>
      </div>

      {preview ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              {mediaType === 'image' ? (
                <img src={preview} alt="Hero media" className="w-full h-full object-cover" />
              ) : (
                <video src={preview} className="w-full h-full object-cover" controls />
              )}
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              {mediaType === 'image' ? <ImageIcon className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              Current {mediaType}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <Label htmlFor="media-upload" className="cursor-pointer">
            <Button variant="outline" disabled={uploading} asChild>
              <span>
                {uploading ? 'Uploading...' : 'Choose Image or Video'}
              </span>
            </Button>
          </Label>
          <Input
            id="media-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            JPEG, PNG, WebP, MP4, or WebM - Max 10MB
          </p>
        </div>
      )}
    </div>
  );
}
