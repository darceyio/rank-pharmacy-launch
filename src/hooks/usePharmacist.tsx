import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Pharmacist {
  id: string;
  pharmacy_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'super_admin' | 'pharmacy_owner' | 'pharmacist';
  photo_url: string | null;
  bio: string | null;
  is_active: boolean;
}

export function usePharmacist() {
  const { user, loading: authLoading } = useAuth();
  const [pharmacist, setPharmacist] = useState<Pharmacist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setPharmacist(null);
      setLoading(false);
      return;
    }

    const fetchPharmacist = async () => {
      const { data, error } = await supabase
        .from('pharmacists')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching pharmacist:', error);
        setPharmacist(null);
      } else {
        setPharmacist(data);
      }
      setLoading(false);
    };

    fetchPharmacist();
  }, [user, authLoading]);

  return { pharmacist, loading: loading || authLoading };
}
