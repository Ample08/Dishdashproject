import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  EXPERIENCES,
  LOYALTY_BOOKINGS,
  SEED_VOUCHERS,
  nextTier,
  tierForPoints,
  tierProgress,
  type LoyaltyBooking,
  type Tier,
  type Voucher,
} from '../data/loyalty';
import {useAuth} from './AuthContext';
import * as loyaltyApi from '../services/loyaltyService';

/**
 * Loyalty state — points/tier, vouchers and the celebration generator.
 * Demo balance defaults to a Savor member (1,550 pts) matching the Figma home.
 */
type LoyaltyValue = {
  points: number;
  tier: Tier;
  next: Tier | null;
  progress: number;
  vouchers: Voucher[];
  /** Whether the first-time tier coach mark has been dismissed this session. */
  coachSeen: boolean;
  dismissCoach: () => void;
  getVoucher: (id: string) => Voucher | undefined;
  claimVoucher: (id: string) => void;
  /** Mark a voucher as used (redeemed) — moves it to the "Used" tab. */
  redeemVoucher: (id: string) => void;
  /** Generate the celebration code for a given party size; returns the voucher. */
  generateCelebration: (guests: number) => Voucher;
  /** Experience bookings made with points (Loyalty Bookings screen). */
  loyaltyBookings: LoyaltyBooking[];
  /** Book an experience by id; deducts points and adds to the bookings list. */
  bookExperience: (experienceId: string) => void;
};

const LoyaltyContext = createContext<LoyaltyValue | null>(null);

export function LoyaltyProvider({children}: {children: React.ReactNode}) {
  const {token} = useAuth();
  const [points, setPoints] = useState(1550); // Savor member (Figma home)
  const [vouchers, setVouchers] = useState<Voucher[]>(SEED_VOUCHERS);
  const [loyaltyBookings, setLoyaltyBookings] =
    useState<LoyaltyBooking[]>(LOYALTY_BOOKINGS);
  const [coachSeen, setCoachSeen] = useState(false);

  // Hydrate points, vouchers and point history once signed in.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    loyaltyApi
      .fetchSummary()
      .then(s => {
        if (!cancelled && typeof s.points === 'number') setPoints(s.points);
      })
      .catch(() => {});
    loyaltyApi
      .fetchVouchers()
      .then(list => {
        if (!cancelled && list.length) setVouchers(list);
      })
      .catch(() => {});
    loyaltyApi.hydratePointHistory();
    loyaltyApi
      .fetchLoyaltyBookings()
      .then(list => {
        if (!cancelled && list.length) setLoyaltyBookings(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  const dismissCoach = useCallback(() => setCoachSeen(true), []);

  const getVoucher = useCallback(
    (id: string) => vouchers.find(v => v.id === id),
    [vouchers],
  );

  const claimVoucher = useCallback((id: string) => {
    setVouchers(prev =>
      prev.map(v => (v.id === id ? {...v, status: 'claimed'} : v)),
    );
    loyaltyApi.claimVoucher(id).catch(() => {});
  }, []);

  const redeemVoucher = useCallback((id: string) => {
    setVouchers(prev =>
      prev.map(v => (v.id === id ? {...v, status: 'used'} : v)),
    );
    loyaltyApi.redeemVoucher(id).catch(() => {});
  }, []);

  const generateCelebration = useCallback((guests: number): Voucher => {
    let result: Voucher | undefined;
    setVouchers(prev =>
      prev.map(v => {
        if (v.kind === 'celebration') {
          result = {...v, status: 'claimed', guests};
          return result;
        }
        return v;
      }),
    );
    loyaltyApi.generateCelebration(guests).catch(() => {});
    return result ?? SEED_VOUCHERS[1];
  }, []);

  const bookExperience = useCallback((experienceId: string) => {
    const exp = EXPERIENCES.find(e => e.id === experienceId);
    if (!exp) return;

    // Optimistic: add the booking + deduct points locally, then persist.
    const optimistic: LoyaltyBooking = {
      id: `lb-local-${experienceId}`,
      brand: exp.brand,
      title: exp.title,
      dateLabel: 'Upcoming',
      location: exp.location,
      inDays: 7,
    };
    setLoyaltyBookings(prev => [optimistic, ...prev]);
    setPoints(prev => Math.max(0, prev - exp.pts));

    loyaltyApi
      .bookExperience(experienceId)
      .then(saved => {
        setLoyaltyBookings(prev =>
          prev.map(b => (b.id === optimistic.id ? saved : b)),
        );
      })
      .catch(() => {});
  }, []);

  const value = useMemo<LoyaltyValue>(
    () => ({
      points,
      tier: tierForPoints(points),
      next: nextTier(points),
      progress: tierProgress(points),
      vouchers,
      coachSeen,
      dismissCoach,
      getVoucher,
      claimVoucher,
      redeemVoucher,
      generateCelebration,
      loyaltyBookings,
      bookExperience,
    }),
    [
      points,
      vouchers,
      coachSeen,
      dismissCoach,
      getVoucher,
      claimVoucher,
      redeemVoucher,
      generateCelebration,
      loyaltyBookings,
      bookExperience,
    ],
  );

  return (
    <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>
  );
}

export function useLoyalty(): LoyaltyValue {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return ctx;
}
