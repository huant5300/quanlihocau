export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          hut_number: string
          customer_id: string | null
          start_time: string
          end_time: string | null
          status: string
          total_amount: number
          tenant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hut_number: string
          customer_id?: string | null
          start_time?: string
          end_time?: string | null
          status?: string
          total_amount?: number
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hut_number?: string
          customer_id?: string | null
          start_time?: string
          end_time?: string | null
          status?: string
          total_amount?: number
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          stock: number
          is_active: boolean
          thumbnail: string | null
          tenant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          stock?: number
          is_active?: boolean
          thumbnail?: string | null
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          stock?: number
          is_active?: boolean
          thumbnail?: string | null
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          full_name: string
          phone: string
          role: string
          tenant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string
          role?: string
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          role?: string
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          session_id: string
          amount: number
          method: string
          tenant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          amount: number
          method: string
          tenant_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          amount?: number
          method?: string
          tenant_id?: string
          created_at?: string
        }
      }
      dashboard_stats: {
        Row: {
          id: string
          total_revenue: number
          active_sessions_count: number
          total_customers: number
          inventory_alerts_count: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          id: string
          total_revenue?: number
          active_sessions_count?: number
          total_customers?: number
          inventory_alerts_count?: number
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          id?: string
          total_revenue?: number
          active_sessions_count?: number
          total_customers?: number
          inventory_alerts_count?: number
          tenant_id?: string
          updated_at?: string
        }
      }
    }
    Views: {
      monthly_revenue_stats: {
        Row: {
          tenant_id: string
          month: string
          revenue: number
          payment_count: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
