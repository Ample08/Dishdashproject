import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import type {MenuItem} from '../data/menu';

/**
 * Lightweight cart state shared across the order flow
 * (Brand Page → Dish Detail → Cart → Payment → Order Status).
 */
export type CartLine = MenuItem & {qty: number};

type CartValue = {
  lines: CartLine[];
  add: (item: MenuItem, qty?: number) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  qtyOf: (id: string) => number;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({children}: {children: React.ReactNode}) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback((item: MenuItem, qty = 1) => {
    setLines(prev => {
      const found = prev.find(l => l.id === item.id);
      if (found) {
        return prev.map(l => (l.id === item.id ? {...l, qty: l.qty + qty} : l));
      }
      return [...prev, {...item, qty}];
    });
  }, []);

  const inc = useCallback((id: string) => {
    setLines(prev => prev.map(l => (l.id === id ? {...l, qty: l.qty + 1} : l)));
  }, []);

  const dec = useCallback((id: string) => {
    setLines(prev =>
      prev
        .map(l => (l.id === id ? {...l, qty: l.qty - 1} : l))
        .filter(l => l.qty > 0),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    return {
      lines,
      add,
      inc,
      dec,
      remove,
      clear,
      qtyOf: (id: string) => lines.find(l => l.id === id)?.qty ?? 0,
      count,
      subtotal,
    };
  }, [lines, add, inc, dec, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
