import {createContext, createElement, ReactNode, useContext, useEffect, useState} from "react";
import {useColorScheme} from "react-native";
import {darkColors, lightColors} from "@/theme/colors";
import {IThemeContext, TThemeScheme} from "@/theme/types";
import {convertColorObject} from "@/utils/colorConvert";

export const ThemeContext = createContext<IThemeContext>({
  isDark: false,
  colors: lightColors,
  setScheme: () => {
  }
});

export const ThemeProvider = ({children}: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(colorScheme === 'dark');

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const defaultTheme: IThemeContext = {
    isDark,
    colors: isDark ? convertColorObject(darkColors) : convertColorObject(lightColors),
    setScheme: (scheme: TThemeScheme) => setIsDark(scheme === 'dark')
  };

  return createElement(ThemeContext.Provider, {value: defaultTheme}, children);
};

export const useTheme = () => useContext(ThemeContext);