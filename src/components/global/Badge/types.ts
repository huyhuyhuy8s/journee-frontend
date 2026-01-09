export type TBadgeVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'danger'
  | 'outline';
export type TBadgeSize = 'small' | 'medium' | 'large';

export interface IBadgeProps {
  text: string;
  variant?: TBadgeVariant;
  size?: TBadgeSize;
  style?: object;
}
