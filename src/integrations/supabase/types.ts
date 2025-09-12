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
      analytics_snapshots: {
        Row: {
          clicks: number | null
          created_at: string
          engagement_rate: number | null
          followers_count: number | null
          following_count: number | null
          id: string
          impressions: number | null
          platform: string
          posts_count: number | null
          project_id: string
          reach: number | null
          snapshot_date: string
        }
        Insert: {
          clicks?: number | null
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          impressions?: number | null
          platform: string
          posts_count?: number | null
          project_id: string
          reach?: number | null
          snapshot_date: string
        }
        Update: {
          clicks?: number | null
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          impressions?: number | null
          platform?: string
          posts_count?: number | null
          project_id?: string
          reach?: number | null
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          added_at: string
          community_id: string
          community_name: string
          community_url: string | null
          id: string
          is_monitoring: boolean | null
          platform: string
          project_id: string
          relevance_score: number | null
          updated_at: string
        }
        Insert: {
          added_at?: string
          community_id: string
          community_name: string
          community_url?: string | null
          id?: string
          is_monitoring?: boolean | null
          platform: string
          project_id: string
          relevance_score?: number | null
          updated_at?: string
        }
        Update: {
          added_at?: string
          community_id?: string
          community_name?: string
          community_url?: string | null
          id?: string
          is_monitoring?: boolean | null
          platform?: string
          project_id?: string
          relevance_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          id: string
          is_read: boolean | null
          is_replied: boolean | null
          message_type: string
          message_url: string | null
          platform: string
          platform_message_id: string
          project_id: string
          received_at: string
          recipient_username: string | null
          replied_at: string | null
          sender_id: string
          sender_username: string
          thread_id: string | null
        }
        Insert: {
          content: string
          id?: string
          is_read?: boolean | null
          is_replied?: boolean | null
          message_type: string
          message_url?: string | null
          platform: string
          platform_message_id: string
          project_id: string
          received_at?: string
          recipient_username?: string | null
          replied_at?: string | null
          sender_id: string
          sender_username: string
          thread_id?: string | null
        }
        Update: {
          content?: string
          id?: string
          is_read?: boolean | null
          is_replied?: boolean | null
          message_type?: string
          message_url?: string | null
          platform?: string
          platform_message_id?: string
          project_id?: string
          received_at?: string
          recipient_username?: string | null
          replied_at?: string | null
          sender_id?: string
          sender_username?: string
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_posts: {
        Row: {
          author_id: string | null
          author_username: string | null
          community_id: string
          content: string | null
          discovered_at: string
          engagement_count: number | null
          id: string
          is_read: boolean | null
          platform_post_id: string
          post_url: string | null
          posted_at: string | null
          relevance_score: number | null
          title: string | null
        }
        Insert: {
          author_id?: string | null
          author_username?: string | null
          community_id: string
          content?: string | null
          discovered_at?: string
          engagement_count?: number | null
          id?: string
          is_read?: boolean | null
          platform_post_id: string
          post_url?: string | null
          posted_at?: string | null
          relevance_score?: number | null
          title?: string | null
        }
        Update: {
          author_id?: string | null
          author_username?: string | null
          community_id?: string
          content?: string | null
          discovered_at?: string
          engagement_count?: number | null
          id?: string
          is_read?: boolean | null
          platform_post_id?: string
          post_url?: string | null
          posted_at?: string | null
          relevance_score?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitored_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      post_versions: {
        Row: {
          character_count: number | null
          content: string
          created_at: string
          engagement_metrics: Json | null
          id: string
          media_urls: string[] | null
          platform: string
          platform_post_id: string | null
          platform_url: string | null
          post_id: string
          published_at: string | null
        }
        Insert: {
          character_count?: number | null
          content: string
          created_at?: string
          engagement_metrics?: Json | null
          id?: string
          media_urls?: string[] | null
          platform: string
          platform_post_id?: string | null
          platform_url?: string | null
          post_id: string
          published_at?: string | null
        }
        Update: {
          character_count?: number | null
          content?: string
          created_at?: string
          engagement_metrics?: Json | null
          id?: string
          media_urls?: string[] | null
          platform?: string
          platform_post_id?: string | null
          platform_url?: string | null
          post_id?: string
          published_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_versions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          ai_generated: boolean | null
          content: string | null
          created_at: string
          id: string
          media_urls: string[] | null
          platforms: string[]
          project_id: string
          published_at: string | null
          scheduled_at: string | null
          status: string | null
          template_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          content?: string | null
          created_at?: string
          id?: string
          media_urls?: string[] | null
          platforms?: string[]
          project_id: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          template_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          content?: string | null
          created_at?: string
          id?: string
          media_urls?: string[] | null
          platforms?: string[]
          project_id?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          template_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_posts_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          ai_enabled: boolean | null
          ai_tone: string | null
          created_at: string
          description: string | null
          id: string
          marketing_goal: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_enabled?: boolean | null
          ai_tone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          marketing_goal?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_enabled?: boolean | null
          ai_tone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          marketing_goal?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string
          account_id: string
          account_username: string
          connected_at: string
          id: string
          is_active: boolean | null
          platform: string
          project_id: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          account_id: string
          account_username: string
          connected_at?: string
          id?: string
          is_active?: boolean | null
          platform: string
          project_id: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          account_id?: string
          account_username?: string
          connected_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          project_id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          content: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          platforms: string[]
          project_id: string
          tags: string[] | null
          updated_at: string
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          platforms?: string[]
          project_id: string
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          platforms?: string[]
          project_id?: string
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      token_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          id: string
          ip_address: unknown | null
          social_account_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          id?: string
          ip_address?: unknown | null
          social_account_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          id?: string
          ip_address?: unknown | null
          social_account_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_social_tokens: {
        Args: { account_project_id: string }
        Returns: boolean
      }
      get_safe_social_accounts: {
        Args: { p_project_id: string }
        Returns: {
          account_id: string
          account_username: string
          connected_at: string
          has_access_token: boolean
          has_refresh_token: boolean
          id: string
          is_active: boolean
          is_token_expired: boolean
          platform: string
          project_id: string
          token_expires_at: string
          updated_at: string
        }[]
      }
      is_profile_owner: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      is_token_expired: {
        Args: { expires_at: string }
        Returns: boolean
      }
      log_token_access: {
        Args: { access_type: string; account_id: string }
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
