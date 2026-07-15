/**
 * Loyalty data model — tiers ("Luminous climb" palette), aurora colours,
 * earn-marquee copy, vouchers, experiences, bookings and point history.
 * Source: Figma "Flavours" Loyalty section + CONCEPT · Tier Palette (4817:6).
 *
 * NOTE: Loyalty runs on a DARK aurora theme, separate from the ivory app.
 */
import type {BrandKey} from './menu';

/** Dark-theme palette for the loyalty surface. */
export const loyaltyColors = {
  bgTop: '#102b2f',
  bgall: '#1B4A55',
  bgBottom: '#061416',
  auroraMint: '#b8e5c8', // rgba(184,229,200)
  auroraJade: '#7dc9a0', // rgba(125,201,160)
  auroraGold: '#f5d85c', // Figma "Hot Accent" warm glow
  chipBg: '#3b6167',
  chipBorder: '#768c84',
  surfaceTeal: '#1d4148', // inset boxes / stepper card
  cardOnDark: '#ffffff',
} as const;

export type TierKey = 'taste' | 'savor' | 'feast' | 'gourmet';

export type Tier = {
  key: TierKey;
  name: string;
  color: string;
  min: number;
  perk: string | null; // dine-in discount
};

/** "Luminous climb" — canonical palette ranges. */
export const TIERS: Tier[] = [
  {key: 'taste', name: 'Taste', color: '#E5B870', min: 0, perk: null},
  {key: 'savor', name: 'Savor', color: '#F4A574', min: 1000, perk: '5% OFF'},
  {key: 'feast', name: 'Feast', color: '#7DC9A0', min: 3000, perk: '10% OFF'},
  {key: 'gourmet', name: 'Gourmet', color: '#D9E0F0', min: 7000, perk: '15% OFF'},
];

export function tierForPoints(points: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (points >= t.min) {
      current = t;
    }
  }
  return current;
}

export function nextTier(points: number): Tier | null {
  const idx = TIERS.findIndex(t => t.key === tierForPoints(points).key);
  return TIERS[idx + 1] ?? null;
}

/** Fraction (0–1) filled within the current tier band, for the progress ring. */
export function tierProgress(points: number): number {
  const cur = tierForPoints(points);
  const nxt = nextTier(points);
  if (!nxt) {
    return 1;
  }
  return Math.min(1, Math.max(0, (points - cur.min) / (nxt.min - cur.min)));
}

/** Looping ticker copy under the loyalty header (EarnMarquee 4039:178). */
export const EARN_MARQUEE = [
  'Earn 1 point per 5 AED you spend',
  'Refer a friend, you both get 100 pts',
  'Dine-in at any brand earns same rate',
  'Feast tier auto-applies 10% off',
];

export type VoucherKind = 'welcome' | 'celebration';
export type VoucherStatus = 'pending' | 'available' | 'claimed' | 'used';

export type Voucher = {
  id: string;
  kind: VoucherKind;
  label: string; // 'WELCOME OFFER'
  title: string; // 'Welcome'
  discount: string; // '10%'
  scope: string; // 'DINE-IN ONLY' / 'PARTIES OF 10+'
  sub: string; // 'First dine-in' / 'Parties of 10+'
  action: string; // 'Unlock' / 'Generate'
  status: VoucherStatus;
  code: string;
  guests?: number; // celebration party size
};

export const SEED_VOUCHERS: Voucher[] = [
  {
    id: 'v-welcome',
    kind: 'welcome',
    label: 'WELCOME OFFER',
    title: 'Welcome',
    discount: '10%',
    scope: 'DINE-IN ONLY',
    sub: 'First dine-in',
    action: 'Unlock',
    status: 'pending',
    code: 'WELCOME-A3F2K9',
  },
  {
    id: 'v-celebration',
    kind: 'celebration',
    label: 'CELEBRATION OFFER',
    title: 'Celebration',
    discount: '20%',
    scope: 'PARTIES OF 10+',
    sub: 'Parties of 10+',
    action: 'Generate',
    status: 'available',
    code: 'CELEB-R7K4M2',
  },
  // A previously redeemed voucher so the "Used" tab has content out of the box.
  {
    id: 'v-welcome-used',
    kind: 'welcome',
    label: 'WELCOME OFFER',
    title: 'Welcome',
    discount: '10%',
    scope: 'DINE-IN ONLY',
    sub: 'First dine-in',
    action: 'Used',
    status: 'used',
    code: 'WELCOME-K9M2P4',
  },
];

/** "How to redeem" steps (WelcomeRevealOverlay 4068:345). */
export const REDEEM_STEPS = [
  'Tap voucher card to reveal your code',
  'Show the code on screen to restaurant staff',
  'Staff verifies the code and applies discount on POS',
  'You still earn loyalty points on the discounted bill',
];

