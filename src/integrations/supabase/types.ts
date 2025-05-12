export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          operating_hours: Json | null; // e.g., { mon: "9am-5pm", tue: "9am-5pm" }
          timezone: string | null;
          additional_info: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          operating_hours?: Json | null;
          timezone?: string | null;
          additional_info?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          operating_hours?: Json | null;
          timezone?: string | null;
          additional_info?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          duration_minutes: number; // Duration in minutes
          price: number | null;
          max_capacity_per_slot: number | null;
          buffer_time_minutes: number | null;
          category: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price?: number | null;
          max_capacity_per_slot?: number | null;
          buffer_time_minutes?: number | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number | null;
          max_capacity_per_slot?: number | null;
          buffer_time_minutes?: number | null;
          category?: string | null;
        };
        Relationships: [];
      };
      location_services: {
        Row: {
          location_id: string;
          service_id: string;
          is_offered: boolean;
          specific_operating_hours: Json | null; // Override location operating hours for this service
          staff_ids: string[] | null; // Staff qualified to perform this service at this location
        };
        Insert: {
          location_id: string;
          service_id: string;
          is_offered?: boolean;
          specific_operating_hours?: Json | null;
          staff_ids?: string[] | null;
        };
        Update: {
          location_id?: string;
          service_id?: string;
          is_offered?: boolean;
          specific_operating_hours?: Json | null;
          staff_ids?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "location_services_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "location_services_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          }
        ];
      };
      appointments: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          customer_id: string; // FK to profiles.id (user_id)
          location_id: string; // FK to locations.id
          service_id: string; // FK to services.id
          staff_id_assigned: string | null; // FK to profiles.id (staff user_id)
          scheduled_start_time: string;
          scheduled_end_time: string;
          actual_start_time: string | null;
          actual_end_time: string | null;
          status: Database["public"]["Enums"]["appointment_status_new"];
          check_in_time: string | null;
          customer_notes: string | null;
          staff_notes: string | null;
          cancellation_reason: string | null;
          rescheduled_from_appointment_id: string | null;
          booked_via: string | null; // e.g., "online", "phone", "walk-in"
          is_recurring: boolean;
          recurrence_rule: string | null; // e.g., iCalendar RRULE
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          customer_id: string;
          location_id: string;
          service_id: string;
          staff_id_assigned?: string | null;
          scheduled_start_time: string;
          scheduled_end_time: string;
          actual_start_time?: string | null;
          actual_end_time?: string | null;
          status?: Database["public"]["Enums"]["appointment_status_new"];
          check_in_time?: string | null;
          customer_notes?: string | null;
          staff_notes?: string | null;
          cancellation_reason?: string | null;
          rescheduled_from_appointment_id?: string | null;
          booked_via?: string | null;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          customer_id?: string;
          location_id?: string;
          service_id?: string;
          staff_id_assigned?: string | null;
          scheduled_start_time?: string;
          scheduled_end_time?: string;
          actual_start_time?: string | null;
          actual_end_time?: string | null;
          status?: Database["public"]["Enums"]["appointment_status_new"];
          check_in_time?: string | null;
          customer_notes?: string | null;
          staff_notes?: string | null;
          cancellation_reason?: string | null;
          rescheduled_from_appointment_id?: string | null;
          booked_via?: string | null;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
        };
        Relationships: [
          // Assuming profiles table exists for users (customers, staff)
          { foreignKeyName: "appointments_customer_id_fkey", columns: ["customer_id"], referencedRelation: "profiles", referencedColumns: ["id"] },
          { foreignKeyName: "appointments_location_id_fkey", columns: ["location_id"], referencedRelation: "locations", referencedColumns: ["id"] },
          { foreignKeyName: "appointments_service_id_fkey", columns: ["service_id"], referencedRelation: "services", referencedColumns: ["id"] },
          { foreignKeyName: "appointments_staff_id_assigned_fkey", columns: ["staff_id_assigned"], referencedRelation: "profiles", referencedColumns: ["id"] },
          { foreignKeyName: "appointments_rescheduled_from_fkey", columns: ["rescheduled_from_appointment_id"], referencedRelation: "appointments", referencedColumns: ["id"] }
        ];
      };
      staff_schedules: {
        Row: {
          id: string;
          staff_id: string; // FK to profiles.id (staff user_id)
          location_id: string; // FK to locations.id
          start_time: string;
          end_time: string;
          date: string; // YYYY-MM-DD
          type: Database["public"]["Enums"]["schedule_type"]; // e.g., "working", "break", "unavailable"
          notes: string | null;
        };
        Insert: { id?: string; staff_id: string; location_id: string; start_time: string; end_time: string; date: string; type?: Database["public"]["Enums"]["schedule_type"]; notes?: string | null; };
        Update: { id?: string; staff_id?: string; location_id?: string; start_time?: string; end_time?: string; date?: string; type?: Database["public"]["Enums"]["schedule_type"]; notes?: string | null; };
        Relationships: [
          { foreignKeyName: "staff_schedules_staff_id_fkey", columns: ["staff_id"], referencedRelation: "profiles", referencedColumns: ["id"] },
          { foreignKeyName: "staff_schedules_location_id_fkey", columns: ["location_id"], referencedRelation: "locations", referencedColumns: ["id"] }
        ];
      };
      message_templates: {
        Row: {
          id: string;
          name: string;
          type: Database["public"]["Enums"]["message_template_type"];
          subject_english: string | null;
          content_english: string;
          subject_spanish: string | null;
          content_spanish: string | null;
          subject_haitian_creole: string | null;
          content_haitian_creole: string | null;
          subject_portuguese: string | null;
          content_portuguese: string | null;
          variables: string[] | null; // e.g., ["customer_name", "appointment_time"]
        };
        Insert: { id?: string; name: string; type: Database["public"]["Enums"]["message_template_type"]; subject_english?: string | null; content_english: string; subject_spanish?: string | null; content_spanish?: string | null; subject_haitian_creole?: string | null; content_haitian_creole?: string | null; subject_portuguese?: string | null; content_portuguese?: string | null; variables?: string[] | null; };
        Update: { id?: string; name?: string; type?: Database["public"]["Enums"]["message_template_type"]; subject_english?: string | null; content_english?: string; subject_spanish?: string | null; content_spanish?: string | null; subject_haitian_creole?: string | null; content_haitian_creole?: string | null; subject_portuguese?: string | null; content_portuguese?: string | null; variables?: string[] | null; };
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          appointment_id: string; // FK to appointments.id
          message_template_id: string; // FK to message_templates.id
          send_at: string;
          status: Database["public"]["Enums"]["reminder_status"]; // e.g., "pending", "sent", "failed"
          sent_at: string | null;
          error_message: string | null;
          communication_channel: Database["public"]["Enums"]["communication_channel"]; // e.g., "sms", "email"
        };
        Insert: { id?: string; appointment_id: string; message_template_id: string; send_at: string; status?: Database["public"]["Enums"]["reminder_status"]; sent_at?: string | null; error_message?: string | null; communication_channel: Database["public"]["Enums"]["communication_channel"]; };
        Update: { id?: string; appointment_id?: string; message_template_id?: string; send_at?: string; status?: Database["public"]["Enums"]["reminder_status"]; sent_at?: string | null; error_message?: string | null; communication_channel?: Database["public"]["Enums"]["communication_channel"]; };
        Relationships: [
          { foreignKeyName: "reminders_appointment_id_fkey", columns: ["appointment_id"], referencedRelation: "appointments", referencedColumns: ["id"] },
          { foreignKeyName: "reminders_message_template_id_fkey", columns: ["message_template_id"], referencedRelation: "message_templates", referencedColumns: ["id"] }
        ];
      };
      surveys: {
        Row: {
          id: string;
          appointment_id: string; // FK to appointments.id
          customer_id: string; // FK to profiles.id
          submitted_at: string;
          ratings: Json | null; // e.g., { overall: 5, staff_friendliness: 4 }
          comments: string | null;
        };
        Insert: { id?: string; appointment_id: string; customer_id: string; submitted_at?: string; ratings?: Json | null; comments?: string | null; };
        Update: { id?: string; appointment_id?: string; customer_id?: string; submitted_at?: string; ratings?: Json | null; comments?: string | null; };
        Relationships: [
          { foreignKeyName: "surveys_appointment_id_fkey", columns: ["appointment_id"], referencedRelation: "appointments", referencedColumns: ["id"] },
          { foreignKeyName: "surveys_customer_id_fkey", columns: ["customer_id"], referencedRelation: "profiles", referencedColumns: ["id"] }
        ];
      };
      queue_configurations: {
        Row: {
          id: string;
          location_id: string; // FK to locations.id
          service_id: string | null; // Optional: specific to a service, or null for location-wide
          name: string;
          is_active: boolean;
          allow_new_appointments: boolean;
          max_queue_size: number | null;
          estimated_wait_time_logic: string | null; // e.g., "avg_service_time", "manual"
          welcome_message_template_id: string | null; // FK to message_templates.id
          max_future_booking_days: number | null;
          operating_hours_override: Json | null; // Override location/service hours for this queue
        };
        Insert: { id?: string; location_id: string; service_id?: string | null; name: string; is_active?: boolean; allow_new_appointments?: boolean; max_queue_size?: number | null; estimated_wait_time_logic?: string | null; welcome_message_template_id?: string | null; max_future_booking_days?: number | null; operating_hours_override?: Json | null; };
        Update: { id?: string; location_id?: string; service_id?: string | null; name?: string; is_active?: boolean; allow_new_appointments?: boolean; max_queue_size?: number | null; estimated_wait_time_logic?: string | null; welcome_message_template_id?: string | null; max_future_booking_days?: number | null; operating_hours_override?: Json | null; };
        Relationships: [
          { foreignKeyName: "queue_configurations_location_id_fkey", columns: ["location_id"], referencedRelation: "locations", referencedColumns: ["id"] },
          { foreignKeyName: "queue_configurations_service_id_fkey", columns: ["service_id"], referencedRelation: "services", referencedColumns: ["id"] },
          { foreignKeyName: "queue_configurations_welcome_message_fkey", columns: ["welcome_message_template_id"], referencedRelation: "message_templates", referencedColumns: ["id"] }
        ];
      };
      // Assuming a 'profiles' table for users (customers, staff, admins)
      profiles: {
        Row: {
          id: string; // User UUID from auth.users
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["user_role_new"];
          default_location_id: string | null; // FK to locations.id, for staff
          phone_number: string | null;
          language_preference: string | null; // e.g., "en", "es"
        };
        Insert: { id: string; updated_at?: string | null; username?: string | null; full_name?: string | null; avatar_url?: string | null; role?: Database["public"]["Enums"]["user_role_new"]; default_location_id?: string | null; phone_number?: string | null; language_preference?: string | null; };
        Update: { id?: string; updated_at?: string | null; username?: string | null; full_name?: string | null; avatar_url?: string | null; role?: Database["public"]["Enums"]["user_role_new"]; default_location_id?: string | null; phone_number?: string | null; language_preference?: string | null; };
        Relationships: [
          { foreignKeyName: "profiles_id_fkey", columns: ["id"], referencedRelation: "users", referencedColumns: ["id"] }, // From Supabase Auth
          { foreignKeyName: "profiles_default_location_id_fkey", columns: ["default_location_id"], referencedRelation: "locations", referencedColumns: ["id"] }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never }; // Assuming Edge Functions handle complex logic
    Enums: {
      appointment_status_new: "pending_confirmation" | "confirmed" | "checked_in" | "servicing" | "completed" | "cancelled_by_customer" | "cancelled_by_staff" | "no_show" | "rescheduled";
      schedule_type: "working_hours" | "break" | "time_off" | "on_call";
      message_template_type: "appointment_confirmation" | "appointment_reminder" | "cancellation_notice" | "survey_request" | "general_notification";
      reminder_status: "pending" | "sent" | "failed" | "acknowledged";
      communication_channel: "sms" | "email" | "push_notification";
      user_role_new: "customer" | "staff" | "location_manager" | "admin" | "system_admin";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

