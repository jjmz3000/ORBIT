import { supabase } from '../lib/supabase';
import { toCartItem } from './mappers';
import type { CartItem } from '../types';

const CART_SELECT = '*, products(*)';

export async function getCart(): Promise<CartItem[]> {
  const { data, error } = await supabase.from('cart_items').select(CART_SELECT);
  if (error) throw error;
  return (data ?? []).map((row: any) => toCartItem(row));
}

export async function addToCart(
  productId: string,
  selectedColor: { name: string; hex: string },
  selectedSize: string | undefined,
  quantity: number
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('Se requiere autenticación');

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('product_id', productId)
    .eq('selected_size', selectedSize ?? '')
    .filter('selected_color->>name', 'eq', selectedColor.name)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('cart_items').insert({
    user_id: userId,
    product_id: productId,
    selected_color: selectedColor,
    selected_size: selectedSize,
    quantity,
  });
  if (error) throw error;
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<void> {
  if (quantity <= 0) return removeCartItem(cartItemId);
  const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
  if (error) throw error;
}

export async function removeCartItem(cartItemId: string): Promise<void> {
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
  if (error) throw error;
}

export async function clearCart(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) throw error;
}
