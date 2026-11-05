import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { ToastProvider } from './context/ToastContext'
import { WishlistProvider } from './context/WishlistContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { useLanguage } from './context/useLanguage'
import Home from './pages/Home'
import Layout from './components/Layout'
import GuestOverlay from './components/GuestOverlay'

const Login = lazy(() => import('./pages/Login'))
const ProductListing = lazy(() => import('./pages/ProductListing'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const RandomProduct = lazy(() => import('./pages/RandomProduct'))
const Cart = lazy(() => import('./pages/Cart'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AdminProducts = lazy(() => import('./pages/AdminProducts'))
const AdminCustomers = lazy(() => import('./pages/AdminCustomers'))
const AdminOrders = lazy(() => import('./pages/AdminOrders'))

const ProtectedAdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { t } = useLanguage();
  return (
    <div key={location.pathname} className={location.pathname === '/' ? undefined : 'page-enter'}>
      <Suspense fallback={<div className="min-h-[50svh] bg-bg" aria-label={t('common.loadingPage')} />}>
        <Routes location={location}>
          <Route path="/" element={<Layout><Home /></Layout>} />
        
          <Route path="/shop" element={<ProductListing />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/random" element={<RandomProduct />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedAdminRoute><AdminCustomers /></ProtectedAdminRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <GuestOverlay />
                  <AnimatedRoutes />
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
