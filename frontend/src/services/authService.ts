import {api, unwrap} from './api';

export type ApiUser = {
  id: number;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string | null;
  phone: string | null;
  dob?: string | null;
  referral_code?: string | null;
  marketing_opt_in?: boolean;
  loyalty_points?: number;
  is_active: boolean;
};

/** Profile fields the backend accepts on PUT /api/app/profile. */
export type ProfilePatch = {
  name?: string; // display name (backend keeps a `name` column too)
  first_name?: string;
  last_name?: string;
  email?: string;
  dob?: string; // 'YYYY-MM-DD'
  marketing_opt_in?: boolean;
  referral_code?: string;
};

export type VerifyOtpResult = {
  user: ApiUser;
  token: string;
  isNewUser: boolean;
};

/** Request an OTP for a phone number. In mock mode the code is 123456. */
export async function requestOtp(phone: string): Promise<{devCode?: string}> {
  const res = await api.post('/api/app/auth/request-otp', {phone});
  return unwrap(res);
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<VerifyOtpResult> {
  const res = await api.post('/api/app/auth/verify-otp', {phone, code});
  return unwrap(res);
}

export async function getProfile(): Promise<ApiUser> {
  const res = await api.get('/api/app/profile');
  return unwrap(res);
}

/**
 * Whether the user has finished registration (Module 1 · 4.1 required fields):
 * a real name, an email, and a date of birth. Incomplete users are routed back
 * to Profile Setup after login instead of into the app.
 */
export function isProfileComplete(user: ApiUser | null | undefined): boolean {
  if (!user) {
    return false;
  }
  const hasName =
    !!user.first_name?.trim() ||
    (!!user.name?.trim() && user.name.trim().toLowerCase() !== 'guest');
  return hasName && !!user.email?.trim() && !!user.dob;
}

export async function updateProfile(patch: ProfilePatch): Promise<ApiUser> {
  const res = await api.put('/api/app/profile', patch);
  return unwrap(res);
}
