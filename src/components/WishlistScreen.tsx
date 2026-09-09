import { Product } from '../types';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistScreenProps {
  wishlistProducts: Product[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onRemoveFromWishlist: (p: Product) => void;
  onExplore: () => void;
}

export const WishlistScreen = ({
  wishlistProducts,
  onSelectProduct,
  onAddToCart,
  onRemoveFromWishlist,
  onExplore,
}: WishlistScreenProps) => {
  if (wishlistProducts.length === 0) {
    return (
      <div id="wishlist-empty-screen" className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
          <Heart className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Tu lista de deseos está vacía</h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Guarda tus artículos favoritos pulsando el icono del corazón en cualquier producto para encontrarlos fácilmente.
          </p>
        </div>
        <button
          id="wishlist-empty-explore-btn"
          onClick={onExplore}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <span>Descubrir Artículos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div id="wishlist-screen" className="max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Artículos Guardados
          </h1>
          <p className="text-xs text-zinc-500">
            {wishlistProducts.length} producto{wishlistProducts.length !== 1 ? 's' : ''} en tu lista de deseos
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {wishlistProducts.map((product) => (
          <div
            key={product.id}
            id={`wishlist-item-${product.id}`}
            className="group relative bg-white rounded-xl sm:rounded-2xl border border-zinc-200 overflow-hidden flex flex-col hover:border-zinc-300 hover:shadow-xs transition-all"
          >
            {/* Direct Image Link Container */}
            <div
              onClick={() => onSelectProduct(product)}
              className="relative aspect-square w-full bg-zinc-100 cursor-pointer overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                id={`wishlist-remove-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromWishlist(product);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-zinc-400 hover:text-rose-600 transition-colors shadow-xs"
                title="Quitar de la lista"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Info and Actions */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {product.brand}
                </span>
                <h4
                  onClick={() => onSelectProduct(product)}
                  className="text-xs sm:text-sm font-semibold text-zinc-900 line-clamp-1 hover:text-zinc-600 cursor-pointer mt-0.5"
                >
                  {product.name}
                </h4>
                <div className="mt-1 text-sm font-bold text-zinc-900">
                  {product.price.toFixed(2)}€
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 mt-3 flex items-center gap-2">
                <button
                  id={`wishlist-add-cart-${product.id}`}
                  onClick={() => onAddToCart(product)}
                  className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Añadir a la cesta</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
