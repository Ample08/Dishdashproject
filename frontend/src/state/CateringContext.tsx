import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  SEED_INQUIRIES,
  type CateringInquiry,
  type EventType,
} from '../data/catering';
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

let inquirySeq = 1042;
function nextInquiryId(): string {
  inquirySeq += 1;
  return `#CRV-${inquirySeq}`;
}

type CateringValue = {
  draft: CateringDraft;
  inquiries: CateringInquiry[];
  patchDraft: (patch: Partial<CateringDraft>) => void;
  resetDraft: () => void;
  getInquiry: (id: string) => CateringInquiry | undefined;
  /** Commit the current draft as an 'awaiting' inquiry; returns the new record. */
  createInquiry: () => CateringInquiry;
};

const CateringContext = createContext<CateringValue | null>(null);

export function CateringProvider({children}: {children: React.ReactNode}) {
  const {token} = useAuth();
  const [draft, setDraft] = useState<CateringDraft>(EMPTY_DRAFT);
  const [inquiries, setInquiries] = useState<CateringInquiry[]>(SEED_INQUIRIES);

  // Load the user's real inquiries once signed in (mock seed as fallback).
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    cateringApi
      .fetchInquiries()
      .then(list => {
        if (!cancelled && list.length) setInquiries(list);
      })
      .catch(() => {});
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

  const createInquiry = useCallback((): CateringInquiry => {
    const inquiry: CateringInquiry = {
      id: nextInquiryId(),
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
      status: 'awaiting',
    };
    setInquiries(prev => [inquiry, ...prev]);

    // Persist to the backend (best-effort); adopt the server ref on success.
    cateringApi
      .createInquiry({
        eventType: inquiry.eventType,
        title: inquiry.title,
        guests: inquiry.guests,
        dateLabel: inquiry.dateLabel,
        location: inquiry.location,
        budget: inquiry.budget,
        requirements: inquiry.requirements,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
      })
      .then(saved => {
        setInquiries(prev => prev.map(i => (i.id === inquiry.id ? saved : i)));
      })
      .catch(() => {});

    return inquiry;
  }, [draft]);

  const value = useMemo<CateringValue>(
    () => ({
      draft,
      inquiries,
      patchDraft,
      resetDraft,
      getInquiry,
      createInquiry,
    }),
    [draft, inquiries, patchDraft, resetDraft, getInquiry, createInquiry],
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
