import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO').format(n)
}

export default function Confirmacion() {
  const { id } = useParams()
  const { state } = useLocation()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(t)
  }, [])

  const data = state ?? {}

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Checkmark animado */}
      <div
        className={`w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 transition-all duration-500
          ${animate ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-2">¡Pedido registrado exitosamente!</h1>
      <p className="text-gray-500 text-sm mb-8">
        Tu pedido ha sido recibido y será confirmado por uno de nuestros asesores.
      </p>

      {/* Ticket */}
      <div className="bg-white border border-dashed border-gray-200 rounded-2xl px-6 py-5 text-left mb-6">
        {id && (
          <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
            <span className="text-sm text-gray-500">N° de pedido</span>
            <span className="font-bold text-[#1C1C1E]">#{String(id).padStart(4, '0')}</span>
          </div>
        )}
        {data.subtotal != null && (
          <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="font-medium">${formatCOP(data.subtotal)} COP</span>
          </div>
        )}
        {data.descuentoAplicado > 0 && (
          <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
            <span className="text-sm text-[#C0392B]">Descuento</span>
            <span className="font-medium text-[#C0392B]">-${formatCOP(data.descuentoAplicado)} COP</span>
          </div>
        )}
        {data.totalNeto != null && (
          <div className="flex justify-between items-center py-2.5">
            <span className="font-bold text-[#1C1C1E]">Total</span>
            <span className="font-bold text-[#C0392B] text-lg">${formatCOP(data.totalNeto)} COP</span>
          </div>
        )}
      </div>

      {/* WhatsApp */}
      <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-start gap-3 mb-6 text-left">
        <span className="text-green-600 mt-0.5">💬</span>
        <p className="text-sm text-green-800">
          <strong>Serás redirigido al WhatsApp del asesor asignado</strong> para formalizar tu pedido. El pago es contraentrega.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {data.whatsappUrl && (
          <a
            href={data.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            💬 Continuar por WhatsApp
          </a>
        )}
        <Link
          to="/mis-pedidos"
          className="text-sm text-[#C0392B] font-medium hover:underline"
        >
          Ver mis pedidos →
        </Link>
        <Link
          to="/catalogo"
          className="text-sm text-gray-400 hover:text-[#C0392B] transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
