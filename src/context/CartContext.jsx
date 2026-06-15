import { createContext, useContext, useState, useEffect } from 'react'

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

  useEffect(() => {
    localStorage.setItem('qs_cart', JSON.stringify(items))
  }, [items])

  function addItem(product, talla, cantidad = 1) {
    setItems(prev => {
      const key = `${product.id}-${talla}`
      const existing = prev.find(i => i.key === key)
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, cantidad: i.cantidad + cantidad } : i)
      }
      return [...prev, { key, product, talla, cantidad }]
    })
    setDrawerOpen(true)
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
      totalItems, subtotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
