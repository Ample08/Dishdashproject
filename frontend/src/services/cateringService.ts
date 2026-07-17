import {api, unwrap} from './api';
import type {CateringInquiry, EventType} from '../data/catering';

type ApiInquiry = {
  inquiry_ref: string;
  event_type: EventType;
  title: string;
  guests: number;
  date_label: string;
  location: string;
  budget: string | null;
  requirements: string | null;
  name: string;
  email: string;
  phone: string;
  status: CateringInquiry['status'];
};

export type CreateInquiryInput = {
  eventType: EventType;
  title: string;
  guests: number;
  dateLabel: string;
  location: string;
  budget?: string;
  requirements?: string;
  name: string;
  email: string;
  phone: string;
};

function mapInquiry(a: ApiInquiry): CateringInquiry {
  return {
    id: a.inquiry_ref,
    eventType: a.event_type,
    title: a.title,
    guests: a.guests,
    dateLabel: a.date_label,
    location: a.location,
    budget: a.budget ?? undefined,
    requirements: a.requirements ?? undefined,
    name: a.name,
    email: a.email,
    phone: a.phone,
    status: a.status,
  };
}

export async function fetchInquiries(): Promise<CateringInquiry[]> {
  const res = await api.get('/api/app/catering/inquiries');
  return unwrap<ApiInquiry[]>(res).map(mapInquiry);
}

export async function createInquiry(
  input: CreateInquiryInput,
): Promise<CateringInquiry> {
  const res = await api.post('/api/app/catering/inquiries', input);
  return mapInquiry(unwrap<ApiInquiry>(res));
}

/** Fetch a single inquiry by its reference (GET /catering/inquiries/{ref}). */
export async function fetchInquiry(ref: string): Promise<CateringInquiry> {
  const res = await api.get(
    `/api/app/catering/inquiries/${encodeURIComponent(ref)}`,
  );
  return mapInquiry(unwrap<ApiInquiry>(res));
}
