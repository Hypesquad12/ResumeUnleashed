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
      customized_resumes: {
        Row: {
          ai_suggestions: Json | null
          created_at: string | null
          customized_content: Json
          id: string
          job_description_id: string | null
          match_score: number | null
          pdf_url: string | null
          source_resume_id: string | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_suggestions?: Json | null
          created_at?: string | null
          customized_content?: Json
          id?: string
          job_description_id?: string | null
          match_score?: number | null
          pdf_url?: string | null
          source_resume_id?: string | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_suggestions?: Json | null
          created_at?: string | null
          customized_content?: Json
          id?: string
          job_description_id?: string | null
          match_score?: number | null
          pdf_url?: string | null
          source_resume_id?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customized_resumes_job_description_id_fkey"
            columns: ["job_description_id"]
            isOneToOne: false
            referencedRelation: "job_descriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customized_resumes_source_resume_id_fkey"
            columns: ["source_resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customized_resumes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "resume_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customized_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_descriptions: {
        Row: {
          company: string | null
          created_at: string | null
          description: string
          extracted_keywords: string[] | null
          id: string
          requirements: string[] | null
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          description: string
          extracted_keywords?: string[] | null
          id?: string
          requirements?: string[] | null
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          description?: string
          extracted_keywords?: string[] | null
          id?: string
          requirements?: string[] | null
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_descriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_analytics: {
        Row: {
          card_id: string | null
          city: string | null
          country: string | null
          id: string
          ip_address: string | null
          link_id: string | null
          referrer: string | null
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          card_id?: string | null
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: string | null
          link_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          card_id?: string | null
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: string | null
          link_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_analytics_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "visiting_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_analytics_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "public_resume_links"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      public_resume_links: {
        Row: {
          created_at: string | null
          customized_resume_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          password_hash: string | null
          public_slug: string
          qr_code_url: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          customized_resume_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string | null
          public_slug: string
          qr_code_url?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          customized_resume_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string | null
          public_slug?: string
          qr_code_url?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_resume_links_customized_resume_id_fkey"
            columns: ["customized_resume_id"]
            isOneToOne: false
            referencedRelation: "customized_resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_resume_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_templates: {
        Row: {
          created_at: string | null
          css_styles: string | null
          description: string | null
          html_template: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          slug: string
          template_type: string | null
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          css_styles?: string | null
          description?: string | null
          html_template?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          slug: string
          template_type?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          css_styles?: string | null
          description?: string | null
          html_template?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          slug?: string
          template_type?: string | null
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          certifications: Json | null
          contact: Json | null
          created_at: string | null
          education: Json | null
          experience: Json | null
          id: string
          is_primary: boolean | null
          languages: Json | null
          projects: Json | null
          raw_file_url: string | null
          skills: string[] | null
          summary: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certifications?: Json | null
          contact?: Json | null
          created_at?: string | null
          education?: Json | null
          experience?: Json | null
          id?: string
          is_primary?: boolean | null
          languages?: Json | null
          projects?: Json | null
          raw_file_url?: string | null
          skills?: string[] | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certifications?: Json | null
          contact?: Json | null
          created_at?: string | null
          education?: Json | null
          experience?: Json | null
          id?: string
          is_primary?: boolean | null
          languages?: Json | null
          projects?: Json | null
          raw_file_url?: string | null
          skills?: string[] | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visiting_cards: {
        Row: {
          card_image_url: string | null
          company: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          github: string | null
          id: string
          is_active: boolean | null
          linkedin: string | null
          name: string
          phone: string | null
          public_slug: string | null
          qr_code_url: string | null
          template_id: string | null
          theme_color: string | null
          title: string | null
          twitter: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          card_image_url?: string | null
          company?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          github?: string | null
          id?: string
          is_active?: boolean | null
          linkedin?: string | null
          name: string
          phone?: string | null
          public_slug?: string | null
          qr_code_url?: string | null
          template_id?: string | null
          theme_color?: string | null
          title?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          card_image_url?: string | null
          company?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          github?: string | null
          id?: string
          is_active?: boolean | null
          linkedin?: string | null
          name?: string
          phone?: string | null
          public_slug?: string | null
          qr_code_url?: string | null
          template_id?: string | null
          theme_color?: string | null
          title?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visiting_cards_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "resume_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visiting_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

// Custom types for the application
export type Profile = Tables<'profiles'>
export type Resume = Tables<'resumes'>
export type JobDescription = Tables<'job_descriptions'>
export type CustomizedResume = Tables<'customized_resumes'>
export type ResumeTemplate = Tables<'resume_templates'>
export type VisitingCard = Tables<'visiting_cards'>
export type PublicResumeLink = Tables<'public_resume_links'>
export type LinkAnalytics = Tables<'link_analytics'>

// Contact info type
export interface ContactInfo {
  name?: string
  email?: string
  phone?: string
  linkedin?: string
  github?: string
  website?: string
  location?: string
}

// Experience entry type
export interface ExperienceEntry {
  id?: string
  company: string
  title: string
  location?: string
  startDate: string
  endDate?: string
  current?: boolean
  description: string[]
}

// Education entry type
export interface EducationEntry {
  id?: string
  institution: string
  degree: string
  field?: string
  location?: string
  startDate?: string
  endDate?: string
  gpa?: string
  achievements?: string[]
}

// Certification entry type
export interface CertificationEntry {
  id?: string
  name: string
  issuer: string
  date?: string
  url?: string
}

// Project entry type
export interface ProjectEntry {
  id?: string
  name: string
  description: string
  technologies?: string[]
  url?: string
  startDate?: string
  endDate?: string
}
