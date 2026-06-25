import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

function formatCOP(price) {
  return new Intl.NumberFormat('es-CO').format(price)
}

function SizeSelect({ tallas, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const sorted = [...tallas].sort((a, b) => {
    const na = Number(a), nb = Number(b)
    return !isNaN(na) && !isNaN(nb) ? na - nb : String(a).localeCompare(String(b))
  })

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-colors duration-150"
        style={{
          border: open ? '1.5px solid #C0392B' : '1.5px solid #E5E5E5',
          backgroundColor: '#fff',
          color: value != null ? '#1C1C1E' : '#9CA3AF',
        }}
      >
        <span className={value != null ? 'font-medium' : ''}>
          {value != null ? `Talla ${value}` : 'Elige tu talla'}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="flex-shrink-0 ml-1 transition-transform duration-200"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: open ? '#C0392B' : '#9CA3AF',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-20 mt-1 bg-white overflow-hidden"
          style={{
            borderRadius: '12px',
            border: '1px solid #EBEBEB',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          }}
        >
          {sorted.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { onChange(t); setOpen(false) }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors duration-100 hover:bg-gray-50"
              style={{
                color: value === t ? '#C0392B' : '#1C1C1E',
                fontWeight: value === t ? 600 : 400,
              }}
            >
              <span>Talla {t}</span>
              {value === t && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductCard({ product, compact = false, featured = false }) {
  const { addItem } = useCart()
  const [talla, setTalla] = useState(null)
  const [added, setAdded] = useState(false)

  function handleAddToCart(e) {
    e.preventDefault()
    if (!talla) return
    addItem(product, talla)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      className="group bg-white overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 h-full"
      style={{
        borderRadius: '16px',
        border: '1px solid #EBEBEB',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
    >
      {/* Image */}
      <Link
        to={`/producto/${product.id}`}
        className="block overflow-hidden flex-shrink-0 flex items-center justify-center p-4"
        style={{
          backgroundColor: '#F7F7F7',
          aspectRatio: featured ? '16/10' : '1',
        }}
      >
        {product.imagenUrl ? (
          <img
            src={product.imagenUrl}
            alt={product.nombre}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <span className="text-xs text-gray-400">{product.nombre?.split(' ')[0] ?? 'Producto'}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <Link to={`/producto/${product.id}`}>
            <h3
              className="font-semibold text-sm leading-snug transition-colors line-clamp-2"
              style={{ color: '#1C1C1E' }}
              onMouseOver={e => e.currentTarget.style.color = '#C0392B'}
              onMouseOut={e => e.currentTarget.style.color = '#1C1C1E'}
            >
              {product.nombre}
            </h3>
          </Link>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-bold text-base" style={{ color: '#C0392B' }}>
              ${formatCOP(product.precioBase)}
            </span>
            <span className="text-xs text-gray-400 font-normal">COP</span>
          </div>
        </div>

        {/* Size selector */}
        {!compact && product.tallasDisponibles?.length > 0 && (
          <SizeSelect
            tallas={product.tallasDisponibles}
            value={talla}
            onChange={setTalla}
          />
        )}

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={!talla && !compact}
          className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: added
              ? '#16a34a'
              : talla || compact
              ? '#C0392B'
              : '#F5F5F5',
            color: talla || compact || added ? '#FFFFFF' : '#9CA3AF',
            cursor: !talla && !compact ? 'not-allowed' : 'pointer',
          }}
        >
          {added
            ? '✓ Agregado al carrito'
            : !talla && !compact
            ? 'Selecciona una talla'
            : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}
