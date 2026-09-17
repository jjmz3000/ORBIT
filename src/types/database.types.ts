// Tipos de la base de datos Supabase.
//
// Este archivo está escrito a mano para reflejar supabase/migrations/*.sql.
// En cuanto el proyecto exista en Supabase, regenéralo con la fuente de verdad real:
//   npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface ColorOption {
  name: string;
  hex: string;
}

export interface SpecEntry {
  label: string;
  value: string;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  email?: string;
}

export type OrderStatus = 'confirmado' | 'en_preparacion' | 'en_camino' | 'entregado';

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; icon: string };
        Insert: { id: string; name: string; icon: string };
        Update: Partial<{ id: string; name: string; icon: string }>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          brand: string;
          category_id: string;
          price: number;
          original_price: number | null;
          rating: number;
          reviews_count: number;
          image: string;
          images: string[];
          colors: ColorOption[];
          sizes: string[] | null;
          description: string;
          specs: SpecEntry[];
          stock: number;
          is_new: boolean;
          is_trending: boolean;
          free_shipping: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']> &
          Pick<Database['public']['Tables']['products']['Row'], 'slug' | 'name' | 'brand' | 'category_id' | 'price' | 'image'>;
        Update: Partial<Database['public']['Tables']['products']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          default_address: Address | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          selected_color: ColorOption;
          selected_size: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['cart_items']['Row']> &
          Pick<Database['public']['Tables']['cart_items']['Row'], 'product_id' | 'selected_color'>;
        Update: Partial<Database['public']['Tables']['cart_items']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'cart_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      wishlist_items: {
        Row: { user_id: string; product_id: string; created_at: string };
        Insert: { user_id?: string; product_id: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['wishlist_items']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'wishlist_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      promo_codes: {
        Row: { code: string; discount_percent: number; active: boolean; expires_at: string | null };
        Insert: { code: string; discount_percent: number; active?: boolean; expires_at?: string | null };
        Update: Partial<Database['public']['Tables']['promo_codes']['Row']>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: OrderStatus;
          subtotal: number;
          discount: number;
          shipping: number;
          total: number;
          promo_code: string | null;
          tracking_code: string | null;
          estimated_delivery: string | null;
          shipping_address: Address;
          created_at: string;
        };
        // Los pedidos solo se crean vía la RPC create_order (security definer),
        // por eso Insert/Update replican Row en vez de exponer un `never`: la
        // API de postgrest-js exige que sean objetos, y la restricción real de
        // "no insert/update directo" ya la impone la ausencia de policies RLS
        // de insert/update en la tabla (ver migración init_schema.sql).
        Insert: Database['public']['Tables']['orders']['Row'];
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_image: string;
          price: number;
          quantity: number;
          color_name: string;
          size: string | null;
        };
        Insert: Database['public']['Tables']['order_items']['Row'];
        Update: Partial<Database['public']['Tables']['order_items']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      order_notifications: {
        Row: {
          id: string;
          order_id: string;
          channel: 'email' | 'whatsapp';
          recipient: string;
          status: 'pending' | 'sent' | 'failed';
          provider_id: string | null;
          payload: Json | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          channel: 'email' | 'whatsapp';
          recipient: string;
          status?: 'pending' | 'sent' | 'failed';
          provider_id?: string | null;
          payload?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          order_id: string;
          channel: 'email' | 'whatsapp';
          recipient: string;
          status: 'pending' | 'sent' | 'failed';
          provider_id: string | null;
          payload: Json | null;
          error_message: string | null;
          created_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: 'order_notifications_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_order: {
        Args: { p_shipping_address: Address; p_promo_code?: string | null };
        Returns: Database['public']['Tables']['orders']['Row'];
      };
      validate_promo_code: {
        Args: { p_code: string };
        Returns: number;
      };
    };
  };
}
