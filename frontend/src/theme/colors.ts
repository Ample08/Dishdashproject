/**
 * Design tokens — Colors
 * Source: Figma "Flavours By Dish Dash V1" (8CghbMRbkFouQHZEDPMB0c).
 * Mirrors the Figma `--color-*` variable system. Hexes verified from Dev Mode.
 */
export const colors = {
  brand: {
    pistachio: '#9ed387', // --color-brand-pistachio-500 (primary CTA)
    navy: '#1c2330', // --color-brand-navy-900 (ink)
    teal: '#1b4a55', // --color-brand-teal-500
    tealDeep: '#184657', // exact Splash fill, sampled from Figma render (586:9)
    ivory: '#f9f0ea', // --color-brand-ivory-500 (app background / cream)
    champagne: '#FFEFCB', // --color-brand-champagne-500
    champagneDeep: '#f7e8c7', // rewards-card inner panel
    karaz: '#bc1e3c', // --color/brand/karaz-500 (Karaz brand red)
    jade: '#254063', // --color/brand/jade-500 (Jade brand navy)
    umabdallah: '#2959a8', // --color/brand/umabdallah-500 (Bait Um Abdallah blue)
    orange: '#e26949', // --color/brand/orange-500 (confetti accent)
    white: '#ffffff',
  },
  text: {
    primary: '#1c2330', // --color-text-primary
    secondary: '#525252', // --color-text-secondary
    tertiary: '#a3a3a3', // --color-text-tertiary
    inverse: '#ffffff', // --color-text-inverse
    onButton: '#1c2430', // primary-button label
  },
  border: {
    subtle: '#e3cfbf', // --color-border-subtle (warm tan hairline)
    default: '#e5e5e5', // --color-border-default
    strong: '#a3a3a3', // --color-border-strong
  },
  surface: {
    input: '#f5f5f5', // form field background
    elevated: '#ffffff', // --color-bg-elevated
  },
  status: {
    error: '#dc2626', // --color-status-error
    success: '#16a34a', // --color-status-success
  },
} as const;

export type Colors = typeof colors;
