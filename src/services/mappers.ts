import type { Product, CartItem, Order } from '../types';
import type { Database } from '../types/database.types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type CartItemRow = Database['public']['Tables']['cart_items']['Row'] & { products: ProductRow };
type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category_id as Product['category'],
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    image: row.image,
    images: row.images,
    colors: row.colors,
    sizes: row.sizes ?? undefined,
    description: row.description,
    specs: row.specs,
    stock: row.stock,
    isNew: row.is_new,
    isTrending: row.is_trending,
    freeShipping: row.free_shipping,
  };
}

export function toCartItem(row: CartItemRow): CartItem {
  return {
    id: row.id,
    product: toProduct(row.products),
    selectedColor: row.selected_color,
    selectedSize: row.selected_size ?? undefined,
    quantity: row.quantity,
  };
}

export function toOrder(order: OrderRow, items: OrderItemRow[]): Order {
  const statusText: Record<OrderRow['status'], string> = {
    confirmado: 'Pedido confirmado',
    en_preparacion: 'En preparación',
    en_camino: 'En camino con mensajería',
    entregado: 'Entregado en domicilio',
  };

  return {
    id: order.order_number,
    date: new Date(order.created_at).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: order.status,
    statusText: statusText[order.status],
    items: items.map((item) => ({
      productId: item.product_id ?? '',
      productName: item.product_name,
      productImage: item.product_image,
      price: item.price,
      quantity: item.quantity,
      colorName: item.color_name,
      size: item.size ?? undefined,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    trackingCode: order.tracking_code ?? '',
    estimatedDelivery: order.estimated_delivery ?? '',
    shippingAddress: order.shipping_address,
  };
}
