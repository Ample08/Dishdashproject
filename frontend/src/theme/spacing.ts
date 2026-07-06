/**
 * Design tokens — Spacing & Radius
 * Raw point values from the Figma 390-wide frames (used directly for pixel-exact layout).
 */
export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  smd: 10,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  xxxl: 28,
} as const;

export const radius = {
  cell: 12,
  input: 14,
  card: 16,
  sheet: 24,
  pill: 999,
  indicator: 2.5,
} as const;

/** Base design canvas (iPhone Pro) the Figma frames were drawn at. */
export const DESIGN_WIDTH = 390;
export const DESIGN_HEIGHT = 844;
