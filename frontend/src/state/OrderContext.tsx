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
  /** Set an order that was created on the backend (has a real ref + status). */
  startOrder: (order: ActiveOrder) => void;
  clearOrder: () => void;
};

const OrderContext = createContext<OrderValue | null>(null);

/** Backend poll interval for live status changes. */
const POLL_MS = 8000;

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

  const startOrder = useCallback((order: ActiveOrder) => {
    setActive(order);
  }, []);

  const clearOrder = useCallback(() => setActive(null), []);

  // Live status: poll the backend for the current stage. On a transient error
  // we keep the last known status (no fake progression).
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
        // Keep the last known status until the next successful poll.
      }
    };

    const t = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [active]);

  const value = useMemo<OrderValue>(
    () => ({active, startOrder, clearOrder}),
    [active, startOrder, clearOrder],
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
