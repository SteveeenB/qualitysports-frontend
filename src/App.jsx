import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/ui/ToastContainer'
import AppRouter from './router/AppRouter'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppRouter />
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
