import {formatHex, oklch} from 'culori';
import type {IThemeColors} from '@/theme/types';

export const convertOklchToHex = (oklchColor: string): string => {
  try {
    const hex = oklch(oklchColor);
    if (!hex) return '#000000';
    return formatHex(hex);
  } catch (error) {
    console.error('Color conversion error:', error);
    return '#000000';
  }
};

export const convertColorObject = (colors: IThemeColors): IThemeColors => {
  const converted = {} as IThemeColors;

  for (const [key, value] of Object.entries(colors)) {
    converted[key as keyof IThemeColors] = convertOklchToHex(value);
  }

  return converted;
};
