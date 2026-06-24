const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID

/**
 * Inyecta el script de Meta Pixel en <head> e inicializa el pixel.
 * Llamar UNA sola vez en main.jsx antes de render().
 * No hace nada si VITE_META_PIXEL_ID está vacío (entorno local).
 */
export function initPixel() {
  if (!PIXEL_ID) return
  if (window.fbq) return  // Guard contra doble-invocación (StrictMode)

  /* eslint-disable */
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */

  window.fbq('init', PIXEL_ID)
}

// ── Helper interno ────────────────────────────────────────────────────────────

function track(eventName, params = {}, eventId = null) {
  if (!PIXEL_ID || typeof window.fbq !== 'function') return
  const options = eventId ? { eventID: eventId } : {}
  window.fbq('track', eventName, params, options)
}

// ── Lee una cookie del navegador por nombre ───────────────────────────────────

export function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

// ── Eventos estándar ─────────────────────────────────────────────────────────

export function pixelPageView() {
  track('PageView')
}

export function pixelViewContent({ productId, productName, price }) {
  track('ViewContent', {
    content_ids:  [String(productId)],
    content_name: productName,
    content_type: 'product',
    value:        price,
    currency:     'COP',
  }, crypto.randomUUID())
}

export function pixelSearch({ searchString }) {
  if (!searchString?.trim()) return
  track('Search', { search_string: searchString }, crypto.randomUUID())
}

export function pixelAddToCart({ productId, productName, price }) {
  track('AddToCart', {
    content_ids:  [String(productId)],
    content_name: productName,
    content_type: 'product',
    value:        price,
    currency:     'COP',
  }, crypto.randomUUID())
}

export function pixelInitiateCheckout({ value, numItems }) {
  track('InitiateCheckout', {
    value,
    currency:  'COP',
    num_items: numItems,
  }, crypto.randomUUID())
}

/**
 * Evento Purchase — usa el eventId del backend para deduplicación pixel↔CAPI.
 * @param {string} orderId  ID del pedido
 * @param {number} value    Total neto pagado
 * @param {string} eventId  UUID retornado por el backend en metaEventId
 */
export function pixelPurchase({ orderId, value, eventId }) {
  track('Purchase', {
    content_type: 'product',
    order_id:     String(orderId),
    value,
    currency:     'COP',
  }, eventId ?? crypto.randomUUID())
}
