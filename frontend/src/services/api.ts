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
  return config;
});

api.interceptors.response.use(
  response => response,
  error => Promise.reject(error),
);

/** Backend envelope: { success, statusCode, message, data }. */
export function unwrap<T = any>(response: {data: {data: T}}): T {
  return response.data.data;
}

/** Human-readable message from an axios error (backend sends { message }). */
export function apiErrorMessage(error: any, fallback = 'Something went wrong'): string {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}
