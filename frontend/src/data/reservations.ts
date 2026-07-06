/**
 * Reservation data model — branches, seating, time slots and seed bookings.
 * Source: Figma "Flavours" Reservation section (Section · Reservation 4732:24).
 * Restaurants reuse the order-side BrandKey (Karaz / Jade); branches are the
 * three reservable locations shown on the Place screen (41 · Place).
 */
import {dashboardImages} from '../assets/dashboardImages';
import type {BrandKey} from './menu';

export type BranchKey = 'dubai-mall' | 'creek' | 'yas-island';

export type Branch = {
  key: BranchKey;
  name: string; // 'Dubai Mall'
  area: string; // 'Fashion Avenue · Downtown Dubai'
  rating: number; // 4.7
  ratingCount: string; // '2.1k'
  tags: string[]; // ['Arabic', 'Turkish', 'Fast food']
  highlight: string; // 'Kids zone with a toy library'
  mostLoved: string; // 'Lamb Mansaf'
  /** Rotating one-liners for the FactTicker on the expanded card. */
  facts: string[];
  /** Ambiance photo for the expanded-card gallery (first slide). */
  photo: ReturnType<typeof require>;
  /** Full swipeable gallery for the expanded card (auto + manual). */
  photos: ReturnType<typeof require>[];
};

/** The three reservable branches (41 · Place card stack). */
export const BRANCHES: Branch[] = [
  {
    key: 'dubai-mall',
    name: 'Dubai Mall',
    area: 'Fashion Avenue · Downtown Dubai',
    rating: 4.7,
    ratingCount: '2.1k',
    tags: ['Arabic', 'Turkish', 'Fast food'],
    highlight: 'Kids zone with a toy library',
    mostLoved: 'Lamb Mansaf',
    facts: [
      'Avg. table held 12 min past slot',
      'Window seats face the fountain',
      'Live oud on Thursday nights',
    ],
    photo: require('../assets/reservations/branch-dubai-mall.jpg'),
    photos: [
      require('../assets/reservations/branch-dubai-mall.jpg'),
      dashboardImages.dishes.mansaf,
      dashboardImages.dishes.hummus,
    ],
  },
  {
    key: 'creek',
    name: 'The Creek',
    area: 'Festival Avenue · Dubai Festival City',
    rating: 4.6,
    ratingCount: '1.8k',
    tags: ['Seafood', 'Grill', 'Levantine'],
    highlight: 'Marina-view terrace deck',
    mostLoved: 'Grilled Hammour',
    facts: [
      'Terrace overlooks the marina',
      'Sunset slots book out fastest',
      'Shisha lounge on the deck',
    ],
    photo: require('../assets/reservations/branch-creek.jpg'),
    photos: [
      require('../assets/reservations/branch-creek.jpg'),
      dashboardImages.dishes.shish,
      dashboardImages.dishes.fattoush,
    ],
  },
  {
    key: 'yas-island',
    name: 'Yas Island',
    area: 'Yas Bay Waterfront · Abu Dhabi',
    rating: 4.8,
    ratingCount: '1.2k',
    tags: ['Emirati', 'Fine dining', 'Rooftop'],
    highlight: 'Rooftop skyline lounge',
    mostLoved: 'Camel Slider',
    facts: [
      'Rooftop bar with skyline view',
      'Valet parking after 6 PM',
      'Private booths for groups of 6+',
    ],
    photo: require('../assets/reservations/branch-yas-island.jpg'),
    photos: [
      require('../assets/reservations/branch-yas-island.jpg'),
      dashboardImages.dishes.kanafeh,
      dashboardImages.dishes.maklouba,
    ],
  },
];

export const branchByKey = (key: BranchKey): Branch =>
  BRANCHES.find(b => b.key === key) ?? BRANCHES[0];

/** Seating area + shisha preference (42 · When & Table). */
export type SeatingArea = 'indoor' | 'terrace';
export type ShishaPref = 'shisha' | 'non';

/** Day-part segments for the time picker (43 · When). */
export const TIME_SEGMENTS = [
  'Morning',
  'Lunch',
  'Afternoon',
  'Dinner',
  'Late',
] as const;
export type TimeSegment = (typeof TIME_SEGMENTS)[number];

/** Slot chips per day-part. `popular` shows the small red dot. */
export type TimeSlot = {label: string; popular?: boolean};

export const SLOTS_BY_SEGMENT: Record<TimeSegment, TimeSlot[]> = {
  Morning: [{label: '09:00'}, {label: '09:30'}, {label: '10:00'}, {label: '10:30'}],
  Lunch: [{label: '12:00'}, {label: '12:30'}, {label: '13:00'}, {label: '13:30'}],
  Afternoon: [{label: '15:00'}, {label: '15:30'}, {label: '16:00'}],
  Dinner: [
    {label: '18:00'},
    {label: '18:30'},
    {label: '19:00'},
    {label: '19:30', popular: true},
    {label: '20:00'},
    {label: '20:30'},
  ],
  Late: [{label: '21:30'}, {label: '22:00'}, {label: '22:30'}],
};

