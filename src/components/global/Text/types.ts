import React from "react";

export interface ITextProps extends Omit<React.PropsWithChildren, 'style'> {
  style?: object
}