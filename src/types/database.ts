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
        Relationships: []
      }
      interview_sessions: {
        Row: {
          answers: Json | null
          company_name: string | null
          created_at: string | null
          feedback: Json | null
          id: string
          job_description: string | null
          job_title: string | null
          overall_score: number | null
          questions: Json | null
          resume_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          company_name?: string | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          job_description?: string | null
          job_title?: string | null
          overall_score?: number | null
          questions?: Json | null
          resume_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          company_name?: string | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          job_description?: string | null
          job_title?: string | null
          overall_score?: number | null
          questions?: Json | null
          resume_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          phone: string | null
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
          phone?: string | null
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
          phone?: string | null
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
        Relationships: []
      }
      resume_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          preview_image_url: string | null
          template_data: Json
          type: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          preview_image_url?: string | null
          template_data?: Json
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          preview_image_url?: string | null
          template_data?: Json
          type?: string | null
          updated_at?: string | null
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
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string
          features: Json | null
          id: string
          is_active: boolean | null
          limits: Json | null
          name: string
          price_annual: string
          price_monthly: string
          region: string
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name: string
          price_annual: string
          price_monthly: string
          region: string
          tier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name?: string
          price_annual?: string
          price_monthly?: string
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
          status: string
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
          status: string
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
          status?: string
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
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
