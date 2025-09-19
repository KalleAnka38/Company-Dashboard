export type Json = string | number | boolean | null | {
  [key: string]: Json | undefined;
} | Json[];
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number;
          name: string;
          sector: string;
          website: string | null;
          employees: number;
          growth_rate: number;
          recent_funding: boolean;
          stale_design: boolean;
          clarity_score: number;
          churn_indicators: number;
          hq: string | null;
          last_updated: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          sector: string;
          website?: string | null;
          employees?: number;
          growth_rate?: number;
          recent_funding?: boolean;
          stale_design?: boolean;
          clarity_score?: number;
          churn_indicators?: number;
          hq?: string | null;
          last_updated?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          sector?: string;
          website?: string | null;
          employees?: number;
          growth_rate?: number;
          recent_funding?: boolean;
          stale_design?: boolean;
          clarity_score?: number;
          churn_indicators?: number;
          hq?: string | null;
          last_updated?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_views: {
        Row: {
          id: number;
          name: string;
          querystring: string;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          querystring: string;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          querystring?: string;
          created_at?: string;
          user_id?: string | null;
        };
      };
      todos: {
        Row: {
          id: number;
          title: string;
          completed: boolean;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          completed?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          completed?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
}