/* ============================================================
   Axios client — the single door to the backend.

   Every request carries two headers the API requires:
     api-key       static, from .env
     access-token  the JWT handed out by POST /api/admin/login

   The API always answers in the same envelope:
     { success, statusCode, message, data, pagination? }
   The response interceptor unwraps it, so callers just read
   `data` / `pagination` and never touch `res.data.data`.
   ============================================================ */

import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY

const TOKEN_KEY = 'flavours_admin_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

/* AuthContext registers here so an expired token logs the user out
   from anywhere, without every page having to handle 401 itself. */
let onUnauthorized = null
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  config.headers['api-key'] = API_KEY
  const token = tokenStore.get()
  if (token) config.headers['access-token'] = token
  return config
})

client.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && typeof body === 'object' && 'success' in body) {
      return { data: body.data, pagination: body.pagination, message: body.message }
    }
    return { data: body } // non-enveloped (file downloads etc.)
  },
  (error) => {
    const status = error.response?.status
    const isLoginCall = error.config?.url?.includes('/login')

    // Expired/invalid token — drop the session. A failed login attempt also
    // returns 401, but that's a wrong password, not a dead session.
    if (status === 401 && !isLoginCall) {
      tokenStore.clear()
      onUnauthorized?.()
    }

    error.status = status
    error.apiMessage =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The server took too long to respond.'
        : !error.response
          ? `Cannot reach the API at ${API_BASE_URL}. Is the backend running?`
          : 'Something went wrong. Please try again.')

    return Promise.reject(error)
  },
)

export default client
