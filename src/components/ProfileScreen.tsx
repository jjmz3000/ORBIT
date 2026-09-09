import { useState } from 'react';
import { Order } from '../types';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  CreditCard,
  Download,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface ProfileScreenProps {
  orders: Order[];
  onSelectProductById: (productId: string) => void;
  onShowToast: (title: string, msg: string) => void;
  userEmail: string;
  userName: string;
  onSignOut: () => void;
}

export const ProfileScreen = ({
  orders,
  onSelectProductById,
  onShowToast,
  userEmail,
  userName,
  onSignOut,
}: ProfileScreenProps) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'account'>('orders');

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'confirmado':
        return 1;
      case 'en_preparacion':
        return 2;
      case 'en_camino':
        return 3;
      case 'entregado':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div id="profile-screen" className="max-w-4xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* User Info Header Card */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-lg font-bold shrink-0">
            {userName.trim().charAt(0).toUpperCase() || 'U'}
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">{userName}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{userEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <button
            id="profile-manage-btn"
            onClick={() => onShowToast('Perfil actualizado', 'Tus preferencias de cuenta están sincronizadas.')}
            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Editar perfil
          </button>
          <button
            id="profile-signout-btn"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-200 gap-6">
        <button
          id="profile-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'orders' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mis Pedidos & Envíos ({orders.length})</span>
          {activeTab === 'orders' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
          )}
        </button>

        <button
          id="profile-tab-account"
          onClick={() => setActiveTab('account')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'account' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Direcciones y Ajustes</span>
          {activeTab === 'account' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab: Orders Tracking */}
      {activeTab === 'orders' ? (
        <div className="space-y-5">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200 p-6">
              <Package className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-800">Aún no tienes pedidos registrados</p>
              <p className="text-xs text-zinc-500 mt-1">Realiza una compra desde el catálogo para ver aquí el seguimiento en vivo.</p>
            </div>
          ) : (
            orders.map((order) => {
              const currentStep = getStatusStep(order.status);
              const isDelivered = order.status === 'entregado';

              return (
                <div
                  key={order.id}
                  id={`order-card-${order.id}`}
                  className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs space-y-4 p-4 sm:p-6"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900">{order.id}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-xs text-zinc-500">{order.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-medium text-zinc-600">Seguimiento:</span>
                        <span className="font-mono text-xs font-semibold text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded">
                          {order.trackingCode}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:text-right">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isDelivered ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span>{order.statusText}</span>
                      </span>
                    </div>
                  </div>

                  {/* Delivery Timeline Tracker */}
                  <div className="py-2">
                    <div className="relative flex items-center justify-between max-w-lg mx-auto">
                      {/* Line connector */}
                      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-zinc-100 -z-0">
                        <div
                          className="h-full bg-zinc-900 transition-all duration-500"
                          style={{
                            width:
                              currentStep === 1
                                ? '15%'
                                : currentStep === 2
                                ? '45%'
                                : currentStep === 3
                                ? '75%'
                                : '100%',
                          }}
                        />
                      </div>

                      {/* Step 1 */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep >= 1
                              ? 'bg-zinc-900 text-white'
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-600">Confirmado</span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep >= 2
                              ? 'bg-zinc-900 text-white'
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}
                        >
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-600">Preparación</span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep >= 3
                              ? 'bg-zinc-900 text-white'
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}
                        >
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-600">En reparto</span>
                      </div>

                      {/* Step 4 */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep >= 4
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-600">Entregado</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    <span className="text-xs font-semibold text-zinc-500 block">Artículos comprados:</span>
                    <div className="divide-y divide-zinc-50">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => onSelectProductById(item.productId)}
                          className="py-2 flex items-center justify-between gap-3 hover:bg-zinc-50/50 p-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover bg-zinc-100 border border-zinc-100"
                            />
                            <div>
                              <h5 className="text-xs font-semibold text-zinc-900 hover:underline">
                                {item.productName}
                              </h5>
                              <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                                <span>Color: {item.colorName}</span>
                                {item.size && <span>• Talla: {item.size}</span>}
                                <span>• Cantidad: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-zinc-900">
                            {(item.price * item.quantity).toFixed(2)}€
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-zinc-100 text-xs">
                    <div className="text-zinc-600">
                      <span>Destino: </span>
                      <span className="font-medium text-zinc-800">
                        {order.shippingAddress.street}, {order.shippingAddress.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          onShowToast(
                            'Descargando factura...',
                            `Factura electrónica para el pedido ${order.id} generada.`
                          )
                        }
                        className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 font-medium"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Factura</span>
                      </button>
                      <span className="font-bold text-sm text-zinc-900">
                        Total: {order.total.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Tab: Account Settings */
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-700" />
              <span>Direcciones de Envío Habituales</span>
            </h3>
            <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex items-start justify-between">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase bg-zinc-900 text-white px-2 py-0.5 rounded-sm mb-1">
                  Principal
                </span>
                <p className="text-xs font-bold text-zinc-900">Carlos Fernández</p>
                <p className="text-xs text-zinc-600">Calle Serrano 45, 3º B</p>
                <p className="text-xs text-zinc-500">28001 Madrid, España</p>
                <p className="text-xs text-zinc-500 mt-1">+34 612 345 678</p>
              </div>
              <button
                onClick={() => onShowToast('Dirección', 'Modo edición de dirección habilitado.')}
                className="text-xs text-zinc-600 hover:text-zinc-900 font-medium underline"
              >
                Modificar
              </button>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-zinc-700" />
              <span>Métodos de Pago Guardados</span>
            </h3>
            <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-zinc-800 text-white font-bold text-[10px] flex items-center justify-center">
                  VISA
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Visa terminada en 4829</p>
                  <p className="text-[11px] text-zinc-500">Caduca 09/28</p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Predeterminada
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
