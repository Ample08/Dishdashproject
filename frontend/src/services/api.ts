import axios from 'axios';
import {env} from '../config/env';

/**
 * Shared axios instance for the DishDash backend.
 * Every request carries the `api-key` header; once the user logs in the
 * `access-token` header is attached too (set via {@link setAuthToken}).
 */
export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

/** Called by AuthContext after login / on restore / on sign-out (null). */
export function setAuthToken(token: string | null) {
  authToken = token;
}

api.interceptors.request.use(config => {
  config.headers = config.headers ?? {};
  config.headers['api-key'] = env.apiKey;
  if (authToken) {
    config.headers['access-token'] = authToken;
  }
  // Dev trace so you can see every API call in the Metro console (remove later).
  const method = (config.method ?? 'get').toUpperCase();
  console.log(`[API →] ${method} ${config.url}`, config.data ?? config.params ?? '');
  return config;
});

api.interceptors.response.use(
  response => {
    const method = (response.config.method ?? 'get').toUpperCase();
    console.log(
      `[API ✓ ${response.status}] ${method} ${response.config.url}`,
      response.data?.data ?? response.data,
    );
    return response;
  },
  error => {
    const cfg = error?.config ?? {};
    const method = (cfg.method ?? 'get').toUpperCase();
    console.log(
      `[API ✗ ${error?.response?.status ?? 'network'}] ${method} ${cfg.url}`,
      error?.response?.data ?? error?.message,
    );
    return Promise.reject(error);
  },
);

/** Backend envelope: { success, statusCode, message, data }. */
export function unwrap<T = any>(response: {data: {data: T}}): T {
  return response.data.data;
}

/** Human-readable message from an axios error (backend sends { message }). */
export function apiErrorMessage(error: any, fallback = 'Something went wrong'): string {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

/**
 * Coarse category for an axios error, so screens can pick the right recovery UI
 * (Figma "Error Handling — Auth Flow"):
 *  - offline     : no response reached us (network down / DNS / timeout)
 *  - auth        : 401 — wrong/expired credentials or OTP code
 *  - validation  : 400 — bad input (backend sends { errors: [{field, message}] })
 *  - conflict    : 409 — e.g. phone already linked to another account
 *  - server      : 5xx — backend fault / timeout on their side
 *  - unknown     : anything else
 */
export type ApiErrorKind =
  | 'offline'
  | 'auth'
  | 'validation'
  | 'conflict'
  | 'server'
  | 'unknown';

export function classifyError(error: any): ApiErrorKind {
  // No `response` means the request never got an HTTP reply → treat as offline.
  if (!error?.response) {
    return 'offline';
  }
  const status = error.response.status as number;
  if (status === 401) return 'auth';
  if (status === 400) return 'validation';
  if (status === 409) return 'conflict';
  if (status >= 500) return 'server';
  return 'unknown';
}

/** First field-level validation message from a 400 response, if any. */
export function firstValidationMessage(error: any): string | undefined {
  const errs = error?.response?.data?.errors;
  return Array.isArray(errs) && errs.length ? errs[0]?.message : undefined;
}
