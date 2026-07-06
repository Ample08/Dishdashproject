import React, {useMemo} from 'react';
import {SvgXml} from 'react-native-svg';
import {MASCOT} from '../assets/illustrations';

const ASPECT = 29.7917 / 22; // from the Figma export viewBox

type Props = {
  width?: number;
  /** Recolor the mascot (defaults to the navy ink it ships with). */
  color?: string;
};

/** Brand mascot illustration (Figma node I894:110;893:15). */
export function Mascot({width = 22, color}: Props) {
  const xml = useMemo(
    () => (color ? MASCOT.replace(/#1C2330/gi, color) : MASCOT),
    [color],
  );
  return <SvgXml xml={xml} width={width} height={width * ASPECT} />;
}
