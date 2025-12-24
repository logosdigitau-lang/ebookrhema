import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book } from '../types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

export interface CartItem extends Book {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book) => Promise<void>;
  removeFromCart: (bookId: string) => Promise<void>;
  updateQuantity: (bookId: string, delta: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial cart
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        // Logged in: Load from Supabase
        try {
          // 1. Get or Create Cart
          let { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();

          if (!cart) {
            const { data: newCart, error } = await supabase.from('carts').insert({ user_id: user.id }).select().single();
            if (error) throw error;
            cart = newCart;
          }

          // 2. Check for local items to merge
          const localCartJson = localStorage.getItem('rhema_cart');
          if (localCartJson) {
            const localItems: CartItem[] = JSON.parse(localCartJson);
            if (localItems.length > 0) {
              // Merge logic: Upsert items to Supabase
              for (const item of localItems) {
                await supabase.from('cart_items').upsert({
                  cart_id: cart.id,
                  book_id: item.id,
                  quantity: item.quantity
                }, { onConflict: 'cart_id,book_id' }); // Conflict on unique constraint
              }
              // Clear local
              localStorage.removeItem('rhema_cart');
            }
          }

          // 3. Fetch Items
          const { data: cartItems, error: itemsError } = await supabase
            .from('cart_items')
            .select('*, book:books(*)') // Join with books
            .eq('cart_id', cart.id);

          if (itemsError) throw itemsError;

          // Transform to CartItem
          const formattedItems = cartItems.map((item: any) => ({
            ...item.book,
            quantity: item.quantity
          }));

          setItems(formattedItems);

        } catch (error) {
          console.error('Error loading cart:', error);
        }
      } else {
        // Guest: Load from LocalStorage
        const saved = localStorage.getItem('rhema_cart');
        setItems(saved ? JSON.parse(saved) : []);
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Sync to LocalStorage if Guest
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem('rhema_cart', JSON.stringify(items));
    }
  }, [items, user, loading]);

  const addToCart = async (book: Book) => {
    // Optimistic Update
    setItems(prev => {
      const existing = prev.find(item => item.id === book.id);
      if (existing) {
        return prev.map(item => item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...book, quantity: 1 }];
    });

    if (user) {
      try {
        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
        if (cart) {
          const currentItem = items.find(i => i.id === book.id);
          const quantity = currentItem ? currentItem.quantity + 1 : 1;

          await supabase.from('cart_items').upsert({
            cart_id: cart.id,
            book_id: book.id,
            quantity: quantity
          }, { onConflict: 'cart_id,book_id' });
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const updateQuantity = async (bookId: string, delta: number) => {
    let newQty = 0;

    setItems(prev => prev.map(item => {
      if (item.id === bookId) {
        newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));

    if (user) {
      try {
        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
        if (cart) {
          await supabase.from('cart_items').update({ quantity: newQty }).eq('cart_id', cart.id).eq('book_id', bookId);
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  };

  const removeFromCart = async (bookId: string) => {
    setItems(prev => prev.filter(item => item.id !== bookId));

    if (user) {
      try {
        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
        if (cart) {
          await supabase.from('cart_items').delete().eq('cart_id', cart.id).eq('book_id', bookId);
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      try {
        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
        if (cart) {
          await supabase.from('cart_items').delete().eq('cart_id', cart.id);
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
