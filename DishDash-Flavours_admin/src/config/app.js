export const APP_NAME = 'Flavours by DishDash'
export const APP_SHORT = 'Flavours'
export const APP_TAGLINE = 'Food Ordering Control Center'

// UAE market (app uses +971) — change symbol/locale here to re-currency the whole panel
export const CURRENCY = 'AED'
export const CURRENCY_LOCALE = 'en-AE'

export function money(value, { compact = false } = {}) {
  const n = Number(value) || 0
  if (compact && n >= 1000) {
    const formatted = new Intl.NumberFormat(CURRENCY_LOCALE, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n)
    return `${CURRENCY} ${formatted}`
  }
  return `${CURRENCY} ${new Intl.NumberFormat(CURRENCY_LOCALE, { maximumFractionDigits: 0 }).format(n)}`
}
