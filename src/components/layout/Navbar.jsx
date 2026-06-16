import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import CartDrawer from '../cart/CartDrawer'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems, setDrawerOpen } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-[#C0392B]' : 'text-[#1C1C1E] hover:text-[#C0392B]'}`

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.05)' }}>
        <div className="w-full px-6 md:px-10 h-16 flex items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 flex-1">
            <div className="w-8 h-8 bg-[#C0392B] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">QS</span>
            </div>
            <div className="leading-none">
              <span className="font-bold text-sm text-[#1C1C1E] tracking-[0.08em]">QUALITY</span>
              <span className="block text-[9px] text-[#C0392B] tracking-[0.3em] font-semibold">SPORTS</span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/"         end className={navLinkClass}>Inicio</NavLink>
            <NavLink to="/catalogo"     className={navLinkClass}>Catálogo</NavLink>
            {user?.role === 'CLIENTE' && (
              <NavLink to="/mis-pedidos" className={navLinkClass}>Mis Pedidos</NavLink>
            )}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Cart */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors text-[#1C1C1E]"
              aria-label="Carrito"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C0392B] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Auth desktop */}
            {!user ? (
              <Link
                to="/login"
                className="hidden md:flex items-center px-4 py-2 bg-[#C0392B] text-white text-sm font-semibold rounded-lg hover:bg-[#A93226] transition-colors active:scale-[0.98]"
              >
                Iniciar Sesión
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to={user.role === 'ADMINISTRADOR' ? '/admin' : user.role === 'ASESOR_VENTAS' ? '/asesor' : '/mis-pedidos'}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1C1C1E] text-white text-sm font-semibold rounded-lg hover:bg-[#2d2d2d] transition-colors active:scale-[0.98]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  {user.role === 'ADMINISTRADOR' ? 'Panel de control' : 'Mis pedidos'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 border border-gray-200 text-[#1C1C1E] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}

            {/* Hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-5 flex flex-col gap-4">
            <NavLink to="/"         end className={navLinkClass} onClick={() => setMenuOpen(false)}>Inicio</NavLink>
            <NavLink to="/catalogo"     className={navLinkClass} onClick={() => setMenuOpen(false)}>Catálogo</NavLink>
            {user?.role === 'CLIENTE' && (
              <NavLink to="/mis-pedidos" className={navLinkClass} onClick={() => setMenuOpen(false)}>Mis Pedidos</NavLink>
            )}
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
              {!user ? (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex justify-center w-full py-2.5 bg-[#C0392B] text-white text-sm font-semibold rounded-lg text-center hover:bg-[#A93226] transition-colors">Iniciar Sesión</Link>
              ) : (
                <>
                  <Link
                    to={user.role === 'ADMINISTRADOR' ? '/admin' : user.role === 'ASESOR_VENTAS' ? '/asesor' : '/mis-pedidos'}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1C1C1E] text-white text-sm font-semibold rounded-lg hover:bg-[#2d2d2d] transition-colors"
                  >
                    {user.role === 'ADMINISTRADOR' ? 'Panel de control' : 'Mis pedidos'}
                  </Link>
                  <button onClick={handleLogout} className="w-full py-2.5 border border-gray-200 text-[#1C1C1E] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Cerrar sesión</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}
