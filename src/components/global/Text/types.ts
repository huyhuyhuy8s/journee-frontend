import type {StyleProp, TextProps, TextStyle} from 'react-native';

export interface ITextProps extends TextProps {
  style?: StyleProp<TextStyle>;
}
