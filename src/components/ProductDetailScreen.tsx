import { useState } from 'react';
import { Product } from '../types';
import {
  ArrowLeft,
  Heart,
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Zap,
} from 'lucide-react';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, selectedColor: { name: string; hex: string }, selectedSize?: string, quantity?: number) => void;
  onBuyNow: (product: Product, selectedColor: { name: string; hex: string }, selectedSize?: string, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  relatedProducts: Product[];
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailScreen = ({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  relatedProducts,
  onSelectProduct,
}: ProductDetailScreenProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImage = images[selectedImageIndex] || product.image;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    onBuyNow(product, selectedColor, selectedSize, quantity);
  };

  return (
    <div id="product-detail-screen" className="pb-24 max-w-5xl mx-auto px-4 sm:px-6 pt-2 space-y-8">
      {/* Top Breadcrumb / Nav */}
      <div className="flex items-center justify-between">
        <button
          id="detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo</span>
        </button>

        <button
          id="detail-wishlist-toggle"
          onClick={() => onToggleWishlist(product)}
          className="p-2 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:text-rose-600 hover:border-rose-200 shadow-xs transition-colors"
          aria-label={isWishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Main Detail Grid: Images left, Info right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Gallery Section */}
        <div className="space-y-4">
          {/* Main Photo with direct link */}
          <div className="relative aspect-square w-full bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 shadow-xs">
            <img
              id="detail-main-image"
              src={activeImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                Ahorra {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  id={`detail-thumb-${idx}`}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-zinc-900 shadow-xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} vista ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information & Purchase options */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                {product.brand}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-xs text-emerald-600 font-medium">En stock ({product.stock} disponibles)</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-200 fill-zinc-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-800">{product.rating}</span>
              <span className="text-xs text-zinc-400">({product.reviewsCount} opiniones verificadas)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              {product.price.toFixed(2)}€
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-zinc-400 line-through">
                {product.originalPrice.toFixed(2)}€
              </span>
            )}
            <span className="text-xs text-zinc-500 font-medium ml-auto">
              IVA incluido
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 leading-relaxed">
            {product.description}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                <span>Color seleccionado:</span>
                <span className="text-zinc-900 font-bold">{selectedColor.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((color) => {
                  const isColorSelected = selectedColor.name === color.name;
                  return (
                    <button
                      key={color.name}
                      id={`color-btn-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                        isColorSelected ? 'border-zinc-900 ring-2 ring-zinc-900/20 scale-105' : 'border-zinc-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isColorSelected && (
                        <Check className={`w-4 h-4 ${color.hex === '#f8fafc' || color.hex === '#fafaf9' || color.hex === '#f5f5f4' ? 'text-zinc-900' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                <span>Talla / Dimensión:</span>
                <span className="text-zinc-500 text-[11px]">Guía de tallas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isSizeSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      id={`size-btn-${size}`}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isSizeSelected
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center border border-zinc-200 rounded-xl bg-white p-1">
                <button
                  id="qty-decrement-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg text-zinc-600 hover:bg-zinc-100 flex items-center justify-center font-bold text-sm transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  -
                </button>
                <span id="qty-display" className="w-10 text-center text-sm font-bold text-zinc-900">
                  {quantity}
                </span>
                <button
                  id="qty-increment-btn"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-lg text-zinc-600 hover:bg-zinc-100 flex items-center justify-center font-bold text-sm transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Añadido a la cesta!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Añadir a la Cesta • {(product.price * quantity).toFixed(2)}€</span>
                  </>
                )}
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              id="buy-now-btn"
              onClick={handleBuyNow}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>Comprar Ahora con 1 Clic</span>
            </button>
          </div>

          {/* Guarantees / Trust Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-200 text-center">
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col items-center">
              <Truck className="w-4 h-4 text-zinc-700 mb-1" />
              <span className="text-[11px] font-semibold text-zinc-800 leading-tight">Envío Exprés</span>
              <span className="text-[10px] text-zinc-500">24-48 horas</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col items-center">
              <RotateCcw className="w-4 h-4 text-zinc-700 mb-1" />
              <span className="text-[11px] font-semibold text-zinc-800 leading-tight">30 Días</span>
              <span className="text-[10px] text-zinc-500">Devolución gratis</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-zinc-700 mb-1" />
              <span className="text-[11px] font-semibold text-zinc-800 leading-tight">Garantía Oficial</span>
              <span className="text-[10px] text-zinc-500">2 años de cobertura</span>
            </div>
          </div>

          {/* Technical Specifications */}
          {product.specs && product.specs.length > 0 && (
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <h3 className="text-sm font-bold text-zinc-900">Especificaciones clave</h3>
              <div className="divide-y divide-zinc-100 text-xs">
                {product.specs.map((spec, i) => (
                  <div key={i} className="py-2 flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">{spec.label}</span>
                    <span className="text-zinc-900 font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section id="related-products-section" className="pt-8 border-t border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-zinc-900">Artículos recomendados</h3>
            <span className="text-xs text-zinc-400">Basado en tus preferencias</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((rel) => (
              <div
                key={rel.id}
                id={`rel-product-${rel.id}`}
                onClick={() => onSelectProduct(rel)}
                className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer flex flex-col"
              >
                <div className="aspect-square bg-zinc-100 overflow-hidden">
                  <img
                    src={rel.image}
                    alt={rel.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">{rel.brand}</span>
                    <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1 group-hover:text-zinc-600">
                      {rel.name}
                    </h4>
                  </div>
                  <div className="mt-2 text-xs font-bold text-zinc-900">
                    {rel.price.toFixed(2)}€
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
