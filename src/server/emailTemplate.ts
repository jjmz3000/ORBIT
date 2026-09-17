export function generateOrderEmailHtml(order: any, customerEmail: string): string {
  const address = order.shippingAddress || {};
  const items = order.items || [];

  const itemsRows = items
    .map(
      (item: any) => `
      <tr style="border-bottom: 1px solid #f4f4f5;">
        <td style="padding: 14px 0; vertical-align: middle;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #18181b;">${item.productName}</p>
          <p style="margin: 3px 0 0 0; font-size: 12px; color: #71717a;">
            ${item.colorName ? `Color: ${item.colorName}` : ''}
            ${item.size ? ` · Talla: ${item.size}` : ''}
          </p>
        </td>
        <td style="padding: 14px 12px; text-align: center; font-size: 14px; color: #52525b;">
          ${item.quantity}
        </td>
        <td style="padding: 14px 0; text-align: right; font-size: 14px; font-weight: 600; color: #18181b;">
          ${(Number(item.price) * Number(item.quantity)).toFixed(2)}€
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido - ORBIT</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          
          <!-- Encabezado -->
          <tr>
            <td style="background-color: #09090b; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">O R B I T</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Catálogo & Compras Oficial</p>
            </td>
          </tr>

          <!-- Mensaje principal -->
          <tr>
            <td style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; border: 1px solid #a7f3d0;">
                  ✓ Pago & Pedido Confirmado
                </span>
                <h2 style="margin: 16px 0 6px 0; font-size: 22px; font-weight: 700; color: #18181b;">¡Gracias por tu compra, ${address.fullName || 'Cliente'}!</h2>
                <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.5;">
                  Hemos recibido tu pedido correctamente. Ya se encuentra en preparación para ser despachado.
                </p>
              </div>

              <!-- Tarjeta de seguimiento -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 13px; color: #64748b;">Nº de Pedido:</td>
                        <td style="padding-bottom: 8px; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right; font-family: monospace;">${order.id}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 13px; color: #64748b;">Código de Rastreo:</td>
                        <td style="padding-bottom: 8px; font-size: 13px; font-weight: 600; color: #2563eb; text-align: right; font-family: monospace;">${order.trackingCode || 'Generando...'}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 13px; color: #64748b;">Entrega estimada:</td>
                        <td style="padding-bottom: 8px; font-size: 13px; font-weight: 600; color: #059669; text-align: right;">${order.estimatedDelivery || 'En 3-5 días laborables'}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748b;">Dirección de entrega:</td>
                        <td style="font-size: 13px; color: #334155; text-align: right;">${address.street || ''}, ${address.city || ''} (${address.postalCode || ''})</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Lista de productos -->
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a;">Artículos comprados</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <thead>
                  <tr style="border-bottom: 2px solid #e4e4e7; font-size: 12px; color: #a1a1aa; text-transform: uppercase;">
                    <th align="left" style="padding-bottom: 8px;">Producto</th>
                    <th align="center" style="padding-bottom: 8px;">Cant.</th>
                    <th align="right" style="padding-bottom: 8px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Resumen financiero -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e4e4e7; padding-top: 14px; margin-bottom: 28px;">
                <tr>
                  <td style="font-size: 13px; color: #71717a; padding: 4px 0;">Subtotal:</td>
                  <td style="font-size: 13px; color: #18181b; text-align: right; padding: 4px 0;">${Number(order.subtotal || 0).toFixed(2)}€</td>
                </tr>
                ${
                  order.discount > 0
                    ? `
                <tr>
                  <td style="font-size: 13px; color: #16a34a; padding: 4px 0;">Descuento cupón:</td>
                  <td style="font-size: 13px; color: #16a34a; text-align: right; padding: 4px 0;">-${Number(order.discount).toFixed(2)}€</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="font-size: 13px; color: #71717a; padding: 4px 0;">Gastos de envío:</td>
                  <td style="font-size: 13px; color: #18181b; text-align: right; padding: 4px 0;">${order.shipping === 0 ? 'Gratis' : `${Number(order.shipping).toFixed(2)}€`}</td>
                </tr>
                <tr>
                  <td style="font-size: 16px; font-weight: 800; color: #09090b; padding-top: 12px; border-top: 1px solid #f4f4f5;">Total Abonado:</td>
                  <td style="font-size: 18px; font-weight: 800; color: #09090b; text-align: right; padding-top: 12px; border-top: 1px solid #f4f4f5;">${Number(order.total || 0).toFixed(2)}€</td>
                </tr>
              </table>

              <!-- Mensaje WhatsApp -->
              <div style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; border: 1px solid #bbf7d0; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #15803d;">¿Necesitas ayuda con tu pedido o cambio de fecha?</p>
                <p style="margin: 0; font-size: 12px; color: #166534;">
                  Puedes comunicarte directamente con nuestro centro de atención por WhatsApp con el número de tu pedido.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 20px 32px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #71717a;">
                Este correo fue enviado automáticamente por <strong>ORBIT</strong> a ${customerEmail}.
              </p>
              <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                © ${new Date().getFullYear()} ORBIT Inc. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
