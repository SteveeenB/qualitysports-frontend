# Capa API — Quality Sports

Módulos de comunicación entre el frontend (Vite + React) y el backend (Spring Boot).

## Estructura

```
src/api/
├── client.js      # Instancia axios con interceptor JWT y manejo 401
├── auth.js        # Login y registro
├── productos.js   # Catálogo y gestión de productos
├── pedidos.js     # Creación y seguimiento de pedidos
└── admin.js       # Clientes, asesores, KPIs, descuentos
```

## Cómo funciona el token

El `client.js` lee automáticamente el token de `localStorage` y lo adjunta como `Authorization: Bearer <token>` en cada request. Si el servidor responde `401`, borra la sesión y redirige a `/login`.

```js
// Al hacer login, guardar el token manualmente:
import { login } from '../api/auth'

const { data } = await login(email, password)
localStorage.setItem('token', data.token)
localStorage.setItem('user', JSON.stringify(data.user))
```

---

## auth.js

```js
import { login, register } from '../api/auth'

// Iniciar sesión
const { data } = await login('juan@example.com', 'miPassword123')
// data.token  → JWT
// data.user   → { id, nombre, email, rol }

// Registrarse como cliente
const { data } = await register('Juan Pérez', 'juan@example.com', 'miPassword123')
```

---

## productos.js

### Rutas públicas (sin token)

```js
import { listarProductos, buscarProductos, obtenerProducto, listarCategorias } from '../api/productos'

// Paginado — page empieza en 0
const { data } = await listarProductos(0, 20)
// data.content      → array de productos
// data.totalPages   → total de páginas
// data.totalElements → total de registros

// Búsqueda por nombre o descripción
const { data } = await buscarProductos('camiseta')
// data → array de productos

// Detalle de un producto
const { data } = await obtenerProducto(5)

// Categorías para el filtro
const { data } = await listarCategorias()
// data → [{ id, nombre }, ...]
```

### Rutas admin (requiere rol ADMINISTRADOR)

```js
import {
  listarProductosAdmin,
  crearProducto,
  actualizarProducto,
  cambiarEstadoProducto,
  subirImagenProducto,
} from '../api/productos'

// Listar todos (activos e inactivos)
const { data } = await listarProductosAdmin(0, 20)

// Crear producto
const { data } = await crearProducto({
  nombre: 'Camiseta Dry-Fit',
  descripcion: 'Transpirable y ligera',
  precio: 89900,
  stock: 50,
  categoriaId: 2,
})

// Actualizar producto
await actualizarProducto(5, { precio: 79900, stock: 30 })

// Activar / desactivar
await cambiarEstadoProducto(5, false)  // desactiva
await cambiarEstadoProducto(5, true)   // activa

// Subir imagen (input type="file")
const handleFileChange = async (e) => {
  const file = e.target.files[0]
  const { data } = await subirImagenProducto(5, file)
  // data.imagenUrl → URL pública en Supabase Storage
}
```

---

## pedidos.js

### Público — compra sin cuenta

```js
import { crearPedido } from '../api/pedidos'

const { data } = await crearPedido({
  nombreComprador: 'Carlos López',
  emailComprador:  'carlos@example.com',
  telefonoComprador: '3001234567',
  items: [
    { productoId: 3, cantidad: 2 },
    { productoId: 7, cantidad: 1 },
  ],
  codigoDescuento: 'PROMO10',  // opcional
})
// data.id          → id del pedido creado
// data.total       → total calculado con descuentos
// data.estado      → "POR_CONFIRMAR"
```

### Cliente autenticado

```js
import { misPedidos, miPedido } from '../api/pedidos'

const { data } = await misPedidos()
// data → array de pedidos del cliente logueado

const { data } = await miPedido(12)
// data → pedido completo con items y estado
```

### Asesor (requiere rol ASESOR_VENTAS)

```js
import { pedidosAsesor, pedidoAsesor, avanzarEstadoAsesor } from '../api/pedidos'

const { data } = await pedidosAsesor()
const { data } = await pedidoAsesor(12)

// Avanzar estado: Por confirmar → Confirmado → En despacho → Entregado
await avanzarEstadoAsesor(12, 'Cliente confirmó por WhatsApp')
```

### Admin (requiere rol ADMINISTRADOR)

```js
import { todosPedidos, cualquierPedido, avanzarEstadoAdmin, reasignarAsesor } from '../api/pedidos'

const { data } = await todosPedidos()
const { data } = await cualquierPedido(12)
await avanzarEstadoAdmin(12, 'Aprobado por gerencia')
await reasignarAsesor(12, 3)  // asesorId = 3
```

---

## admin.js

```js
import {
  listarClientes, historialCliente,
  listarAsesores, obtenerKpis,
  listarDescuentos, crearDescuento, actualizarDescuento, eliminarDescuento,
} from '../api/admin'

const { data: clientes }  = await listarClientes()
const { data: historial } = await historialCliente(7)
const { data: asesores }  = await listarAsesores()
const { data: kpis }      = await obtenerKpis()
// kpis.totalPedidos, kpis.porEstado, kpis.topProductos

// Descuentos
const { data } = await listarDescuentos()
await crearDescuento({ codigo: 'VERANO25', porcentaje: 25, activo: true })
await actualizarDescuento(3, { activo: false })
await eliminarDescuento(3)
```

---

## Manejo de errores en componentes

```js
try {
  const { data } = await login(email, password)
  // éxito
} catch (error) {
  // error.response.data.message → mensaje del backend
  // error.response.status       → código HTTP (400, 401, 404, 409, etc.)
  const mensaje = error.response?.data?.message || 'Error de conexión'
  setError(mensaje)
}
```

---

## Entornos

| Entorno | Archivo | Variable |
|---|---|---|
| Desarrollo (`pnpm dev`) | `.env.development` | `VITE_API_URL=http://localhost:8080` |
| Producción (`pnpm build`) | `.env.production` | `VITE_API_URL=https://tu-backend.com` |

Para validar el build de producción localmente: `pnpm build && pnpm preview`
