import {api, unwrap} from './api';
import {BRANCHES, type Booking, type BranchKey} from '../data/reservations';
import type {BrandKey} from '../data/menu';

type ApiBranch = {
  branch_key: BranchKey;
  name: string;
  area: string;
  rating: number | string;
  rating_count: string;
  tags: string[] | null;
  highlight: string;
  most_loved: string;
  facts: string[] | null;
};

type ApiBooking = {
  booking_ref: string;
  restaurant: BrandKey;
  branch_key: BranchKey;
  branch_name: string;
  date_label: string;
  date_full: string;
  time_label: string;
  guests: number;
  seating_label: string;
  note: string | null;
  status: Booking['status'];
};

export type CreateBookingInput = {
  restaurant: BrandKey;
  branch: BranchKey;
  branchName: string;
  dateLabel: string;
  dateFull: string;
  timeLabel: string;
  guests: number;
  seatingLabel: string;
  note?: string;
};

function mapBooking(a: ApiBooking): Booking {
  return {
    id: a.booking_ref,
    restaurant: a.restaurant,
    branch: a.branch_key,
    branchName: a.branch_name,
    dateLabel: a.date_label,
    dateFull: a.date_full,
    timeLabel: a.time_label,
    guests: a.guests,
    seatingLabel: a.seating_label,
    note: a.note ?? undefined,
    status: a.status,
  };
}

/** Refresh the bundled branch catalog text in place (keeps local photos). */
export async function hydrateBranches(): Promise<boolean> {
  try {
    const res = await api.get('/api/app/branches');
    const apiBranches = unwrap<ApiBranch[]>(res);
    apiBranches.forEach(b => {
      const target = BRANCHES.find(x => x.key === b.branch_key);
      if (!target) return;
      target.name = b.name;
      target.area = b.area;
      target.rating = Number(b.rating);
      target.ratingCount = b.rating_count;
      target.tags = b.tags ?? target.tags;
      target.highlight = b.highlight;
      target.mostLoved = b.most_loved;
      target.facts = b.facts ?? target.facts;
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchBookings(): Promise<Booking[]> {
  const res = await api.get('/api/app/bookings');
  return unwrap<ApiBooking[]>(res).map(mapBooking);
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const res = await api.post('/api/app/bookings', input);
  return mapBooking(unwrap<ApiBooking>(res));
}

export async function cancelBooking(ref: string): Promise<Booking> {
  const res = await api.post(`/api/app/bookings/${ref}/cancel`);
  return mapBooking(unwrap<ApiBooking>(res));
}

export async function updateBooking(
  ref: string,
  patch: {guests?: number; note?: string; timeLabel?: string},
): Promise<Booking> {
  const body: Record<string, unknown> = {};
  if (patch.guests !== undefined) body.guests = patch.guests;
  if (patch.note !== undefined) body.note = patch.note;
  if (patch.timeLabel !== undefined) body.time_label = patch.timeLabel;
  const res = await api.patch(`/api/app/bookings/${ref}`, body);
  return mapBooking(unwrap<ApiBooking>(res));
}
