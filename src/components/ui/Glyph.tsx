import type { ColorValue } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { GLYPHS, type GlyphName } from './glyph-data';

type Props = { name: GlyphName; size?: number; color?: ColorValue; strokeWidth?: number };

export function Glyph({ name, size = 24, color = '#fff', strokeWidth = 2 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {GLYPHS[name].map((s, i) =>
        s.t === 'path' ? (
          <Path key={i} d={s.d} fill={s.fill ? color : 'none'} />
        ) : (
          <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill ? color : 'none'} />
        ),
      )}
    </Svg>
  );
}
