import { ScreenType } from '../types';
import { Home, Heart, ShoppingBag, User, LucideIcon } from 'lucide-react';

interface BottomTabBarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  cartCount: number;
  wishlistCount: number;
}

export const BottomTabBar = ({
  currentScreen,
  onSelectScreen,
  cartCount,
  wishlistCount,
}: BottomTabBarProps) => {
  const tabs: { id: ScreenType; label: string; icon: LucideIcon }[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'wishlist', label: 'Deseados', icon: Heart },
    { id: 'cart', label: 'Cesta', icon: ShoppingBag },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav
      id="bottom-tab-bar"
      aria-label="Navegación principal de pantallas"
      className="shrink-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-3 py-2 z-30"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id || (tab.id === 'home' && currentScreen === 'product_detail');
          const badgeCount = tab.id === 'cart' ? cartCount : tab.id === 'wishlist' ? wishlistCount : 0;

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => onSelectScreen(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-zinc-900 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-600 font-normal'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {badgeCount > 0 && (
                  <span
                    id={`tab-badge-${tab.id}`}
                    className="absolute -top-1.5 -right-2.5 bg-zinc-900 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-zinc-900 rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
