# Quality Sports — Frontend

Interfaz web del e-commerce de calzado deportivo **Quality Sports** (Cúcuta, Colombia).

## Stack

| Tecnología | Versión |
|---|---|
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 4 |
| React Router DOM | 7 |
| Axios | 1.x |
| Framer Motion | 12 |
| Recharts | 3 |
| Phosphor Icons | 2 |
| pnpm | — |

## Estructura

```
src/
├── api/            # Clientes Axios por módulo (auth, pedidos, productos, heka…)
├── assets/         # Imágenes y recursos estáticos
├── components/
│   ├── cart/       # Carrito y lógica de paquetes
│   ├── layout/     # Navbar, Footer, AdminLayout, AsesorLayout
│   └── ui/         # Componentes reutilizables (botones, modales, badges…)
├── context/        # AuthContext, CartContext
├── hooks/          # Hooks personalizados
├── pages/
│   ├── admin/      # Dashboard, Pedidos, Clientes, Asesores, Productos, Modelos, Descuentos
│   ├── asesor/     # Dashboard y detalle de pedido del asesor
│   ├── auth/       # Login, Register
│   ├── cliente/    # MisPedidos, MisPedidoDetalle, MiPerfil
│   └── public/     # Home, Catálogo, ProductoDetalle, Carrito, Checkout, Confirmación
├── router/         # AppRouter con rutas protegidas por rol
└── utils/          # Helpers y formateadores
```

## Rutas por rol

### Público (sin login)
| Ruta | Página |
|---|---|
| `/` | Home — promoción 2 pares × $190.000 |
| `/catalogo` | Catálogo de productos |
| `/producto/:id` | Detalle de producto |
| `/carrito` | Carrito de compras |
| `/login` | Login |
| `/register` | Registro |

### Cliente autenticado
| Ruta | Página |
|---|---|
| `/checkout` | Checkout y selección de modalidad de entrega |
| `/confirmacion` | Confirmación de pedido |
| `/mis-pedidos` | Listado de pedidos del cliente |
| `/mis-pedidos/:id` | Detalle de pedido |
| `/mi-perfil` | Editar perfil y cambiar contraseña |

### Asesor de Ventas
| Ruta | Página |
|---|---|
| `/asesor` | Dashboard con pedidos asignados |
| `/asesor/pedido/:id` | Detalle de pedido + cotizador de envío Heka |

### Administrador
| Ruta | Página |
|---|---|
| `/admin` | Dashboard con métricas y gráficos |
| `/admin/pedidos` | Gestión de todos los pedidos |
| `/admin/clientes` | Listado de clientes |
| `/admin/asesores` | Gestión de asesores de venta |
| `/admin/productos` | CRUD de productos |
| `/admin/modelos` | CRUD de modelos |
| `/admin/descuentos` | Reglas de paquetes (precios por cantidad) |

## Variables de entorno

```env
# .env.development
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://tu-backend-produccion.com
```

> Vite hace proxy de `/api` → `http://localhost:8080` en desarrollo, por lo que no es necesario indicar la URL completa en las llamadas Axios locales.

## Setup desde cero

### Prerequisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Backend corriendo en `http://localhost:8080`

### Pasos

1. **Clona el repositorio y entra al directorio `frontend/`**

2. **Instala las dependencias**
   ```bash
   pnpm install
   ```

3. **Configura el entorno de desarrollo**

   El archivo `.env.development` ya está incluido con:
   ```env
   VITE_API_URL=http://localhost:8080
   ```
   Vite hace proxy automático de `/api` → backend, así que no necesitas cambiar nada para desarrollo local.

4. **Inicia el servidor de desarrollo**
   ```bash
   pnpm dev
   ```
   La app queda disponible en `http://localhost:5173`.

### Verificar que funciona

Abre `http://localhost:5173` — deberías ver el Home con la promoción de 2 pares. Si el catálogo carga productos, el proxy al backend está funcionando.

## Build para producción

```bash
pnpm build
# Los archivos estáticos quedan en /dist

pnpm preview  # previsualizar el build localmente
```

Para desplegar, apunta `VITE_API_URL` en `.env.production` a tu backend en producción y sirve la carpeta `/dist` con cualquier servidor estático (Nginx, Vercel, Netlify, etc.).

## Notas de diseño

- El panel **admin** y el **dashboard del asesor** son totalmente responsivos: sidebar drawer con hamburger en móvil, tabla en desktop y tarjetas en móvil.
- Los precios de paquete se obtienen del backend (`/api/admin/descuentos`); los valores del `Home.jsx` son UI estática de marketing.
