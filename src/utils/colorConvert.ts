import {formatRgb, oklch} from 'culori';
import {IThemeColors} from '@/theme/types';

export const convertOklchToRgb = (oklchColor: string): string => {
  try {
    const rgb = oklch(oklchColor);
    if (!rgb) return '#000000';
    return formatRgb(rgb);
  } catch (error) {
    console.error('Color conversion error:', error);
    return '#000000';
  }
};

export const convertColorObject = (colors: IThemeColors): IThemeColors => {
  const converted = {} as IThemeColors;

  for (const [key, value] of Object.entries(colors)) {
    converted[key as keyof IThemeColors] = convertOklchToRgb(value);
  }

  return converted;
};