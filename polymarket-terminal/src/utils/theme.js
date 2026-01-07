// Apple Liquid Glass Theme
export const darkTheme = {
  bg: '#000000',
  surface: 'rgba(28,28,30,0.8)',
  glass: 'rgba(255,255,255,0.06)',
  glassHover: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.1)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  textTertiary: 'rgba(255,255,255,0.4)',
  accent: '#0A84FF',
  green: '#30D158',
  red: '#FF453A',
  yellow: '#FFD60A',
  orange: '#FF9F0A',
  purple: '#BF5AF2',
  cyan: '#64D2FF',
  pink: '#FF375F',
};

export const lightTheme = {
  bg: '#F2F2F7',
  surface: 'rgba(255,255,255,0.8)',
  glass: 'rgba(255,255,255,0.9)',
  glassHover: 'rgba(255,255,255,1)',
  border: 'rgba(0,0,0,0.1)',
  text: '#000000',
  textSecondary: 'rgba(0,0,0,0.6)',
  textTertiary: 'rgba(0,0,0,0.4)',
  accent: '#007AFF',
  green: '#34C759',
  red: '#FF3B30',
  yellow: '#FFCC00',
  orange: '#FF9500',
  purple: '#AF52DE',
  cyan: '#5AC8FA',
  pink: '#FF2D55',
};

export const getTheme = (dark) => dark ? darkTheme : lightTheme;

// Probability color helper
export const getProbColor = (p, t) => {
  if (p >= 0.15) return t.green;
  if (p >= 0.02) return t.yellow;
  return t.red;
};
