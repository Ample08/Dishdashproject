/**
 * Design tokens — Typography
 * Two families from Figma: Playfair Display (display/headings) + Lato (UI/body).
 * Font files are bundled in assets/fonts and linked via react-native.config.js.
 * These names match the fonts' PostScript names (iOS) and filenames (Android).
 */
export const fontFamily = {
  // Playfair Display — serif display
  displayBold: 'PlayfairDisplay-Bold',
  displayBlack: 'PlayfairDisplay-Black',
  displayItalic: 'PlayfairDisplay-Italic',
  displayBoldItalic: 'PlayfairDisplay-BoldItalic',
  // Lato — sans UI/body
  bodyRegular: 'Lato-Regular',
  bodyMedium: 'Lato-Medium',
  bodySemibold: 'Lato-Semibold',
  bodyBold: 'Lato-Bold',
  bodyBlack: 'Lato-Black',
} as const;

/** Type scale (pt) observed across the Auth flow. */
export const fontSize = {
  caption: 11,
  small: 13,
  body: 14,
  bodyLg: 16,
  statusBar: 17,
  title: 20,
  heroSm: 24,
  hero: 28,
  display: 32,
  displayLg: 36,
  counter: 50.4,
} as const;
