import * as Colors from "@tamagui/colors";
import {createThemes, defaultComponentThemes} from "@tamagui/theme-builder";

const lightShadows = {
  shadow1: "rgba(0,0,0,0.04)",
  shadow2: "rgba(0,0,0,0.08)",
  shadow3: "rgba(0,0,0,0.16)",
  shadow4: "rgba(0,0,0,0.24)",
  shadow5: "rgba(0,0,0,0.32)",
  shadow6: "rgba(0,0,0,0.4)",
};

const darkShadows = {
  shadow1: "rgba(0,0,0,0.2)",
  shadow2: "rgba(0,0,0,0.3)",
  shadow3: "rgba(0,0,0,0.4)",
  shadow4: "rgba(0,0,0,0.5)",
  shadow5: "rgba(0,0,0,0.6)",
  shadow6: "rgba(0,0,0,0.7)",
};

const builtThemes = createThemes({
  componentThemes: defaultComponentThemes,

  base: {
    palette: {
      dark: [
        "hsla(198, 56%, 93%, 1)",
        "hsla(198, 56%, 83%, 1)",
        "hsla(198, 56%, 74%, 1)",
        "hsla(198, 56%, 65%, 1)",
        "hsla(198, 56%, 56%, 1)",
        "hsla(198, 56%, 47%, 1)",
        "hsla(198, 56%, 38%, 1)",
        "hsla(198, 56%, 29%, 1)",
        "hsla(198, 56%, 20%, 1)",
        "hsla(198, 56%, 10%, 1)",
        "hsla(198, 50%, 5%, 1)",
      ],
      light: [
        "hsla(198, 56%, 7%, 1)",
        "hsla(198, 56%, 14%, 1)",
        "hsla(198, 56%, 23%, 1)",
        "hsla(198, 56%, 32%, 1)",
        "hsla(198, 56%, 41%, 1)",
        "hsla(198, 56%, 50%, 1)",
        "hsla(198, 56%, 59%, 1)",
        "hsla(198, 56%, 68%, 1)",
        "hsla(198, 56%, 77%, 1)",
        "hsla(198, 56%, 90%, 1)",
        "hsla(198, 50%, 90%, 1)",
      ],
    },

    extra: {
      light: {
        primary: "hsla(201, 72%, 75%, 1)",
        background: "hsla(204, 67%, 98%, 1)",
        secondary: "hsla(197, 69%, 34%, 1)",
        ...Colors.green,
        ...Colors.red,
        ...Colors.yellow,
        ...lightShadows,
        shadowColor: lightShadows.shadow1,
        transparent: "hsla(0,0%,0%,0)",
        static1: "hsla(0, 0%, 0%, 0.5)",
        static2: "hsla(0, 0%, 94%, 1)",
        static3: "hsla(0, 0%, 9%, 1)",
        static4: "hsla(0, 0%, 88%, 1)",
        static5: "hsla(160, 76%, 38%, 1)",
        static6: "hsla(0, 0%, 100%, 0.15)",
        static7: "hsla(0, 0%, 100%, 0.1)",
        static8: "hsla(0, 0%, 100%, 0.05)",
        static9: "hsla(0, 0%, 100%, 0.3)",
        static10: "hsla(0, 0%, 16%, 1)",
        static11: "hsla(0, 0%, 100%, 0.03)",
        static12: "hsla(0, 0%, 0%, 0.8)",
        static13: "hsla(0, 0%, 25%, 1)",
        static14: "hsla(0, 0%, 100%, 0.2)",
        static15: "hsla(196, 30.90%, 26.70%, 0.50)5.10%, 0.50)",
      },
      dark: {
        // Giá trị GỐC từ bảng màu dark:
        primary: "hsla(201, 72%, 76%, 1)",
        background: "hsla(204, 35%, 6%, 1)",
        secondary: "hsla(229, 53%, 34%, 1)",
        ...Colors.greenDark,
        ...Colors.redDark,
        ...Colors.yellowDark,
        ...darkShadows,
        shadowColor: darkShadows.shadow1,
        transparent: "hsla(0,0%,0%,0)",
        static1: "hsla(0, 0%, 88%, 0.5)", // Light gray 50% opacity
        static2: "hsla(0, 0%, 6%, 1)", // Very dark gray
        static3: "hsla(0, 0%, 100%, 1)", // Pure white
        static4: "hsla(0, 0%, 88%, 0.2)", // Light gray 20% opacity
        static5: "hsla(160, 76%, 38%, 1)", // Green accent (same as dark)
        static6: "hsla(202, 7.90%, 47.30%, 0.24)", // Black 5% opacity
        static7: "hsla(0, 0%, 0%, 0.1)", // Black 10% opacity
        static8: "hsla(0, 0%, 100%, 0.3)", // Black 15% opacity
        static9: "hsla(0, 0%, 0%, 0.3)", // Black 30% opacity
        static10: "hsla(0, 0%, 88%, 1)", // Light gray
        static11: "hsla(0, 0%, 0%, 0.03)", // Black 3% opacity
        static12: "hsla(0, 0%, 100%, 0.8)", // White 80% opacity
        static13: "hsla(0,0%,92%,1)",
        static14: "hsla(0,0%,0%,0.2)",
        static15: "hsla(199, 100.00%, 79.80%, 0.50)",
      },
    },
  },

  accent: {
    palette: {
      dark: [
        "hsla(201, 86%, 28%,1)", // 0 - Giá trị GỐC (cho dark mode)
        "hsla(201, 86%, 36%,1)",
        "hsla(201, 86%, 42%,1)",
        "hsla(201, 86%, 48%,1)",
        "hsla(201, 86%, 54%,1)",
        "hsla(201, 86%, 61%,1)",
        "hsla(201, 86%, 68%,1)",
        "hsla(201, 86%, 74%,1)",
        "hsla(201, 86%, 80%,1)",
        "hsla(201, 86%, 86%,1)",
        "hsla(201, 86%, 90%,1)", // 10
      ],
      light: [
        "hsla(201, 92%, 86%, 1)", // 0 - Giá trị GỐC (cho light mode)
        "hsla(201, 92%, 80%, 1)",
        "hsla(201, 92%, 74%, 1)",
        "hsla(201, 92%, 68%, 1)",
        "hsla(201, 92%, 60%, 1)",
        "hsla(201, 92%, 54%, 1)",
        "hsla(201, 92%, 48%, 1)",
        "hsla(201, 92%, 42%, 1)",
        "hsla(201, 92%, 38%, 1)",
        "hsla(201, 92%, 31%, 1)",
        "hsla(201, 92%, 27%, 1)", // 10
      ],
    },
  },
});

export type OldThemes = typeof builtThemes;

export const themes: OldThemes =
  process.env.TAMAGUI_ENVIRONMENT === "client" &&
  process.env.NODE_ENV === "production"
    ? ({} as any)
    : (builtThemes as any);
