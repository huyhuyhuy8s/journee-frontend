import type { ButtonProps } from 'react-native';

export type TButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'danger'
  | 'outline';
export type TButtonSize = 'small' | 'medium' | 'large';

export interface IButtonProps extends ButtonProps {
  title: string;
  variant?: TButtonVariant;
  size?: TButtonSize;
  onPress: () => Promise<void> | void;
  loading?: boolean;
  style?: object;
}
