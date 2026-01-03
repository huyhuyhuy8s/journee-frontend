import type {ColorValue} from 'react-native';

export interface IThemeColors {
  green: ColorValue;
  green100: ColorValue;
  green150: ColorValue;
  green200: ColorValue;
  green250: ColorValue;
  green300: ColorValue;
  green400: ColorValue;
  green500: ColorValue;
  green600: ColorValue;
  green700: ColorValue;
  green800: ColorValue;
  green850: ColorValue;
  green900: ColorValue;

  yellow: ColorValue;
  yellow100: ColorValue;
  yellow150: ColorValue;
  yellow200: ColorValue;
  yellow250: ColorValue;
  yellow300: ColorValue;
  yellow400: ColorValue;
  yellow500: ColorValue;
  yellow600: ColorValue;
  yellow700: ColorValue;
  yellow800: ColorValue;
  yellow850: ColorValue;
  yellow900: ColorValue;

  orange: ColorValue;
  orange100: ColorValue;
  orange150: ColorValue;
  orange200: ColorValue;
  orange250: ColorValue;
  orange300: ColorValue;
  orange400: ColorValue;
  orange500: ColorValue;
  orange600: ColorValue;
  orange700: ColorValue;
  orange800: ColorValue;
  orange850: ColorValue;
  orange900: ColorValue;

  salmon: ColorValue;
  salmon100: ColorValue;
  salmon150: ColorValue;
  salmon200: ColorValue;
  salmon250: ColorValue;
  salmon300: ColorValue;
  salmon400: ColorValue;
  salmon500: ColorValue;
  salmon600: ColorValue;
  salmon700: ColorValue;
  salmon800: ColorValue;
  salmon850: ColorValue;
  salmon900: ColorValue;

  darkGreen: ColorValue;
  darkGreen100: ColorValue;
  darkGreen150: ColorValue;
  darkGreen200: ColorValue;
  darkGreen250: ColorValue;
  darkGreen300: ColorValue;
  darkGreen400: ColorValue;
  darkGreen500: ColorValue;
  darkGreen600: ColorValue;
  darkGreen700: ColorValue;
  darkGreen800: ColorValue;
  darkGreen850: ColorValue;
  darkGreen900: ColorValue;

  navy: ColorValue;
  navy100: ColorValue;
  navy150: ColorValue;
  navy200: ColorValue;
  navy250: ColorValue;
  navy300: ColorValue;
  navy400: ColorValue;
  navy500: ColorValue;
  navy600: ColorValue;
  navy700: ColorValue;
  navy800: ColorValue;
  navy850: ColorValue;
  navy900: ColorValue;

  brown: ColorValue;
  brown100: ColorValue;
  brown150: ColorValue;
  brown200: ColorValue;
  brown250: ColorValue;
  brown300: ColorValue;
  brown400: ColorValue;
  brown500: ColorValue;
  brown600: ColorValue;
  brown700: ColorValue;
  brown800: ColorValue;
  brown850: ColorValue;
  brown900: ColorValue;
}

export type TThemeScheme = 'dark' | 'light' | boolean;

export interface IThemeContext {
  isDark: boolean;
  colors: IThemeColors;
  setScheme: (scheme: TThemeScheme) => void;
}
