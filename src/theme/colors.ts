import type { IThemeColors } from '@/theme/types';

export const darkColors: IThemeColors = {
  // Text shades: In Dark Mode, 100 is Darkest, 950 is Lightest
  text: 'oklch(0.9454 0.017 50.43)',
  text50: 'oklch(0.15 0.010 50.43)',
  text100: 'oklch(0.20 0.015 50.43)', // Darkest
  text200: 'oklch(0.30 0.020 50.43)',
  text300: 'oklch(0.40 0.025 50.43)',
  text400: 'oklch(0.50 0.028 50.43)',
  text500: 'oklch(0.60 0.025 50.43)',
  text600: 'oklch(0.70 0.022 50.43)',
  text700: 'oklch(0.80 0.018 50.43)',
  text800: 'oklch(0.88 0.014 50.43)',
  text900: 'oklch(0.94 0.010 50.43)',
  text950: 'oklch(0.98 0.005 50.43)', // Lightest

  // Background shades: In Dark Mode, 100 is Black, 950 is Lightest
  background: 'oklch(0.1918 0.0102 52.85)',
  background50: 'oklch(0.05 0.005 52.85)',
  background100: 'oklch(0.10 0.010 52.85)', // Black
  background200: 'oklch(0.15 0.011 52.85)',
  background300: 'oklch(0.30 0.011 52.85)',
  background400: 'oklch(0.40 0.011 52.85)',
  background500: 'oklch(0.50 0.010 52.85)',
  background600: 'oklch(0.60 0.009 52.85)',
  background700: 'oklch(0.70 0.008 52.85)',
  background800: 'oklch(0.80 0.007 52.85)',
  background900: 'oklch(0.90 0.006 52.85)',
  background950: 'oklch(0.95 0.005 52.85)',

  // Primary shades (base hue: 41.28)
  primary: 'oklch(0.6121 0.187258 41.2859)',
  primary50: 'oklch(0.20 0.07 41.28)',
  primary100: 'oklch(0.27 0.10 41.28)',
  primary200: 'oklch(0.35 0.13 41.28)',
  primary300: 'oklch(0.43 0.16 41.28)',
  primary400: 'oklch(0.52 0.18 41.28)',
  primary500: 'oklch(0.61 0.187 41.28)',
  primary600: 'oklch(0.65 0.17 41.28)',
  primary700: 'oklch(0.70 0.15 41.28)',
  primary800: 'oklch(0.80 0.12 41.28)',
  primary900: 'oklch(0.90 0.08 41.28)',
  primary950: 'oklch(0.95 0.05 41.28)',

  // Secondary shades (base hue: 71.78)
  secondary: 'oklch(0.8877 0.0884 71.78)',
  secondary50: 'oklch(0.32 0.14 71.78)',
  secondary100: 'oklch(0.42 0.13 71.78)',
  secondary200: 'oklch(0.52 0.12 71.78)',
  secondary300: 'oklch(0.62 0.11 71.78)',
  secondary400: 'oklch(0.72 0.10 71.78)',
  secondary500: 'oklch(0.82 0.092 71.78)',
  secondary600: 'oklch(0.86 0.085 71.78)',
  secondary700: 'oklch(0.89 0.075 71.78)',
  secondary800: 'oklch(0.92 0.06 71.78)',
  secondary900: 'oklch(0.95 0.04 71.78)',
  secondary950: 'oklch(0.98 0.02 71.78)',

  // Accent shades (base hue: 84.33)
  accent: 'oklch(0.7499 0.1538 84.33)',
  accent50: 'oklch(0.27 0.07 84.33)',
  accent100: 'oklch(0.37 0.10 84.33)',
  accent200: 'oklch(0.47 0.12 84.33)',
  accent300: 'oklch(0.57 0.14 84.33)',
  accent400: 'oklch(0.67 0.15 84.33)',
  accent500: 'oklch(0.75 0.154 84.33)',
  accent600: 'oklch(0.77 0.145 84.33)',
  accent700: 'oklch(0.81 0.13 84.33)',
  accent800: 'oklch(0.87 0.10 84.33)',
  accent900: 'oklch(0.93 0.07 84.33)',
  accent950: 'oklch(0.97 0.04 84.33)',
};

