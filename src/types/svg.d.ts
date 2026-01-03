// Type declaration for importing SVGs as React components with react-native-svg
declare module '*.svg' {
  import type {SvgProps} from 'react-native-svg';
  import type {ComponentType} from 'react';
  const content: ComponentType<SvgProps>;
  export default content;
}

