export type ScreenType = 'home' | 'product_detail' | 'cart' | 'wishlist' | 'profile';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'moda' | 'calzado' | 'tecnologia' | 'accesorios' | 'hogar';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes?: string[];
  description: string;
  specs: { label: string; value: string }[];
  stock: number;
  isNew?: boolean;
  isTrending?: boolean;
  freeShipping?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedColor: { name: string; hex: string };
  selectedSize?: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  colorName: string;
  size?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'confirmado' | 'en_preparacion' | 'en_camino' | 'entregado';
  statusText: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  trackingCode: string;
  estimatedDelivery: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    phone: string;
    email?: string;
  };
}

export interface FilterOptions {
  category: string;
  searchQuery: string;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'rating';
  onlyOffers: boolean;
  onlyFreeShipping: boolean;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}
