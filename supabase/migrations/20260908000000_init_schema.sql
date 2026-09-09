-- =========================================================================
-- ORBIT · Catálogo y Compras — esquema inicial
-- =========================================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- categories
-- -------------------------------------------------------------------------
create table public.categories (
  id   text primary key,
  name text not null,
  icon text not null
);

alter table public.categories enable row level security;

create policy "categories are publicly readable"
  on public.categories for select
  using (true);

-- -------------------------------------------------------------------------
-- products
-- -------------------------------------------------------------------------
create table public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  brand          text not null,
  category_id    text not null references public.categories(id),
  price          numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price is null or original_price >= 0),
  rating         numeric(2,1) not null default 0 check (rating between 0 and 5),
  reviews_count  integer not null default 0 check (reviews_count >= 0),
  image          text not null,
  images         text[] not null default '{}',
  colors         jsonb not null default '[]',   -- [{ "name": "...", "hex": "#..." }]
  sizes          text[],
  description    text not null default '',
  specs          jsonb not null default '[]',   -- [{ "label": "...", "value": "..." }]
  stock          integer not null default 0 check (stock >= 0),
  is_new         boolean not null default false,
  is_trending    boolean not null default false,
  free_shipping  boolean not null default false,
  created_at     timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_is_trending_idx on public.products (is_trending) where is_trending;

alter table public.products enable row level security;

create policy "products are publicly readable"
  on public.products for select
  using (true);

-- -------------------------------------------------------------------------
-- profiles (1:1 con auth.users)
-- -------------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  phone           text,
  avatar_url      text,
  default_address jsonb,  -- { fullName, street, city, postalCode, phone }
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Crea automáticamente un perfil al registrarse un usuario nuevo.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------------------
-- cart_items
-- -------------------------------------------------------------------------
create table public.cart_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  product_id     uuid not null references public.products(id) on delete cascade,
  selected_color jsonb not null,   -- { "name": "...", "hex": "#..." }
  selected_size  text,
  quantity       integer not null default 1 check (quantity > 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Misma combinación producto+color+talla no se duplica: se incrementa cantidad.
create unique index cart_items_unique_variant_idx
  on public.cart_items (user_id, product_id, (selected_color ->> 'name'), coalesce(selected_size, ''));

create index cart_items_user_id_idx on public.cart_items (user_id);

alter table public.cart_items enable row level security;

create policy "users manage own cart items"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- wishlists
-- -------------------------------------------------------------------------
create table public.wishlist_items (
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlist_items enable row level security;

create policy "users manage own wishlist"
  on public.wishlist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- promo_codes
-- -------------------------------------------------------------------------
create table public.promo_codes (
  code             text primary key,
  discount_percent integer not null check (discount_percent between 1 and 100),
  active           boolean not null default true,
  expires_at       timestamptz
);

alter table public.promo_codes enable row level security;

-- Sin política de select pública: los códigos se validan solo vía RPC
-- (validate_promo_code / create_order), nunca se listan directamente.

-- -------------------------------------------------------------------------
-- orders / order_items
-- -------------------------------------------------------------------------
create sequence public.order_number_seq;

create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text unique not null default
                         ('ORD-' || lpad(nextval('public.order_number_seq')::text, 5, '0')),
  user_id             uuid not null references auth.users(id) on delete cascade,
  status              text not null default 'confirmado'
                         check (status in ('confirmado', 'en_preparacion', 'en_camino', 'entregado')),
  subtotal            numeric(10,2) not null,
  discount            numeric(10,2) not null default 0,
  shipping            numeric(10,2) not null default 0,
  total               numeric(10,2) not null,
  promo_code          text references public.promo_codes(code),
  tracking_code       text,
  estimated_delivery  text,
  shipping_address    jsonb not null,  -- { fullName, street, city, postalCode, phone }
  created_at          timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

create policy "users view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Los pedidos solo se crean vía la función create_order (security definer).
-- No hay policy de insert/update directa para los clientes.

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  product_image text not null,
  price         numeric(10,2) not null,
  quantity      integer not null check (quantity > 0),
  color_name    text not null,
  size          text
);

create index order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "users view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- =========================================================================
-- RPCs — lógica de checkout ejecutada en el servidor (no confiar en el
-- precio/stock que envía el cliente).
-- =========================================================================

-- Valida un código promocional y devuelve el % de descuento (0 si no existe).
create function public.validate_promo_code(p_code text)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select discount_percent from public.promo_codes
     where code = upper(p_code)
       and active
       and (expires_at is null or expires_at > now())),
    0
  );
