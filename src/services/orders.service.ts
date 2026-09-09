import { supabase } from '../lib/supabase';
import { toOrder } from './mappers';
import type { Order } from '../types';
import type { Address } from '../types/database.types';

export async function getOrders(): Promise<Order[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (orders ?? []).map((row: any) => toOrder(row, row.order_items));
}

/** Valida el carrito, recalcula precios en el servidor y crea el pedido. */
export async function createOrder(shippingAddress: Address, promoCode?: string): Promise<Order> {
  const { data: order, error } = await supabase.rpc('create_order', {
    p_shipping_address: shippingAddress,
    p_promo_code: promoCode || null,
  });
  if (error) throw error;

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);
  if (itemsError) throw itemsError;

  return toOrder(order, items ?? []);
}

/** Devuelve el % de descuento de un código, o 0 si no es válido. */
export async function validatePromoCode(code: string): Promise<number> {
  const { data, error } = await supabase.rpc('validate_promo_code', { p_code: code });
  if (error) throw error;
  return data ?? 0;
}
