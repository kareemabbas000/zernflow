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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          contact_id: string | null
          created_at: string
          event_type: string
          flow_id: string | null
          id: string
          metadata: Json | null
          workspace_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          event_type: string
          flow_id?: string | null
          id?: string
          metadata?: Json | null
          workspace_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          event_type?: string
          flow_id?: string | null
          id?: string
          metadata?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string
          workspace_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type: string
          workspace_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_recipients: {
        Row: {
          broadcast_id: string
          channel_id: string
          contact_id: string
          error_message: string | null
          id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          broadcast_id: string
          channel_id: string
          contact_id: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          broadcast_id?: string
          channel_id?: string
          contact_id?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_recipients_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_recipients_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          created_at: string
          delivered: number
          failed: number
          id: string
          message_content: Json
          name: string
          scheduled_for: string | null
          segment_filter: Json | null
          sent: number
          status: string
          total_recipients: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          delivered?: number
          failed?: number
          id?: string
          message_content?: Json
          name: string
          scheduled_for?: string | null
          segment_filter?: Json | null
          sent?: number
          status?: string
          total_recipients?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          delivered?: number
          failed?: number
          id?: string
          message_content?: Json
          name?: string
          scheduled_for?: string | null
          segment_filter?: Json | null
          sent?: number
          status?: string
          total_recipients?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          comment_rules: Json | null
          connected_at: string
          created_at: string
          disconnected_at: string | null
          display_name: string | null
          id: string
          is_active: boolean
          last_comment_cursor: string | null
          late_account_id: string
          metadata: Json | null
          platform: string
          profile_picture: string | null
          status: string
          updated_at: string
          username: string | null
          webhook_id: string | null
          webhook_secret: string | null
          workspace_id: string
          zernio_account_id: string | null
        }
        Insert: {
          comment_rules?: Json | null
          connected_at?: string
          created_at?: string
          disconnected_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean
          last_comment_cursor?: string | null
          late_account_id: string
          metadata?: Json | null
          platform: string
          profile_picture?: string | null
          status?: string
          updated_at?: string
          username?: string | null
          webhook_id?: string | null
          webhook_secret?: string | null
          workspace_id: string
          zernio_account_id?: string | null
        }
        Update: {
          comment_rules?: Json | null
          connected_at?: string
          created_at?: string
          disconnected_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean
          last_comment_cursor?: string | null
          late_account_id?: string
          metadata?: Json | null
          platform?: string
          profile_picture?: string | null
          status?: string
          updated_at?: string
          username?: string | null
          webhook_id?: string | null
          webhook_secret?: string | null
          workspace_id?: string
          zernio_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channels_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_logs: {
        Row: {
          author_id: string | null
          author_name: string | null
          author_username: string | null
          channel_id: string
          comment_text: string
          created_at: string
          dm_sent: boolean
          error: string | null
          id: string
          matched_trigger_id: string | null
          platform_comment_id: string
          post_id: string | null
          reply_sent: boolean
          workspace_id: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          author_username?: string | null
          channel_id: string
          comment_text: string
          created_at?: string
          dm_sent?: boolean
          error?: string | null
          id?: string
          matched_trigger_id?: string | null
          platform_comment_id: string
          post_id?: string | null
          reply_sent?: boolean
          workspace_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          author_username?: string | null
          channel_id?: string
          comment_text?: string
          created_at?: string
          dm_sent?: boolean
          error?: string | null
          id?: string
          matched_trigger_id?: string | null
          platform_comment_id?: string
          post_id?: string | null
          reply_sent?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_logs_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_logs_matched_trigger_id_fkey"
            columns: ["matched_trigger_id"]
            isOneToOne: false
            referencedRelation: "triggers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_channels: {
        Row: {
          channel_id: string
          contact_id: string
          created_at: string
          id: string
          platform_sender_id: string
          platform_username: string | null
        }
        Insert: {
          channel_id: string
          contact_id: string
          created_at?: string
          id?: string
          platform_sender_id: string
          platform_username?: string | null
        }
        Update: {
          channel_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          platform_sender_id?: string
          platform_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_channels_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_channels_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_custom_fields: {
        Row: {
          contact_id: string
          field_id: string
          updated_at: string
          value: string
        }
        Insert: {
          contact_id: string
          field_id: string
          updated_at?: string
          value: string
        }
        Update: {
          contact_id?: string
          field_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_custom_fields_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_custom_fields_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_notes: {
        Row: {
          author_name: string | null
          contact_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          author_name?: string | null
          contact_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          author_name?: string | null
          contact_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_notes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          contact_id: string
          created_at: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_subscribed: boolean
          last_interaction_at: string | null
          lead_stage: string
          metadata: Json | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_subscribed?: boolean
          last_interaction_at?: string | null
          lead_stage?: string
          metadata?: Json | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_subscribed?: boolean
          last_interaction_at?: string | null
          lead_stage?: string
          metadata?: Json | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_to: string | null
          channel_id: string
          contact_id: string
          created_at: string
          id: string
          is_automation_paused: boolean
          is_muted: boolean
          last_message_at: string | null
          last_message_preview: string | null
          late_conversation_id: string | null
          platform: string
          status: string
          unread_count: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          channel_id: string
          contact_id: string
          created_at?: string
          id?: string
          is_automation_paused?: boolean
          is_muted?: boolean
          last_message_at?: string | null
          last_message_preview?: string | null
          late_conversation_id?: string | null
          platform: string
          status?: string
          unread_count?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          channel_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          is_automation_paused?: boolean
          is_muted?: boolean
          last_message_at?: string | null
          last_message_preview?: string | null
          late_conversation_id?: string | null
          platform?: string
          status?: string
          unread_count?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          type: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          type?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          request_id: string | null
          severity: string
          source: string
          stack_trace: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          request_id?: string | null
          severity?: string
          source: string
          stack_trace?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          request_id?: string | null
          severity?: string
          source?: string
          stack_trace?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          key: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_sessions: {
        Row: {
          channel_id: string
          contact_id: string
          created_at: string
          current_node_id: string | null
          flow_id: string
          flow_stack: Json
          human_takeover_at: string | null
          id: string
          status: string
          updated_at: string
          variables: Json
          waiting_for_input: boolean
          waiting_until: string | null
        }
        Insert: {
          channel_id: string
          contact_id: string
          created_at?: string
          current_node_id?: string | null
          flow_id: string
          flow_stack?: Json
          human_takeover_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          variables?: Json
          waiting_for_input?: boolean
          waiting_until?: string | null
        }
        Update: {
          channel_id?: string
          contact_id?: string
          created_at?: string
          current_node_id?: string | null
          flow_id?: string
          flow_stack?: Json
          human_takeover_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          variables?: Json
          waiting_for_input?: boolean
          waiting_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_sessions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_sessions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_sessions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_versions: {
        Row: {
          created_at: string
          edges: Json
          flow_id: string
          id: string
          name: string
          nodes: Json
          published_by: string | null
          version: number
          viewport: Json | null
        }
        Insert: {
          created_at?: string
          edges: Json
          flow_id: string
          id?: string
          name: string
          nodes: Json
          published_by?: string | null
          version: number
          viewport?: Json | null
        }
        Update: {
          created_at?: string
          edges?: Json
          flow_id?: string
          id?: string
          name?: string
          nodes?: Json
          published_by?: string | null
          version?: number
          viewport?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_versions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flows: {
        Row: {
          created_at: string
          description: string | null
          edges: Json
          id: string
          name: string
          nodes: Json
          published_at: string | null
          status: string
          updated_at: string
          version: number
          viewport: Json | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          name: string
          nodes?: Json
          published_at?: string | null
          status?: string
          updated_at?: string
          version?: number
          viewport?: Json | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          name?: string
          nodes?: Json
          published_at?: string | null
          status?: string
          updated_at?: string
          version?: number
          viewport?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flows_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          callback_data: string | null
          conversation_id: string
          created_at: string
          direction: string
          id: string
          is_internal: boolean
          platform_message_id: string | null
          postback_payload: string | null
          quick_reply_payload: string | null
          sent_by_flow_id: string | null
          sent_by_node_id: string | null
          sent_by_user_id: string | null
          status: string
          delivery_status: string | null
          text: string | null
          workspace_id: string | null
        }
        Insert: {
          attachments?: Json | null
          callback_data?: string | null
          conversation_id: string
          created_at?: string
          direction: string
          id?: string
          is_internal?: boolean
          platform_message_id?: string | null
          postback_payload?: string | null
          quick_reply_payload?: string | null
          sent_by_flow_id?: string | null
          sent_by_node_id?: string | null
          sent_by_user_id?: string | null
          status?: string
          delivery_status?: string | null
          text?: string | null
          workspace_id?: string | null
        }
        Update: {
          attachments?: Json | null
          callback_data?: string | null
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          is_internal?: boolean
          platform_message_id?: string | null
          postback_payload?: string | null
          quick_reply_payload?: string | null
          sent_by_flow_id?: string | null
          sent_by_node_id?: string | null
          sent_by_user_id?: string | null
          status?: string
          delivery_status?: string | null
          text?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sent_by_flow_id_fkey"
            columns: ["sent_by_flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          global_rate_limit_per_minute: number
          is_maintenance_mode: boolean
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          global_rate_limit_per_minute?: number
          is_maintenance_mode?: boolean
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          global_rate_limit_per_minute?: number
          is_maintenance_mode?: boolean
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          platform_role: string
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          platform_role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          platform_role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_state: {
        Row: {
          id: string
          key: string
          last_refill_at: string
          tokens: number
        }
        Insert: {
          id?: string
          key: string
          last_refill_at?: string
          tokens: number
        }
        Update: {
          id?: string
          key?: string
          last_refill_at?: string
          tokens?: number
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          limit_count: number
          updated_at: string
          window_seconds: number
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          limit_count?: number
          updated_at?: string
          window_seconds?: number
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          limit_count?: number
          updated_at?: string
          window_seconds?: number
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_limits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_jobs: {
        Row: {
          attempts: number
          claimed_at: string | null
          created_at: string
          id: string
          last_error: string | null
          payload: Json
          run_at: string
          status: string
          type: string
        }
        Insert: {
          attempts?: number
          claimed_at?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          payload?: Json
          run_at: string
          status?: string
          type: string
        }
        Update: {
          attempts?: number
          claimed_at?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          payload?: Json
          run_at?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      sequence_enrollments: {
        Row: {
          channel_id: string
          completed_at: string | null
          contact_id: string
          current_step_index: number
          enrolled_at: string | null
          id: string
          next_step_at: string | null
          sequence_id: string
          status: string
        }
        Insert: {
          channel_id: string
          completed_at?: string | null
          contact_id: string
          current_step_index?: number
          enrolled_at?: string | null
          id?: string
          next_step_at?: string | null
          sequence_id: string
          status?: string
        }
        Update: {
          channel_id?: string
          completed_at?: string | null
          contact_id?: string
          current_step_index?: number
          enrolled_at?: string | null
          id?: string
          next_step_at?: string | null
          sequence_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_enrollments_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_enrollments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: string
          steps: Json
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          steps?: Json
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          steps?: Json
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequences_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_snapshots: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      triggers: {
        Row: {
          channel_id: string | null
          config: Json
          created_at: string
          flow_id: string
          id: string
          is_active: boolean
          priority: number
          type: string
        }
        Insert: {
          channel_id?: string | null
          config?: Json
          created_at?: string
          flow_id: string
          id?: string
          is_active?: boolean
          priority?: number
          type: string
        }
        Update: {
          channel_id?: string | null
          config?: Json
          created_at?: string
          flow_id?: string
          id?: string
          is_active?: boolean
          priority?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "triggers_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triggers_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          event_id: string
          received_at: string
        }
        Insert: {
          event_id: string
          received_at?: string
        }
        Update: {
          event_id?: string
          received_at?: string
        }
        Relationships: []
      }
      workspace_invites: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          role: string
          status: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          role?: string
          status?: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          role?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          ai_api_key: string | null
          ai_provider: string
          created_at: string
          global_keywords: Json | null
          id: string
          late_api_key_encrypted: string | null
          limits: Json | null
          name: string
          owner_id: string | null
          plan: string
          slug: string
          status: string
          subscription_status: string
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string
          webhook_secret: string | null
          zernio_profile_id: string | null
        }
        Insert: {
          ai_api_key?: string | null
          ai_provider?: string
          created_at?: string
          global_keywords?: Json | null
          id?: string
          late_api_key_encrypted?: string | null
          limits?: Json | null
          name: string
          owner_id?: string | null
          plan?: string
          slug: string
          status?: string
          subscription_status?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          webhook_secret?: string | null
          zernio_profile_id?: string | null
        }
        Update: {
          ai_api_key?: string | null
          ai_provider?: string
          created_at?: string
          global_keywords?: Json | null
          id?: string
          late_api_key_encrypted?: string | null
          limits?: Json | null
          name?: string
          owner_id?: string | null
          plan?: string
          slug?: string
          status?: string
          subscription_status?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          webhook_secret?: string | null
          zernio_profile_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_rate_limit_token: {
        Args: { limit_key: string; max_tokens: number; refill_rate: number }
        Returns: boolean
      }
      get_workspace_role: {
        Args: { uid?: string; ws_id: string }
        Returns: string
      }
      get_workspace_unread_counts: { Args: { ws_id: string }; Returns: Json }
      get_workspace_usage: { Args: { ws_id: string }; Returns: Json }
      has_workspace_role: {
        Args: { min_role: string; uid?: string; ws_id: string }
        Returns: boolean
      }
      increment_broadcast_failed: { Args: { b_id: string }; Returns: undefined }
      increment_broadcast_sent: { Args: { b_id: string }; Returns: undefined }
      increment_unread: {
        Args: { conv_id: string; preview: string }
        Returns: undefined
      }
      is_super_admin: { Args: { uid?: string }; Returns: boolean }
      is_workspace_member: { Args: { ws_id: string }; Returns: boolean }
      search_workspace_contacts: {
        Args: {
          max_limit?: number
          req_is_subscribed?: boolean
          row_offset?: number
          search_query?: string
          tag_name?: string
          ws_id: string
        }
        Returns: {
          contact_id: string
          total_count: number
        }[]
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


// --- Custom Additions ---
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled';
export type Platform = 'whatsapp' | 'telegram' | 'messenger' | 'instagram' | 'twitter' | 'facebook' | 'reddit' | 'bluesky';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type PlatformRole = 'admin' | 'user';
export type SequenceStep = { type: 'message'; content: string } | { type: 'delay'; delayMinutes: number };
export type SequenceStatus = 'draft' | 'active' | 'paused';
export type FlowStatus = 'draft' | 'published' | 'archived';
export type NodeType = 'trigger' | 'message' | 'condition' | 'action' | 'addTag' | 'removeTag' | 'setCustomField' | 'httpRequest' | 'goToFlow' | 'subscribe' | 'unsubscribe' | 'humanTakeover' | 'abSplit' | 'smartDelay' | 'enrollSequence' | string;
export type TriggerType = 'keyword' | 'postback' | 'quick_reply' | 'welcome' | 'default' | 'comment_keyword';
export type ConversationStatus = 'open' | 'closed' | 'snoozed';
