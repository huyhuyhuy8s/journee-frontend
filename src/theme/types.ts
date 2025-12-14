import {ColorValue} from "react-native";

export interface IThemeColors {
  text: ColorValue;
  text50: ColorValue;
  text100: ColorValue;
  text200: ColorValue;
  text300: ColorValue;
  text400: ColorValue;
  text500: ColorValue;
  text600: ColorValue;
  text700: ColorValue;
  text800: ColorValue;
  text900: ColorValue;
  text950: ColorValue;

  background: ColorValue;
  background50: ColorValue;
  background100: ColorValue;
  background200: ColorValue;
  background300: ColorValue;
  background400: ColorValue;
  background500: ColorValue;
  background600: ColorValue;
  background700: ColorValue;
  background800: ColorValue;
  background900: ColorValue;
  background950: ColorValue;

  primary: ColorValue;
  primary50: ColorValue;
  primary100: ColorValue;
  primary200: ColorValue;
  primary300: ColorValue;
  primary400: ColorValue;
  primary500: ColorValue;
  primary600: ColorValue;
  primary700: ColorValue;
  primary800: ColorValue;
  primary900: ColorValue;
  primary950: ColorValue;

  secondary: ColorValue;
  secondary50: ColorValue;
  secondary100: ColorValue;
  secondary200: ColorValue;
  secondary300: ColorValue;
  secondary400: ColorValue;
  secondary500: ColorValue;
  secondary600: ColorValue;
  secondary700: ColorValue;
  secondary800: ColorValue;
  secondary900: ColorValue;
  secondary950: ColorValue;

  accent: ColorValue;
  accent50: ColorValue;
  accent100: ColorValue;
  accent200: ColorValue;
  accent300: ColorValue;
  accent400: ColorValue;
  accent500: ColorValue;
  accent600: ColorValue;
  accent700: ColorValue;
  accent800: ColorValue;
  accent900: ColorValue;
  accent950: ColorValue;
}

export type TThemeScheme = 'dark' | 'light' | boolean;

export interface IThemeContext {
  isDark: boolean;
  colors: IThemeColors
  setScheme: (scheme: TThemeScheme) => void;
}