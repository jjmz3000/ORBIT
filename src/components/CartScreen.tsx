import { useState, FormEvent } from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag, ArrowLeft } from 'lucide-react';

interface CartScreenProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
  promoCode: string;
  promoDiscountPercent: number;
  onApplyPromoCode: (code: string) => Promise<boolean>;
  onRemovePromoCode: () => void;
}

export const CartScreen = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
  promoCode,
  promoDiscountPercent,
  onApplyPromoCode,
  onRemovePromoCode,
}: CartScreenProps) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 60.0;

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = promoDiscountPercent > 0 ? (subtotal * promoDiscountPercent) / 100 : 0;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || cart.every((c) => c.product.freeShipping);
  const shippingCost = isFreeShipping || cart.length === 0 ? 0 : 4.95;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const success = await onApplyPromoCode(couponInput.trim().toUpperCase());
      if (success) {
        setCouponInput('');
        setCouponError('');
      } else {
        setCouponError('Código no válido. Prueba con PROMO10 o BIENVENIDA20');
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div id="cart-empty-screen" className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Tu cesta está vacía</h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Añade productos de alta calidad para comenzar tu pedido con entrega rápida.
          </p>
        </div>
        <button
          id="cart-empty-explore-btn"
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <span>Explorar Artículos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div id="cart-screen" className="max-w-4xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Cesta de la compra
          </h1>
          <p className="text-xs text-zinc-500">
            {cart.reduce((acc, i) => acc + i.quantity, 0)} artículo{cart.length !== 1 ? 's' : ''} en tu pedido
          </p>
        </div>
        <button
          id="cart-continue-link"
          onClick={onContinueShopping}
          className="text-xs text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Seguir comprando</span>
        </button>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-800">
            {isFreeShipping
              ? '🎉 ¡Enhorabuena! Tienes envío estándar GRATIS'
              : `Añade ${amountNeededForFreeShipping.toFixed(2)}€ más para envío GRATIS`}
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">{freeShippingProgress}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Layout Grid: Items left, Summary right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              id={`cart-item-${item.id}`}
              className="p-3.5 bg-white rounded-xl border border-zinc-200 flex gap-3.5 sm:gap-4 items-center shadow-xs"
            >
              {/* Product Direct Image Thumbnail */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-100 rounded-lg overflow-hidden shrink-0 border border-zinc-100">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {item.product.brand}
                </span>
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                  {item.product.name}
                </h4>

                {/* Selected Options (Color & Size) */}
                <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-zinc-300 inline-block"
                      style={{ backgroundColor: item.selectedColor.hex }}
                    />
                    <span>{item.selectedColor.name}</span>
                  </div>
                  {item.selectedSize && (
                    <>
                      <span>•</span>
                      <span>Talla {item.selectedSize}</span>
                    </>
                  )}
                </div>

                {/* Price and Quantity Controls */}
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-sm font-bold text-zinc-900">
                    {(item.product.price * item.quantity).toFixed(2)}€
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 p-0.5">
                      <button
                        id={`cart-decrement-${item.id}`}
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md text-zinc-600 hover:bg-white flex items-center justify-center transition-colors"
                        aria-label="Restar una unidad"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-zinc-800">
                        {item.quantity}
                      </span>
                      <button
                        id={`cart-increment-${item.id}`}
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md text-zinc-600 hover:bg-white flex items-center justify-center transition-colors"
                        aria-label="Añadir una unidad"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      id={`cart-remove-${item.id}`}
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Eliminar artículo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Checkout (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              Resumen del Pedido
            </h3>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal productos</span>
                <span className="font-semibold text-zinc-900">{subtotal.toFixed(2)}€</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Descuento ({promoDiscountPercent}%)</span>
                  </span>
                  <span>-{discountAmount.toFixed(2)}€</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600">
                <span>Gastos de envío</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 font-semibold">Gratis</span>
                  ) : (
                    `${shippingCost.toFixed(2)}€`
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex justify-between text-base font-bold text-zinc-900">
                <span>Total a pagar</span>
                <span className="text-lg text-zinc-900 tracking-tight">{total.toFixed(2)}€</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2 border-t border-zinc-100">
              {promoCode ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cupón {promoCode} aplicado</span>
                  </div>
                  <button
                    onClick={onRemovePromoCode}
                    className="text-[11px] text-rose-600 hover:underline font-medium"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                      }}
                      placeholder="Código (ej: PROMO10)"
                      className="flex-1 bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon}
                      className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 pt-0.5">{couponError}</p>
                  )}
                </form>
              )}
            </div>

            {/* Checkout CTA Button */}
            <button
              id="proceed-checkout-btn"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <span>Tramitar Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Security Guarantee Badge */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pago 100% seguro y encriptado SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
