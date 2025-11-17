export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_end: string
          booking_start: string
          created_at: string
          id: string
          notes: string | null
          patient_email: string
          patient_first_name: string
          patient_last_name: string
          patient_phone: string | null
          pharmacist_id: string | null
          pharmacy_id: string
          pharmacy_service_id: string
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          booking_end: string
          booking_start: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_email: string
          patient_first_name: string
          patient_last_name: string
          patient_phone?: string | null
          pharmacist_id?: string | null
          pharmacy_id: string
          pharmacy_service_id: string
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          booking_end?: string
          booking_start?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_email?: string
          patient_first_name?: string
          patient_last_name?: string
          patient_phone?: string | null
          pharmacist_id?: string | null
          pharmacy_id?: string
          pharmacy_service_id?: string
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_pharmacist_id_fkey"
            columns: ["pharmacist_id"]
            isOneToOne: false
            referencedRelation: "pharmacists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pharmacy_service_id_fkey"
            columns: ["pharmacy_service_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_services"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          content_json: Json | null
          created_at: string
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          pharmacy_id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content_json?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          pharmacy_id: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content_json?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          pharmacy_id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_pages_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          booking_notification_email: string | null
          cc_email: string | null
          created_at: string
          id: string
          pharmacy_id: string
          send_patient_confirmation: boolean | null
          send_pharmacy_notification: boolean | null
          updated_at: string
        }
        Insert: {
          booking_notification_email?: string | null
          cc_email?: string | null
          created_at?: string
          id?: string
          pharmacy_id: string
          send_patient_confirmation?: boolean | null
          send_pharmacy_notification?: boolean | null
          updated_at?: string
        }
        Update: {
          booking_notification_email?: string | null
          cc_email?: string | null
          created_at?: string
          id?: string
          pharmacy_id?: string
          send_patient_confirmation?: boolean | null
          send_pharmacy_notification?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_settings_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: true
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          postcode: string | null
          primary_email: string | null
          slug: string
          time_zone: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          postcode?: string | null
          primary_email?: string | null
          slug: string
          time_zone?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          postcode?: string | null
          primary_email?: string | null
          slug?: string
          time_zone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pharmacists: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          pharmacy_id: string | null
          phone: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          pharmacy_id?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          pharmacy_id?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacists_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_services: {
        Row: {
          booking_enabled: boolean | null
          created_at: string
          custom_title: string | null
          description: string | null
          duration_minutes: number | null
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          pharmacy_id: string
          price_from: number | null
          service_catalogue_id: string
          short_summary: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          booking_enabled?: boolean | null
          created_at?: string
          custom_title?: string | null
          description?: string | null
          duration_minutes?: number | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          pharmacy_id: string
          price_from?: number | null
          service_catalogue_id: string
          short_summary?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          booking_enabled?: boolean | null
          created_at?: string
          custom_title?: string | null
          description?: string | null
          duration_minutes?: number | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          pharmacy_id?: string
          price_from?: number | null
          service_catalogue_id?: string
          short_summary?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_services_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_services_service_catalogue_id_fkey"
            columns: ["service_catalogue_id"]
            isOneToOne: false
            referencedRelation: "service_catalogue"
            referencedColumns: ["id"]
          },
        ]
      }
      service_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          max_bookings_per_slot: number | null
          pharmacist_id: string | null
          pharmacy_service_id: string
          slot_length_minutes: number
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          max_bookings_per_slot?: number | null
          pharmacist_id?: string | null
          pharmacy_service_id: string
          slot_length_minutes: number
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          max_bookings_per_slot?: number | null
          pharmacist_id?: string | null
          pharmacy_service_id?: string
          slot_length_minutes?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_availability_pharmacist_id_fkey"
            columns: ["pharmacist_id"]
            isOneToOne: false
            referencedRelation: "pharmacists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_availability_pharmacy_service_id_fkey"
            columns: ["pharmacy_service_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_catalogue: {
        Row: {
          code: string
          created_at: string
          default_description: string | null
          id: string
          is_nhs_service: boolean | null
          name: string
          nhs_service_code: string | null
          nhs_service_url: string | null
        }
        Insert: {
          code: string
          created_at?: string
          default_description?: string | null
          id?: string
          is_nhs_service?: boolean | null
          name: string
          nhs_service_code?: string | null
          nhs_service_url?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          default_description?: string | null
          id?: string
          is_nhs_service?: boolean | null
          name?: string
          nhs_service_code?: string | null
          nhs_service_url?: string | null
        }
        Relationships: []
      }
      service_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          pharmacy_service_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          pharmacy_service_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          pharmacy_service_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_images_pharmacy_service_id_fkey"
            columns: ["pharmacy_service_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_staff_assignments: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          pharmacist_id: string
          pharmacy_service_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          pharmacist_id: string
          pharmacy_service_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          pharmacist_id?: string
          pharmacy_service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_staff_assignments_pharmacist_id_fkey"
            columns: ["pharmacist_id"]
            isOneToOne: false
            referencedRelation: "pharmacists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_staff_assignments_pharmacy_service_id_fkey"
            columns: ["pharmacy_service_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_pharmacy_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "pharmacy_owner" | "pharmacist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "pharmacy_owner", "pharmacist"],
    },
  },
} as const
