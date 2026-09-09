# Guía Supabase ORBIT

De cero a pedidos reales en Supabase: crea el proyecto, aplica el esquema de `supabase/migrations`, conéctalo al frontend local y comprueba que una cotización enviada desde ORBIT queda almacenada y es gestionable desde el dashboard de Supabase — sin datos quemados.

**Proyecto:** `orbit-catalogo-compras` · **Stack:** React + Vite · Supabase (Postgres/Auth) · **Tiempo estimado:** 25–35 min

---

## Índice

1. [Visión general](#1-visión-general)
2. [Crear el proyecto en Supabase](#2-crear-el-proyecto-en-supabase)
3. [Obtener las credenciales](#3-obtener-las-credenciales)
4. [Aplicar el esquema y los datos semilla](#4-aplicar-el-esquema-y-los-datos-semilla)
5. [Configurar autenticación](#5-configurar-autenticación)
6. [Conectar el frontend local](#6-conectar-el-frontend-local)
7. [Probar de extremo a extremo](#7-probar-de-extremo-a-extremo)
8. [Gestionar todo desde el dashboard](#8-gestionar-todo-desde-el-dashboard)
9. [Solución de problemas comunes](#9-solución-de-problemas-comunes)

---

## 1. Visión general

ORBIT no tiene servidor propio: el frontend habla directo con Supabase usando `supabase-js`. Row Level Security (RLS) decide qué puede leer o escribir cada usuario autenticado; la creación del pedido pasa por una función SQL (`create_order`) que recalcula precios y stock en el servidor. El "panel de admin" no es una pantalla que construyamos en ORBIT — es el propio **Supabase Studio**, el dashboard que ya trae tu proyecto.

```
Frontend ORBIT  --supabase-js (RLS)-->   Supabase            <--bypassa RLS--   Studio
(React + Vite)  <--sesión de usuario--   (Postgres · Auth     --datos reales--  (Tú, como
                                          · RPC create_order)                    admin)
```

Una cotización enviada desde el frontend recorre este camino hasta quedar visible y editable en Studio.

> **Nota — sobre el término "cotización":** ORBIT no tiene un objeto de "cotización" separado: el equivalente es el **pedido** que se crea al completar el checkout (tabla `orders`). Esta guía usa ambos términos de forma intercambiable.

**Requisitos antes de empezar:**
- Node.js instalado y el repo ORBIT abierto en esta máquina.
- Una cuenta gratuita en `supabase.com` (puedes entrar con GitHub).
- Los archivos ya generados en `supabase/migrations/` y `supabase/seed.sql` (vienen en el repo).

---

## 2. Crear el proyecto en Supabase

Provisiona la base de datos Postgres real que sustituirá a los productos y pedidos quemados.

1. **Entra al dashboard.** Ve a `supabase.com/dashboard` e inicia sesión (o regístrate con GitHub/email).
2. **New Project.** Pulsa *New Project*, elige tu organización y rellena:

   | Campo | Valor sugerido |
   |---|---|
   | Name | `orbit-catalogo-compras` |
   | Database Password | Genera una fuerte y guárdala — la necesitarás para el CLI |
   | Region | La más cercana a ti (menor latencia) |
   | Pricing Plan | Free |

3. **Espera el aprovisionamiento.** Tarda 1–2 minutos. Cuando el estado pase de "Setting up project" a activo, ya tienes Postgres + Auth + API corriendo.

> **Advertencia — plan gratuito:** los proyectos free se pausan tras ~1 semana sin uso. Si un día el frontend deja de conectar, entra al dashboard y pulsa *Restore project*.

---

## 3. Obtener las credenciales

Solo necesitas dos valores públicos — nunca la `service_role key` en el frontend.

1. **Ve a Project Settings → API.** Icono de engranaje en la barra lateral izquierda → *API*.
2. **Copia dos valores:** `Project URL` (tipo `https://xxxxxxxxxxxx.supabase.co`) y la clave `anon public` (larga, empieza por `eyJ...`).

> **Importante:** nunca copies la `service_role key` aquí. Esa clave salta todas las políticas de RLS. Solo debe vivir en un backend de confianza — nunca en `.env` de un proyecto Vite, porque termina expuesta en el bundle del navegador.

---

## 4. Aplicar el esquema y los datos semilla

Crea las 8 tablas, las políticas RLS y las funciones `create_order` / `validate_promo_code`, y carga el catálogo real (8 productos, 5 categorías, 2 cupones).

Elige una de las dos rutas — el resultado final es idéntico.

### Ruta A · Desde el navegador (sin instalar nada)

1. **Abre el SQL Editor.** En el menú lateral de tu proyecto: *SQL Editor* → *New query*.
2. **Pega y ejecuta la migración.** Abre `supabase/migrations/20260908000000_init_schema.sql` en tu editor, copia todo el contenido, pégalo en el SQL Editor y pulsa *Run*.
3. **Pega y ejecuta el seed.** Abre una *New query* nueva, pega el contenido completo de `supabase/seed.sql` y pulsa *Run*. Esto inserta los 8 productos, 5 categorías y los cupones `PROMO10` / `BIENVENIDA20`.

### Ruta B · Con el CLI de Supabase (recomendada si repites este proceso)

1. **Inicia sesión con el CLI:**

   ```bash
   npx supabase login
   ```

   Abre el navegador y genera un token de acceso.

2. **Enlaza el proyecto local con el remoto.** El `project-ref` está en *Project Settings → General → Reference ID*, o en la URL del dashboard.

   ```bash
   npx supabase link --project-ref TU_PROJECT_REF
   ```

   Te pedirá la contraseña de la base de datos que guardaste en la fase 2.

3. **Empuja la migración:**

   ```bash
   npm run db:push
   ```

   Aplica `supabase/migrations/20260908000000_init_schema.sql` contra el proyecto remoto.

4. **Carga los datos semilla.** `db push` no ejecuta `seed.sql` en un proyecto remoto (solo lo hace `supabase db reset` en local). Para el proyecto remoto, usa la Ruta A, paso 3: pega `supabase/seed.sql` en el SQL Editor y ejecútalo.

**Verificación antes de continuar:**
- En *Table Editor* ves 8 tablas: `categories`, `products`, `profiles`, `cart_items`, `wishlist_items`, `promo_codes`, `orders`, `order_items`.
- `products` tiene 8 filas y `categories` tiene 5.
- `promo_codes` tiene `PROMO10` y `BIENVENIDA20`.

---

## 5. Configurar autenticación

ORBIT usa Supabase Auth real (registro/login por email y contraseña). Ajusta dos cosas para que funcione en local sin fricción.

1. **Desactiva la confirmación por email (solo para desarrollo).** *Authentication → Providers → Email* (o *Authentication → Settings*, según la versión del panel) → apaga *Confirm email*. Así cada cuenta que crees desde ORBIT queda activa al instante, sin depender de un proveedor SMTP.
2. **Define la Site URL.** *Authentication → URL Configuration* → pon `Site URL` en `http://localhost:3000`. Si Vite arranca en otro puerto (lo verás en la terminal, p. ej. `3001`), añade también esa URL en *Redirect URLs*.

> **Nota — en producción:** vuelve a activar *Confirm email* y configura un proveedor SMTP propio (o el de Supabase con dominio verificado) antes de abrir el registro al público.

---

## 6. Conectar el frontend local

Pega las credenciales reales en `.env` y levanta el servidor de desarrollo.

1. **Edita el archivo `.env`** en la raíz del proyecto, sustituyendo los valores de ejemplo:

   ```bash
   # pegar los valores reales de Project Settings → API
   VITE_SUPABASE_URL="https://tu-proyecto-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

2. **Instala dependencias** (si no lo has hecho):

   ```bash
   npm install
   ```

3. **Arranca el servidor:**

   ```bash
   npm run dev
   ```

   Abre la URL que imprime Vite (por defecto `http://localhost:3000`).

**Verificación antes de continuar:**
- La app carga la pantalla **Iniciar sesión / Crear cuenta** (no un error en blanco ni una excepción en consola).
- En las DevTools del navegador, la pestaña Network no muestra peticiones a `xxxxxxxxxxxx.supabase.co` (ese es el placeholder — confirma que ves tu *project-ref* real).

---

## 7. Probar de extremo a extremo

Envía una cotización real desde el frontend y confirma que Supabase la recibe y almacena.

1. **Crea una cuenta.** En la pestaña *Crear cuenta*, usa un email cualquiera (no hace falta que exista, ya que desactivaste la confirmación) y una contraseña de 6+ caracteres.
2. **Confirma que el usuario y el perfil se crearon.** En Studio: *Authentication → Users* debe listar tu email. En *Table Editor → profiles* debe existir una fila con ese mismo `id` — la crea automáticamente el trigger `handle_new_user`.
3. **Confirma que el catálogo es real, no quemado.** En *Table Editor → products*, edita el `name` o `price` de un producto y guarda. Recarga ORBIT en el navegador: el cambio debe reflejarse en el catálogo al instante.
4. **Añade productos a la cesta y aplica un cupón.** Desde el detalle de producto, pulsa *Añadir a la Cesta*. En la Cesta, prueba el código `PROMO10`.
5. **Completa el checkout.** Pulsa *Tramitar Pedido*, rellena la dirección y *Confirmar y Pagar*. Esto ejecuta la función `create_order`, que valida stock, recalcula el total en el servidor y vacía la cesta.

**Confirma la cotización en Supabase:**
- *Table Editor → orders*: fila nueva con `order_number` tipo `ORD-00001` y `status = confirmado`.
- *Table Editor → order_items*: las líneas del pedido, con precio y cantidad.
- *Table Editor → products*: el `stock` del producto comprado bajó exactamente la cantidad pedida.
- *Table Editor → cart_items*: sin filas para tu `user_id` (el RPC vacía la cesta).
- En ORBIT, pestaña *Perfil → Mis Pedidos*: el pedido aparece con seguimiento en vivo.

---

## 8. Gestionar todo desde el dashboard

Supabase Studio **es** el panel de administración: al entrar con tu cuenta de propietario del proyecto, tus acciones pasan por la `service_role key` internamente y **evitan RLS** — puedes ver y editar cualquier fila de cualquier usuario.

| Tarea de administración | Dónde hacerla |
|---|---|
| Avanzar el estado de un pedido | `Table Editor → orders` → edita la celda `status` |
| Ver / editar líneas de un pedido | `Table Editor → order_items` |
| Añadir, editar o retirar productos | `Table Editor → products` (o *SQL Editor* para lotes) |
| Ajustar stock manualmente | `Table Editor → products → stock` |
| Activar / crear cupones | `Table Editor → promo_codes` |
| Gestionar cuentas (banear, borrar, resetear contraseña) | `Authentication → Users` |
| Depurar una petición fallida | `Logs → API / Postgres` |

### Ejemplo: avanzar un pedido a "en camino"

1. **Localiza el pedido.** *Table Editor → orders*, busca la fila por su `order_number`.
2. **Cambia el status.** Haz doble clic en la celda `status` y elige uno de los cuatro valores válidos:

   ```
   confirmado → en_preparacion → en_camino → entregado
   ```

3. **Verifica en el frontend.** Recarga ORBIT y entra a *Perfil → Mis Pedidos*: el timeline de seguimiento avanza al nuevo estado.

> **Nota — no hay policy de insert/update en `orders` para clientes.** Por diseño (ver la migración), un usuario normal solo puede *leer* sus propios pedidos — no crearlos ni editarlos directo. Solo la función `create_order` y tú desde Studio podéis escribir en esa tabla. Es la barrera que impide que alguien manipule totales o robe pedidos ajenos.

---

## 9. Solución de problemas comunes

| Síntoma | Causa probable y solución |
|---|---|
| "Failed to fetch" al iniciar sesión | Revisa que `VITE_SUPABASE_URL` no tenga barra final ni comillas de más, y que el proyecto no esté pausado (revívelo desde el dashboard). |
| "Email not confirmed" al hacer login | No desactivaste *Confirm email* (fase 5), o creaste la cuenta antes de desactivarlo. Confírmala a mano en `Authentication → Users`. |
| "new row violates row-level security policy" | Intentaste escribir sin sesión activa, o en una tabla sin policy de insert para clientes (p. ej. `orders` — usa `create_order`). |
| El catálogo aparece vacío | `seed.sql` no se ejecutó. Repite la fase 4, Ruta A, paso 3. |
| Cambié el esquema y TypeScript ya no compila | Actualiza `src/types/database.types.ts` a mano, o enlaza el CLI y corre `npm run db:types`. |
| El puerto 3000 está ocupado | Vite usa el siguiente puerto libre automáticamente — mira la URL real en la terminal y añádela a *Redirect URLs* si vas a iniciar sesión. |
| Un cupón no se aplica | Comprueba en `promo_codes` que `active = true` y que `expires_at` esté vacío o en el futuro. |

> **Nota:** en Studio, *Logs → API* muestra cada petición que llega desde ORBIT con su código de error real — es el primer sitio a mirar cuando algo falla en silencio en el navegador.

---

*Guía basada en `supabase/migrations/20260908000000_init_schema.sql` y `supabase/seed.sql`.*
