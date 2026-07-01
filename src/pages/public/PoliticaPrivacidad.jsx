import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clearConsent } from '../../components/CookieConsentBanner'

const ULTIMA_ACTUALIZACION = '1 de julio de 2026'
const VERSION_POLITICA = '1.0'

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-[#1C1C1E] mb-3 pb-2" style={{ borderBottom: '2px solid #C0392B' }}>
        {title}
      </h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

function TableRow({ cols }) {
  return (
    <tr className="border-b border-gray-100">
      {cols.map((c, i) => (
        <td key={i} className="py-2 pr-4 text-xs align-top">{c}</td>
      ))}
    </tr>
  )
}

export default function PoliticaPrivacidad() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  function handleResetCookies() {
    clearConsent()
    window.location.reload()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Encabezado */}
      <div className="mb-10">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
          style={{ backgroundColor: '#FEF2F1', color: '#C0392B' }}>
          Versión {VERSION_POLITICA} · {ULTIMA_ACTUALIZACION}
        </div>
        <h1 className="text-3xl font-black text-[#1C1C1E] mb-3">Política de Tratamiento de Datos Personales</h1>
        <p className="text-gray-500 text-sm">
          Quality Sports — Cúcuta, Norte de Santander, Colombia
        </p>
      </div>

      {/* 1. Responsable */}
      <Section title="1. Responsable del Tratamiento">
        <p>
          <strong>Quality Sports</strong> (en adelante "nosotros" o "la empresa"), con domicilio en
          la ciudad de Cúcuta, Norte de Santander, Colombia, es el responsable del tratamiento de
          los datos personales recolectados a través de este sitio web y sus formularios.
        </p>
        <p>
          <strong>Canal de contacto para asuntos de privacidad:</strong><br />
          Correo electrónico: <a href="mailto:qualitysports414@gmail.com" className="underline" style={{ color: '#C0392B' }}>qualitysports414@gmail.com</a><br />
          Teléfono: +57 315 733 2742
        </p>
        <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
          Esta política fue elaborada en cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong>,
          el <strong>Decreto 1377 de 2013</strong> y el <strong>Decreto 1074 de 2015</strong> de la República de Colombia,
          y de las <strong>Meta Business Tools Terms</strong> de Meta Platforms Inc.
        </p>
      </Section>

      {/* 2. Datos */}
      <Section title="2. Datos Personales que Recolectamos">
        <p>Recolectamos los siguientes datos según la fuente:</p>
        <table className="w-full mt-3 border border-gray-100 rounded-xl overflow-hidden">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 text-left" style={{ backgroundColor: '#F5F5F5' }}>
              <th className="py-2 pr-4 pl-3">Fuente</th>
              <th className="py-2 pr-4">Datos recolectados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <TableRow cols={['Formulario de pedido', 'Nombre y apellido, número de cédula, teléfono, correo electrónico, departamento, municipio, dirección de envío, barrio']} />
            <TableRow cols={['Meta Pixel (Facebook)', 'Dirección IP, user agent del navegador, URL visitada, eventos de comportamiento (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase)']} />
            <TableRow cols={['Conversions API (CAPI)', 'Los mismos datos del formulario, enviados al servidor de Meta con hash SHA-256 para protección']} />
            <TableRow cols={['Cookies del navegador', '_fbp (identificador de navegador generado por Meta Pixel), _fbc (identificador de clic en anuncio de Facebook)']} />
            <TableRow cols={['Registro de usuario (opcional)', 'Correo electrónico, nombre, teléfono, dirección (para clientes que crean cuenta)']} />
          </tbody>
        </table>
        <p className="mt-3">
          <strong>No recolectamos</strong> datos sensibles como información biométrica, datos de salud,
          ideología política o información financiera más allá de los datos de entrega del pedido.
          Los pagos se realizan contra entrega — no procesamos información de tarjetas de crédito.
        </p>
      </Section>

      {/* 3. Finalidades */}
      <Section title="3. Finalidades del Tratamiento">
        <table className="w-full mt-2 border border-gray-100 rounded-xl overflow-hidden">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 text-left" style={{ backgroundColor: '#F5F5F5' }}>
              <th className="py-2 pr-4 pl-3">Finalidad</th>
              <th className="py-2 pr-4">Base legal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <TableRow cols={['Procesamiento y entrega del pedido', 'Ejecución del contrato de compraventa (Ley 1581, Art. 10 lit. b)']} />
            <TableRow cols={['Asignación de asesor de ventas y comunicación por WhatsApp', 'Ejecución del contrato']} />
            <TableRow cols={['Servicio al cliente y soporte postventa', 'Interés legítimo / ejecución del contrato']} />
            <TableRow cols={['Publicidad personalizada y retargeting en Facebook e Instagram', 'Consentimiento del titular (opcional)']} />
            <TableRow cols={['Medición de conversiones y optimización de campañas publicitarias', 'Consentimiento del titular (opcional)']} />
            <TableRow cols={['Prevención de fraude y seguridad de la plataforma', 'Interés legítimo']} />
            <TableRow cols={['Gestión interna: estadísticas, KPIs de ventas', 'Interés legítimo']} />
          </tbody>
        </table>
        <p className="mt-3">
          Los datos del formulario de pedido (nombre, teléfono, dirección) se tratan de forma{' '}
          <strong>obligatoria</strong> para procesar la compra. Los datos para publicidad personalizada
          se tratan <strong>solo con tu consentimiento expreso</strong>.
        </p>
      </Section>

      {/* 4. Terceros */}
      <Section title="4. Terceros que Reciben tus Datos">
        <table className="w-full mt-2 border border-gray-100 rounded-xl overflow-hidden">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 text-left" style={{ backgroundColor: '#F5F5F5' }}>
              <th className="py-2 pr-4 pl-3">Tercero</th>
              <th className="py-2 pr-4">Datos compartidos</th>
              <th className="py-2 pr-4">Finalidad</th>
              <th className="py-2 pr-4">País</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <TableRow cols={['Meta Platforms Inc.', 'Email/teléfono hasheados, IP, user agent, eventos de compra', 'Publicidad y medición (solo con consentimiento)', 'EE.UU.']} />
            <TableRow cols={['Heka Entrega', 'Nombre, teléfono, dirección, municipio, DANE', 'Generación de guía de envío y seguimiento', 'Colombia']} />
            <TableRow cols={['Supabase Inc.', 'Todos los datos de la plataforma', 'Almacenamiento de base de datos e imágenes', 'EE.UU.']} />
            <TableRow cols={['Proveedor de infraestructura (hosting)', 'Datos de tráfico y logs del servidor', 'Operación del sitio web', 'Variable']} />
          </tbody>
        </table>
        <p className="mt-3">
          No vendemos, arrendamos ni cedemos tus datos personales a terceros para sus propios fines comerciales.
          Los datos compartidos con los terceros anteriores se limitan a lo estrictamente necesario para
          cada finalidad descrita.
        </p>
      </Section>

      {/* 5. Transferencias internacionales */}
      <Section title="5. Transferencias Internacionales de Datos">
        <p>
          Algunos de los terceros listados (Meta Platforms Inc. y Supabase Inc.) están ubicados en
          los <strong>Estados Unidos de América</strong>. Al usar este sitio web y aceptar esta política,
          autorizas la transferencia de tus datos personales a dicho país para los fines descritos.
        </p>
        <p>
          Estas transferencias se realizan bajo mecanismos contractuales apropiados. Meta Platforms Inc.
          es firmante del Marco de Privacidad de Datos UE-EE.UU. y cumple estándares equivalentes de
          protección de datos.
        </p>
        <p>
          Los datos enviados a Meta Conversions API son <strong>hasheados con SHA-256</strong> antes
          de la transmisión, lo que significa que Meta recibe una representación criptográfica
          unidireccional de tu información, no los datos en texto plano.
        </p>
      </Section>

      {/* 6. Cookies */}
      <Section title="6. Cookies y Tecnologías de Rastreo">
        <p>
          Usamos las siguientes cookies. Puedes gestionar tu preferencia en cualquier momento usando el
          botón al final de esta sección.
        </p>
        <table className="w-full mt-3 border border-gray-100 rounded-xl overflow-hidden">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 text-left" style={{ backgroundColor: '#F5F5F5' }}>
              <th className="py-2 pr-4 pl-3">Cookie</th>
              <th className="py-2 pr-4">Tipo</th>
              <th className="py-2 pr-4">Finalidad</th>
              <th className="py-2 pr-4">Duración</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <TableRow cols={['Sesión de usuario (JWT)', 'Necesaria', 'Mantener la sesión del cliente autenticado', 'Sesión / 6 horas']} />
            <TableRow cols={['Carrito de compras (localStorage)', 'Necesaria', 'Recordar los productos en el carrito', 'Hasta que se vacíe']} />
            <TableRow cols={['_fbp', 'Marketing (requiere consentimiento)', 'Meta Pixel: identificar el navegador para atribución de anuncios', '90 días']} />
            <TableRow cols={['_fbc', 'Marketing (requiere consentimiento)', 'Meta Pixel: rastrear clics en anuncios de Facebook/Instagram', '90 días']} />
            <TableRow cols={['qs_cookie_consent (localStorage)', 'Necesaria', 'Guardar tu preferencia de cookies para no volver a preguntar', '12 meses']} />
          </tbody>
        </table>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleResetCookies}
            className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors"
            style={{ borderColor: '#C0392B', color: '#C0392B', backgroundColor: '#FEF2F1' }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#C0392B'; e.currentTarget.style.color = '#FFFFFF' }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = '#FEF2F1'; e.currentTarget.style.color = '#C0392B' }}
          >
            Cambiar mis preferencias de cookies
          </button>
        </div>
      </Section>

      {/* 7. Retención */}
      <Section title="7. Retención de Datos">
        <table className="w-full mt-2 border border-gray-100 rounded-xl overflow-hidden">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 text-left" style={{ backgroundColor: '#F5F5F5' }}>
              <th className="py-2 pr-4 pl-3">Categoría de dato</th>
              <th className="py-2 pr-4">Período de retención</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <TableRow cols={['Datos de pedido (nombre, dirección, productos, total)', '5 años — obligación tributaria y contable bajo legislación colombiana']} />
            <TableRow cols={['Datos de cuenta de cliente (email, nombre, teléfono)', '3 años después de la última interacción o hasta que solicites eliminación']} />
            <TableRow cols={['Historial de estados del pedido', '5 años']} />
            <TableRow cols={['Datos de comportamiento (eventos Meta Pixel)', '12 meses (definido por Meta según sus políticas)']} />
            <TableRow cols={['Registro de consentimiento (qué aceptaste y cuándo)', '5 años — evidencia para posibles auditorías SIC']} />
          </tbody>
        </table>
        <p className="mt-3">
          Los datos necesarios para cumplir obligaciones legales (tributarias, mercantiles) se conservarán
          por el tiempo exigido por la ley, incluso si solicitas la eliminación de tu cuenta.
        </p>
      </Section>

      {/* 8. Seguridad */}
      <Section title="8. Medidas de Seguridad">
        <p>Implementamos las siguientes medidas técnicas y organizacionales para proteger tus datos:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>HTTPS:</strong> Toda la comunicación entre tu navegador y nuestros servidores está cifrada con TLS.</li>
          <li><strong>Hashing SHA-256:</strong> Antes de enviar datos a Meta Conversions API, hasheamos irreversiblemente email, teléfono, nombre y apellido.</li>
          <li><strong>Autenticación JWT:</strong> Las sesiones de usuario están protegidas con tokens firmados de tiempo limitado (6 horas).</li>
          <li><strong>Control de acceso por roles:</strong> Solo el personal autorizado (asesores y administradores) puede ver datos de clientes, y solo los propios para su rol.</li>
          <li><strong>Credenciales en variables de entorno:</strong> Ninguna credencial sensible está hardcodeada en el código fuente.</li>
          <li><strong>Sanitización de logs:</strong> Los registros del servidor no almacenan datos personales completos ni tokens de acceso.</li>
        </ul>
      </Section>

      {/* 9. Derechos */}
      <Section title="9. Derechos del Titular de los Datos">
        <p>
          De acuerdo con la Ley 1581 de 2012, tienes los siguientes derechos sobre tus datos personales:
        </p>
        <table className="w-full mt-3 border border-gray-100 rounded-xl overflow-hidden">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 text-left" style={{ backgroundColor: '#F5F5F5' }}>
              <th className="py-2 pr-4 pl-3">Derecho</th>
              <th className="py-2 pr-4">Descripción</th>
              <th className="py-2 pr-4">Plazo de respuesta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <TableRow cols={['Acceso', 'Conocer qué datos tuyos tenemos y cómo los usamos', '10 días hábiles']} />
            <TableRow cols={['Rectificación', 'Corregir datos inexactos o incompletos', '15 días hábiles']} />
            <TableRow cols={['Cancelación / Eliminación', 'Solicitar la eliminación de tus datos (salvo obligaciones legales)', '15 días hábiles']} />
            <TableRow cols={['Oposición', 'Oponerte al tratamiento para fines de marketing', 'Inmediato']} />
            <TableRow cols={['Revocación del consentimiento', 'Retirar el consentimiento para tratamientos basados en él (marketing)', 'Inmediato para futuros tratamientos']} />
          </tbody>
        </table>
        <p className="mt-3">
          Para ejercer cualquiera de estos derechos, escríbenos a{' '}
          <a href="mailto:qualitysports414@gmail.com" className="underline" style={{ color: '#C0392B' }}>
            qualitysports414@gmail.com
          </a>{' '}
          indicando tu nombre completo, el derecho que deseas ejercer y adjuntando copia de tu documento
          de identidad. Responderemos dentro de los plazos señalados.
        </p>
        <p>
          Si considerás que hemos vulnerado tus derechos, puedes presentar una queja ante la{' '}
          <strong>Superintendencia de Industria y Comercio (SIC)</strong> en{' '}
          <a
            href="https://www.sic.gov.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: '#C0392B' }}
          >
            www.sic.gov.co
          </a>.
        </p>
      </Section>

      {/* 10. Menores */}
      <Section title="10. Datos de Menores de Edad">
        <p>
          Este sitio web no está dirigido a personas menores de 18 años y no recolectamos
          intencionalmente datos de menores. Si detectamos que hemos recolectado datos de un menor
          sin el consentimiento de sus padres o tutores, los eliminaremos inmediatamente.
        </p>
      </Section>

      {/* 11. Cambios */}
      <Section title="11. Cambios a Esta Política">
        <p>
          Podemos actualizar esta política en cualquier momento. Cuando lo hagamos, notificaremos
          el cambio actualizando la fecha de "Última actualización" en la parte superior de esta página.
          Si los cambios son sustanciales (nuevas finalidades, nuevos terceros), te lo notificaremos
          por correo electrónico si tienes cuenta registrada.
        </p>
        <p>
          El uso continuado del sitio después de la fecha de actualización constituye tu aceptación
          de la nueva versión de la política.
        </p>
      </Section>

      {/* Footer de la política */}
      <div className="mt-10 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid #E5E7EB' }}>
        <p className="text-xs text-gray-400">
          Versión {VERSION_POLITICA} · Última actualización: {ULTIMA_ACTUALIZACION}
        </p>
        <Link
          to="/"
          className="text-xs font-medium transition-colors"
          style={{ color: '#C0392B' }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
