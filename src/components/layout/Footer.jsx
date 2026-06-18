import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1C1C1E' }} className="text-white mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 pt-12 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Brand — 2 cols */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C0392B' }}>
                <span className="text-white text-xs font-black">QS</span>
              </div>
              <div className="leading-none">
                <span className="font-bold text-sm tracking-[0.08em]">QUALITY</span>
                <span className="block text-[9px] tracking-[0.3em] font-semibold" style={{ color: '#C0392B' }}>SPORTS</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Calzado deportivo de alta calidad para toda Colombia. Venta mayorista y al detal con atención personalizada.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="#"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                aria-label="WhatsApp"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                aria-label="Instagram"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">Tienda</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Catálogo', to: '/catalogo' },
                { label: 'Mis pedidos', to: '/mis-pedidos' },
                { label: 'Iniciar sesión', to: '/login' },
                { label: 'Registrarse', to: '/register' },
              ].map(l => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm transition-colors"
                    style={{ color: '#9CA3AF' }}
                    onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'}
                    onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">Contacto</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 flex-shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>+57 315 733 2742</span>
              </div>
              <div className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 flex-shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>qualitysports@gmail.com</span>
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs leading-relaxed text-gray-500">
                  Pago contraentrega — tu asesor confirma cada pedido por WhatsApp antes del despacho.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} Quality Sports — Todos los derechos reservados</span>
          <span>Colombia</span>
        </div>
      </div>
    </footer>
  )
}
