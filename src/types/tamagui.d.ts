import { TamaguiComponent } from "@tamagui/core";

declare module "@tamagui/core" {
  interface StackStyleBase {
    borderRadius?: number | string;
  }

  interface TextStyleBase {
    borderRadius?: number | string;
  }

  interface ButtonStyleBase {
    borderRadius?: number | string;
  }

  interface InputStyleBase {
    borderRadius?: number | string;
  }

  interface ViewStyleBase {
    borderRadius?: number | string;
  }
}

// Extend all common Tamagui component props
declare module "tamagui" {
  interface ButtonProps {
    borderRadius?: number | string;
  }

  interface InputProps {
    borderRadius?: number | string;
  }

  interface TextProps {
    borderRadius?: number | string;
  }

  interface YStackProps {
    borderRadius?: number | string;
  }

  interface XStackProps {
    borderRadius?: number | string;
  }

  interface ViewProps {
    borderRadius?: number | string;
  }
}
