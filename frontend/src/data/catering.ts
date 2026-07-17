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

/**
 * Inquiry lifecycle (SRS §8.2): submitted → admin workflow.
 * `awaiting` is the backend's default on create; the admin moves it through
 * New → Contacted → Quoted → Confirmed → Completed / Cancelled.
 */
export type InquiryStatus =
  | 'awaiting'
  | 'new'
  | 'contacted'
  | 'quoted'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

/** Display meta for each inquiry status (pill + footer note). */
export const INQUIRY_STATUS_META: Record<
  InquiryStatus,
  {label: string; tint: string; dot: string; icon: string; note: string}
> = {
  awaiting: {
    label: 'Awaiting Response',
    tint: 'rgba(237,199,128,0.35)',
    dot: '#e0a83c',
    icon: 'time-outline',
    note: "We'll reach out within 24 hours.",
  },
  new: {
    label: 'New',
    tint: 'rgba(237,199,128,0.35)',
    dot: '#e0a83c',
    icon: 'sparkles-outline',
    note: "We've received your inquiry and will be in touch soon.",
  },
  contacted: {
    label: 'Contacted',
    tint: 'rgba(41,89,168,0.14)',
    dot: '#2959a8',
    icon: 'chatbubble-ellipses-outline',
    note: 'Our team has reached out — check your email or WhatsApp.',
  },
  quoted: {
    label: 'Quoted',
    tint: 'rgba(41,89,168,0.14)',
    dot: '#2959a8',
    icon: 'document-text-outline',
    note: 'A quote is ready — review it in your email or WhatsApp.',
  },
  confirmed: {
    label: 'Confirmed',
    tint: 'rgba(158,211,135,0.30)',
    dot: '#2f9e44',
    icon: 'checkmark-circle-outline',
    note: "You're confirmed! We'll share final details before the event.",
  },
  completed: {
    label: 'Completed',
    tint: 'rgba(158,211,135,0.22)',
    dot: '#2f9e44',
    icon: 'ribbon-outline',
    note: 'Event completed — thank you for hosting with us.',
  },
  cancelled: {
    label: 'Cancelled',
    tint: 'rgba(224,52,45,0.12)',
    dot: '#e0342d',
    icon: 'close-circle-outline',
    note: 'This inquiry was cancelled.',
  },
};

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

