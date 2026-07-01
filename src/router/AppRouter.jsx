import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { pixelPageView } from '../utils/metaPixel.js'

function PixelPageTracker() {
  const location = useLocation()
  useEffect(() => {
    pixelPageView()
  }, [location.pathname])
  return null
}

import Layout      from '../components/layout/Layout'
import AdminLayout  from '../components/layout/AdminLayout'
import AsesorLayout from '../components/layout/AsesorLayout'

import Home             from '../pages/public/Home'
import Catalogo         from '../pages/public/Catalogo'
import ProductoDetalle  from '../pages/public/ProductoDetalle'
import Carrito          from '../pages/public/Carrito'
import Checkout         from '../pages/public/Checkout'
import Confirmacion     from '../pages/public/Confirmacion'

import Login    from '../pages/auth/Login'
import Register from '../pages/auth/Register'

import MisPedidos        from '../pages/cliente/MisPedidos'
import MisPedidoDetalle  from '../pages/cliente/MisPedidoDetalle'
import MiPerfil          from '../pages/cliente/MiPerfil'

import AsesorDashboard     from '../pages/asesor/AsesorDashboard'
import AsesorDetallePedido from '../pages/asesor/AsesorDetallePedido'

import AdminDashboard  from '../pages/admin/AdminDashboard'
import AdminProductos  from '../pages/admin/AdminProductos'
import AdminPedidos    from '../pages/admin/AdminPedidos'
import AdminClientes   from '../pages/admin/AdminClientes'
import AdminAsesores   from '../pages/admin/AdminAsesores'
import AdminDescuentos from '../pages/admin/AdminDescuentos'
import AdminModelos    from '../pages/admin/AdminModelos'

import PoliticaPrivacidad from '../pages/public/PoliticaPrivacidad'
import Acceso403 from '../pages/Acceso403'
import CookieConsentBanner from '../components/CookieConsentBanner'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-white" />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/403" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-white" />
  if (user) {
    if (user.role === 'ADMINISTRADOR') return <Navigate to="/admin" replace />
    if (user.role === 'ASESOR_VENTAS') return <Navigate to="/asesor" replace />
    return <Navigate to="/" replace />
  }
  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <PixelPageTracker />
      <CookieConsentBanner />
      <Routes>
        {/* Públicas con layout */}
        <Route element={<Layout />}>
          <Route path="/"                   element={<Home />} />
          <Route path="/catalogo"            element={<Catalogo />} />
          <Route path="/producto/:id"        element={<ProductoDetalle />} />
          <Route path="/carrito"             element={<Carrito />} />
          <Route path="/checkout"              element={<Checkout />} />
          <Route path="/confirmacion/:id"    element={<Confirmacion />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/mis-pedidos"         element={<PrivateRoute roles={['CLIENTE']}><MisPedidos /></PrivateRoute>} />
          <Route path="/mis-pedidos/:id"    element={<PrivateRoute roles={['CLIENTE']}><MisPedidoDetalle /></PrivateRoute>} />
          <Route path="/mi-perfil"          element={<PrivateRoute roles={['CLIENTE']}><MiPerfil /></PrivateRoute>} />
        </Route>

        {/* Auth sin layout */}
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Asesor — rutas anidadas dentro de AsesorLayout */}
        <Route element={<PrivateRoute roles={['ASESOR_VENTAS']}><AsesorLayout /></PrivateRoute>}>
          <Route path="/asesor"            element={<AsesorDashboard />} />
          <Route path="/asesor/pedido/:id" element={<AsesorDetallePedido />} />
        </Route>

        {/* Admin — rutas anidadas dentro de AdminLayout */}
        <Route element={<PrivateRoute roles={['ADMINISTRADOR']}><AdminLayout /></PrivateRoute>}>
          <Route path="/admin"             element={<AdminDashboard />} />
          <Route path="/admin/productos"   element={<AdminProductos />} />
          <Route path="/admin/pedidos"     element={<AdminPedidos />} />
          <Route path="/admin/clientes"    element={<AdminClientes />} />
          <Route path="/admin/asesores"    element={<AdminAsesores />} />
          <Route path="/admin/modelos"     element={<AdminModelos />} />
          <Route path="/admin/descuentos"  element={<AdminDescuentos />} />
        </Route>

        <Route path="/403" element={<Acceso403 />} />
        <Route path="*"    element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
