// El catálogo de productos y los pedidos ya no viven aquí: se sirven desde
// Supabase (ver src/services/products.service.ts y src/services/orders.service.ts).
// CATEGORIES se mantiene como constante de UI porque 'todos' es un filtro
// del cliente que no existe como fila real en la tabla `categories`.

export const CATEGORIES = [
  { id: 'todos', name: 'Todos los productos', icon: 'Sparkles' },
  { id: 'tecnologia', name: 'Tecnología', icon: 'Headphones' },
  { id: 'calzado', name: 'Calzado & Sneakers', icon: 'Footprints' },
  { id: 'moda', name: 'Moda & Ropa', icon: 'Shirt' },
  { id: 'accesorios', name: 'Accesorios', icon: 'Watch' },
  { id: 'hogar', name: 'Hogar & Estilo', icon: 'Home' },
] as const;
