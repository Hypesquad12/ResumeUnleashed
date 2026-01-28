export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversion_tokens: {
        Row: {
          created_at: string | null
          event_type: string
          expires_at: string | null
          id: string
          subscription_id: string | null
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          expires_at?: string | null
          id?: string
          subscription_id?: string | null
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          expires_at?: string | null
          id?: string
          subscription_id?: string | null
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversion_tokens_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      customized_resumes: {
        Row: {
          ai_suggestions: Json | null
          cover_letter: string | null
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
          cover_letter?: string | null
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
          cover_letter?: string | null
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
      interview_sessions: {
        Row: {
          answers: Json | null
          company_name: string | null
          created_at: string | null
          evaluation: Json | null
          feedback: Json | null
          id: string
          interview_level: string | null
          interview_round: string | null
          job_description: string | null
          job_title: string | null
          overall_score: number | null
          questions: Json | null
          resume_id: string | null
          status: string | null
          thread_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          company_name?: string | null
          created_at?: string | null
          evaluation?: Json | null
          feedback?: Json | null
          id?: string
          interview_level?: string | null
          interview_round?: string | null
          job_description?: string | null
          job_title?: string | null
          overall_score?: number | null
          questions?: Json | null
          resume_id?: string | null
          status?: string | null
          thread_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          company_name?: string | null
          created_at?: string | null
          evaluation?: Json | null
          feedback?: Json | null
          id?: string
          interview_level?: string | null
          interview_round?: string | null
          job_description?: string | null
          job_title?: string | null
          overall_score?: number | null
          questions?: Json | null
          resume_id?: string | null
          status?: string | null
          thread_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string | null
          company_name: string
          created_at: string | null
          customized_resume_id: string | null
          id: string
          job_description: string | null
          job_title: string
          job_url: string | null
          location: string | null
          next_step: string | null
          next_step_date: string | null
          notes: string | null
          remote_type: string | null
          response_at: string | null
          resume_id: string | null
          salary_max: number | null
          salary_min: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          company_name: string
          created_at?: string | null
          customized_resume_id?: string | null
          id?: string
          job_description?: string | null
          job_title: string
          job_url?: string | null
          location?: string | null
          next_step?: string | null
          next_step_date?: string | null
          notes?: string | null
          remote_type?: string | null
          response_at?: string | null
          resume_id?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          company_name?: string
          created_at?: string | null
          customized_resume_id?: string | null
          id?: string
          job_description?: string | null
          job_title?: string
          job_url?: string | null
          location?: string | null
          next_step?: string | null
          next_step_date?: string | null
          notes?: string | null
          remote_type?: string | null
          response_at?: string | null
          resume_id?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_customized_resume_id_fkey"
            columns: ["customized_resume_id"]
            isOneToOne: false
            referencedRelation: "customized_resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
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
          country: string | null
          created_at: string | null
          device: string | null
          id: string
          ip_address: string | null
          link_id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          device?: string | null
          id?: string
          ip_address?: string | null
          link_id: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          device?: string | null
          id?: string
          ip_address?: string | null
          link_id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_analytics_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "public_resume_links"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          metadata: Json | null
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
          phone: string | null
          role: string | null
          subscription_region: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          subscription_region?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          subscription_region?: string | null
          subscription_tier?: string | null
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
          resume_id: string | null
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
          resume_id?: string | null
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
          resume_id?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_resume_links_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
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
      resume_ab_tests: {
        Row: {
          created_at: string | null
          current_variant: string | null
          id: string
          metrics: Json | null
          resume_a_id: string
          resume_b_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_variant?: string | null
          id?: string
          metrics?: Json | null
          resume_a_id: string
          resume_b_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_variant?: string | null
          id?: string
          metrics?: Json | null
          resume_a_id?: string
          resume_b_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_ab_tests_resume_a_id_fkey"
            columns: ["resume_a_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_ab_tests_resume_b_id_fkey"
            columns: ["resume_b_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_scores: {
        Row: {
          created_at: string | null
          detailed_feedback: Json | null
          id: string
          improvement_suggestions: string[] | null
          job_description_id: string
          keyword_matches: Json | null
          overall_score: number
          resume_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          detailed_feedback?: Json | null
          id?: string
          improvement_suggestions?: string[] | null
          job_description_id: string
          keyword_matches?: Json | null
          overall_score: number
          resume_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          detailed_feedback?: Json | null
          id?: string
          improvement_suggestions?: string[] | null
          job_description_id?: string
          keyword_matches?: Json | null
          overall_score?: number
          resume_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_scores_job_description_id_fkey"
            columns: ["job_description_id"]
            isOneToOne: false
            referencedRelation: "job_descriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_scores_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
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
          photo_url: string | null
          projects: Json | null
          raw_file_url: string | null
          skills: string[] | null
          summary: string | null
          template: string | null
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
          photo_url?: string | null
          projects?: Json | null
          raw_file_url?: string | null
          skills?: string[] | null
          summary?: string | null
          template?: string | null
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
          photo_url?: string | null
          projects?: Json | null
          raw_file_url?: string | null
          skills?: string[] | null
          summary?: string | null
          template?: string | null
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
      salary_insights: {
        Row: {
          created_at: string | null
          currency: string | null
          experience_level: string | null
          id: string
          job_title: string
          location: string | null
          market_demand: string | null
          negotiation_tips: Json | null
          role_description: string | null
          salary_max: number | null
          salary_median: number | null
          salary_min: number | null
          skills: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          experience_level?: string | null
          id?: string
          job_title: string
          location?: string | null
          market_demand?: string | null
          negotiation_tips?: Json | null
          role_description?: string | null
          salary_max?: number | null
          salary_median?: number | null
          salary_min?: number | null
          skills?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          experience_level?: string | null
          id?: string
          job_title?: string
          location?: string | null
          market_demand?: string | null
          negotiation_tips?: Json | null
          role_description?: string | null
          salary_max?: number | null
          salary_median?: number | null
          salary_min?: number | null
          skills?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string
          features: Json
          id: string
          is_active: boolean | null
          limits: Json
          name: string
          price_annual: number
          price_monthly: number
          region: string
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency: string
          features: Json
          id?: string
          is_active?: boolean | null
          limits: Json
          name: string
          price_annual: number
          price_monthly: number
          region: string
          tier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          limits?: Json
          name?: string
          price_annual?: number
          price_monthly?: number
          region?: string
          tier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          region: string | null
          status: string
          tier: string | null
          trial_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle: string
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          region?: string | null
          status: string
          tier?: string | null
          trial_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle?: string
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          region?: string | null
          status?: string
          tier?: string | null
          trial_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          created_at: string | null
          feature_type: string
          id: string
          period_end: string
          period_start: string
          subscription_id: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature_type: string
          id?: string
          period_end: string
          period_start: string
          subscription_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature_type?: string
          id?: string
          period_end?: string
          period_start?: string
          subscription_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
      check_usage_limit: {
        Args: { p_feature_type: string; p_user_id: string }
        Returns: boolean
      }
      get_public_resume_by_slug: { Args: { slug: string }; Returns: Json }
      increment_public_resume_view_count: {
        Args: { link_id: string }
        Returns: undefined
      }
      increment_usage: {
        Args: { p_feature_type: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
