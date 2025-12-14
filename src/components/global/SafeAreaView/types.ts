import React from "react";

export interface ISafeAreaViewProps extends Omit<React.PropsWithChildren, 'style'> {
  style?: object
}