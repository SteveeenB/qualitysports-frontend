import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Truck, Lock, ChatCircle } from '@phosphor-icons/react'
import { listarProductos } from '../../api/productos'
import ProductCard from '../../components/ui/ProductCard'
import Spinner from '../../components/ui/Spinner'
import { toCollageUrl } from '../../utils/imageUrl'

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

function CollageColumn({ images, direction, speed, left }) {
  if (!images.length) return null
  const doubled = [...images, ...images]
  const totalH = images.length * 192
  const yFrom = direction === 'up' ? 0 : -totalH
  const yTo   = direction === 'up' ? -totalH : 0

  return (
    <div className="absolute top-0 h-full overflow-hidden" style={{ width: '150px', left }}>
      <motion.div
        animate={{ y: [yFrom, yTo] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
        className="flex flex-col gap-3 pt-3"
      >
        {doubled.map((url, i) => (
          <img
            key={i}
            src={url}
            alt=""
            loading="lazy"
            fetchPriority="low"
            className="w-full rounded-xl object-cover flex-shrink-0"
            style={{ height: '180px' }}
          />
        ))}
      </motion.div>
    </div>
  )
}

export default function Home() {
  const [featured, setFeatured]       = useState([])
  const [collageUrls, setCollageUrls] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    listarProductos(0, 4)
      .then(r => setFeatured(r.data.content ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false))

    listarProductos(0, 12)
      .then(r => {
        const items = r.data.content ?? r.data
        setCollageUrls(items.map(p => toCollageUrl(p.imagenUrl)).filter(Boolean))
      })
      .catch(() => {})
  }, [])

  const padded = collageUrls.length
    ? Array.from({ length: Math.ceil(9 / collageUrls.length) }, () => collageUrls).flat().slice(0, Math.max(collageUrls.length, 9))
    : []
  const third = Math.ceil(padded.length / 3)
  const cols = [padded.slice(0, third), padded.slice(third, third * 2), padded.slice(third * 2)]

  function scrollToPaquetes(e) {
    e.preventDefault()
    document.getElementById('paquetes')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        style={{ backgroundColor: '#1C1C1E' }}
        className="relative overflow-hidden flex items-center min-h-[520px] md:min-h-[600px]"
      >
        {/* Collage columns — desktop only */}
        {collageUrls.length > 0 && (
          <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
            <CollageColumn images={cols[0]} direction="up"   speed={22} left="calc(55% + 0px)"   />
            <CollageColumn images={cols[1]} direction="down" speed={18} left="calc(55% + 162px)" />
            <CollageColumn images={cols[2]} direction="up"   speed={26} left="calc(55% + 324px)" />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, rgba(28,28,30,1) 38%, rgba(28,28,30,0.55) 60%, rgba(28,28,30,0.75) 100%)' }}
            />
          </div>
        )}

        {/* Red accent glow */}
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
          <div className="max-w-[1280px] mx-auto">
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

              <p className="text-gray-400 text-base md:text-lg mb-6 leading-relaxed max-w-sm">
                Compra al por mayor o detal. Pago contraentrega, atención personalizada por WhatsApp.
              </p>

              {/* Promo 2 pares */}
              <div
                className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl mb-7"
                style={{ backgroundColor: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.35)' }}
              >
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>Oferta especial</span>
                  <span className="text-white font-black text-lg leading-tight mt-0.5">2 pares · $190.000</span>
                </div>
                <div className="h-8 w-px" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
                <span className="text-xs text-gray-300 max-w-[110px] leading-tight">Mezcla modelos libremente</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/catalogo"
                  className="px-7 py-3 text-sm font-semibold rounded-xl transition-colors active:scale-[0.98]"
                  style={{ backgroundColor: '#C0392B', color: '#FFFFFF' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#A93226'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#C0392B'}
                >
                  Ver Catálogo
                </Link>
                <a
                  href="#paquetes"
                  onClick={scrollToPaquetes}
                  className="px-7 py-3 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  style={{ border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', backgroundColor: 'transparent', textDecoration: 'none' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Ver paquetes
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────── */}
      <section className="hidden md:block bg-white border-b border-gray-100 py-4">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-center gap-10">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Truck size={18} weight="duotone" color="#C0392B" />
              <span>Envío a todo Colombia</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Lock size={18} weight="duotone" color="#C0392B" />
              <span>Pago contraentrega</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <ChatCircle size={18} weight="duotone" color="#C0392B" />
              <span>Atención personalizada</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Productos destacados ──────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1E]">Productos destacados</h2>
              <p className="text-gray-400 text-sm mt-1">Los más buscados de la temporada</p>
            </div>
            <Link to="/catalogo" className="hidden md:flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#C0392B' }}>
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
              style={{ color: '#C0392B', textDecoration: 'none' }}
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
      <section id="paquetes" style={{ backgroundColor: '#1C1C1E' }} className="py-14">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Combina modelos, ahorra más
            </h2>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              Compra varios pares de cualquier modelo y paga el precio del paquete. Se aplica automáticamente al hacer tu pedido.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { pares: 2, precio: '190.000', tag: '¡Empieza aquí!' },
              { pares: 3, precio: '280.000', tag: null },
              { pares: 4, precio: '360.000', tag: null },
              { pares: 5, precio: '450.000', tag: null },
            ].map((t, i) => (
              <div
                key={t.pares}
                className="relative rounded-2xl p-5"
                style={{
                  backgroundColor: i === 0 ? '#C0392B' : 'rgba(255,255,255,0.05)',
                  border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {t.tag && (
                  <span
                    className="absolute -top-2.5 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#FFFFFF', color: '#C0392B' }}
                  >
                    {t.tag}
                  </span>
                )}
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: i === 0 ? 'rgba(255,255,255,0.75)' : '#6B7280' }}>
                  {t.pares} pares
                </p>
                <p className="text-xl font-black text-white mt-2">${t.precio}</p>
                <p className="text-xs mt-1" style={{ color: i === 0 ? 'rgba(255,255,255,0.65)' : '#4B5563' }}>
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
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1E]">¿Cómo comprar?</h2>
            <p className="text-gray-400 text-sm mt-2">Simple y rápido, sin complicaciones</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0">
            {/* Connector line — desktop only */}
            <div
              className="hidden md:block absolute top-7 h-px bg-gray-300"
              style={{ left: 'calc(16.66% + 1.75rem)', right: 'calc(16.66% + 1.75rem)' }}
            />

            {PASOS.map((paso, idx) => (
              <div key={paso.n} className="relative flex flex-col items-center text-center px-6">
                <div
                  className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-5 font-black text-lg text-white"
                  style={{ backgroundColor: '#C0392B', boxShadow: '0 0 0 6px #F5F5F5' }}
                >
                  {idx + 1}
                </div>
                <h3 className="font-semibold text-[#1C1C1E] text-base mb-2">{paso.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">{paso.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
