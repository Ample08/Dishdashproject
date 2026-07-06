import React from 'react';
import {SvgXml} from 'react-native-svg';
import {APPLE_LOGO, GOOGLE_LOGO, WHATSAPP_MARK} from '../assets/illustrations';

/** Brand glyphs exported verbatim from Figma (exact multi-color marks). */

export function GoogleLogo({size = 22}: {size?: number}) {
  return <SvgXml xml={GOOGLE_LOGO} width={size} height={size} />;
}

export function AppleLogo({size = 22}: {size?: number}) {
  // viewBox 18.333 × 22 → keep aspect when scaling by height.
  const width = (size * 18.333) / 22;
  return <SvgXml xml={APPLE_LOGO} width={width} height={size} />;
}

export function WhatsAppMark({size = 20}: {size?: number}) {
  return <SvgXml xml={WHATSAPP_MARK} width={size} height={size} />;
}
