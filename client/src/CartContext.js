import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product._id === product._id);
      if (existing) {
        return prev.map(i =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(i =>
      i.product._id === productId ? { ...i, quantity } : i
    ));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.product._id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
