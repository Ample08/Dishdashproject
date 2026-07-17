import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {BrandKey} from '../data/menu';
import {fetchActiveOrder, fetchOrder} from '../services/orderService';
import {useAuth} from './AuthContext';

/**
 * Active-order state shared by the Orders tab and the Order Status screen.
 * Once an order is placed it auto-advances through the fulfilment stages so the
 * status-dependent UIs (card chip, hero, timeline) update live.
 */
export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'pickedup';

export const ORDER_STAGES: OrderStatus[] = ['placed', 'preparing', 'ready', 'pickedup'];

export const STATUS_META: Record<
  OrderStatus,
  {chip: string; mid: string; heroTitle: string; heroSub: string; ready: boolean}
> = {
  placed: {
    chip: 'ORDER PLACED',
    mid: 'Ready in 15–20 min',
    heroTitle: 'Order received',
    heroSub: "We've sent it straight to the kitchen.",
    ready: false,
  },
  preparing: {
    chip: 'PREPARING',
    mid: 'Ready in 10–15 min',
    heroTitle: 'Cooking it fresh.',
    heroSub: 'Our chefs are plating your dishes.',
    ready: false,
  },
  ready: {
    chip: 'READY FOR PICKUP',
    mid: 'Ready now · grab it',
    heroTitle: 'Ready to grab!',
    heroSub: 'Your order is hot and waiting at the counter.',
    ready: true,
  },
  pickedup: {
    chip: 'PICKED UP',
    mid: 'Picked up · enjoy!',
    heroTitle: 'Enjoy, habibi!',
    heroSub: 'Thanks for ordering with us.',
    ready: true,
  },
};

/** A single line on the placed order (for the Order Status summary). */
export type OrderLine = {qty: number; name: string; price: number};

export type ActiveOrder = {
  id: string;
  brand: BrandKey;
  branch: string;
  itemCount: number;
  total: number;
  items: OrderLine[];
  status: OrderStatus;
};

type OrderValue = {
  active: ActiveOrder | null;
  /** Local/demo order placement (used as a fallback when the API is offline). */
  placeOrder: (o: Omit<ActiveOrder, 'id' | 'status'>) => void;
  /** Set an order that was created on the backend (has a real ref + status). */
  startOrder: (order: ActiveOrder) => void;
  advance: () => void;
  clearOrder: () => void;
};

const OrderContext = createContext<OrderValue | null>(null);

/** Poll / local-advance interval for live status changes. */
const ADVANCE_MS = 8000;

export function OrderProvider({children}: {children: React.ReactNode}) {
  const {token} = useAuth();
  const [active, setActive] = useState<ActiveOrder | null>(null);

  // On sign-in, pull the user's live (not-yet-collected) order from the backend
  // so a placed order still shows in the Orders tab after an app restart.
  useEffect(() => {
    if (!token) {
      setActive(null);
      return;
    }
    let cancelled = false;
    fetchActiveOrder()
      .then(o => {
        if (!cancelled && o) setActive(o);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  const placeOrder = useCallback((o: Omit<ActiveOrder, 'id' | 'status'>) => {
    setActive({...o, id: 'CRV-00123', status: 'placed'});
  }, []);

  const startOrder = useCallback((order: ActiveOrder) => {
    setActive(order);
  }, []);

  const clearOrder = useCallback(() => setActive(null), []);

  const advance = useCallback(() => {
    setActive(prev => {
      if (!prev) {
        return prev;
      }
      const i = ORDER_STAGES.indexOf(prev.status);
      if (i >= ORDER_STAGES.length - 1) {
        return prev;
      }
      return {...prev, status: ORDER_STAGES[i + 1]};
    });
  }, []);

  // Live status: poll the backend for the current stage; if it's unreachable
  // (or this is a local demo order) fall back to advancing on a timer.
  useEffect(() => {
    if (!active || active.status === 'pickedup') {
      return;
    }
    let cancelled = false;
    const orderId = active.id;

    const tick = async () => {
      try {
        const latest = await fetchOrder(orderId);
        if (!cancelled && latest) {
          setActive(prev =>
            prev && prev.id === latest.id
              ? {...prev, status: latest.status}
              : prev,
          );
        }
      } catch {
        if (!cancelled) {
          advance();
        }
      }
    };

    const t = setInterval(tick, ADVANCE_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [active, advance]);

  const value = useMemo<OrderValue>(
    () => ({active, placeOrder, startOrder, advance, clearOrder}),
    [active, placeOrder, startOrder, advance, clearOrder],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders(): OrderValue {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return ctx;
}
