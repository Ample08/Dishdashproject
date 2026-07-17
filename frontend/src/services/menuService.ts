import {api, unwrap} from './api';
import {dashboardImages} from '../assets/dashboardImages';
import {
  ALL_ITEMS,
  BRANDS,
  ITEMS_BY_BRAND,
  KARAZ_ITEMS,
  JADE_ITEMS,
  type BrandInfo,
  type BrandKey,
  type MenuItem,
} from '../data/menu';

type ApiBrand = {
  brand_key: BrandKey;
  name: string;
  cuisine: string;
  tagline: string;
  rating: number | string;
  rating_count: string;
  price_level: string;
  tags: string;
  color: string;
  logo_key: string;
  branch: string;
  distance: string;
  address: string;
  prep_time: string;
  // Backend sends this as a JSON-encoded string, e.g. '["Mezze","Grills"]'.
  categories: string[] | string | null;
};

/** Normalize the backend `categories` (JSON string or array) to a string[]. */
function parseCategories(raw: string[] | string | null): string[] | undefined {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

type ApiMenuItem = {
  slug: string;
  brand_key: BrandKey;
  name: string;
  description: string;
  price: number | string;
  old_price: number | string | null;
  discount_pct: number | null;
  category: string;
  image_key: string;
  popular: boolean;
  sold_out: boolean;
};

const dishes = dashboardImages.dishes as unknown as Record<
  string,
  ReturnType<typeof require>
>;
const logos = dashboardImages as unknown as Record<
  string,
  ReturnType<typeof require>
>;

/** Re-attach the locally-bundled image the API references by key. */
function imageFor(key: string): ReturnType<typeof require> {
  return dishes[key] ?? dishes.hummus;
}

function mapItem(a: ApiMenuItem): MenuItem {
  return {
    id: a.slug,
    brand: a.brand_key,
    name: a.name ?? '',
    desc: a.description ?? '',
    price: Number(a.price),
    oldPrice: a.old_price != null ? Number(a.old_price) : undefined,
    discountPct: a.discount_pct ?? undefined,
    category: a.category,
    image: imageFor(a.image_key),
    popular: a.popular || undefined,
    soldOut: a.sold_out || undefined,
  };
}

export async function fetchBrands(): Promise<ApiBrand[]> {
  const res = await api.get('/api/app/brands');
  return unwrap(res);
}

export async function fetchMenu(params?: {
  brand?: BrandKey;
  category?: string;
}): Promise<MenuItem[]> {
  const res = await api.get('/api/app/menu', {params});
  return unwrap<ApiMenuItem[]>(res).map(mapItem);
}

/** Replace an array's contents in place so existing imports see fresh data. */
function replaceInPlace<T>(target: T[], next: T[]) {
  target.splice(0, target.length, ...next);
}

/**
 * Hydrate the local mock catalog (data/menu.ts) from the API, in place, so the
 * synchronously-rendered menu screens pick up live data. On any failure the
 * bundled mock data is left untouched (API-first with mock fallback).
 */
export async function hydrateMenu(): Promise<boolean> {
  try {
    const [apiBrands, apiItems] = await Promise.all([
      fetchBrands(),
      fetchMenu(),
    ]);

    // --- Brands: mutate each existing BrandInfo in place ---
    apiBrands.forEach(b => {
      const target = BRANDS[b.brand_key];
      if (!target) return;
      const patch: Partial<BrandInfo> = {
        name: b.name,
        cuisine: b.cuisine,
        tagline: b.tagline,
        rating: Number(b.rating),
        ratingCount: b.rating_count,
        priceLevel: b.price_level,
        tags: b.tags,
        color: b.color,
        logo: logos[b.logo_key] ?? target.logo,
        branch: b.branch,
        distance: b.distance,
        address: b.address,
        prepTime: b.prep_time,
        categories: parseCategories(b.categories) ?? target.categories,
      };
      Object.assign(target, patch);
    });

    // --- Items: rebuild the per-brand arrays and refresh the shared ones ---
    const karaz = apiItems.filter(i => i.brand === 'Karaz');
    const jade = apiItems.filter(i => i.brand === 'Jade');

    if (karaz.length) replaceInPlace(KARAZ_ITEMS, karaz);
    if (jade.length) replaceInPlace(JADE_ITEMS, jade);

    ITEMS_BY_BRAND.Karaz = KARAZ_ITEMS;
    ITEMS_BY_BRAND.Jade = JADE_ITEMS;
    replaceInPlace(ALL_ITEMS, [...KARAZ_ITEMS, ...JADE_ITEMS]);

    return true;
  } catch {
    // Keep the bundled mock data — the app still works fully offline.
    return false;
  }
}
