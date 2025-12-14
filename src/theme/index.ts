import {createContext, createElement, PropsWithChildren, useContext, useEffect, useState} from "react";
import {useColorScheme} from "react-native";
import {darkColors, lightColors} from "@/theme/colors";
import {IThemeContext, TThemeScheme} from "@/theme/types";

export const ThemeContext = createContext<IThemeContext>({
  isDark: false,
  colors: lightColors,
  setScheme: () => {
  }
});

export const ThemeProvider = (props: PropsWithChildren<{}>) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(colorScheme === 'dark');

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const defaultTheme: IThemeContext = {
    isDark,
    colors: isDark ? darkColors : lightColors,
    setScheme: (scheme: TThemeScheme) => setIsDark(scheme === 'dark')
  };

  return createElement(ThemeContext.Provider, {value: defaultTheme}, props.children);
};

export const useTheme = () => useContext(ThemeContext);