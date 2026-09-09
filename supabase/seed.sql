-- Datos de ejemplo migrados desde src/data/products.ts
-- Se ejecuta automáticamente con `supabase db reset`.

insert into public.categories (id, name, icon) values
  ('tecnologia', 'Tecnología', 'Headphones'),
  ('calzado', 'Calzado & Sneakers', 'Footprints'),
  ('moda', 'Moda & Ropa', 'Shirt'),
  ('accesorios', 'Accesorios', 'Watch'),
  ('hogar', 'Hogar & Estilo', 'Home');

insert into public.products
  (slug, name, brand, category_id, price, original_price, rating, reviews_count,
   image, images, colors, sizes, description, specs, stock, is_new, is_trending, free_shipping)
values
  (
    'smartwatch-minimalist-ultra-series', 'Smartwatch Minimalist Ultra Series', 'AetherTech', 'tecnologia',
    189.99, 229.99, 4.9, 342,
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
    ],
    '[{"name":"Blanco Lunar","hex":"#f8fafc"},{"name":"Gris Grafito","hex":"#334155"},{"name":"Oro Rosa","hex":"#e0a996"}]'::jsonb,
    array['40 mm', '44 mm'],
    'Reloj inteligente de última generación con pantalla AMOLED de alta resolución siempre activa, monitorización cardíaca continua, resistencia al agua 50m y autonomía de hasta 7 días.',
    '[{"label":"Autonomía","value":"Hasta 7 días de uso estándar"},{"label":"Resistencia","value":"5 ATM (sumergible 50m)"},{"label":"Pantalla","value":"AMOLED 1.4\" Cristal Zafiro"},{"label":"Sensores","value":"SpO2, ECG, Sueño, GPS dual"}]'::jsonb,
    14, true, true, true
  ),
  (
    'auriculares-inalambricos-studio-anc', 'Auriculares Inalámbricos Studio ANC', 'SonicAura', 'tecnologia',
    149.0, 199.0, 4.8, 512,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    '[{"name":"Negro Mate","hex":"#18181b"},{"name":"Plata Arena","hex":"#d4d4d8"},{"name":"Azul Noche","hex":"#1e293b"}]'::jsonb,
    null,
    'Experimenta una inmersión acústica pura con cancelación activa de ruido híbrida (ANC), transductores de neodimio de 40mm y hasta 40 horas de reproducción ininterrumpida.',
    '[{"label":"Cancelación de Ruido","value":"Híbrida Adaptativa -38dB"},{"label":"Batería","value":"40h ANC activado / 60h normal"},{"label":"Conectividad","value":"Bluetooth 5.3 Multipunto + Jack"},{"label":"Carga","value":"USB-C de carga rápida (10m = 5h)"}]'::jsonb,
    22, false, true, true
  ),
  (
    'sneakers-urban-runner-crimson-pro', 'Sneakers Urban Runner Crimson Pro', 'Veloce Footwear', 'calzado',
    119.5, 140.0, 4.7, 289,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&auto=format&fit=crop&q=80'
    ],
    '[{"name":"Rojo Carmesí","hex":"#dc2626"},{"name":"Negro Ónix","hex":"#09090b"},{"name":"Blanco Glaciar","hex":"#f4f4f5"}]'::jsonb,
    array['39','40','41','42','43','44','45'],
    'Zapatillas urbanas de alto rendimiento con amortiguación reactiva CloudFoam, malla transpirable antirozaduras y suela con tracción geométrica multidispersión.',
    '[{"label":"Material Exterior","value":"Malla transpirable tejida 3D"},{"label":"Amortiguación","value":"Espuma reactiva CloudFoam"},{"label":"Peso","value":"265g por zapatilla"},{"label":"Uso recomendado","value":"Running urbano y lifestyle"}]'::jsonb,
    18, false, true, true
  ),
  (
    'camara-fotografica-instantanea-classic-90', 'Cámara Fotográfica Instantánea Classic 90', 'Lumix Retro', 'tecnologia',
    95.0, null, 4.6, 178,
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
    ],
    '[{"name":"Turquesa Vintage","hex":"#0d9488"},{"name":"Negro Clásico","hex":"#27272a"},{"name":"Blanco Crema","hex":"#f5f5f4"}]'::jsonb,
    null,
    'Inmortaliza tus momentos favoritos con el encanto analógico instantáneo. Cuenta con flash inteligente automático, lente macro retráctil y modo selfie con espejo frontal integrado.',
    '[{"label":"Película","value":"Película instantánea estándar"},{"label":"Velocidad Obturación","value":"1/60 seg automática"},{"label":"Alimentación","value":"2 Pilas AA incluidas"},{"label":"Dimensiones","value":"107.6 x 121.2 x 67.3 mm"}]'::jsonb,
    9, false, false, false
  ),
  (
    'gafas-de-sol-polarizadas-aviator-black', 'Gafas de Sol Polarizadas Aviator Black', 'Solstice Eyewear', 'accesorios',
    68.0, 85.0, 4.9, 420,
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
    ],
    '[{"name":"Montura Negra / Lente Gris","hex":"#18181b"},{"name":"Montura Dorada / Lente Verde","hex":"#d97706"}]'::jsonb,
    array['Estándar 54mm'],
    'Gafas de sol con montura en acetato italiano ligero y lentes de cristal mineral polarizado con protección UV400 total. Reducen los reflejos y realzan el contraste cromático natural.',
    '[{"label":"Protección","value":"UV400 Categoría 3 Polarizada"},{"label":"Montura","value":"Acetato de celulosa premium"},{"label":"Bisagras","value":"Acero inoxidable de 5 ejes"}]'::jsonb,
    25, true, false, false
  ),
  (
    'mochila-urbana-impermeable-roll-top', 'Mochila Urbana Impermeable Roll-Top', 'NordicPack', 'accesorios',
    84.95, 105.0, 4.8, 195,
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
    ],
    '[{"name":"Gris Asfalto","hex":"#475569"},{"name":"Negro Carbón","hex":"#0f172a"},{"name":"Verde Oliva","hex":"#3f6212"}]'::jsonb,
    null,
    'Diseño minimalista escandinavo fabricado con lona encerada hidrófuga y poliéster reciclado. Incluye compartimento acolchado para portátiles de hasta 16 pulgadas y bolsillos antirrobo.',
    '[{"label":"Capacidad","value":"20L expandible a 25L"},{"label":"Bolsillo Portátil","value":"Hasta 16\" con acolchado EVA"},{"label":"Resistencia al Agua","value":"Tejido repelente DWR + Cremalleras selladas"}]'::jsonb,
    12, false, false, true
  ),
  (
    'bolso-bandolera-de-piel-vegana-artesanal', 'Bolso Bandolera de Piel Vegana Artesanal', 'Atelier Bloom', 'moda',
    79.0, 99.0, 4.7, 130,
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'
    ],
    '[{"name":"Cuero Miel","hex":"#b45309"},{"name":"Negro Piel","hex":"#1c1917"}]'::jsonb,
    null,
    'Bolso versátil confeccionado éticamente con piel de microfibra ecológica de tacto sedoso y forro interior de algodón orgánico. Correa ajustable extraíble con herrajes dorados mate.',
    '[{"label":"Dimensiones","value":"24 x 18 x 7 cm"},{"label":"Material","value":"Cuero vegano PETA-Approved"},{"label":"Cierre","value":"Solapa con broche magnético invisible"}]'::jsonb,
    7, false, false, true
  ),
  (
    'difusor-aromatico-ceramico-ultrasonidos', 'Difusor Aromático Cerámico Ultrasonidos', 'ZenLiving Studio', 'hogar',
    45.0, 55.0, 4.9, 310,
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
    ],
    '[{"name":"Cerámica Blanca","hex":"#fafaf9"},{"name":"Terracota Cálido","hex":"#c2410c"}]'::jsonb,
    null,
    'Aromatiza tu espacio y purifica el aire de forma silenciosa mediante tecnología ultrasónica. Cubierta artesanal en cerámica esmaltada a mano con iluminación ambiental tenue de tono ámbar.',
    '[{"label":"Capacidad depósito","value":"220 ml (hasta 9h continuas)"},{"label":"Nivel Sonoro","value":"< 20 dB (modo ultra-silencioso)"},{"label":"Apagado Automático","value":"Sí, al agotarse el agua"}]'::jsonb,
    19, false, false, false
  );

insert into public.promo_codes (code, discount_percent) values
  ('PROMO10', 10),
  ('BIENVENIDA20', 20);
