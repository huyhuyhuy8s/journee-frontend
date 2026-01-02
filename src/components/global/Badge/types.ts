export type TBadgeVariant =
  | 'default'
  | 'primary'
  | 'warning'
  | 'danger'
  | 'success';
export type TBadgeSize = 'small' | 'medium' | 'large';

export interface IBadgeProps {
  text: string;
  variant?: TBadgeVariant;
  size?: TBadgeSize;
  style?: object;
}
