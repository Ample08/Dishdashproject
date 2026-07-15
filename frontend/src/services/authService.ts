import {api, unwrap} from './api';

export type ApiUser = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
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

export async function updateProfile(patch: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<ApiUser> {
  const res = await api.put('/api/app/profile', patch);
  return unwrap(res);
}
