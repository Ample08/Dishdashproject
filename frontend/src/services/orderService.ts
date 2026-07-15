import {api, unwrap} from './api';
import type {BrandKey} from '../data/menu';
import type {ActiveOrder, OrderStatus} from '../state/OrderContext';

type ApiOrderItem = {slug: string | null; name: string; qty: number; price: number | string};

type ApiOrder = {
  order_ref: string;
  brand_key: BrandKey;
  branch: string | null;
  item_count: number;
  total: number | string;
  status: OrderStatus;
  items: ApiOrderItem[];
};

export type CreateOrderInput = {
  brand: BrandKey;
  branch?: string;
  paymentMethod?: string;
  items: {slug?: string; name: string; qty: number; price: number}[];
};

function mapOrder(a: ApiOrder): ActiveOrder {
  return {
    id: a.order_ref,
    brand: a.brand_key,
    branch: a.branch ?? '',
    itemCount: a.item_count,
    total: Number(a.total),
    items: a.items.map(i => ({
      name: i.name,
      qty: i.qty,
      price: Number(i.price),
    })),
    status: a.status,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<ActiveOrder> {
  const res = await api.post('/api/app/orders', input);
  return mapOrder(unwrap<ApiOrder>(res));
}

/** Latest not-yet-picked-up order, or null. Used to poll live status. */
export async function fetchActiveOrder(): Promise<ActiveOrder | null> {
  const res = await api.get('/api/app/orders/active');
  const data = unwrap<ApiOrder | null>(res);
  return data ? mapOrder(data) : null;
}

export async function fetchOrder(ref: string): Promise<ActiveOrder> {
  const res = await api.get(`/api/app/orders/${ref}`);
  return mapOrder(unwrap<ApiOrder>(res));
}
