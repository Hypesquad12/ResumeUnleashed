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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
          projects?: Json | null
          raw_file_url?: string | null
          skills?: string[] | null
          summary?: string | null
          template?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
        Relationships: []
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          tier: string
          region: string
          currency: string
          price_monthly: number
          price_annual: number
          features: Json
          limits: Json
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          tier: string
          region: string
          currency: string
          price_monthly: number
          price_annual: number
          features?: Json
          limits?: Json
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          tier?: string
          region?: string
          currency?: string
          price_monthly?: number
          price_annual?: number
          features?: Json
          limits?: Json
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          razorpay_subscription_id: string | null
          razorpay_customer_id: string | null
          status: string
          billing_cycle: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          razorpay_subscription_id?: string | null
          razorpay_customer_id?: string | null
          status?: string
          billing_cycle: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          razorpay_subscription_id?: string | null
          razorpay_customer_id?: string | null
          status?: string
          billing_cycle?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          amount: number
          currency: string
          status: string
          payment_method: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount: number
          currency: string
          status: string
          payment_method?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payment_method?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          feature_type: string
          usage_count: number | null
          period_start: string
          period_end: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          feature_type: string
          usage_count?: number | null
          period_start: string
          period_end: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          feature_type?: string
          usage_count?: number | null
          period_start?: string
          period_end?: string
          created_at?: string | null
          updated_at?: string | null
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
