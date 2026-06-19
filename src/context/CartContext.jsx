import { createContext, useContext, useState, useEffect, useRef } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('qs_cart') ?? '[]')
    } catch {
      return []
    }
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    localStorage.setItem('qs_cart', JSON.stringify(items))
  }, [items])

  function triggerToast(product, talla) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ product, talla })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  function dismissToast() {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(null)
  }

  function addItem(product, talla, cantidad = 1) {
    setItems(prev => {
      const key = `${product.id}-${talla}`
      const existing = prev.find(i => i.key === key)
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, cantidad: i.cantidad + cantidad } : i)
      }
      return [...prev, { key, product, talla, cantidad }]
    })
    triggerToast(product, talla)
  }

  function updateCantidad(key, cantidad) {
    if (cantidad <= 0) return removeItem(key)
    setItems(prev => prev.map(i => i.key === key ? { ...i, cantidad } : i))
  }

  function removeItem(key) {
    setItems(prev => prev.filter(i => i.key !== key))
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0)
  const subtotal   = items.reduce((sum, i) => sum + i.product.precioBase * i.cantidad, 0)

  return (
    <CartContext.Provider value={{
      items, drawerOpen, setDrawerOpen,
      addItem, updateCantidad, removeItem, clearCart,
      totalItems, subtotal,
      toast, dismissToast,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
