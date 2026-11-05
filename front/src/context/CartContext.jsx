// ============================================================
// CartContext.jsx — إدارة سلة التسوق عبر الـ API
// ============================================================
// البيانات تُخزَّن في الداتابيز (مرتبطة بالتوكن/المستخدم)
// وتتزامن على كل الأجهزة
// ============================================================

import { createContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../services/api';
import { useAuth } from './useAuth';
import { getEffectivePrice, getRegularPrice, hasValidSalePrice } from '../utils/pricing';

const CartContext = createContext();

const mapCartItem = (item) => {
  const product = item.product || {};
  const discounted = hasValidSalePrice(product);
  return {
    itemId: item._id,
    id: product._id,
    name: product.name,
    price: getEffectivePrice(product),
    originalPrice: discounted ? getRegularPrice(product) : null,
    image: product.image || '',
    size: item.size,
    color: item.color,
    quantity: item.quantity,
  };
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useAuth();

  // ── جلب السلة من الـ API ─────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCartItems((data.cart || []).map(mapCartItem));
    } catch {
      console.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchCart(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchCart]);

  // ── إضافة منتج للسلة عبر الـ API ────────────────────────
  const addToCart = useCallback(async (product, quantity = 1, size = '', color = '') => {
    if (!isLoggedIn) {
      // Handle guest cart here if needed, but since we are forcing DB:
      // In this app, users must be logged in to use the cart properly.
      return;
    }
    const productId = product._id || product.id;
    try {
      const data = await cartApi.addToCart(productId, quantity, size, color);
      setCartItems((data.cart || []).map(mapCartItem));
    } catch {
      console.error('Failed to add to cart');
    }
  }, [isLoggedIn]);

  // ── تغيير الكمية عبر الـ API ─────────────────────────────
  const updateQuantity = useCallback(async (id, size, color, delta) => {
    if (!isLoggedIn) return;
    
    // إيجاد العنصر الحالي في السلة
    const existingItem = cartItems.find(
      item => item.id === id && item.size === size && item.color === color
    );
    
    if (!existingItem) return;
    
    const newQuantity = Math.max(1, existingItem.quantity + delta);
    
    try {
      const data = await cartApi.updateQuantity(existingItem.itemId, newQuantity);
      setCartItems((data.cart || []).map(mapCartItem));
    } catch {
      console.error('Failed to update quantity');
    }
  }, [cartItems, isLoggedIn]);

  // ── حذف عنصر عبر الـ API ────────────────────────────────
  const removeFromCart = useCallback(async (id, size, color) => {
    if (!isLoggedIn) return;
    
    const existingItem = cartItems.find(
      item => item.id === id && item.size === size && item.color === color
    );
    
    if (!existingItem) return;

    try {
      await cartApi.removeFromCart(existingItem.itemId);
      setCartItems(prev => prev.filter(item => item.itemId !== existingItem.itemId));
    } catch {
      console.error('Failed to remove from cart');
    }
  }, [cartItems, isLoggedIn]);

  // ── تفريغ السلة بالكامل ──────────────────────────────────
  const clearCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }
    try {
      await cartApi.clearCart();
      setCartItems([]);
    } catch {
      console.error('Failed to clear cart');
    }
  }, [isLoggedIn]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      subtotal,
      loading,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