/** Guest count bounds for the TableViz stepper (round table 2–6, banquet 7–8). */
export const MIN_GUESTS = 2;
export const MAX_GUESTS = 10;

export type BookingStatus = 'awaiting' | 'confirmed' | 'completed' | 'cancelled';

export type Booking = {
  id: string; // 'BR-DJM-4082'
  restaurant: BrandKey; // 'Karaz'
  branch: BranchKey;
  branchName: string; // 'Dubai Mall'
  dateLabel: string; // 'Fri, Jun 12'
  dateFull: string; // 'Friday, Jun 12 · 2026'
  timeLabel: string; // '7:00 PM'
  guests: number;
  seatingLabel: string; // 'Indoor · Non-Shisha Lounge'
  note?: string;
  status: BookingStatus;
};

/**
 * Seed bookings so the list tab counts match the Figma mock
 * (Upcoming 1 · Completed 4 · Cancelled 2).
 */
export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'BR-DJM-4082',
    restaurant: 'Karaz',
    branch: 'dubai-mall',
    branchName: 'Dubai Mall',
    dateLabel: 'Fri, Jun 12',
    dateFull: 'Friday, Jun 12 · 2026',
    timeLabel: '7:00 PM',
    guests: 2,
    seatingLabel: 'Indoor · Non-Shisha Lounge',
    note: 'A birthday surprise — discreet candle, no song',
    status: 'awaiting',
  },
  {
    id: 'BR-DJM-3914',
    restaurant: 'Karaz',
    branch: 'dubai-mall',
    branchName: 'Dubai Mall',
    dateLabel: 'Sat, May 24',
    dateFull: 'Saturday, May 24 · 2026',
    timeLabel: '8:30 PM',
    guests: 4,
    seatingLabel: 'Terrace · Shisha Lounge',
    status: 'completed',
  },
  {
    id: 'BR-CRK-3722',
    restaurant: 'Karaz',
    branch: 'creek',
    branchName: 'The Creek',
    dateLabel: 'Fri, May 9',
    dateFull: 'Friday, May 9 · 2026',
    timeLabel: '7:30 PM',
    guests: 6,
    seatingLabel: 'Terrace · Non-Shisha Lounge',
    status: 'completed',
  },
  {
    id: 'BR-YAS-3540',
    restaurant: 'Jade',
    branch: 'yas-island',
    branchName: 'Yas Island',
    dateLabel: 'Sun, Apr 27',
    dateFull: 'Sunday, Apr 27 · 2026',
    timeLabel: '9:00 PM',
    guests: 2,
    seatingLabel: 'Indoor · Non-Shisha Lounge',
    status: 'completed',
  },
  {
    id: 'BR-DJM-3301',
    restaurant: 'Karaz',
    branch: 'dubai-mall',
    branchName: 'Dubai Mall',
    dateLabel: 'Thu, Apr 10',
    dateFull: 'Thursday, Apr 10 · 2026',
    timeLabel: '7:00 PM',
    guests: 3,
    seatingLabel: 'Indoor · Shisha Lounge',
    status: 'completed',
  },
  {
    id: 'BR-CRK-3120',
    restaurant: 'Karaz',
    branch: 'creek',
    branchName: 'The Creek',
    dateLabel: 'Wed, Apr 2',
    dateFull: 'Wednesday, Apr 2 · 2026',
    timeLabel: '8:00 PM',
    guests: 5,
    seatingLabel: 'Terrace · Shisha Lounge',
    status: 'cancelled',
  },
  {
    id: 'BR-YAS-2904',
    restaurant: 'Jade',
    branch: 'yas-island',
    branchName: 'Yas Island',
    dateLabel: 'Sat, Mar 22',
    dateFull: 'Saturday, Mar 22 · 2026',
    timeLabel: '9:30 PM',
    guests: 2,
    seatingLabel: 'Indoor · Non-Shisha Lounge',
    status: 'cancelled',
  },
];

/** Which list tab a booking belongs to. */
export type BookingTab = 'Upcoming' | 'Completed' | 'Cancelled';

export const tabForStatus = (s: BookingStatus): BookingTab => {
  if (s === 'cancelled') {
    return 'Cancelled';
  }
  if (s === 'completed') {
    return 'Completed';
  }
  return 'Upcoming'; // awaiting + confirmed
};

/** "WHY RESERVE? · Premium dining starts here" benefit rows (40 · Reservations). */
export const RESERVE_BENEFITS: {title: string; body: string; icon: string}[] = [
  {
    title: 'Skip the wait',
    body: 'Walk straight to your reserved table — no queue, no awkward hover.',
    icon: 'walk-outline',
  },
  {
    title: 'Pick your moment',
    body: 'Best tables fill within hours. Lock yours before the night is gone.',
    icon: 'time-outline',
  },
  {
    title: 'Personalised welcome',
    body: 'Tell the chef about birthdays, allergies or surprises ahead of time.',
    icon: 'sparkles-outline',
  },
  {
    title: 'Earn 100 points',
    body: 'Loyalty grows with every dine, unlocking perks the more you visit.',
    icon: 'ribbon-outline',
  },
];
