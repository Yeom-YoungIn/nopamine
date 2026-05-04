import {Platform} from 'react-native';

const createShadow = (color: string, opacity: number, radius: number, height: number) => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: {width: 0, height},
  elevation: Platform.OS === 'android' ? Math.max(1, Math.round(radius / 3)) : 0,
});

export const colors = {
  background: '#F4F1EA',
  backgroundStrong: '#ECE7DD',
  surface: '#FCFAF5',
  surfaceMuted: '#F1ECE2',
  card: '#FFFCF6',
  text: '#181613',
  textMuted: '#6F6A61',
  textFaint: '#A39B90',
  border: '#E4DED2',
  accent: '#1C8C72',
  accentStrong: '#146A57',
  accentSoft: '#D8EEE8',
  danger: '#D85F43',
  dangerSoft: '#F6E1DA',
  success: '#3D8B5E',
  successSoft: '#E1F0E4',
  dark: '#111315',
  white: '#FFFFFF',
  overlay: '#11131599',
};

export const metrics = {
  screenPadding: 24,
  cardRadius: 24,
  pillRadius: 999,
  buttonRadius: 18,
};

export const shadows = {
  card: createShadow('#181613', 0.06, 16, 6),
  soft: createShadow('#181613', 0.03, 10, 3),
  accent: createShadow('#1C8C72', 0.18, 18, 8),
};
