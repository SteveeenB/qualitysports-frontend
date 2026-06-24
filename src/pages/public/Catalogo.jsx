import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { listarProductos, listarProductosPorModelo, buscarProductos, listarModelos } from '../../api/productos'
import { toCollageUrl } from '../../utils/imageUrl'
import ProductCard from '../../components/ui/ProductCard'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { pixelSearch } from '../../utils/metaPixel.js'

const GRID_KEY = 'qs_catalog_cols'

function ModeloCard({ modelo, isSelected, onSelect }) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors flex-shrink-0"
      style={{
        backgroundColor: isSelected ? '#FEF2F1' : '#FFFFFF',
        borderColor: isSelected ? '#C0392B' : '#E5E5E5',
      }}
    >
      {modelo.imagenRepresentativa && (
        <img
          src={toCollageUrl(modelo.imagenRepresentativa)}
          alt={modelo.nombre}
          loading="lazy"
          className="w-14 h-14 rounded-xl object-contain flex-shrink-0"
          style={{ backgroundColor: '#F7F7F7' }}
        />
      )}
      <span
        className="text-sm font-semibold whitespace-nowrap"
        style={{ color: isSelected ? '#C0392B' : '#1C1C1E' }}
      >
        {modelo.nombre}
      </span>
    </motion.button>
  )
}

export default function Catalogo() {
  const [products, setProducts] = useState([])
  const [modelos, setModelos]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [query, setQuery]       = useState('')
  const [modeloId, setModeloId] = useState(null)
  const [page, setPage]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [mobileCols, setMobileCols] = useState(() => parseInt(localStorage.getItem(GRID_KEY) ?? '2'))
  const debounceRef = useRef(null)
  const scrollRef   = useRef(null)
  const [fadeRight, setFadeRight] = useState(false)

  useEffect(() => {
    listarModelos()
      .then(r => setModelos(r.data))
      .catch(() => {})
  }, [])

  const fetchProducts = useCallback(async (q, mId, p) => {
    setLoading(true)
    setError(false)
    try {
      let res
      if (q.trim()) {
        res = await buscarProductos(q)
        const data = res.data
        setProducts(Array.isArray(data) ? data : data.content ?? [])
        setTotalPages(data.totalPages ?? 1)
        pixelSearch({ searchString: q })
      } else if (mId) {
        res = await listarProductosPorModelo(mId, p, 9)
        const data = res.data
        setProducts(data.content ?? [])
        setTotalPages(data.totalPages ?? 1)
      } else {
        res = await listarProductos(p, 9)
        const data = res.data
        setProducts(data.content ?? [])
        setTotalPages(data.totalPages ?? 1)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchProducts(query, modeloId, 0)
      setPage(0)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, modeloId, fetchProducts])

  useEffect(() => {
    if (!query.trim()) fetchProducts('', modeloId, page)
  }, [page])

  function checkFade() {
    const el = scrollRef.current
    if (!el) return
    setFadeRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 2)
  }

  useEffect(() => {
    checkFade()
    window.addEventListener('resize', checkFade)
    return () => window.removeEventListener('resize', checkFade)
  }, [modelos])

  function selectModelo(id) {
    setModeloId(id)
    setPage(0)
  }

  function toggleMobileCols() {
    const next = mobileCols === 1 ? 2 : 1
    setMobileCols(next)
    localStorage.setItem(GRID_KEY, String(next))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#C0392B' }}>
                Quality Sports
              </span>
              <h1 className="text-2xl md:text-3xl font-bold mt-0.5" style={{ color: '#1C1C1E' }}>
                Catálogo
              </h1>
            </div>
            <p className="text-sm text-gray-400 hidden md:block">
              {loading ? '' : `${products.length} producto${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">

        {/* Search + toggle */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 flex-shrink-0"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por modelo o número..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white transition-colors focus:outline-none"
              style={{ border: '1px solid #E5E5E5', borderRadius: '12px' }}
              onFocus={e => e.target.style.borderColor = '#C0392B'}
              onBlur={e => e.target.style.borderColor = '#E5E5E5'}
            />
          </div>

          {/* Mobile col toggle */}
          <button
            onClick={toggleMobileCols}
            className="md:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center transition-colors bg-white"
            style={{ border: '1px solid #E5E5E5', borderRadius: '12px', color: '#6B7280' }}
            title="Cambiar vista"
          >
            {mobileCols === 1 ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/>
                <rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="8" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/>
              </svg>
            )}
          </button>
        </div>

        {/* Model filter — horizontal scroll on mobile, wrap on desktop */}
        {modelos.length > 0 && (
          <div className="relative mb-8">
            <div
              ref={scrollRef}
              onScroll={checkFade}
              className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <motion.button
                onClick={() => selectModelo(null)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-xl border text-sm font-medium transition-colors flex-shrink-0"
                style={{
                  backgroundColor: modeloId === null ? '#C0392B' : '#FFFFFF',
                  color: modeloId === null ? '#FFFFFF' : '#4B5563',
                  borderColor: modeloId === null ? '#C0392B' : '#E5E5E5',
                }}
              >
                Todos
              </motion.button>
              {modelos.map(m => (
                <ModeloCard
                  key={m.id}
                  modelo={m}
                  isSelected={modeloId === m.id}
                  onSelect={() => selectModelo(m.id)}
                />
              ))}
            </div>

            {/* Scroll hint — mobile only */}
            {fadeRight && (
              <div
                className="md:hidden absolute inset-y-0 right-0 w-14 pointer-events-none flex items-center justify-end pr-1"
                style={{ background: 'linear-gradient(to right, transparent, #FAFAFA 70%)' }}
              >
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* Mobile product count */}
        {!loading && (
          <p className="md:hidden text-xs text-gray-400 mb-4">
            {products.length} producto{products.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : error ? (
          <EmptyState
            icon="⚠️"
            title="Error de conexión"
            description="No pudimos cargar los productos. Verifica tu conexión."
            action={{ label: 'Reintentar', onClick: () => fetchProducts(query, modeloId, page) }}
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Sin resultados"
            description={query ? `No encontramos productos para "${query}".` : 'No hay productos en este modelo.'}
            action={{ label: 'Ver todos', onClick: () => { setQuery(''); selectModelo(null) } }}
          />
        ) : (
          <div className={`grid gap-4 ${mobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} md:grid-cols-3`}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: page === i ? '#C0392B' : '#FFFFFF',
                  color: page === i ? '#FFFFFF' : '#4B5563',
                  border: page === i ? '1px solid #C0392B' : '1px solid #E5E5E5',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
