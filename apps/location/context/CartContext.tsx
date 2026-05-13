'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../lib/rentman';
import { useRental } from './RentalContext';
import { calculateRentalFactor } from '../lib/pricing';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
  factor: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { durationInDays } = useRental();

  // Load cart from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('au_location_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('au_location_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + quantity;
      
      // Check against stock_level if available
      if (product.stock_level !== undefined && newQty > product.stock_level) {
        // Limit to max available
        const allowedQty = product.stock_level;
        if (allowedQty <= 0) return prev; // Don't add if out of stock
        
        if (existing) {
          return prev.map(item => 
            item.id === product.id ? { ...item, quantity: allowedQty } : item
          );
        }
        return [...prev, { ...product, quantity: allowedQty }];
      }

      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prev => {
      const item = prev.find(i => i.id === productId);
      if (item && item.stock_level !== undefined && quantity > item.stock_level) {
        quantity = item.stock_level;
      }
      return prev.map(item => item.id === productId ? { ...item, quantity } : item);
    });
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Apply Degressive Pricing Factor to the total
  const factor = calculateRentalFactor(durationInDays);
  const baseTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPrice = Math.round(baseTotal * factor);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      itemCount,
      totalPrice,
      factor
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
