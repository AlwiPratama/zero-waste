/**
 * Ikon garis ala SF Symbols (grid 24x24), digambar sendiri supaya sama di iOS, Android, dan web
 * dan bisa dipakai juga sebagai string SVG untuk marker Leaflet.
 */
export type Shape =
  | { t: 'path'; d: string; fill?: boolean }
  | { t: 'circle'; cx: number; cy: number; r: number; fill?: boolean };

export type GlyphName =
  | 'restoran' | 'hotel' | 'toko' | 'panti' | 'komunitas'
  | 'map' | 'sliders' | 'search' | 'close' | 'chevron' | 'locate' | 'flag' | 'fit' | 'check';

export const GLYPHS: Record<GlyphName, Shape[]> = {
  restoran: [
    { t: 'path', d: 'M6 3v5a3 3 0 0 0 6 0V3M9 3v18' },
    { t: 'path', d: 'M18 21V3c-2.2 1.2-3.5 3.6-3.5 6.5V14H18' },
  ],
  hotel: [
    { t: 'path', d: 'M3 19V6M3 15h18v4M21 15v-1a3 3 0 0 0-3-3h-7v4' },
    { t: 'circle', cx: 7.5, cy: 11.5, r: 1.8 },
  ],
  toko: [
    { t: 'path', d: 'M5 8h14l-1 12H6L5 8z' },
    { t: 'path', d: 'M9 8V7a3 3 0 0 1 6 0v1' },
  ],
  panti: [
    { t: 'path', d: 'M3 11.5 12 4l9 7.5M5.5 10v10h13V10M10 20v-6h4v6' },
  ],
  komunitas: [
    { t: 'circle', cx: 9, cy: 8, r: 3 },
    { t: 'path', d: 'M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5' },
    { t: 'circle', cx: 17, cy: 9, r: 2.4 },
    { t: 'path', d: 'M16 14.7c2.6.2 4.5 2 4.5 5' },
  ],
  map: [{ t: 'path', d: 'M9 4 3 6.5V20l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4zM9 4v13.5M15 6.5V20' }],
  sliders: [
    { t: 'path', d: 'M4 7h9M19 7h1M4 17h1M11 17h9' },
    { t: 'circle', cx: 16, cy: 7, r: 2.4 },
    { t: 'circle', cx: 8, cy: 17, r: 2.4 },
  ],
  search: [
    { t: 'circle', cx: 11, cy: 11, r: 6.5 },
    { t: 'path', d: 'M20 20l-4.2-4.2' },
  ],
  close: [{ t: 'path', d: 'M6 6l12 12M18 6 6 18' }],
  chevron: [{ t: 'path', d: 'M9 5l7 7-7 7' }],
  locate: [{ t: 'path', d: 'M3 11 21 3l-8 18-2-8-8-2z', fill: true }],
  flag: [{ t: 'path', d: 'M6 21V4M6 5h11l-2 4 2 4H6' }],
  fit: [{ t: 'path', d: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5' }],
  check: [{ t: 'path', d: 'M5 12.5l4.5 4.5L19 7' }],
};

/** String SVG (untuk HTML marker di Leaflet). */
export function glyphSvg(name: GlyphName, color: string, size: number, strokeWidth = 2): string {
  const body = GLYPHS[name]
    .map((s) => {
      const fill = s.fill ? color : 'none';
      return s.t === 'path'
        ? `<path d="${s.d}" fill="${fill}"/>`
        : `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${fill}"/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
