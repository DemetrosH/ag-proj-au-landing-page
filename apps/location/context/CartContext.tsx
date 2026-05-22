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
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
  factor: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { durationInDays, startDate, endDate } = useRental();

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

  // Validate cart items when dates or items change
  useEffect(() => {
    let active = true;
    
    const validateCartItems = async () => {
      if (items.length === 0) return;
      
      const validatedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const queryParams = new URLSearchParams({ id: item.id });
            if (startDate) queryParams.append('start', startDate);
            if (endDate) queryParams.append('end', endDate);

            const res = await fetch(`/location/api/rentman/availability?${queryParams.toString()}`);
            if (res.ok) {
              const data = await res.json();
              const available = data.available;
              if (item.quantity > available) {
                return { ...item, quantity: available };
              }
            }
          } catch (e) {
            console.error(`Failed to validate cart item ${item.id}`, e);
          }
          return item;
        })
      );

      if (!active) return;

      // Filter out items that are now at 0 quantity
      const filtered = validatedItems.filter(item => item.quantity > 0);
      
      // If there are any differences, update the cart state!
      const hasChanges = filtered.length !== items.length || 
        filtered.some((item, idx) => item.quantity !== (items[idx]?.quantity ?? 0));

      if (hasChanges) {
        setItems(filtered);
      }
    };

    // We can debounce this validation slightly to avoid multiple rapid queries
    const timeout = setTimeout(() => {
      validateCartItems();
    }, 500);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [startDate, endDate]);

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

  const getItemQuantity = (productId: string) => {
    return items.find(item => String(item.id) === String(productId))?.quantity || 0;
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
      getItemQuantity,
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
