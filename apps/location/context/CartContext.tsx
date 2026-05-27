'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../lib/rentman';
import { useRental } from './RentalContext';
import { calculateRentalFactor } from '../lib/pricing';

interface CartItem extends Product {
  quantity: number;
  cartItemId: string;
  selectedIngredients?: boolean;
  selectedFlavours?: Record<string, number>;
  customPriceAdjustment?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product, 
    quantity?: number, 
    options?: { 
      selectedIngredients?: boolean; 
      selectedFlavours?: Record<string, number>; 
      customPriceAdjustment?: number; 
    }
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
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
        const parsed = JSON.parse(savedCart);
        // Ensure all legacy items get a cartItemId
        const upgraded = parsed.map((item: any) => ({
          ...item,
          cartItemId: item.cartItemId || item.id
        }));
        setItems(upgraded);
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

  const addToCart = (
    product: Product, 
    quantity = 1, 
    options?: { 
      selectedIngredients?: boolean; 
      selectedFlavours?: Record<string, number>; 
      customPriceAdjustment?: number; 
    }
  ) => {
    // Unique ID based on product ID and selected options
    const suffix = options?.selectedIngredients && options?.selectedFlavours
      ? `_ingredients_${JSON.stringify(options.selectedFlavours)}`
      : '';
    const cartItemId = `${product.id}${suffix}`;

    setItems(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + quantity;
      
      // Check against stock_level if available
      if (product.stock_level !== undefined && newQty > product.stock_level) {
        // Limit to max available
        const allowedQty = product.stock_level;
        if (allowedQty <= 0) return prev; // Don't add if out of stock
        
        if (existing) {
          return prev.map(item => 
            item.cartItemId === cartItemId ? { ...item, quantity: allowedQty } : item
          );
        }
        return [...prev, { ...product, quantity: allowedQty, cartItemId, ...options }];
      }

      if (existing) {
        return prev.map(item => 
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { ...product, quantity, cartItemId, ...options }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setItems(prev => {
      const item = prev.find(i => i.cartItemId === cartItemId);
      if (item && item.stock_level !== undefined && quantity > item.stock_level) {
        quantity = item.stock_level;
      }
      return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item);
    });
  };

  const getItemQuantity = (productId: string) => {
    // For checking overall item count of a product, sum up all configs
    return items
      .filter(item => String(item.id) === String(productId))
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Apply Degressive Pricing Factor to the total
  const factor = calculateRentalFactor(durationInDays);
  const baseTotal = items.reduce((sum, item) => {
    const itemPrice = item.price + (item.customPriceAdjustment || 0);
    return sum + (itemPrice * item.quantity);
  }, 0);
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
