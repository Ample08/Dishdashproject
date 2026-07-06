import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  SEED_VOUCHERS,
  nextTier,
  tierForPoints,
  tierProgress,
  type Tier,
  type Voucher,
} from '../data/loyalty';

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
};

const LoyaltyContext = createContext<LoyaltyValue | null>(null);

export function LoyaltyProvider({children}: {children: React.ReactNode}) {
  const [points] = useState(1550); // Savor member (Figma home)
  const [vouchers, setVouchers] = useState<Voucher[]>(SEED_VOUCHERS);
  const [coachSeen, setCoachSeen] = useState(false);

  const dismissCoach = useCallback(() => setCoachSeen(true), []);

  const getVoucher = useCallback(
    (id: string) => vouchers.find(v => v.id === id),
    [vouchers],
  );

  const claimVoucher = useCallback((id: string) => {
    setVouchers(prev =>
      prev.map(v => (v.id === id ? {...v, status: 'claimed'} : v)),
    );
  }, []);

  const redeemVoucher = useCallback((id: string) => {
    setVouchers(prev =>
      prev.map(v => (v.id === id ? {...v, status: 'used'} : v)),
    );
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
    return result ?? SEED_VOUCHERS[1];
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
