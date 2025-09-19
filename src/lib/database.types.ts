export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      biolink_pages: {
        Row: {
          id: string
          user_id: string
          slug: string
          title: string
          description: string | null
          theme_color: string
          font_family: string
          is_public: boolean
          seo_title: string | null
          seo_description: string | null
          og_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          title: string
          description?: string | null
          theme_color?: string
          font_family?: string
          is_public?: boolean
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          title?: string
          description?: string | null
          theme_color?: string
          font_family?: string
          is_public?: boolean
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          page_id: string
          user_id: string
          block_type: string
          display_order: number
          properties: Record<string, any>
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          user_id: string
          block_type: string
          display_order: number
          properties: Record<string, any>
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          user_id?: string
          block_type?: string
          display_order?: number
          properties?: Record<string, any>
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shortlinks: {
        Row: {
          id: string
          user_id: string
          slug: string
          target_url: string
          title: string | null
          description: string | null
          is_active: boolean
          password: string | null
          expires_at: string | null
          click_limit: number | null
          click_count: number
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          device_targeting: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          target_url: string
          title?: string | null
          description?: string | null
          is_active?: boolean
          password?: string | null
          expires_at?: string | null
          click_limit?: number | null
          click_count?: number
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          device_targeting?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          target_url?: string
          title?: string | null
          description?: string | null
          is_active?: boolean
          password?: string | null
          expires_at?: string | null
          click_limit?: number | null
          click_count?: number
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          device_targeting?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          link_id: string | null
          page_id: string | null
          event_type: string
          timestamp: string
          referrer: string | null
          user_agent: string | null
          ip_address: string | null
          country_code: string | null
          city: string | null
          device_type: string | null
          browser: string | null
          os: string | null
          created_at: string
        }
        Insert: {
          id?: string
          link_id?: string | null
          page_id?: string | null
          event_type: string
          timestamp?: string
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          country_code?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          link_id?: string | null
          page_id?: string | null
          event_type?: string
          timestamp?: string
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          country_code?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          created_at?: string
        }
      }
      directory_items: {
        Row: {
          id: string
          user_id: string
          page_id: string | null
          link_id: string | null
          title: string
          description: string | null
          url: string
          category: string | null
          tags: string[] | null
          click_count: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          page_id?: string | null
          link_id?: string | null
          title: string
          description?: string | null
          url: string
          category?: string | null
          tags?: string[] | null
          click_count?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          page_id?: string | null
          link_id?: string | null
          title?: string
          description?: string | null
          url?: string
          category?: string | null
          tags?: string[] | null
          click_count?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}