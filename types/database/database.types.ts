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
          end_time: string
          status: string
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hut_number: string
          customer_id?: string | null
          start_time?: string
          end_time: string
          status?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hut_number?: string
          customer_id?: string | null
          start_time?: string
          end_time?: string
          status?: string
          total_amount?: number
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
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          stock?: number
          is_active?: boolean
          thumbnail?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          stock?: number
          is_active?: boolean
          thumbnail?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          full_name: string
          phone: string
          role: string
          tenant_id: string
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          role?: string
          tenant_id: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          role?: string
          tenant_id?: string
        }
      }
      payments: {
        Row: {
          id: string
          session_id: string
          amount: number
          method: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          amount: number
          method: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          amount?: number
          method?: string
          created_at?: string
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
