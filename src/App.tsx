import { useState, useEffect, useCallback } from 'react';
import { ScreenType, Product, CartItem, Order, ToastNotification } from './types';
import type { Address } from './types/database.types';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { HomeScreen } from './components/HomeScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { CartScreen } from './components/CartScreen';
import { WishlistScreen } from './components/WishlistScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { CheckoutModal } from './components/CheckoutModal';
import { ToastContainer } from './components/Toast';
import { AuthScreen } from './components/AuthScreen';
import { Wifi, Battery, Signal, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { getProducts } from './services/products.service';
import * as cartService from './services/cart.service';
import * as wishlistService from './services/wishlist.service';
import * as ordersService from './services/orders.service';
import { signOut, getProfile } from './services/auth.service';
import type { Database } from './types/database.types';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  // Screen and Product Navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Server-backed data
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(0);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Clock for mobile status bar
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const showToast = useCallback(
    (title: string, message: string, type: ToastNotification['type'] = 'success') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load user-scoped data once authenticated; reset it on sign-out.
  useEffect(() => {
    if (!user) {
      setCart([]);
      setWishlistIds(new Set());
      setOrders([]);
      setProfile(null);
      setSelectedProduct(null);
      setCurrentScreen('home');
      return;
    }

    let cancelled = false;
    setDataLoading(true);

    Promise.all([
      getProducts(),
      cartService.getCart(),
      wishlistService.getWishlistProductIds(),
      ordersService.getOrders(),
      getProfile(user.id),
    ])
      .then(([productsData, cartData, wishlistData, ordersData, profileData]) => {
        if (cancelled) return;
        setProducts(productsData);
        setCart(cartData);
        setWishlistIds(wishlistData);
        setOrders(ordersData);
        setProfile(profileData);
      })
      .catch((err) => {
        if (!cancelled) {
          showToast('Error al cargar datos', err instanceof Error ? err.message : 'Inténtalo de nuevo.', 'error');
        }
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, showToast]);

  // Cart operations
  const handleAddToCart = async (
    product: Product,
    selectedColor: { name: string; hex: string } = product.colors[0],
    selectedSize?: string,
    quantity: number = 1
  ) => {
    try {
      await cartService.addToCart(product.id, selectedColor, selectedSize, quantity);
      setCart(await cartService.getCart());
      showToast('Añadido a la cesta', `${product.name} (${quantity} ud.)`);
    } catch (err) {
      showToast('No se pudo añadir', err instanceof Error ? err.message : 'Inténtalo de nuevo.', 'error');
    }
  };

  const handleBuyNow = async (
    product: Product,
    selectedColor: { name: string; hex: string } = product.colors[0],
    selectedSize?: string,
    quantity: number = 1
  ) => {
    await handleAddToCart(product, selectedColor, selectedSize, quantity);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty <= 0) return handleRemoveCartItem(itemId);

    const previous = cart;
    setCart((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item)));
    try {
      await cartService.updateCartItemQuantity(itemId, newQty);
    } catch (err) {
      setCart(previous);
      showToast('No se pudo actualizar', err instanceof Error ? err.message : 'Inténtalo de nuevo.', 'error');
    }
  };

  const handleRemoveCartItem = async (itemId: string) => {
    const previous = cart;
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Artículo eliminado', 'Se ha retirado de tu cesta.', 'info');
    try {
      await cartService.removeCartItem(itemId);
    } catch (err) {
      setCart(previous);
      showToast('No se pudo eliminar', err instanceof Error ? err.message : 'Inténtalo de nuevo.', 'error');
    }
  };

  const handleClearCart = async () => {
    const previous = cart;
    setCart([]);
    try {
      await cartService.clearCart();
    } catch (err) {
      setCart(previous);
      showToast('No se pudo vaciar la cesta', err instanceof Error ? err.message : 'Inténtalo de nuevo.', 'error');
    }
  };

  // Wishlist operations
  const handleToggleWishlist = async (product: Product) => {
    const wasWishlisted = wishlistIds.has(product.id);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      wasWishlisted ? next.delete(product.id) : next.add(product.id);
      return next;
    });
    showToast(
      wasWishlisted ? 'Eliminado de deseados' : 'Guardado en deseados',
      product.name,
      wasWishlisted ? 'info' : 'success'
    );

    try {
      if (wasWishlisted) {
        await wishlistService.removeFromWishlist(product.id);
      } else {
        await wishlistService.addToWishlist(product.id);
      }
    } catch (err) {
      setWishlistIds((prev) => {
        const next = new Set(prev);
        wasWishlisted ? next.add(product.id) : next.delete(product.id);
        return next;
      });
      showToast('No se pudo actualizar', err instanceof Error ? err.message : 'Inténtalo de nuevo.', 'error');
    }
  };

  // Promo code (validated server-side)
  const handleApplyPromoCode = async (code: string): Promise<boolean> => {
    try {
      const discountPercent = await ordersService.validatePromoCode(code);
      if (discountPercent > 0) {
        setPromoCode(code.toUpperCase());
        setPromoDiscountPercent(discountPercent);
        showToast('¡Cupón aplicado!', `${discountPercent}% de descuento en tu compra`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode('');
    setPromoDiscountPercent(0);
    showToast('Cupón retirado', 'Se ha restablecido el importe estándar.', 'info');
  };

  // Checkout: server recalculates prices/stock and creates the order atomically.
  const handleSubmitOrder = async (address: Address): Promise<Order> => {
    const order = await ordersService.createOrder(address, promoCode || undefined);
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setPromoCode('');
    setPromoDiscountPercent(0);
    return order;
  };

  const handleSignOut = async () => {
    setIsCheckoutOpen(false);
    await signOut();
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProductById = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) handleSelectProduct(found);
  };

  // Cart total calculations (display only — the server recomputes authoritative
  // totals in create_order at checkout time).
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = promoDiscountPercent > 0 ? (subtotal * promoDiscountPercent) / 100 : 0;
  const isFreeShipping = subtotal >= 60.0 || (cart.length > 0 && cart.every((c) => c.product.freeShipping));
  const shippingCost = isFreeShipping || cart.length === 0 ? 0 : 4.95;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  // Filter products for wishlist
  const wishlistProducts = products.filter((p) => wishlistIds.has(p.id));

  // Related products
  const relatedProducts = selectedProduct
    ? products.filter((p) => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.isTrending))
    : [];

  // Screen content renderer
  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            products={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        );
      case 'product_detail':
        return selectedProduct ? (
          <ProductDetailScreen
            product={selectedProduct}
            onBack={() => setCurrentScreen('home')}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlistIds.has(selectedProduct.id)}
            relatedProducts={relatedProducts}
            onSelectProduct={handleSelectProduct}
          />
        ) : null;
      case 'cart':
        return (
          <CartScreen
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onProceedToCheckout={() => setIsCheckoutOpen(true)}
            onContinueShopping={() => setCurrentScreen('home')}
            promoCode={promoCode}
            promoDiscountPercent={promoDiscountPercent}
            onApplyPromoCode={handleApplyPromoCode}
            onRemovePromoCode={handleRemovePromoCode}
          />
        );
      case 'wishlist':
        return (
          <WishlistScreen
            wishlistProducts={wishlistProducts}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={handleToggleWishlist}
            onExplore={() => setCurrentScreen('home')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            orders={orders}
            onSelectProductById={handleSelectProductById}
            onShowToast={showToast}
            userEmail={user?.email ?? ''}
            userName={profile?.full_name || user?.user_metadata?.full_name || 'Usuario'}
            onSignOut={handleSignOut}
          />
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-100/70 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans antialiased selection:bg-zinc-900 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Main Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        onBackToHome={() => setCurrentScreen('home')}
        cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.size}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={setIsMobileFrame}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Screen Selector Banner / Quick Switcher */}
      <div className="bg-white border-b border-zinc-200/80 px-4 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
              Pantallas de la App:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                id="screen-tab-home"
                onClick={() => setCurrentScreen('home')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentScreen === 'home'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                1. Catálogo / Inicio
              </button>

              <button
                id="screen-tab-detail"
                onClick={() => {
                  if (products[0]) setSelectedProduct(products[0]);
                  setCurrentScreen('product_detail');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentScreen === 'product_detail'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                2. Detalle de Producto
              </button>

              <button
                id="screen-tab-cart"
                onClick={() => setCurrentScreen('cart')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all relative ${
                  currentScreen === 'cart'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                3. Cesta & Pedido
                {cart.length > 0 && (
                  <span className="ml-1 px-1 bg-zinc-700 text-white text-[10px] rounded-full">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>

              <button
                id="screen-tab-wishlist"
                onClick={() => setCurrentScreen('wishlist')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentScreen === 'wishlist'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                4. Lista de Deseos
              </button>

              <button
                id="screen-tab-profile"
                onClick={() => setCurrentScreen('profile')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentScreen === 'profile'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                5. Perfil & Mis Envíos
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-zinc-400 text-[11px]">
            <span>Enlace directo a imágenes HTML activo</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Device Frame vs Full Responsive */}
      <main className="flex-1 flex items-start justify-center p-2 sm:p-4 md:p-6 overflow-x-hidden">
        {isMobileFrame ? (
          /* Smartphone Device Mockup Container */
          <div className="w-full max-w-[420px] mx-auto my-2">
            {/* Phone Outer Chassis */}
            <div
              id="mobile-phone-chassis"
              className="relative bg-zinc-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-zinc-800/80 border-4 border-zinc-800"
            >
              {/* Phone Inner Screen */}
              <div className="relative bg-zinc-50 rounded-[34px] overflow-hidden flex flex-col h-[780px] shadow-inner">
                {/* Status Bar */}
                <div
                  id="mobile-status-bar"
                  className="bg-white px-6 pt-3 pb-1 flex items-center justify-between text-zinc-800 select-none z-30 shrink-0"
                >
                  <span className="text-xs font-semibold tracking-tight">{currentTime}</span>
                  {/* Dynamic Island / Notch */}
                  <div className="w-24 h-4 bg-zinc-900 rounded-full mx-auto" />
                  <div className="flex items-center gap-1.5 text-zinc-700">
                    <Signal className="w-3.5 h-3.5 stroke-[2]" />
                    <Wifi className="w-3.5 h-3.5 stroke-[2]" />
                    <Battery className="w-4 h-4 stroke-[2]" />
                  </div>
                </div>

                {/* Scrollable Screen Content */}
                <div
                  id="mobile-screen-scroll-container"
                  className="flex-1 overflow-y-auto overscroll-contain bg-zinc-50"
                >
                  {dataLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                    </div>
                  ) : (
                    renderScreenContent()
                  )}
                </div>

                {/* Bottom Navigation Tab Bar */}
                <BottomTabBar
                  currentScreen={currentScreen}
                  onSelectScreen={setCurrentScreen}
                  cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
                  wishlistCount={wishlistIds.size}
                />

                {/* Home Indicator bar */}
                <div className="bg-white pb-1.5 pt-0.5 flex justify-center shrink-0">
                  <div className="w-32 h-1 bg-zinc-300 rounded-full" />
                </div>
              </div>
            </div>

            {/* Hint below phone chassis */}
            <p className="text-center text-xs text-zinc-400 mt-3 font-medium">
              Interactúa con la pantalla táctil o pulsa los botones superiores para cambiar de pantalla.
            </p>
          </div>
        ) : (
          /* Full Width Responsive View */
          <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl border border-zinc-200 shadow-xs min-h-[750px] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto py-6">
              {dataLoading ? (
                <div className="h-full flex items-center justify-center py-24">
                  <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                </div>
              ) : (
                renderScreenContent()
              )}
            </div>
          </div>
        )}
      </main>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={subtotal}
        discount={discountAmount}
        shipping={shippingCost}
        total={total}
        defaultAddress={profile?.default_address ?? undefined}
        onSubmitOrder={handleSubmitOrder}
        onViewOrders={() => {
          setIsCheckoutOpen(false);
          setCurrentScreen('profile');
        }}
      />
    </div>
  );
}
