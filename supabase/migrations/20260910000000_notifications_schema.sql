-- =========================================================================
-- ORBIT · Notificaciones de Pedidos (Resend / Email y WhatsApp)
--
-- Idempotente: se puede volver a ejecutar completo sin errores aunque la
-- tabla, el índice o las políticas ya existan.
-- =========================================================================

-- Tabla de historial y auditoría de notificaciones enviadas
create table if not exists public.order_notifications (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  channel      text not null check (channel in ('email', 'whatsapp')),
  recipient    text not null, -- Dirección de email o número telefónico
  status       text not null default 'sent' check (status in ('pending', 'sent', 'failed')),
  provider_id  text,          -- ID retornado por Resend (e.g. re_xxxx) o WhatsApp/Twilio
  payload      jsonb,         -- Contenido o metadata adicional de la notificación
  error_message text,         -- Descripción en caso de fallo
  created_at   timestamptz not null default now()
);

create index if not exists order_notifications_order_id_idx
  on public.order_notifications(order_id);

alter table public.order_notifications enable row level security;

-- Los usuarios pueden consultar el historial de notificaciones de sus propios pedidos
drop policy if exists "users can view their order notifications" on public.order_notifications;
create policy "users can view their order notifications"
  on public.order_notifications for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_notifications.order_id and o.user_id = auth.uid()
    )
  );

-- Permitir registrar notificaciones desde usuarios autenticados
drop policy if exists "users or system can insert order notifications" on public.order_notifications;
create policy "users or system can insert order notifications"
  on public.order_notifications for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_notifications.order_id and o.user_id = auth.uid()
    )
  );
