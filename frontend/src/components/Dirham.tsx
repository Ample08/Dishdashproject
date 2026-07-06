import React, {useMemo} from 'react';
import {SvgXml} from 'react-native-svg';
import {DIRHAM} from '../assets/illustrations';

/** UAE Dirham (AED) currency glyph used before prices (Figma imgVector1). */
export function Dirham({size = 12, color}: {size?: number; color?: string}) {
  const xml = useMemo(
    () => (color ? DIRHAM.replace(/#[0-9A-Fa-f]{6}/g, color) : DIRHAM),
    [color],
  );
  return <SvgXml xml={xml} width={size} height={size} />;
}
