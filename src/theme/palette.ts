/** Warna sistem iOS (HIG) versi terang dan gelap. */
export type Palette = {
  bg: string;
  sheet: string;
  card: string;
  inset: string;
  fill: string;
  separator: string;
  label: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  tint: string;
  green: string;
  orange: string;
  red: string;
  barBg: string;
  segmentThumb: string;
};

export const DARK: Palette = {
  bg: '#000000',
  sheet: 'rgba(28,28,30,0.97)',
  card: '#1C1C1E',
  inset: '#2C2C2E',
  fill: 'rgba(118,118,128,0.36)',
  separator: 'rgba(84,84,88,0.65)',
  label: '#FFFFFF',
  secondaryLabel: 'rgba(235,235,245,0.6)',
  tertiaryLabel: 'rgba(235,235,245,0.3)',
  tint: '#0A84FF',
  green: '#30D158',
  orange: '#FF9F0A',
  red: '#FF453A',
  barBg: 'rgba(28,28,30,0.94)',
  segmentThumb: '#636366',
};

export const LIGHT: Palette = {
  bg: '#F2F2F7',
  sheet: 'rgba(255,255,255,0.97)',
  card: '#FFFFFF',
  inset: '#F2F2F7',
  fill: 'rgba(118,118,128,0.12)',
  separator: 'rgba(60,60,67,0.29)',
  label: '#000000',
  secondaryLabel: 'rgba(60,60,67,0.6)',
  tertiaryLabel: 'rgba(60,60,67,0.3)',
  tint: '#007AFF',
  green: '#34C759',
  orange: '#FF9500',
  red: '#FF3B30',
  barBg: 'rgba(249,249,249,0.94)',
  segmentThumb: '#FFFFFF',
};
