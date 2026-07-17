import {api, unwrap} from './api';
import {
  EXPERIENCES,
  POINT_HISTORY,
  type Experience,
  type LoyaltyBooking,
  type PointEntry,
  type Voucher,
} from '../data/loyalty';
import type {BrandKey} from '../data/menu';

/** Local photo per experience key (the API doesn't ship images). */
const EXP_PHOTOS: Record<string, ReturnType<typeof require>> = {
  'x-chefs-table': require('../assets/reservations/branch-dubai-mall.jpg'),
  'x-private-dining': require('../assets/reservations/branch-yas-island.jpg'),
  'x-weekend-special': require('../assets/reservations/branch-creek.jpg'),
};
const DEFAULT_EXP_PHOTO = require('../assets/reservations/branch-dubai-mall.jpg');

/** Backend list fields can arrive as a JSON string; normalize to string[]. */
function toList(raw: string[] | string | null | undefined): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

type ApiVoucher = {
  id: string; // == voucher_key
  kind: Voucher['kind'];
  label: string;
  title: string;
  discount: string;
  scope: string;
  sub: string;
  action: string;
  status: Voucher['status'];
  code: string;
  guests: number | null;
};

type ApiExperience = {
  exp_key: string;
  brand: string | null;
  title: string | null;
  location: string | null;
  description: string | null;
  pts: number | string | null;
  value: string | null;
  tags: string[] | string | null;
  eligible: boolean | null;
  need_more: number | null;
};

type ApiPointEntry = {
  id: string;
  title: string;
  sub: string;
  delta: number;
  icon: string;
};

function mapVoucher(a: ApiVoucher): Voucher {
  return {
    id: a.id,
    kind: a.kind,
    label: a.label,
    title: a.title,
    discount: a.discount,
    scope: a.scope,
    sub: a.sub,
    action: a.action,
    status: a.status,
    code: a.code,
    guests: a.guests ?? undefined,
  };
}

export async function fetchSummary(): Promise<{points: number}> {
  const res = await api.get('/api/app/loyalty/summary');
  return unwrap(res);
}

export async function fetchVouchers(): Promise<Voucher[]> {
  const res = await api.get('/api/app/loyalty/vouchers');
  return unwrap<ApiVoucher[]>(res).map(mapVoucher);
}

export async function claimVoucher(key: string): Promise<Voucher> {
  const res = await api.post(`/api/app/loyalty/vouchers/${key}/claim`);
  return mapVoucher(unwrap<ApiVoucher>(res));
}

export async function redeemVoucher(key: string): Promise<Voucher> {
  const res = await api.post(`/api/app/loyalty/vouchers/${key}/redeem`);
  return mapVoucher(unwrap<ApiVoucher>(res));
}

export async function generateCelebration(guests: number): Promise<Voucher> {
  const res = await api.post('/api/app/loyalty/celebration', {guests});
  return mapVoucher(unwrap<ApiVoucher>(res));
}

/** Refresh the bundled point-history list in place (keeps local icons). */
export async function hydratePointHistory(): Promise<boolean> {
  try {
    const res = await api.get('/api/app/loyalty/point-history');
    const rows = unwrap<ApiPointEntry[]>(res);
    if (rows.length) {
      POINT_HISTORY.splice(
        0,
        POINT_HISTORY.length,
        ...rows.map(r => ({
          id: r.id,
          title: r.title,
          sub: r.sub,
          delta: r.delta,
          icon: r.icon,
        })),
      );
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchLoyaltyBookings(): Promise<LoyaltyBooking[]> {
  const res = await api.get('/api/app/loyalty/bookings');
  return unwrap<LoyaltyBooking[]>(res);
}

/** Full experiences catalogue straight from the API (all brands). */
export async function fetchExperiences(): Promise<Experience[]> {
  const res = await api.get('/api/app/loyalty/experiences');
  return unwrap<ApiExperience[]>(res).map(r => ({
    id: r.exp_key,
    brand: (r.brand ?? 'Karaz') as BrandKey,
    title: r.title ?? 'Experience',
    location: r.location ?? '',
    desc: r.description ?? '',
    pts: Number(r.pts ?? 0),
    value: r.value ?? '',
    tags: toList(r.tags),
    eligible: r.eligible ?? false,
    needMore: r.need_more ?? undefined,
    photo: EXP_PHOTOS[r.exp_key] ?? DEFAULT_EXP_PHOTO,
  }));
}

/** Full point-history transaction list from the API. */
export async function fetchPointHistory(): Promise<PointEntry[]> {
  const res = await api.get('/api/app/loyalty/point-history');
  return unwrap<ApiPointEntry[]>(res).map(r => ({
    id: r.id,
    title: r.title,
    sub: r.sub,
    delta: r.delta,
    icon: r.icon,
  }));
}

export async function bookExperience(
  key: string,
  payload?: {dateLabel?: string; inDays?: number},
): Promise<LoyaltyBooking> {
  const res = await api.post(`/api/app/loyalty/experiences/${key}/book`, payload ?? {});
  return unwrap<LoyaltyBooking>(res);
}

/** Refresh the bundled experiences catalog text in place (keeps local photos). */
export async function hydrateExperiences(): Promise<boolean> {
  try {
    const res = await api.get('/api/app/loyalty/experiences');
    const rows = unwrap<ApiExperience[]>(res);
    rows.forEach(r => {
      const target = EXPERIENCES.find(e => e.id === r.exp_key);
      if (!target) return;
      target.title = r.title ?? target.title;
      target.location = r.location ?? target.location ?? '';
      target.desc = r.description ?? target.desc ?? '';
      target.pts = Number(r.pts ?? target.pts);
      target.value = r.value ?? target.value ?? '';
      target.tags = toList(r.tags).length ? toList(r.tags) : target.tags;
      target.eligible = r.eligible ?? target.eligible;
      target.needMore = r.need_more ?? undefined;
    });
    return true;
  } catch {
    return false;
  }
}