export const lightColors: IThemeColors = {
  // Text shades: In Light Mode, 100 is Lightest, 950 is Darkest
  text: 'oklch(0.1845 0.0261 49.31)',
  text50: 'oklch(0.98 0.005 49.31)',
  text100: 'oklch(0.95 0.008 49.31)', // Lightest
  text200: 'oklch(0.85 0.012 49.31)',
  text300: 'oklch(0.70 0.016 49.31)',
  text400: 'oklch(0.55 0.020 49.31)',
  text500: 'oklch(0.40 0.024 49.31)',
  text600: 'oklch(0.30 0.026 49.31)',
  text700: 'oklch(0.22 0.027 49.31)',
  text800: 'oklch(0.17 0.027 49.31)',
  text900: 'oklch(0.13 0.027 49.31)',
  text950: 'oklch(0.09 0.026 49.31)', // Darkest

  // Background shades: In Light Mode, 100 is White, 950 is Darkest
  background: 'oklch(0.9401 0.0068 53.44)',
  background50: 'oklch(0.99 0.003 53.44)',
  background100: 'oklch(0.97 0.004 53.44)', // White
  background200: 'oklch(0.95 0.005 53.44)',
  background300: 'oklch(0.92 0.006 53.44)',
  background400: 'oklch(0.88 0.007 53.44)',
  background500: 'oklch(0.82 0.008 53.44)',
  background600: 'oklch(0.72 0.009 53.44)',
  background700: 'oklch(0.62 0.010 53.44)',
  background800: 'oklch(0.52 0.011 53.44)',
  background900: 'oklch(0.42 0.011 53.44)',
  background950: 'oklch(0.32 0.011 53.44)',

  // Primary shades (base hue: 45.38)
  primary: 'oklch(0.7155 0.1892 45.38)',
  primary50: 'oklch(0.97 0.05 45.38)',
  primary100: 'oklch(0.92 0.09 45.38)', // Lightest
  primary200: 'oklch(0.85 0.13 45.38)',
  primary300: 'oklch(0.78 0.16 45.38)',
  primary400: 'oklch(0.73 0.18 45.38)',
  primary500: 'oklch(0.72 0.189 45.38)',
  primary600: 'oklch(0.63 0.18 45.38)',
  primary700: 'oklch(0.53 0.16 45.38)',
  primary800: 'oklch(0.43 0.13 45.38)',
  primary900: 'oklch(0.33 0.10 45.38)',
  primary950: 'oklch(0.25 0.07 45.38)', // Darkest

  // Secondary shades (base hue: 62.25)
  secondary: 'oklch(0.3899 0.0895 62.25)',
  secondary50: 'oklch(0.96 0.02 62.25)',
  secondary100: 'oklch(0.90 0.04 62.25)', // Lightest
  secondary200: 'oklch(0.80 0.06 62.25)',
  secondary300: 'oklch(0.70 0.07 62.25)',
  secondary400: 'oklch(0.60 0.08 62.25)',
  secondary500: 'oklch(0.50 0.085 62.25)',
  secondary600: 'oklch(0.43 0.09 62.25)',
  secondary700: 'oklch(0.36 0.09 62.25)',
  secondary800: 'oklch(0.30 0.09 62.25)',
  secondary900: 'oklch(0.24 0.085 62.25)',
  secondary950: 'oklch(0.18 0.075 62.25)', // Darkest

  // Accent shades (base hue: 87.5)
  accent: 'oklch(0.8582 0.1686 87.5)',
  accent50: 'oklch(0.98 0.04 87.5)',
  accent100: 'oklch(0.95 0.07 87.5)', // Lightest
  accent200: 'oklch(0.90 0.11 87.5)',
  accent300: 'oklch(0.85 0.14 87.5)',
  accent400: 'oklch(0.82 0.16 87.5)',
  accent500: 'oklch(0.86 0.169 87.5)',
  accent600: 'oklch(0.75 0.17 87.5)',
  accent700: 'oklch(0.63 0.16 87.5)',
  accent800: 'oklch(0.51 0.14 87.5)',
  accent900: 'oklch(0.39 0.11 87.5)',
  accent950: 'oklch(0.29 0.08 87.5)', // Darkest
};
