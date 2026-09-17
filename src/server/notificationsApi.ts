import { Resend } from 'resend';
import { generateOrderEmailHtml } from './emailTemplate';

export async function handleEmailNotification(body: any): Promise<{
  status: number;
  data: any;
}> {
  const { order, customerEmail } = body || {};

  if (!order || !order.id) {
    return {
      status: 400,
      data: { success: false, error: 'Faltan los datos del pedido (order).' },
    };
  }

  const recipient = customerEmail || order.shippingAddress?.email;
  if (!recipient) {
    return {
      status: 400,
      data: { success: false, error: 'No se ha proporcionado una dirección de correo válida.' },
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL || 'ORBIT Store <onboarding@resend.dev>';
  const adminEmail = process.env.ADMIN_EMAIL;

  // Si la clave no está configurada aún en .env, operamos en modo simulación para desarrollo
  if (!resendApiKey || resendApiKey.includes('MY_RESEND') || resendApiKey.startsWith('re_xxxx')) {
    console.log(`[ORBIT Notifications - MODO SIMULACIÓN] Email para ${recipient}:`);
    console.log(`  -> Pedido: ${order.id} | Total: ${order.total}€ | Tracking: ${order.trackingCode}`);
    console.log(`  -> Consejo: Añade RESEND_API_KEY en tu .env para enviar correos reales con tu cuenta de resend.com.`);
    if (adminEmail) {
      console.log(`  -> [Admin] Se simularía también una copia a ${adminEmail}.`);
    }

    return {
      status: 200,
      data: {
        success: true,
        simulated: true,
        messageId: `sim_${Date.now()}`,
        message: `Simulación local: Correo generado para ${recipient}. Para envío real, configura RESEND_API_KEY en .env`,
      },
    };
  }

  try {
    const resend = new Resend(resendApiKey);
    const htmlContent = generateOrderEmailHtml(order, recipient);

    const response = await resend.emails.send({
      from: resendFrom,
      to: [recipient],
      subject: `📦 Pedido Confirmado: ${order.id} - ORBIT Store`,
      html: htmlContent,
    });

    if (response.error) {
      console.error('[Resend Error]', response.error);
      return {
        status: 400,
        data: {
          success: false,
          error: response.error.message,
        },
      };
    }

    // Copia interna al administrador de la tienda, siempre que haya un
    // pedido confirmado. Es un envío best-effort: si falla, no bloquea ni
    // afecta la respuesta que recibe el cliente.
    if (adminEmail) {
      try {
        const adminHtml = generateOrderEmailHtml(order, adminEmail);
        const adminResponse = await resend.emails.send({
          from: resendFrom,
          to: [adminEmail],
          subject: `🔔 Nuevo pedido recibido: ${order.id} (${recipient})`,
          html: adminHtml,
        });
        if (adminResponse.error) {
          console.error('[Resend Error - notificación admin]', adminResponse.error);
        }
      } catch (adminErr: any) {
        console.error('[Notifications Service Error - notificación admin]', adminErr);
      }
    }

    return {
      status: 200,
      data: {
        success: true,
        resend: response.data,
        message: `Correo de confirmación enviado exitosamente a ${recipient} a través de Resend.`,
      },
    };
  } catch (err: any) {
    console.error('[Notifications Service Error]', err);
    return {
      status: 500,
      data: {
        success: false,
        error: err.message || 'Error interno al procesar el envío con Resend.',
      },
    };
  }
}
