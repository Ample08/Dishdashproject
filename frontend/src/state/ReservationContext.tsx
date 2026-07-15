import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {BrandKey} from '../data/menu';
import {
  branchByKey,
  MIN_GUESTS,
  SEED_BOOKINGS,
  type Booking,
  type BookingStatus,
  type BranchKey,
  type SeatingArea,
  type ShishaPref,
  type TimeSegment,
} from '../data/reservations';
import {useAuth} from './AuthContext';
import * as reservationApi from '../services/reservationService';

/**
 * Reservation state shared across the booking flow
 * (New Reservation → Place → When & Table → When → Confirm → Success)
 * plus the bookings list shown on the Reserve tab and Booking Detail.
 */
export type ReservationDraft = {
  restaurant: BrandKey | null;
  branch: BranchKey | null;
  seating: SeatingArea;
  shisha: ShishaPref;
  guests: number;
  dateLabel: string | null; // 'Fri, Jun 12'
  dateFull: string | null; // 'Friday, Jun 12 · 2026'
  segment: TimeSegment;
  time: string | null; // 24h slot label e.g. '19:30'
  note: string;
};

const EMPTY_DRAFT: ReservationDraft = {
  restaurant: null,
  branch: null,
  seating: 'indoor',
  shisha: 'non',
  guests: MIN_GUESTS,
  dateLabel: null,
  dateFull: null,
  segment: 'Dinner',
  time: null,
  note: '',
};

/** '19:30' → '7:30 PM' */
export function to12h(slot: string): string {
  const [hStr, m] = slot.split(':');
  const h = Number(hStr);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

function seatingLabel(seating: SeatingArea, shisha: ShishaPref): string {
  const area = seating === 'indoor' ? 'Indoor' : 'Terrace';
  const sh = shisha === 'shisha' ? 'Shisha Lounge' : 'Non-Shisha Lounge';
  return `${area} · ${sh}`;
}

let bookingSeq = 4083;
function nextBookingId(branch: BranchKey): string {
  const code =
    branch === 'creek' ? 'CRK' : branch === 'yas-island' ? 'YAS' : 'DJM';
  bookingSeq += 1;
  return `BR-${code}-${bookingSeq}`;
}

type ReservationValue = {
  draft: ReservationDraft;
  bookings: Booking[];
  patchDraft: (patch: Partial<ReservationDraft>) => void;
  resetDraft: () => void;
  getBooking: (id: string) => Booking | undefined;
  /** Commit the current draft as an 'awaiting' booking; returns the new record. */
  createBooking: () => Booking;
  cancelBooking: (id: string) => void;
  modifyBooking: (id: string, patch: Partial<Booking>) => void;
};

const ReservationContext = createContext<ReservationValue | null>(null);

export function ReservationProvider({children}: {children: React.ReactNode}) {
  const {token} = useAuth();
  const [draft, setDraft] = useState<ReservationDraft>(EMPTY_DRAFT);
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);

  // Once signed in, replace the seed list with the user's real bookings.
  // Offline / signed-out → the bundled seed stays (mock fallback).
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    reservationApi
      .fetchBookings()
      .then(list => {
        if (!cancelled && list.length) setBookings(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  const patchDraft = useCallback((patch: Partial<ReservationDraft>) => {
    setDraft(prev => ({...prev, ...patch}));
  }, []);

  const resetDraft = useCallback(() => setDraft(EMPTY_DRAFT), []);

  const getBooking = useCallback(
    (id: string) => bookings.find(b => b.id === id),
    [bookings],
  );

  const createBooking = useCallback((): Booking => {
    const branch = draft.branch ?? 'dubai-mall';
    const booking: Booking = {
      id: nextBookingId(branch),
      restaurant: draft.restaurant ?? 'Karaz',
      branch,
      branchName: branchByKey(branch).name,
      dateLabel: draft.dateLabel ?? 'Fri, Jun 12',
      dateFull: draft.dateFull ?? 'Friday, Jun 12 · 2026',
      timeLabel: draft.time ? to12h(draft.time) : '7:00 PM',
      guests: draft.guests,
      seatingLabel: seatingLabel(draft.seating, draft.shisha),
      note: draft.note.trim() || undefined,
      status: 'awaiting',
    };
    setBookings(prev => [booking, ...prev]);

    // Persist to the backend (best-effort). If it succeeds, adopt the
    // server record (real booking_ref) so detail/cancel stay in sync.
    reservationApi
      .createBooking({
        restaurant: booking.restaurant,
        branch: booking.branch,
        branchName: booking.branchName,
        dateLabel: booking.dateLabel,
        dateFull: booking.dateFull,
        timeLabel: booking.timeLabel,
        guests: booking.guests,
        seatingLabel: booking.seatingLabel,
        note: booking.note,
      })
      .then(saved => {
        setBookings(prev => prev.map(b => (b.id === booking.id ? saved : b)));
      })
      .catch(() => {});

    return booking;
  }, [draft]);

  const setStatus = (id: string, status: BookingStatus) =>
    setBookings(prev => prev.map(b => (b.id === id ? {...b, status} : b)));

  const cancelBooking = useCallback((id: string) => {
    setStatus(id, 'cancelled');
    reservationApi.cancelBooking(id).catch(() => {});
  }, []);

  const modifyBooking = useCallback((id: string, patch: Partial<Booking>) => {
    setBookings(prev => prev.map(b => (b.id === id ? {...b, ...patch} : b)));
    reservationApi
      .updateBooking(id, {
        guests: patch.guests,
        note: patch.note,
        timeLabel: patch.timeLabel,
      })
      .catch(() => {});
  }, []);

  const value = useMemo<ReservationValue>(
    () => ({
      draft,
      bookings,
      patchDraft,
      resetDraft,
      getBooking,
      createBooking,
      cancelBooking,
      modifyBooking,
    }),
    [
      draft,
      bookings,
      patchDraft,
      resetDraft,
      getBooking,
      createBooking,
      cancelBooking,
      modifyBooking,
    ],
  );

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations(): ReservationValue {
  const ctx = useContext(ReservationContext);
  if (!ctx) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return ctx;
}

export {seatingLabel};
