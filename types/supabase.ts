export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          github_username: string | null;
          twitter_username: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          github_username?: string | null;
          twitter_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          github_username?: string | null;
          twitter_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          content_id: string;
          content_type: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          content_type: string;
          user_id: string;
          content: string;
          parent_id?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content_id?: string;
          content_type?: string;
          user_id?: string;
          content?: string;
          parent_id?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          content_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          content_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_id?: string;
          content_type?: string;
          created_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          content_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          content_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_id?: string;
          content_type?: string;
          created_at?: string;
        };
      };
      user_actions: {
        Row: {
          id: string;
          user_id: string;
          action_type: string;
          content_id: string;
          content_type: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_type: string;
          content_id: string;
          content_type: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_type?: string;
          content_id?: string;
          content_type?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// 辅助类型
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// 内容类型枚举
export const ContentType = {
  POST: "post",
  PROJECT: "project",
  BOOK: "book",
  TOOL: "tool",
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

// 行为类型枚举
export const ActionType = {
  VIEW: "view",
  LIKE: "like",
  UNLIKE: "unlike",
  BOOKMARK: "bookmark",
  UNBOOKMARK: "unbookmark",
  COMMENT: "comment",
  SHARE: "share",
} as const;

export type ActionType = (typeof ActionType)[keyof typeof ActionType];
