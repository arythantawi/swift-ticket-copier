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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          button_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          layout_type: string
          link_url: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          layout_type?: string
          link_url?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          layout_type?: string
          link_url?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          dropoff_address: string | null
          has_large_luggage: boolean | null
          has_package_delivery: boolean | null
          id: string
          luggage_description: string | null
          notes: string | null
          order_id: string
          package_description: string | null
          passengers: number
          payment_proof_drive_id: string | null
          payment_proof_url: string | null
          payment_status: string
          pickup_address: string
          pickup_time: string
          route_from: string
          route_to: string
          route_via: string | null
          special_requests: string | null
          total_price: number
          travel_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          dropoff_address?: string | null
          has_large_luggage?: boolean | null
          has_package_delivery?: boolean | null
          id?: string
          luggage_description?: string | null
          notes?: string | null
          order_id: string
          package_description?: string | null
          passengers?: number
          payment_proof_drive_id?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          pickup_address: string
          pickup_time: string
          route_from: string
          route_to: string
          route_via?: string | null
          special_requests?: string | null
          total_price?: number
          travel_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          dropoff_address?: string | null
          has_large_luggage?: boolean | null
          has_package_delivery?: boolean | null
          id?: string
          luggage_description?: string | null
          notes?: string | null
          order_id?: string
          package_description?: string | null
          passengers?: number
          payment_proof_drive_id?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          pickup_address?: string
          pickup_time?: string
          route_from?: string
          route_to?: string
          route_via?: string | null
          special_requests?: string | null
          total_price?: number
          travel_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      promos: {
        Row: {
          created_at: string
          description: string | null
          discount_text: string | null
          end_date: string | null
          id: string
          is_active: boolean
          promo_code: string | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_text?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          promo_code?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_text?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          promo_code?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          pickup_time: string
          price: number
          route_from: string
          route_to: string
          route_via: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          pickup_time: string
          price: number
          route_from: string
          route_to: string
          route_via?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          pickup_time?: string
          price?: number
          route_from?: string
          route_to?: string
          route_via?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          customer_location: string | null
          customer_name: string
          customer_photo_url: string | null
          display_order: number
          id: string
          is_active: boolean
          rating: number
          route_taken: string | null
          testimonial_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_location?: string | null
          customer_name: string
          customer_photo_url?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          rating?: number
          route_taken?: string | null
          testimonial_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_location?: string | null
          customer_name?: string
          customer_photo_url?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          rating?: number
          route_taken?: string | null
          testimonial_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      trip_operations: {
        Row: {
          created_at: string
          driver_name: string | null
          driver_phone: string | null
          expense_driver_commission: number
          expense_driver_meals: number
          expense_ferry: number
          expense_fuel: number
          expense_meals: number
          expense_other: number
          expense_parking: number
          expense_snack: number
          expense_toll: number
          id: string
          income_other: number
          income_tickets: number
          notes: string | null
          pickup_time: string
          route_from: string
          route_to: string
          route_via: string | null
          total_passengers: number
          trip_date: string
          updated_at: string
          vehicle_number: string | null
        }
        Insert: {
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          expense_driver_commission?: number
          expense_driver_meals?: number
          expense_ferry?: number
          expense_fuel?: number
          expense_meals?: number
          expense_other?: number
          expense_parking?: number
          expense_snack?: number
          expense_toll?: number
          id?: string
          income_other?: number
          income_tickets?: number
          notes?: string | null
          pickup_time: string
          route_from: string
          route_to: string
          route_via?: string | null
          total_passengers?: number
          trip_date: string
          updated_at?: string
          vehicle_number?: string | null
        }
        Update: {
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          expense_driver_commission?: number
          expense_driver_meals?: number
          expense_ferry?: number
          expense_fuel?: number
          expense_meals?: number
          expense_other?: number
          expense_parking?: number
          expense_snack?: number
          expense_toll?: number
          id?: string
          income_other?: number
          income_tickets?: number
          notes?: string | null
          pickup_time?: string
          route_from?: string
          route_to?: string
          route_via?: string | null
          total_passengers?: number
          trip_date?: string
          updated_at?: string
          vehicle_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
