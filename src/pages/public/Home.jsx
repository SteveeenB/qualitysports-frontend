import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarProductos } from '../../api/productos'
import ProductCard from '../../components/ui/ProductCard'
import Spinner from '../../components/ui/Spinner'

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO').format(n)
}

const PASOS = [
  {
    n: '01',
    title: 'Explora el catálogo',
    desc: 'Filtra por talla, categoría o modelo. Encuentra lo que buscas rápidamente.',
  },
  {
    n: '02',
    title: 'Agrega al carrito',
    desc: 'Recibe descuentos automáticos por volumen al completar tu pedido.',
  },
  {
    n: '03',
    title: 'Confirma por WhatsApp',
    desc: 'Tu asesor confirma el pedido y coordina el envío directamente contigo.',
  },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listarProductos(0, 4)
      .then(r => setFeatured(r.data.content ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        style={{ backgroundColor: '#1C1C1E' }}
        className="relative overflow-hidden flex items-center min-h-[520px] md:min-h-[600px]"
      >
        {/* Red accent glow — top right */}
        <div
          className="absolute top-0 right-0 w-2/3 h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 85% 30%, rgba(192,57,43,0.18) 0%, transparent 60%)' }}
        />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />

        <div className="relative z-10 w-full px-6 md:px-10 py-16 md:py-24">
          <div className="flex items-center justify-between gap-12 max-w-[1280px] mx-auto">

            {/* Left — editorial text */}
            <div className="max-w-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-[#C0392B]" />
                <span className="text-[#C0392B] text-[11px] font-semibold tracking-[0.25em] uppercase">
                  Colección 2026
                </span>
              </div>

              <h1
                className="font-bold text-white leading-[1.05] tracking-tight mb-5"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}
              >
                Calzado deportivo<br />
                <span style={{ color: '#C0392B' }}>de alta calidad</span>
              </h1>

              <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed max-w-sm">
                Compra al por mayor o detalle. Pago contraentrega, atención personalizada por WhatsApp.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/catalogo"
                  className="px-7 py-3 text-white text-sm font-semibold rounded-xl transition-colors active:scale-[0.98]"
                  style={{ backgroundColor: '#C0392B' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#A93226'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#C0392B'}
                >
                  Ver Catálogo
                </Link>
                <Link
                  to="/catalogo"
                  className="px-7 py-3 text-white text-sm font-medium rounded-xl transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.25)' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Ver paquetes
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-5 mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {[
                  { label: 'Pago contraentrega', icon: '🔒' },
                  { label: 'Envío a todo Colombia', icon: '🚚' },
                  { label: 'Atención personalizada', icon: '💬' },
                ].map(t => (
                  <div key={t.label} className="flex items-center gap-1.5">
                    <span className="text-sm">{t.icon}</span>
                    <span className="text-gray-400 text-xs font-medium">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — brand composition (desktop only) */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="relative w-[340px] h-[340px]">
                {/* Main red rectangle */}
                <div
                  className="absolute top-0 right-0 w-56 h-56 rounded-3xl flex items-end p-6"
                  style={{ backgroundColor: '#C0392B' }}
                >
                  <span className="text-white/20 text-8xl font-black leading-none select-none">QS</span>
                </div>
                {/* Dark square bottom-left */}
                <div
                  className="absolute bottom-0 left-0 w-48 h-48 rounded-2xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                {/* Small accent square */}
                <div
                  className="absolute bottom-16 right-16 w-10 h-10 rounded-lg"
                  style={{ border: '2px solid rgba(192,57,43,0.6)' }}
                />
                {/* Stat card overlay */}
                <div
                  className="absolute bottom-4 right-0 px-5 py-4 rounded-2xl"
                  style={{ backgroundColor: '#FFFFFF', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                >
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Descuento mayorista</p>
                  <p className="text-2xl font-black mt-0.5" style={{ color: '#C0392B' }}>hasta 40%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Productos destacados ──────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C0392B]">Selección</span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1E] mt-1">Productos destacados</h2>
              <p className="text-gray-400 text-sm mt-1">Los más buscados de la temporada</p>
            </div>
            <Link to="/catalogo" className="hidden md:flex items-center gap-1 text-sm font-medium text-[#C0392B] hover:opacity-80 transition-opacity">
              Ver todos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p, i) => (
                <div key={p.id} className={i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}>
                  <ProductCard product={p} featured={i === 0} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: '#C0392B' }}
            >
              Ver todos los productos
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Paquetes ─────────────────────────────────────── */}
      <section style={{ backgroundColor: '#1C1C1E' }} className="py-14">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="mb-10">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#C0392B' }}>
              Precios de paquete
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">
              Combina modelos, ahorra más
            </h2>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              Compra varios pares de cualquier modelo y paga el precio del paquete. Se aplica automáticamente al hacer tu pedido.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { pares: 2, precio: '190.000' },
              { pares: 3, precio: '280.000' },
              { pares: 4, precio: '360.000' },
              { pares: 5, precio: '450.000' },
            ].map((t, i) => (
              <div
                key={t.pares}
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: i === 3 ? '#C0392B' : 'rgba(255,255,255,0.05)',
                  border: i === 3 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: i === 3 ? 'rgba(255,255,255,0.6)' : '#6B7280' }}>
                  {t.pares} pares
                </p>
                <p className="text-xl font-black text-white mt-2">${t.precio}</p>
                <p className="text-xs mt-1" style={{ color: i === 3 ? 'rgba(255,255,255,0.5)' : '#4B5563' }}>
                  COP total
                </p>
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-xs mt-6">
            * Puedes mezclar tallas y modelos libremente. El precio del paquete se calcula sobre el total de pares del pedido.
          </p>
        </div>
      </section>

      {/* ── ¿Cómo comprar? ────────────────────────────────── */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C0392B]">Simple y rápido</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1E] mt-1">¿Cómo comprar?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PASOS.map(paso => (
              <div
                key={paso.n}
                className="relative bg-white rounded-2xl p-8 overflow-hidden group transition-shadow duration-200 hover:shadow-lg"
              >
                <span
                  className="absolute -top-2 -right-1 font-black select-none leading-none pointer-events-none"
                  style={{ fontSize: '7rem', color: '#F5F5F5', lineHeight: 1 }}
                >
                  {paso.n}
                </span>
                <div className="relative z-10">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: '#FEF2F1' }}
                  >
                    <span className="text-sm font-black" style={{ color: '#C0392B' }}>{paso.n}</span>
                  </div>
                  <h3 className="font-semibold text-[#1C1C1E] text-base mb-2">{paso.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
