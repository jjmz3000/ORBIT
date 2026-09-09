import { ScreenType } from '../types';
import { Smartphone, Monitor, ShoppingBag, Heart, Search, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  onBackToHome?: () => void;
  cartCount: number;
  wishlistCount: number;
  isMobileFrame: boolean;
  onToggleMobileFrame: (val: boolean) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar = ({
  currentScreen,
  onSelectScreen,
  onBackToHome,
  cartCount,
  wishlistCount,
  isMobileFrame,
  onToggleMobileFrame,
  searchQuery,
  onSearchChange,
}: NavbarProps) => {
  const isDetail = currentScreen === 'product_detail';

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left Side: Brand / Back Button */}
        <div className="flex items-center gap-3">
          {isDetail ? (
            <button
              id="header-back-btn"
              onClick={onBackToHome}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 px-2 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </button>
          ) : (
            <button
              id="header-logo-btn"
              onClick={() => onSelectScreen('home')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm tracking-widest shadow-xs">
                A
              </div>
              <div>
                <span className="font-semibold tracking-tight text-zinc-900 text-base group-hover:text-zinc-700 transition-colors">
                  AURA
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block leading-tight">
                  Design & Store
                </span>
              </div>
            </button>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-6 border-l border-zinc-200 pl-6">
            <button
              id="nav-link-home"
              onClick={() => onSelectScreen('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentScreen === 'home' || currentScreen === 'product_detail'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              Explorar
            </button>
            <button
              id="nav-link-wishlist"
              onClick={() => onSelectScreen('wishlist')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentScreen === 'wishlist'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              Favoritos
            </button>
            <button
              id="nav-link-cart"
              onClick={() => onSelectScreen('cart')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentScreen === 'cart'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              Cesta
            </button>
            <button
              id="nav-link-profile"
              onClick={() => onSelectScreen('profile')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentScreen === 'profile'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              Mis Pedidos
            </button>
          </nav>
        </div>

        {/* Center: Search input for desktop */}
        <div className="hidden lg:flex flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="desktop-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar productos, marcas..."
              className="w-full bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white text-zinc-900 text-sm pl-9 pr-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Right Side: View Switcher (Mobile Mockup vs Full) + Icons */}
        <div className="flex items-center gap-2">
          {/* Frame Toggle */}
          <div
            id="view-mode-toggle"
            className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs font-medium"
            title="Cambiar entre vista móvil y vista escritorio completa"
          >
            <button
              id="btn-mobile-view"
              onClick={() => onToggleMobileFrame(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                isMobileFrame
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Móvil</span>
            </button>
            <button
              id="btn-desktop-view"
              onClick={() => onToggleMobileFrame(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                !isMobileFrame
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Expandido</span>
            </button>
          </div>

          {/* Wishlist Button */}
          <button
            id="btn-nav-wishlist"
            onClick={() => onSelectScreen('wishlist')}
            className="relative p-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Ver lista de deseos"
          >
            <Heart className={`w-5 h-5 ${currentScreen === 'wishlist' ? 'fill-zinc-900 text-zinc-900' : ''}`} />
            {wishlistCount > 0 && (
              <span
                id="wishlist-badge"
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center border border-white"
              >
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            id="btn-nav-cart"
            onClick={() => onSelectScreen('cart')}
            className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-xs"
            aria-label="Ver carrito de compras"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Cesta</span>
            {cartCount > 0 && (
              <span
                id="cart-badge-count"
                className="bg-white text-zinc-900 text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-none"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
