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
        }
        // ... more tables
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
