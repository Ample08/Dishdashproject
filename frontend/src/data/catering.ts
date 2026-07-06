/**
 * Catering (Bait Um Abdallah) — data & types.
 * Backs the Catering Inquiry flow (UA1 → UA5). Frontend-only mock data,
 * mirrors the reservations.ts / loyalty.ts pattern.
 */

/** Event types shown as the selectable grid on Step 1 (UA2). */
export type EventType =
  | 'Wedding'
  | 'Corporate'
  | 'Iftar'
  | 'Private Event'
  | 'Birthday'
  | 'Other';

/** Ionicons name for each event type card. */
export const EVENT_TYPES: {key: EventType; label: string; icon: string}[] = [
  {key: 'Wedding', label: 'Wedding', icon: 'heart-outline'},
  {key: 'Corporate', label: 'Corporate', icon: 'briefcase-outline'},
  {key: 'Iftar', label: 'Iftar', icon: 'moon-outline'},
  {key: 'Private Event', label: 'Private Event', icon: 'person-outline'},
  {key: 'Birthday', label: 'Birthday', icon: 'gift-outline'},
  {key: 'Other', label: 'Other', icon: 'help-circle-outline'},
];

/** Inquiry lifecycle: freshly submitted → team replied. */
export type InquiryStatus = 'awaiting' | 'received';

export type CateringInquiry = {
  id: string; // '#CRV-1042'
  eventType: EventType;
  title: string; // 'Corporate Dinner · 80 guests'
  guests: number;
  dateLabel: string; // '15 Apr 2026'
  location: string; // 'Abu Dhabi'
  budget?: string; // free-form AED amount
  requirements?: string;
  name: string;
  email: string;
  phone: string;
  status: InquiryStatus;
};

/** Feature rows on the Catering Home landing (UA1). */
export const CATERING_FEATURES: {icon: string; title: string; sub: string}[] = [
  {
    icon: 'restaurant-outline',
    title: 'Home-Style Cooking',
    sub: 'Every dish slow-cooked with care',
  },
  {
    icon: 'calendar-outline',
    title: 'Any Occasion',
    sub: 'Weddings, events, corporates & more',
  },
  {
    icon: 'car-outline',
    title: 'Catering Only',
    sub: 'We come to you — anywhere in the UAE',
  },
];

/** Reviews block on the Catering Home landing (UA1). */
export const CATERING_REVIEW = {
  kicker: 'LOVED BY OUR CUSTOMERS',
  headline: 'Real reviews from real events',
  sub: "From weddings to corporate events here's what guests say.",
  rating: '4.9',
  ratingCount: 'Based on 240 events',
  seeAll: 'Read all review on Google',
};

export type CateringReview = {
  name: string;
  event: string;
  date: string;
  quote: string;
  /** Two-letter fallback avatar (when no photo). */
  initials: string;
};

export const CATERING_REVIEWS: CateringReview[] = [
  {
    name: 'Layla Ahmed',
    event: 'Wedding · 120 guests',
    date: 'May 2026',
    quote:
      '"Showed up early, set up beautifully. Mansaf was so warm and the lamb fell off the bone — our wedding guests still ask about it."',
    initials: 'LA',
  },
  {
    name: 'Mariam Al Hashimi',
    event: 'Family Reunion · 35 guests',
    date: 'Feb 2026',
    quote:
      '"Their machbous was unreal and the team was so kind to our elderly aunties. Will book again, every family reunion from now."',
    initials: 'MA',
  },
  {
    name: 'Omar Khaled',
    event: 'Corporate Iftar · 60 guests',
    date: 'Mar 2026',
    quote:
      '"Best catering call we made for our office Iftar. Everything arrived hot, presented like a hotel, tasted like home."',
    initials: 'OK',
  },
];

/** Seed inquiries shown on My Inquiries (UA5). */
export const SEED_INQUIRIES: CateringInquiry[] = [
  {
    id: '#CRV-1042',
    eventType: 'Corporate',
    title: 'Corporate Dinner · 80 guests',
    guests: 80,
    dateLabel: '15 Apr 2026',
    location: 'Abu Dhabi',
    name: 'Layla Ahmed',
    email: 'layla.ahmad@gmail.com',
    phone: '50 123 4567',
    status: 'awaiting',
  },
  {
    id: '#CRV-0998',
    eventType: 'Wedding',
    title: 'Wedding Reception · 120 guests',
    guests: 120,
    dateLabel: '18 Apr 2026',
    location: 'Palm Jumeirah · Dubai',
    name: 'Layla Ahmed',
    email: 'layla.ahmad@gmail.com',
    phone: '50 123 4567',
    status: 'received',
  },
  {
    id: '#CRV-0921',
    eventType: 'Iftar',
    title: 'Family Iftar · 35 guests',
    guests: 35,
    dateLabel: '5 Apr 2026',
    location: 'Al Ain',
    name: 'Layla Ahmed',
    email: 'layla.ahmad@gmail.com',
    phone: '50 123 4567',
    status: 'received',
  },
  {
    id: '#CRV-0875',
    eventType: 'Birthday',
    title: 'Birthday Lunch · 25 guests',
    guests: 25,
    dateLabel: '12 Mar 2026',
    location: 'JBR · Dubai',
    name: 'Layla Ahmed',
    email: 'layla.ahmad@gmail.com',
    phone: '50 123 4567',
    status: 'received',
  },
];
