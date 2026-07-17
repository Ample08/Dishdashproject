import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  SEED_VOUCHERS,
  nextTier,
  tierForPoints,
  tierProgress,
  type Experience,
  type LoyaltyBooking,
  type PointEntry,
  type Tier,
  type Voucher,
} from '../data/loyalty';
import Toast from 'react-native-toast-message';
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
  /** Full experiences catalogue from the API (all brands). */
  experiences: Experience[];
  /** Point-history transactions from the API. */
  pointHistory: PointEntry[];
  /** Experience bookings made with points (Loyalty Bookings screen). */
  loyaltyBookings: LoyaltyBooking[];
  /** True once loyalty lists have been fetched at least once. */
  loaded: boolean;
  getExperience: (id: string) => Experience | undefined;
  /**
   * Book an experience by id. Checks the balance (SRS §11.3), deducts points,
   * persists to the backend, and rolls back on failure. Resolves true on
   * success, false if blocked or the API failed.
   */
  bookExperience: (experienceId: string) => Promise<boolean>;
};

const LoyaltyContext = createContext<LoyaltyValue | null>(null);

export function LoyaltyProvider({children}: {children: React.ReactNode}) {
  const {token} = useAuth();
  const [points, setPoints] = useState(1550); // Savor member (Figma home)
  const [vouchers, setVouchers] = useState<Voucher[]>(SEED_VOUCHERS);
  // Real API lists only — no static seed (empty until the API responds).
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [pointHistory, setPointHistory] = useState<PointEntry[]>([]);
  const [loyaltyBookings, setLoyaltyBookings] = useState<LoyaltyBooking[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [coachSeen, setCoachSeen] = useState(false);

  // Hydrate all loyalty data from the API once signed in. Signed out → empty.
  useEffect(() => {
    if (!token) {
      setExperiences([]);
      setPointHistory([]);
      setLoyaltyBookings([]);
      setLoaded(false);
      return;
    }
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
    loyaltyApi
      .fetchExperiences()
      .then(list => {
        if (!cancelled) setExperiences(list);
      })
      .catch(() => {});
    loyaltyApi
      .fetchPointHistory()
      .then(list => {
        if (!cancelled) setPointHistory(list);
      })
      .catch(() => {});
    loyaltyApi
      .fetchLoyaltyBookings()
      .then(list => {
        if (!cancelled) setLoyaltyBookings(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
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

  const getExperience = useCallback(
    (id: string) => experiences.find(e => e.id === id),
    [experiences],
  );

  const bookExperience = useCallback(
    async (experienceId: string): Promise<boolean> => {
      const exp = experiences.find(e => e.id === experienceId);
      if (!exp) return false;

      // SRS §11.3 — real-time balance check before spending points.
      if (points < exp.pts) {
        Toast.show({
          type: 'info',
          text1: 'Not enough points',
          text2: `You need ${(exp.pts - points).toLocaleString()} more points to book this.`,
        });
        return false;
      }

      // Optimistic: add the booking + deduct points locally, then persist.
      const optimistic: LoyaltyBooking = {
        id: `lb-local-${experienceId}`,
        bookingId: 'PENDING',
        brand: exp.brand,
        title: exp.title,
        dateLabel: 'Upcoming',
        date: 'Upcoming',
        time: '',
        location: exp.location,
        address: exp.location,
        guests: 2,
        points: exp.pts,
        inDays: 7,
        status: 'upcoming',
      };
      setLoyaltyBookings(prev => [optimistic, ...prev]);
      setPoints(prev => Math.max(0, prev - exp.pts));

      try {
        const saved = await loyaltyApi.bookExperience(experienceId);
        setLoyaltyBookings(prev =>
          prev.map(b => (b.id === optimistic.id ? saved : b)),
        );
        Toast.show({
          type: 'success',
          text1: 'Experience booked',
          text2: `${exp.pts.toLocaleString()} points redeemed.`,
        });
        return true;
      } catch {
        // SRS §11.2 step 7 — full rollback, no points deducted.
        setLoyaltyBookings(prev => prev.filter(b => b.id !== optimistic.id));
        setPoints(prev => prev + exp.pts);
        Toast.show({
          type: 'error',
          text1: 'Booking failed',
          text2: 'No points were deducted. Please try again.',
        });
        return false;
      }
    },
    [points, experiences],
  );

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
      experiences,
      pointHistory,
      loyaltyBookings,
      loaded,
      getExperience,
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
      experiences,
      pointHistory,
      loyaltyBookings,
      loaded,
      getExperience,
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
