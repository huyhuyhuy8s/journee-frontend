import {ColorValue} from "react-native";

export interface IThemeColors {
  text: ColorValue;
  background: ColorValue;
  primary: ColorValue;
  secondary: ColorValue;
  accent: ColorValue;
}

export type TThemeScheme = 'dark' | 'light' | boolean;

export interface IThemeContext {
  isDark: boolean;
  colors: IThemeColors
  setScheme: (scheme: TThemeScheme) => void;
}