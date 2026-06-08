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
      uploads: {
        Row: {
          id: string
          source: string
          file_name: string | null
          status: string
          row_count: number
          mapped_required_fields: number
          completion_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          file_name?: string | null
          status?: string
          row_count?: number
          mapped_required_fields?: number
          completion_rate?: number
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["uploads"]["Insert"]>
      }
      upload_rows: {
        Row: {
          id: string
          upload_id: string
          row_number: number
          product_name: string
          category: string
          supplier_name: string
          selling_location: string
          unit_cost: number | null
          selling_price: number | null
          units_sold: number | null
          stock_units: number | null
          created_at: string
        }
        Insert: {
          id?: string
          upload_id: string
          row_number: number
          product_name: string
          category: string
          supplier_name: string
          selling_location: string
          unit_cost?: number | null
          selling_price?: number | null
          units_sold?: number | null
          stock_units?: number | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["upload_rows"]["Insert"]>
      }
      validation_issues: {
        Row: {
          id: string
          upload_id: string
          row_number: number | null
          field_key: string | null
          severity: "error" | "warning"
          code: string
          message: string
          recommendation: string
          created_at: string
        }
        Insert: {
          id?: string
          upload_id: string
          row_number?: number | null
          field_key?: string | null
          severity: "error" | "warning"
          code: string
          message: string
          recommendation: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["validation_issues"]["Insert"]>
      }
      product_scores: {
        Row: {
          id: string
          upload_id: string
          product_name: string
          category: string
          supplier_name: string
          location: string
          unit_cost: number
          selling_price: number
          units_sold: number
          stock_units: number
          margin_percent: number
          revenue: number
          profit: number
          score: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          upload_id: string
          product_name: string
          category: string
          supplier_name: string
          location: string
          unit_cost: number
          selling_price: number
          units_sold: number
          stock_units: number
          margin_percent: number
          revenue: number
          profit: number
          score: number
          status: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["product_scores"]["Insert"]>
      }
      supplier_scores: {
        Row: {
          id: string
          upload_id: string
          supplier_name: string
          products_supplied: number
          average_unit_cost: number
          average_margin_percent: number
          lead_time_days: number
          reliability_rate: number
          score: number
          impact: string
          created_at: string
        }
        Insert: {
          id?: string
          upload_id: string
          supplier_name: string
          products_supplied: number
          average_unit_cost: number
          average_margin_percent: number
          lead_time_days: number
          reliability_rate: number
          score: number
          impact: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["supplier_scores"]["Insert"]>
      }
      category_scores: {
        Row: {
          id: string
          upload_id: string
          category: string
          revenue: number
          margin_percent: number
          health_score: number
          created_at: string
        }
        Insert: {
          id?: string
          upload_id: string
          category: string
          revenue: number
          margin_percent: number
          health_score: number
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["category_scores"]["Insert"]>
      }
      business_reports: {
        Row: {
          id: string
          upload_id: string
          health_score: number
          previous_health_score: number
          delta: number
          average_margin_percent: number
          data_quality_score: number
          improving_factors: Json
          harming_factors: Json
          increase_actions: Json
          avoid_actions: Json
          created_at: string
        }
        Insert: {
          id?: string
          upload_id: string
          health_score: number
          previous_health_score: number
          delta: number
          average_margin_percent: number
          data_quality_score: number
          improving_factors: Json
          harming_factors: Json
          increase_actions: Json
          avoid_actions: Json
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["business_reports"]["Insert"]>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
