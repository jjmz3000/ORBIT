import { supabase } from '../lib/supabase';
import type { Order } from '../types';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  message?: string;
  error?: string;
}

export interface WhatsAppNotificationData {
  url: string;
  message: string;
}

/**
 * Envía la confirmación del pedido por correo electrónico vía Resend (a través del endpoint de la API).
 */
export async function sendOrderEmailNotification(
  order: Order,
  recipientEmail?: string
): Promise<SendEmailResult> {
  const email = recipientEmail || order.shippingAddress.email;
  if (!email) {
    return {
      success: false,
      error: 'No se ha especificado ninguna dirección de correo electrónico.',
    };
  }

  try {
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order,
        customerEmail: email,
      }),
    });

    const data = await response.json();

    // Si Supabase está conectado, registramos la traza en order_notifications
    try {
      await supabase.from('order_notifications').insert({
        order_id: order.id,
        channel: 'email',
        recipient: email,
        status: data.success ? 'sent' : 'failed',
        provider_id: data.resend?.id || data.messageId || null,
        payload: { simulated: !!data.simulated, order_total: order.total },
        error_message: data.error || null,
      });
    } catch {
      // Si la tabla no está creada aún en Supabase o falla la inserción, no bloqueamos la respuesta
    }

    return {
      success: data.success ?? response.ok,
      messageId: data.resend?.id || data.messageId,
      simulated: data.simulated,
      message: data.message || 'Correo de confirmación enviado exitosamente con Resend.',
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error al conectar con el servidor de correo.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Genera el mensaje y el enlace oficial de WhatsApp para compartir el pedido con el cliente o la tienda.
 */
export function buildWhatsAppOrderMessage(
  order: Order,
  customPhone?: string
): WhatsAppNotificationData {
  // Teléfono configurado en el .env o el número del cliente
  const defaultStorePhone = (import.meta.env.VITE_WHATSAPP_PHONE || '').replace(/[^0-9]/g, '');
  const targetPhone = (customPhone || order.shippingAddress.phone || defaultStorePhone).replace(/[^0-9]/g, '');

  const itemsList = order.items
    .map(
      (item) =>
        `• *${item.quantity}x* ${item.productName}${
          item.colorName ? ` (${item.colorName})` : ''
        }${item.size ? ` [Talla: ${item.size}]` : ''} - ${(item.price * item.quantity).toFixed(2)}€`
    )
    .join('\n');

  const messageText = [
    `🛍️ *¡CONFIRMACIÓN DE PEDIDO EN ORBIT!*`,
    ``,
    `Hola *${order.shippingAddress.fullName}*, tu pedido ha sido registrado con éxito.`,
    ``,
    `📦 *Nº de Pedido:* ${order.id}`,
    `🚚 *Código de Seguimiento:* ${order.trackingCode}`,
    `⏱️ *Entrega estimada:* ${order.estimatedDelivery}`,
    `📍 *Dirección de Entrega:* ${order.shippingAddress.street}, ${order.shippingAddress.city} (${order.shippingAddress.postalCode})`,
    ``,
    `🛒 *Detalle de Artículos:*`,
    itemsList,
    ``,
    `💳 *Subtotal:* ${order.subtotal.toFixed(2)}€`,
    order.discount > 0 ? `🎁 *Descuento:* -${order.discount.toFixed(2)}€` : null,
    `📦 *Envío:* ${order.shipping === 0 ? 'GRATIS' : `${order.shipping.toFixed(2)}€`}`,
    `💰 *TOTAL A PAGAR:* *${order.total.toFixed(2)}€*`,
    ``,
    `✨ ¡Muchas gracias por tu confianza en ORBIT! Si tienes cualquier consulta puedes responder a este mensaje.`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const encodedMessage = encodeURIComponent(messageText);
  const whatsappUrl = targetPhone
    ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;

  return {
    url: whatsappUrl,
    message: messageText,
  };
}

/**
 * Abre WhatsApp directamente con el pedido formateado y guarda el registro en Supabase.
 */
export async function openWhatsAppNotification(
  order: Order,
  customPhone?: string
): Promise<void> {
  const { url } = buildWhatsAppOrderMessage(order, customPhone);
  const recipient = customPhone || order.shippingAddress.phone || 'WhatsApp Direct';

  // Registrar en order_notifications
  try {
    await supabase.from('order_notifications').insert({
      order_id: order.id,
      channel: 'whatsapp',
      recipient,
      status: 'sent',
      payload: { phone: recipient },
    });
  } catch {
    // Si la tabla no existe aún, ignorar
  }

  // Abrir ventana en nueva pestaña
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
