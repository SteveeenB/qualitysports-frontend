import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { initPixel, getStoredConsent } from '../utils/metaPixel'

const CONSENT_KEY = 'qs_cookie_consent'
const POLICY_VERSION = '1.0'

export function saveConsent(marketing) {
  const c = { necesarias: true, marketing, timestamp: Date.now(), version: POLICY_VERSION }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(c))
}

export function clearConsent() {
  localStorage.removeItem(CONSENT_KEY)
}

export default function CookieConsentBanner() {
  const [visible, setVisible]     = useState(false)
  const [expanded, setExpanded]   = useState(false)

  useEffect(() => {
    if (!getStoredConsent()) setVisible(true)
  }, [])

  function accept(marketing) {
    saveConsent(marketing)
    if (marketing) initPixel()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ backgroundColor: '#1C1C1E', borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4">

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 leading-relaxed">
              Usamos cookies propias y de terceros para procesar tus pedidos, mejorar tu experiencia y,{' '}
              <strong className="text-white">si aceptas</strong>, mostrarte publicidad personalizada en Facebook e Instagram.
              Las cookies de marketing son gestionadas por{' '}
              <span className="text-gray-400">Meta Platforms Inc. (EE.UU.)</span>.{' '}
              <Link
                to="/politica-privacidad"
                className="underline transition-colors"
                style={{ color: '#C0392B' }}
              >
                Ver Política de Privacidad
              </Link>
            </p>

            {expanded && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs font-semibold text-white mb-1">Cookies necesarias</p>
                  <p className="text-xs text-gray-400">
                    Sesión de usuario, carrito de compras. Siempre activas — sin ellas el sitio no funciona.
                  </p>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs font-semibold text-white mb-1">Cookies de marketing</p>
                  <p className="text-xs text-gray-400">
                    <span className="font-medium text-gray-300">_fbp, _fbc</span> — Meta Pixel rastrea
                    eventos de compra para optimizar anuncios en Facebook/Instagram y medir conversiones.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              className="mt-2 text-xs underline transition-colors"
              style={{ color: '#9CA3AF' }}
            >
              {expanded ? 'Ocultar detalles' : 'Ver tipos de cookies'}
            </button>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => accept(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors"
              style={{
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#D1D5DB',
                backgroundColor: 'transparent',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#FFFFFF' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#D1D5DB' }}
            >
              Solo necesarias
            </button>
            <button
              type="button"
              onClick={() => accept(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#C0392B' }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = '#A93226' }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = '#C0392B' }}
            >
              Aceptar todo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
