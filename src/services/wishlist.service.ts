import { supabase } from '../lib/supabase';

export async function getWishlistProductIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from('wishlist_items').select('product_id');
  if (error) throw error;
  return new Set(data.map((row) => row.product_id));
}

export async function addToWishlist(productId: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('Se requiere autenticación');

  const { error } = await supabase.from('wishlist_items').insert({ user_id: userId, product_id: productId });
  if (error) throw error;
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const { error } = await supabase.from('wishlist_items').delete().eq('product_id', productId);
  if (error) throw error;
}