/** "How It Works" steps for celebration generation (31 · 3286:6). */
export const CELEBRATION_STEPS = [
  'Confirm party of 10 or more',
  'Generate your unique celebration code',
  'Show code to staff at any Karaz or Jade dine-in',
  'Staff verifies party size and applies 20% OFF',
  'You still earn loyalty points on the discounted bill',
];

export type Experience = {
  id: string;
  brand: BrandKey;
  title: string;
  location: string;
  desc: string;
  pts: number;
  value: string; // 'AED 250 value'
  tags: string[];
  eligible: boolean;
  needMore?: number; // pts needed when locked
  photo: ReturnType<typeof require>;
};

export const EXPERIENCES: Experience[] = [
  {
    id: 'x-chefs-table',
    brand: 'Jade',
    title: "Chef's Table",
    location: 'Jade · Dubai Mall',
    desc: 'Three-course tasting curated by our head chef. Seasonal ingredients, served at the kitchen counter with chef commentary.',
    pts: 800,
    value: 'AED 250 value',
    tags: ['Table for 2–4', '~2 hrs', 'Halal'],
    eligible: true,
    photo: require('../assets/reservations/branch-dubai-mall.jpg'),
  },
  {
    id: 'x-private-dining',
    brand: 'Jade',
    title: 'Private Dining Room',
    location: 'Jade · Dubai Mall',
    desc: 'An intimate room for your table — curated menu, dedicated service, skyline views.',
    pts: 2000,
    value: 'AED 600 value',
    tags: ['Table for 6–10', '~3 hrs', 'Halal'],
    eligible: false,
    needMore: 750,
    photo: require('../assets/reservations/branch-yas-island.jpg'),
  },
  {
    id: 'x-weekend-special',
    brand: 'Karaz',
    title: 'Weekend Special',
    location: 'Karaz · JBR',
    desc: 'Sommelier-led pairing with our seasonal menu and live oud.',
    pts: 1500,
    value: 'AED 400 value',
    tags: ['Table for 2–4', '~2 hrs', 'Halal'],
    eligible: false,
    needMore: 250,
    photo: require('../assets/reservations/branch-creek.jpg'),
  },
];

/** Lifecycle of an experience booking. Upcoming = future; the rest are "past". */
export type LoyaltyBookingStatus =
  | 'upcoming'
  | 'completed'
  | 'no-show'
  | 'cancelled';

/**
 * Status pill colours (37 · My Bookings · Past + 38 · Booking Detail).
 * `tint` = pill fill, `border` = pill outline, `dot` = leading dot.
 * Source: Figma dot-pills — pistachio / champagne / soft-red at 0.18 fill.
 */
export const BOOKING_STATUS_META: Record<
  LoyaltyBookingStatus,
  {label: string; dot: string; tint: string; border: string}
> = {
  upcoming: {
    label: 'UPCOMING',
    dot: '#9ed387',
    tint: 'rgba(158,212,135,0.18)',
    border: 'rgba(158,212,135,0.4)',
  },
  completed: {
    label: 'COMPLETED',
    dot: '#9ed387',
    tint: 'rgba(158,212,135,0.18)',
    border: 'rgba(158,212,135,0.4)',
  },
  'no-show': {
    label: 'NO SHOW',
    dot: '#ffefcb',
    tint: 'rgba(255,239,203,0.18)',
    border: 'rgba(255,239,203,0.4)',
  },
  cancelled: {
    label: 'CANCELLED',
    dot: '#f27373',
    tint: 'rgba(242,115,115,0.18)',
    border: 'rgba(242,115,115,0.4)',
  },
};

export type LoyaltyBooking = {
  id: string;
  bookingId: string; // 'BK-X7K9M2' — shown on the detail
  brand: BrandKey;
  title: string;
  dateLabel: string; // 'Sat 6 Jun 2026 · 7:30 PM' (list + home strip)
  date: string; // 'Sat 6 Jun 2026' (detail row)
  time: string; // '7:30 PM' (detail row)
  location: string; // branch name, e.g. 'Dubai Mall'
  address: string; // 'Fashion Avenue, Lower Ground, Dubai Mall'
  guests: number;
  points: number; // pts tied to the booking
  inDays: number;
  past?: boolean;
  status: LoyaltyBookingStatus;
};

