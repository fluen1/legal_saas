export type HealthCheckStatus = 'draft' | 'processing' | 'completed' | 'failed';
export type PaymentStatus = 'free' | 'pending' | 'paid';
export type ScoreLevelDB = 'red' | 'yellow' | 'green';
export type AnalysisStatus = 'pending' | 'profiling' | 'analyzing' | 'orchestrating' | 'verifying' | 'complete' | 'error';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthCheck {
  id: string;
  user_id: string | null;
  email: string;
  answers: Record<string, unknown>;
  report: Record<string, unknown> | null;
  overall_score: ScoreLevelDB | null;
  status: HealthCheckStatus;
  payment_status: PaymentStatus;
  tier: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  analysis_status: AnalysisStatus;
  analysis_step: string | null;
  consented_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
}

export interface EmailPreference {
  email: string;
  unsubscribed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      health_checks: {
        Row: HealthCheck;
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          answers?: Record<string, unknown>;
          report?: Record<string, unknown> | null;
          overall_score?: ScoreLevelDB | null;
          status?: HealthCheckStatus;
          payment_status?: PaymentStatus;
          tier?: string;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          analysis_status?: AnalysisStatus;
          analysis_step?: string | null;
          consented_at?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          answers?: Record<string, unknown>;
          report?: Record<string, unknown> | null;
          overall_score?: ScoreLevelDB | null;
          status?: HealthCheckStatus;
          payment_status?: PaymentStatus;
          tier?: string;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          analysis_status?: AnalysisStatus;
          analysis_step?: string | null;
          consented_at?: string | null;
          updated_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      waitlist: {
        Row: WaitlistEntry;
        Insert: {
          id?: string;
          email: string;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          source?: string | null;
        };
        Relationships: [];
      };
      email_preferences: {
        Row: EmailPreference;
        Insert: {
          email: string;
          unsubscribed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          unsubscribed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      health_check_status: HealthCheckStatus;
      payment_status: PaymentStatus;
      score_level: ScoreLevelDB;
    };
    CompositeTypes: Record<string, never>;
  };
}
