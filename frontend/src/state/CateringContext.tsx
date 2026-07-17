import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {type CateringInquiry, type EventType} from '../data/catering';
import Toast from 'react-native-toast-message';
import {useAuth} from './AuthContext';
import * as cateringApi from '../services/cateringService';

/**
 * Catering inquiry state shared across the flow
 * (Catering Home → Step 1 → Step 2 → Success) plus the My Inquiries list.
 * Mirrors ReservationContext: a working `draft` + a committed `inquiries` list.
 */
export type CateringDraft = {
  eventType: EventType | null;
  dateLabel: string; // '15 Apr 2026'
  guests: string; // kept as string for the text field
  budget: string;
  location: string;
  requirements: string;
  name: string;
  email: string;
  phone: string;
};

const EMPTY_DRAFT: CateringDraft = {
  eventType: null,
  dateLabel: '',
  guests: '',
  budget: '',
  location: '',
  requirements: '',
  name: '',
  email: '',
  phone: '',
};

/** Build the 'Corporate Dinner · 80 guests' style card title. */
function draftTitle(draft: CateringDraft): string {
  const type = draft.eventType ?? 'Event';
  const noun =
    type === 'Corporate'
      ? 'Corporate Dinner'
      : type === 'Wedding'
      ? 'Wedding Reception'
      : type === 'Iftar'
      ? 'Iftar'
      : type === 'Birthday'
      ? 'Birthday'
      : type === 'Private Event'
      ? 'Private Event'
      : 'Catering';
  const guests = Number(draft.guests) || 0;
  return guests > 0 ? `${noun} · ${guests} guests` : noun;
}

type CateringValue = {
  draft: CateringDraft;
  inquiries: CateringInquiry[];
  /** True once the inquiries list has been fetched at least once. */
  loaded: boolean;
  patchDraft: (patch: Partial<CateringDraft>) => void;
  resetDraft: () => void;
  getInquiry: (id: string) => CateringInquiry | undefined;
  /** Submit the current draft to the backend; returns the saved server record. */
  createInquiry: () => Promise<CateringInquiry>;
  /** Re-fetch the full inquiry list from the backend (GET list). */
  refreshInquiries: () => void;
  /** Re-fetch a single inquiry by ref and merge it in (GET detail). */
  refreshInquiry: (id: string) => void;
};

const CateringContext = createContext<CateringValue | null>(null);

export function CateringProvider({children}: {children: React.ReactNode}) {
  const {token} = useAuth();
  const [draft, setDraft] = useState<CateringDraft>(EMPTY_DRAFT);
  // Real inquiries only — no mock seed. Empty until the API responds.
  const [inquiries, setInquiries] = useState<CateringInquiry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load the user's real inquiries once signed in. Signed out → empty list.
  useEffect(() => {
    if (!token) {
      setInquiries([]);
      setLoaded(false);
      return;
    }
    let cancelled = false;
    cateringApi
      .fetchInquiries()
      .then(list => {
        if (!cancelled) setInquiries(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const patchDraft = useCallback((patch: Partial<CateringDraft>) => {
    setDraft(prev => ({...prev, ...patch}));
  }, []);

  const resetDraft = useCallback(() => setDraft(EMPTY_DRAFT), []);

  const getInquiry = useCallback(
    (id: string) => inquiries.find(i => i.id === id),
    [inquiries],
  );

  const refreshInquiries = useCallback(() => {
    cateringApi
      .fetchInquiries()
      .then(list => setInquiries(list))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const refreshInquiry = useCallback((id: string) => {
    cateringApi
      .fetchInquiry(id)
      .then(fresh => {
        setInquiries(prev =>
          prev.map(i => (i.id === fresh.id || i.id === id ? fresh : i)),
        );
      })
      .catch(() => {});
  }, []);

  const createInquiry = useCallback(async (): Promise<CateringInquiry> => {
    const input = {
      eventType: draft.eventType ?? 'Other',
      title: draftTitle(draft),
      guests: Number(draft.guests) || 0,
      dateLabel: draft.dateLabel || 'Date TBC',
      location: draft.location.trim() || 'UAE',
      budget: draft.budget.trim() || undefined,
      requirements: draft.requirements.trim() || undefined,
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    };

    try {
      const saved = await cateringApi.createInquiry(input);
      console.log('[Catering] inquiry submitted on backend:', saved.id);
      setInquiries(prev => [saved, ...prev.filter(i => i.id !== saved.id)]);
      Toast.show({
        type: 'success',
        text1: 'Inquiry submitted successfully',
        text2: `Ref ${saved.id} � we'll reach out within 24 hours.`,
      });
      return saved;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Could not submit inquiry',
        text2: 'Please check your connection and try again.',
      });
      throw error;
    }
  }, [draft]);

  const value = useMemo<CateringValue>(
    () => ({
      draft,
      inquiries,
      loaded,
      patchDraft,
      resetDraft,
      getInquiry,
      createInquiry,
      refreshInquiries,
      refreshInquiry,
    }),
    [
      draft,
      inquiries,
      loaded,
      patchDraft,
      resetDraft,
      getInquiry,
      createInquiry,
      refreshInquiries,
      refreshInquiry,
    ],
  );

  return (
    <CateringContext.Provider value={value}>
      {children}
    </CateringContext.Provider>
  );
}

export function useCatering(): CateringValue {
  const ctx = useContext(CateringContext);
  if (!ctx) {
    throw new Error('useCatering must be used within a CateringProvider');
  }
  return ctx;
}