export const LOYALTY_BOOKINGS: LoyaltyBooking[] = [
  // ── Upcoming ──────────────────────────────────────────────
  {
    id: 'lb-1',
    bookingId: 'BK-X7K9M2',
    brand: 'Jade',
    title: "Chef's Table",
    dateLabel: 'Sat 6 Jun 2026 · 7:30 PM',
    date: 'Sat 6 Jun 2026',
    time: '7:30 PM',
    location: 'Dubai Mall',
    address: 'Fashion Avenue, Lower Ground, Dubai Mall',
    guests: 2,
    points: 800,
    inDays: 4,
    status: 'upcoming',
  },
  {
    id: 'lb-2',
    bookingId: 'BK-2M5P8Q',
    brand: 'Karaz',
    title: 'Sunday Brunch Reserve',
    dateLabel: 'Sun 14 Jun 2026 · 12:00 PM',
    date: 'Sun 14 Jun 2026',
    time: '12:00 PM',
    location: 'JBR',
    address: 'The Beach, JBR, Dubai',
    guests: 4,
    points: 400,
    inDays: 12,
    status: 'upcoming',
  },
  {
    id: 'lb-3',
    bookingId: 'BK-9R3T6L',
    brand: 'Jade',
    title: 'Private Dining Room',
    dateLabel: 'Sat 27 Jun 2026 · 8:00 PM',
    date: 'Sat 27 Jun 2026',
    time: '8:00 PM',
    location: 'Dubai Mall',
    address: 'Fashion Avenue, Lower Ground, Dubai Mall',
    guests: 6,
    points: 2000,
    inDays: 25,
    status: 'upcoming',
  },
  // ── Past ──────────────────────────────────────────────────
  {
    id: 'lb-4',
    bookingId: 'BK-C7K9M2',
    brand: 'Jade',
    title: "Chef's Table",
    dateLabel: 'Sat 25 Apr 2026 · 7:30 PM',
    date: 'Sat 25 Apr 2026',
    time: '7:30 PM',
    location: 'Dubai Mall',
    address: 'Fashion Avenue, Lower Ground, Dubai Mall',
    guests: 2,
    points: 800,
    inDays: -42,
    past: true,
    status: 'completed',
  },
  {
    id: 'lb-5',
    bookingId: 'BK-N4K2P9',
    brand: 'Karaz',
    title: 'Sunday Brunch Reserve',
    dateLabel: 'Sun 19 Apr 2026 · 12:00 PM',
    date: 'Sun 19 Apr 2026',
    time: '12:00 PM',
    location: 'JBR',
    address: 'The Beach, JBR, Dubai',
    guests: 4,
    points: 400,
    inDays: -48,
    past: true,
    status: 'no-show',
  },
  {
    id: 'lb-6',
    bookingId: 'BK-X1C8V4',
    brand: 'Jade',
    title: 'Private Dining Room',
    dateLabel: 'Sat 12 Apr 2026 · 8:00 PM',
    date: 'Sat 12 Apr 2026',
    time: '8:00 PM',
    location: 'Dubai Mall',
    address: 'Fashion Avenue, Lower Ground, Dubai Mall',
    guests: 6,
    points: 2000,
    inDays: -55,
    past: true,
    status: 'cancelled',
  },
];

export const bookingById = (id: string): LoyaltyBooking | undefined =>
  LOYALTY_BOOKINGS.find(b => b.id === id);

export type PointEntry = {
  id: string;
  title: string;
  sub: string; // 'Jade · Dubai Mall · 3 Jun 2026'
  delta: number; // +/-
  icon: string;
};

export const POINT_HISTORY: PointEntry[] = [
  {id: 'p1', title: "Chef's Table booked", sub: 'Jade · Dubai Mall · 3 Jun 2026', delta: -800, icon: 'calendar-outline'},
  {id: 'p2', title: 'Dine-in at Karaz', sub: 'Dubai Mall · 1 Jun 2026', delta: 42, icon: 'gift-outline'},
  {id: 'p3', title: 'Pickup order', sub: 'Jade · Abu Dhabi · 28 May 2026', delta: 18, icon: 'bag-outline'},
  {id: 'p4', title: 'Friend joined Flavours', sub: 'Sarah · 22 May 2026', delta: 100, icon: 'download-outline'},
  {id: 'p5', title: 'Dine-in at Jade', sub: 'Abu Dhabi · 17 May 2026', delta: 24, icon: 'gift-outline'},
  {id: 'p6', title: 'Pickup order', sub: 'Karaz · JBR · 8 May 2026', delta: 12, icon: 'bag-outline'},
  {id: 'p7', title: 'Welcome bonus', sub: 'Joined Flavours · 1 May 2026', delta: 50, icon: 'download-outline'},
];

/**
 * Membership-tier overview copy — taken verbatim from Figma (33 · 3514:6).
 * Design-only: these reach/perk strings are displayed as written, not derived.
 */
export const MEMBERSHIP_TIERS = [
  {name: 'Savor', dot: '#8CB2C7', reach: '1,000 pts to reach', perk: '5% OFF', perkSub: 'off every dine-in bill · auto-applied at restaurant', state: 'unlocked' as const},
  {name: 'Feast', dot: '#EBC98F', reach: '2,500 pts to reach', perk: '10% OFF', perkSub: 'off every dine-in bill · auto-applied at restaurant', state: 'current' as const},
  {name: 'Gourmet', dot: '#BFBFC7', reach: '5,000 pts to reach', perk: '15% OFF', perkSub: 'off every dine-in bill · auto-applied at restaurant', state: 'locked' as const, more: '250 more pts to unlock'},
];
