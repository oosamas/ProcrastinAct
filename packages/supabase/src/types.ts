/**
 * Database types for Supabase
 * These match the schema in supabase/migrations/
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionTier = 'free' | 'premium';
export type TaskStatus = 'active' | 'completed' | 'abandoned';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          subscription_tier: SubscriptionTier;
          subscription_expires_at: string | null;
          settings: Json;
          streak_count: number;
          streak_last_date: string | null;
          streak_freezes: number;
          total_tasks_completed: number;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          subscription_tier?: SubscriptionTier;
          subscription_expires_at?: string | null;
          settings?: Json;
          streak_count?: number;
          streak_last_date?: string | null;
          streak_freezes?: number;
          total_tasks_completed?: number;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
          subscription_tier?: SubscriptionTier;
          subscription_expires_at?: string | null;
          settings?: Json;
          streak_count?: number;
          streak_last_date?: string | null;
          streak_freezes?: number;
          total_tasks_completed?: number;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          original_content: string | null;
          shrink_level: number;
          category: string | null;
          status: TaskStatus;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          notes: string | null;
          is_template: boolean;
          position: number;
          parent_task_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          original_content?: string | null;
          shrink_level?: number;
          category?: string | null;
          status?: TaskStatus;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          notes?: string | null;
          is_template?: boolean;
          position?: number;
          parent_task_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          original_content?: string | null;
          shrink_level?: number;
          category?: string | null;
          status?: TaskStatus;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          notes?: string | null;
          is_template?: boolean;
          position?: number;
          parent_task_id?: string | null;
        };
        Relationships: [];
      };
      shrink_history: {
        Row: {
          id: string;
          task_id: string;
          content: string;
          shrink_level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          content: string;
          shrink_level: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          content?: string;
          shrink_level?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      timer_sessions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          duration_seconds: number;
          started_at: string;
          ended_at: string | null;
          completed: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          duration_seconds: number;
          started_at?: string;
          ended_at?: string | null;
          completed?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string | null;
          duration_seconds?: number;
          started_at?: string;
          ended_at?: string | null;
          completed?: boolean;
        };
        Relationships: [];
      };
      ai_usage: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          shrink_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          shrink_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          shrink_count?: number;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_key: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_key: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_key?: string;
          earned_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subscription_tier: SubscriptionTier;
      task_status: TaskStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type ShrinkHistory =
  Database['public']['Tables']['shrink_history']['Row'];
export type TimerSession =
  Database['public']['Tables']['timer_sessions']['Row'];
export type AiUsage = Database['public']['Tables']['ai_usage']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];

export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertTask = Database['public']['Tables']['tasks']['Insert'];
export type InsertTimerSession =
  Database['public']['Tables']['timer_sessions']['Insert'];
export type InsertShrinkHistory =
  Database['public']['Tables']['shrink_history']['Insert'];
export type InsertAiUsage = Database['public']['Tables']['ai_usage']['Insert'];
export type InsertAchievement =
  Database['public']['Tables']['achievements']['Insert'];

export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdateTask = Database['public']['Tables']['tasks']['Update'];
export type UpdateTimerSession =
  Database['public']['Tables']['timer_sessions']['Update'];