$$;

-- Crea un pedido a partir del carrito actual del usuario autenticado:
--  1. Bloquea y valida stock de cada producto en el carrito.
--  2. Recalcula precios/subtotal/envío/descuento en el servidor.
--  3. Descuenta stock, inserta orders + order_items, vacía el carrito.
create function public.create_order(
  p_shipping_address jsonb,
  p_promo_code text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id      uuid := auth.uid();
  v_subtotal     numeric(10,2) := 0;
  v_discount_pct integer := 0;
  v_discount     numeric(10,2) := 0;
  v_shipping     numeric(10,2) := 0;
  v_free_ship    boolean;
  v_order        public.orders;
  v_item         record;
begin
  if v_user_id is null then
    raise exception 'Se requiere autenticación';
  end if;

  if not exists (select 1 from public.cart_items where user_id = v_user_id) then
    raise exception 'El carrito está vacío';
  end if;

  -- Bloquea las filas de producto implicadas para evitar sobreventa
  -- en checkouts concurrentes.
  perform 1
  from public.products p
  join public.cart_items c on c.product_id = p.id
  where c.user_id = v_user_id
  for update;

  -- Valida stock disponible.
  for v_item in
    select c.id as cart_item_id, c.quantity, p.id as product_id, p.name, p.stock
    from public.cart_items c
    join public.products p on p.id = c.product_id
    where c.user_id = v_user_id
  loop
    if v_item.quantity > v_item.stock then
      raise exception 'Stock insuficiente para "%": quedan % unidades', v_item.name, v_item.stock;
    end if;
  end loop;

  select coalesce(sum(p.price * c.quantity), 0),
         bool_and(p.free_shipping) or coalesce(sum(p.price * c.quantity), 0) >= 60.0
    into v_subtotal, v_free_ship
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if p_promo_code is not null then
    v_discount_pct := public.validate_promo_code(p_promo_code);
  end if;
  v_discount := round(v_subtotal * v_discount_pct / 100.0, 2);
  v_shipping := case when v_free_ship then 0 else 4.95 end;

  insert into public.orders (
    user_id, status, subtotal, discount, shipping, total,
    promo_code, tracking_code, estimated_delivery, shipping_address
  ) values (
    v_user_id, 'confirmado', v_subtotal, v_discount, v_shipping,
    greatest(v_subtotal - v_discount + v_shipping, 0),
    case when v_discount_pct > 0 then upper(p_promo_code) else null end,
    'ES-' || floor(random() * 90000000 + 10000000)::text || '-STD',
    'En 3-5 días laborables',
    p_shipping_address
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, product_id, product_name, product_image, price, quantity, color_name, size
  )
  select v_order.id, p.id, p.name, p.image, p.price, c.quantity,
         c.selected_color ->> 'name', c.selected_size
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  update public.products p
  set stock = p.stock - c.quantity
  from public.cart_items c
  where c.product_id = p.id and c.user_id = v_user_id;

  delete from public.cart_items where user_id = v_user_id;

  return v_order;
end;
$$;

revoke all on function public.create_order(jsonb, text) from public;
grant execute on function public.create_order(jsonb, text) to authenticated;

revoke all on function public.validate_promo_code(text) from public;
grant execute on function public.validate_promo_code(text) to authenticated;
