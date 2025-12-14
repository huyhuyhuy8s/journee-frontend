import { createContext, useContext, useReducer, ReactNode } from "react";

// Define types
type Theme = "light" | "dark";
type ThemeAction = { type: "LIGHT" } | { type: "DARK" };
type ThemeContextType = [Theme, React.Dispatch<ThemeAction>] | undefined;

const themeReducer = (state: Theme, action: ThemeAction): Theme => {
  switch (action.type) {
    case "LIGHT":
      return "light"; // Return new state
    case "DARK":
      return "dark"; // Return new state
    default:
      return state; // Return current state for unknown actions
  }
};

const ThemeContext = createContext<ThemeContextType>(undefined);

interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider = ({
  children,
}: ThemeContextProviderProps) => {
  const [theme, themeDispatch] = useReducer(themeReducer, "dark");

  return (
    <ThemeContext.Provider value={[theme, themeDispatch]}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeValue = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeValue must be used within a ThemeContextProvider");
  }
  return context[0];
};

export const useThemeDispatch = (): React.Dispatch<ThemeAction> => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useThemeDispatch must be used within a ThemeContextProvider"
    );
  }
  return context[1];
};

export default ThemeContext;
