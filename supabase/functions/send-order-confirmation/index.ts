// Supabase Edge Function: send-order-confirmation
// Despliegue con: supabase functions deploy send-order-confirmation
// Se invoca tras la creación de un pedido o mediante Database Webhook en `public.orders`.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'ORBIT Store <onboarding@resend.dev>';
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { order, customerEmail } = await req.json();

    if (!order || !order.id) {
      return new Response(JSON.stringify({ error: 'Faltan datos del pedido (order).' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const recipient = customerEmail || order.shippingAddress?.email;
    let resendData = null;

    if (RESEND_API_KEY && recipient) {
      // 1. Enviar email de confirmación con Resend
      const itemsListHtml = (order.items || [])
        .map(
          (item: any) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7;">
                <strong>${item.productName}</strong><br/>
                <span style="color: #71717a; font-size: 13px;">${item.colorName || ''} ${item.size ? '· Talla ' + item.size : ''}</span>
              </td>
              <td style="padding: 10px 0; text-align: center; border-bottom: 1px solid #e4e4e7; font-size: 14px;">
                x${item.quantity}
              </td>
              <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #e4e4e7; font-size: 14px; font-weight: 600;">
                ${(item.price * item.quantity).toFixed(2)}€
              </td>
            </tr>
          `
        )
        .join('');

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #18181b; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">ORBIT STORE</h1>
            <p style="color: #71717a; font-size: 14px; margin: 4px 0 0 0;">Confirmación de Pedido</p>
          </div>

          <p style="font-size: 16px;">¡Hola <strong>${order.shippingAddress?.fullName || 'Cliente'}</strong>!</p>
          <p style="color: #52525b; line-height: 1.5;">Hemos recibido tu pedido correctamente. Ya estamos preparándolo para enviártelo.</p>

          <div style="background-color: #f4f4f5; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Nº de Pedido:</strong> ${order.id}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Código de Seguimiento:</strong> ${order.trackingCode}</p>
            <p style="margin: 0; font-size: 13px;"><strong>Entrega Estimada:</strong> ${order.estimatedDelivery}</p>
          </div>

          <h3 style="font-size: 15px; margin: 20px 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a;">Resumen de la compra</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${itemsListHtml}
            </tbody>
          </table>

          <div style="margin-top: 16px; text-align: right;">
            <p style="margin: 4px 0; font-size: 13px; color: #71717a;">Subtotal: ${order.subtotal?.toFixed(2)}€</p>
            ${order.discount > 0 ? `<p style="margin: 4px 0; font-size: 13px; color: #16a34a;">Descuento: -${order.discount.toFixed(2)}€</p>` : ''}
            <p style="margin: 4px 0; font-size: 13px; color: #71717a;">Envío: ${order.shipping === 0 ? 'Gratis' : order.shipping?.toFixed(2) + '€'}</p>
            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 800; color: #18181b;">Total: ${order.total?.toFixed(2)}€</p>
          </div>

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7; font-size: 12px; color: #a1a1aa; text-align: center;">
            <p>¿Tienes dudas con tu pedido? Escríbenos directamente a nuestro WhatsApp oficial de atención.</p>
            <p>© ${new Date().getFullYear()} ORBIT Store. Todos los derechos reservados.</p>
          </div>
        </div>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: [recipient],
          subject: `📦 Pedido Confirmado: ${order.id} - ORBIT Store`,
          html: emailHtml,
        }),
      });

      resendData = await resendRes.json();

      // 1b. Copia interna al administrador de la tienda (best-effort: no
      // bloquea la respuesta si falla).
      if (ADMIN_EMAIL) {
        try {
          const adminRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: RESEND_FROM_EMAIL,
              to: [ADMIN_EMAIL],
              subject: `🔔 Nuevo pedido recibido: ${order.id} (${recipient})`,
              html: emailHtml,
            }),
          });
          const adminData = await adminRes.json();

          if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
            const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
            await supabaseAdmin.from('order_notifications').insert({
              order_id: order.id,
              channel: 'email',
              recipient: ADMIN_EMAIL,
              status: adminData?.id ? 'sent' : 'pending',
              provider_id: adminData?.id || null,
              payload: { admin: true, adminData },
            });
          }
        } catch (adminErr) {
          console.error('[Admin notification error]', adminErr);
        }
      }
    }

    // 2. Registrar en Supabase order_notifications si service role key está configurada
    if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      if (recipient) {
        await supabaseAdmin.from('order_notifications').insert({
          order_id: order.id,
          channel: 'email',
          recipient: recipient,
          status: resendData?.id ? 'sent' : 'pending',
          provider_id: resendData?.id || null,
          payload: { resendData },
        });
      }
    }

    return new Response(JSON.stringify({ success: true, resend: resendData }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
