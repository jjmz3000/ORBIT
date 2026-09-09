import { useState, useMemo } from 'react';
import { Product, FilterOptions } from '../types';
import { CATEGORIES } from '../data/products';
import { Search, Star, Heart, ShoppingBag, SlidersHorizontal, ArrowRight, Tag, Truck } from 'lucide-react';

interface HomeScreenProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: Set<string>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const HomeScreen = ({
  products,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  searchQuery,
  onSearchChange,
}: HomeScreenProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('popular');
  const [onlyOffers, setOnlyOffers] = useState<boolean>(false);
  const [onlyFreeShipping, setOnlyFreeShipping] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'todos' && p.category !== selectedCategory) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchDesc) return false;
        }
        // Offers filter
        if (onlyOffers && (!p.originalPrice || p.originalPrice <= p.price)) {
          return false;
        }
        // Free shipping filter
        if (onlyFreeShipping && !p.freeShipping) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // default popular
        return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) || b.reviewsCount - a.reviewsCount;
      });
  }, [products, selectedCategory, searchQuery, onlyOffers, onlyFreeShipping, sortBy]);

  return (
    <div id="home-screen" className="pb-16 space-y-6">
      {/* Search Input for Mobile View / Primary bar */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="mobile-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar entre productos seleccionados..."
            className="w-full bg-white text-zinc-900 text-sm pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all placeholder:text-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner with Direct Image Link */}
      {!searchQuery && selectedCategory === 'todos' && (
        <section id="hero-banner" className="px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900 text-white min-h-[220px] sm:min-h-[260px] flex flex-col justify-end p-6 sm:p-8">
            {/* Direct Image Background */}
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
              alt="Colección y estilo"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 transition-transform duration-700 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent" />

            <div className="relative z-10 max-w-lg space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-medium tracking-wide uppercase text-zinc-200 border border-white/15">
                <Tag className="w-3 h-3 text-amber-300" />
                <span>Colección Selecta 2026</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Diseño puro, funcionalidad excepcional.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-md leading-relaxed">
                Descubre artículos destacados en tecnología, calzado y accesorios con envío prioritario y garantía oficial.
              </p>
              <div className="pt-2">
                <button
                  id="hero-explore-btn"
                  onClick={() => {
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 bg-white text-zinc-900 hover:bg-zinc-100 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95"
                >
                  <span>Explorar colección</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Horizontal Carousel */}
      <section id="categories-section" className="px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Categorías
          </h3>
          <span className="text-xs text-zinc-400 font-medium">
            {CATEGORIES.length} secciones
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Catalog Header & Filters Bar */}
      <section id="catalog-section" className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
          <div>
            <h3 className="text-base font-bold text-zinc-900 tracking-tight">
              {selectedCategory === 'todos'
                ? 'Todos los Artículos'
                : CATEGORIES.find((c) => c.id === selectedCategory)?.name}
            </h3>
            <p className="text-xs text-zinc-500">
              Mostrando {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filter Toggles & Sort */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="toggle-filter-btn"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showFilters || onlyOffers || onlyFreeShipping
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {(onlyOffers || onlyFreeShipping) && (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              )}
            </button>

            {/* Sort Select */}
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as FilterOptions['sortBy'])}
              className="bg-white border border-zinc-200 text-zinc-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium cursor-pointer"
            >
              <option value="popular">Más populares</option>
              <option value="rating">Mejor valorados</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
          </div>
        </div>

        {/* Expandable Filter Chips */}
        {showFilters && (
          <div
            id="filters-drawer"
            className="pt-3 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1"
          >
            <button
              id="filter-offers-btn"
              onClick={() => setOnlyOffers(!onlyOffers)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                onlyOffers
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 border border-zinc-200'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>Solo en oferta</span>
            </button>

            <button
              id="filter-freeship-btn"
              onClick={() => setOnlyFreeShipping(!onlyFreeShipping)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                onlyFreeShipping
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 border border-zinc-200'
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>Envío gratis</span>
            </button>

            {(onlyOffers || onlyFreeShipping) && (
              <button
                id="filter-clear-btn"
                onClick={() => {
                  setOnlyOffers(false);
                  setOnlyFreeShipping(false);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-800 underline ml-1"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </section>

      {/* Product Grid */}
      <section id="products-grid-section" className="px-4 sm:px-6">
        {filteredProducts.length === 0 ? (
          <div
            id="empty-results-state"
            className="text-center py-16 px-4 bg-white rounded-2xl border border-zinc-200"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-zinc-900">No encontramos productos</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              No hay artículos que coincidan con los criterios seleccionados. Prueba a borrar la búsqueda o desactivar los filtros.
            </p>
            <button
              id="empty-reset-filters-btn"
              onClick={() => {
                setSelectedCategory('todos');
                onSearchChange('');
                setOnlyOffers(false);
                setOnlyFreeShipping(false);
              }}
              className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              Restablecer todo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => {
              const isFav = wishlistIds.has(product.id);
              const discountPercent =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-zinc-200 overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Image Container with Direct Link */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="relative w-full aspect-square bg-zinc-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Badges Overlay */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
                      {discountPercent > 0 && (
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          -{discountPercent}%
                        </span>
                      )}
                      {product.isNew && (
                        <span className="bg-zinc-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                          Nuevo
                        </span>
                      )}
                    </div>

                    {/* Wishlist Toggle Button */}
                    <button
                      id={`fav-btn-${product.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-zinc-600 hover:text-rose-600 hover:scale-110 active:scale-95 shadow-xs transition-all z-20"
                      aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFav ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Brand & Category */}
                      <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400 uppercase tracking-wider mb-1">
                        <span className="font-semibold text-zinc-500 truncate">{product.brand}</span>
                        {product.freeShipping && (
                          <span className="text-[10px] text-emerald-600 font-medium normal-case flex items-center gap-0.5">
                            <Truck className="w-2.5 h-2.5" />
                            Gratis
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        onClick={() => onSelectProduct(product)}
                        className="text-xs sm:text-sm font-semibold text-zinc-900 line-clamp-2 hover:text-zinc-600 cursor-pointer leading-snug tracking-tight mb-1.5"
                      >
                        {product.name}
                      </h4>

                      {/* Rating */}
                      <div className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-zinc-800 text-[11px]">{product.rating}</span>
                        <span className="text-[10px] text-zinc-400">({product.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2 mt-auto">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">
                            {product.price.toFixed(2)}€
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[11px] text-zinc-400 line-through">
                              {product.originalPrice.toFixed(2)}€
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        id={`quick-add-btn-${product.id}`}
                        onClick={() => onAddToCart(product)}
                        className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-900 text-zinc-800 hover:text-white transition-all text-xs font-semibold flex items-center gap-1 active:scale-95 shrink-0"
                        title="Añadir a la cesta"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Añadir</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
