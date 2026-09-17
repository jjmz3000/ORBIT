import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Order } from '../types';
import type { Address } from '../types/database.types';
import {
  X,
  CheckCircle2,
  CreditCard,
  Shield,
  Truck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Mail,
  MessageCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  sendOrderEmailNotification,
  openWhatsAppNotification,
  buildWhatsAppOrderMessage,
} from '../services/notifications.service';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  defaultAddress?: Address;
  userEmail?: string;
  onSubmitOrder: (address: Address) => Promise<Order>;
  onViewOrders: () => void;
}

const EMPTY_ADDRESS: Address = {
  fullName: '',
  street: '',
  city: '',
  postalCode: '',
  phone: '',
  email: '',
};

export const CheckoutModal = ({
  isOpen,
  onClose,
  subtotal,
  discount,
  shipping,
  total,
  defaultAddress,
  userEmail,
  onSubmitOrder,
  onViewOrders,
}: CheckoutModalProps) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [address, setAddress] = useState<Address>(() => ({
    ...EMPTY_ADDRESS,
    ...(defaultAddress ?? {}),
    email: defaultAddress?.email || userEmail || '',
  }));
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bizum' | 'paypal'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notificaciones de Resend y WhatsApp
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'simulated' | 'error'>('idle');
  const [emailStatusMessage, setEmailStatusMessage] = useState<string>('');

  // Reset the form each time the modal is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setCreatedOrder(null);
      setError(null);
      setEmailStatus('idle');
      setEmailStatusMessage('');
      setAddress({
        ...EMPTY_ADDRESS,
        ...(defaultAddress ?? {}),
        email: defaultAddress?.email || userEmail || '',
      });
    }
  }, [isOpen, defaultAddress, userEmail]);

  if (!isOpen) return null;

  const updateField = (field: keyof Address) => (e: ChangeEvent<HTMLInputElement>) =>
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.street || !address.city || !address.postalCode || !address.phone) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Crear el pedido en Supabase
      const order = await onSubmitOrder(address);
      setCreatedOrder(order);
      setStep('success');

      // 2. Despachar correo automáticamente a través de Resend
      const customerEmail = address.email || userEmail;
      if (customerEmail) {
        setEmailStatus('sending');
        sendOrderEmailNotification(order, customerEmail)
          .then((res) => {
            if (res.simulated) {
              setEmailStatus('simulated');
              setEmailStatusMessage(res.message || 'Confirmación simulada (requiere RESEND_API_KEY).');
            } else if (res.success) {
              setEmailStatus('sent');
              setEmailStatusMessage(`Enviado con éxito a ${customerEmail}`);
            } else {
              setEmailStatus('error');
              setEmailStatusMessage(res.error || 'No se pudo enviar el email con Resend.');
            }
          })
          .catch(() => {
            setEmailStatus('error');
            setEmailStatusMessage('Error en la conexión con el servidor de correo.');
          });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualEmailRetry = async () => {
    if (!createdOrder) return;
    const targetEmail = address.email || userEmail;
    if (!targetEmail) return;

    setEmailStatus('sending');
    const res = await sendOrderEmailNotification(createdOrder, targetEmail);
    if (res.simulated) {
      setEmailStatus('simulated');
      setEmailStatusMessage(res.message || 'Confirmación simulada (requiere RESEND_API_KEY).');
    } else if (res.success) {
      setEmailStatus('sent');
      setEmailStatusMessage(`Enviado con éxito a ${targetEmail}`);
    } else {
      setEmailStatus('error');
      setEmailStatusMessage(res.error || 'Error al reenviar.');
    }
  };

  return (
    <div
      id="checkout-modal-overlay"
      className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="checkout-modal-card"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
              O
            </div>
            <h3 className="font-bold text-zinc-900 text-sm sm:text-base">
              {step === 'form' ? 'Finalizar Pedido' : '¡Pedido Confirmado!'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {step === 'form' ? (
          <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-5">
            {/* Delivery address */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600">
                <Truck className="w-3.5 h-3.5" />
                <span>Datos de Envío & Notificaciones</span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={address.fullName}
                    onChange={updateField('fullName')}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs px-3 py-2 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-zinc-500" />
                      <span>Email (para Resend)</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={address.email || ''}
                      onChange={updateField('email')}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs px-3 py-2 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>Teléfono / WhatsApp</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+34 600 000 000"
                      value={address.phone}
                      onChange={updateField('phone')}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs px-3 py-2 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                    Dirección y piso / puerta
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Calle Gran Vía 42, 3ºB"
                    value={address.street}
                    onChange={updateField('street')}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs px-3 py-2 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Madrid"
                      value={address.city}
                      onChange={updateField('city')}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs px-3 py-2 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="28013"
                      value={address.postalCode}
                      onChange={updateField('postalCode')}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs px-3 py-2 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Método de Pago</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'card'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-800'
                  }`}
                >
                  <span className="text-xs font-semibold">Tarjeta</span>
                  <span className={`text-[10px] ${paymentMethod === 'card' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    Crédito / Débito
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bizum')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'bizum'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-800'
                  }`}
                >
                  <span className="text-xs font-semibold">Bizum</span>
                  <span className={`text-[10px] ${paymentMethod === 'bizum' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    Pago móvil
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-800'
                  }`}
                >
                  <span className="text-xs font-semibold">PayPal</span>
                  <span className={`text-[10px] ${paymentMethod === 'paypal' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    Cuenta segura
                  </span>
                </button>
              </div>
            </div>

            {/* Price Summary Banner */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500">Total a pagar:</span>
                <div className="text-base font-bold text-zinc-900">{total.toFixed(2)}€</div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-600 font-semibold block">Envío garantizado</span>
                <span className="text-[10px] text-zinc-400">Protección del comprador</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Procesando pago seguro...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Confirmar y Pagar {total.toFixed(2)}€</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Confirmation / Success Screen with Resend & WhatsApp */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3" />
                Pago procesado correctamente
              </span>
              <h2 className="text-xl font-bold text-zinc-900">¡Gracias por tu compra!</h2>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Tu pedido ha sido registrado en Supabase.
              </p>
            </div>

            {/* Resend Email Status Badge */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-800">
                  <Mail className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Confirmación por Correo (Resend):</span>
                </div>
                {emailStatus === 'sending' && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Enviando...
                  </span>
                )}
                {emailStatus === 'sent' && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                    ✓ Enviado vía Resend
                  </span>
                )}
                {emailStatus === 'simulated' && (
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 font-medium">
                    Modo Local
                  </span>
                )}
                {emailStatus === 'error' && (
                  <button
                    type="button"
                    onClick={handleManualEmailRetry}
                    className="text-[10px] text-rose-700 underline font-medium hover:text-rose-900"
                  >
                    Reintentar envío
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 truncate">
                {emailStatusMessage || `Destinatario: ${address.email || userEmail || 'No especificado'}`}
              </p>
            </div>

            {/* Order info receipt */}
            {createdOrder && (
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-left space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-zinc-900 pb-2 border-b border-zinc-200">
                  <span>Número de pedido:</span>
                  <span className="font-mono text-zinc-700">{createdOrder.id}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Código de seguimiento:</span>
                  <span className="font-mono font-medium">{createdOrder.trackingCode}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Entrega estimada:</span>
                  <span className="font-medium text-emerald-600">{createdOrder.estimatedDelivery}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Dirección:</span>
                  <span className="truncate max-w-[200px]">{createdOrder.shippingAddress.street}</span>
                </div>
              </div>
            )}

            {/* Actions: WhatsApp + View Orders */}
            <div className="flex flex-col gap-2 pt-2">
              {createdOrder && (
                <button
                  id="btn-whatsapp-order"
                  type="button"
                  onClick={() => openWhatsAppNotification(createdOrder)}
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-transparent" />
                  <span>Enviar / Recibir en WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              )}

              <button
                id="btn-view-order-tracking"
                onClick={() => {
                  onClose();
                  onViewOrders();
                }}
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Ver Seguimiento en Mis Pedidos</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 px-4 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Volver a la tienda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
